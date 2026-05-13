import argparse
import time
from collections import OrderedDict
from pathlib import Path

import cv2
import numpy as np

# CentroidTracker class to keep track of objects and their IDs across frames
class CentroidTracker:
    def __init__(self, max_disappeared=50):
        self.next_object_id = 0
        self.objects = OrderedDict()  # Object ID and their centroids
        self.disappeared = OrderedDict()  # Tracks how long an object has been missing
        self.max_disappeared = max_disappeared

    def register(self, centroid):
        # Register a new object
        self.objects[self.next_object_id] = centroid
        self.disappeared[self.next_object_id] = 0
        self.next_object_id += 1

    def deregister(self, object_id):
        # Deregister an object
        del self.objects[object_id]
        del self.disappeared[object_id]

    def update(self, input_centroids):
        if len(input_centroids) == 0:
            for object_id in list(self.disappeared.keys()):
                self.disappeared[object_id] += 1
                if self.disappeared[object_id] > self.max_disappeared:
                    self.deregister(object_id)
            return self.objects

        if len(self.objects) == 0:
            for centroid in input_centroids:
                self.register(centroid)

        else:
            object_ids = list(self.objects.keys())
            object_centroids = list(self.objects.values())

            # Calculate distance between current centroids and input centroids
            D = np.linalg.norm(np.array(object_centroids)[:, np.newaxis] - input_centroids, axis=2)
            rows = D.min(axis=1).argsort()
            cols = D.argmin(axis=1)[rows]

            used_rows = set()
            used_cols = set()

            for (row, col) in zip(rows, cols):
                if row in used_rows or col in used_cols:
                    continue

                object_id = object_ids[row]
                self.objects[object_id] = input_centroids[col]
                self.disappeared[object_id] = 0

                used_rows.add(row)
                used_cols.add(col)

            unused_rows = set(range(D.shape[0])) - used_rows
            unused_cols = set(range(D.shape[1])) - used_cols

            for row in unused_rows:
                object_id = object_ids[row]
                self.disappeared[object_id] += 1
                if self.disappeared[object_id] > self.max_disappeared:
                    self.deregister(object_id)

            for col in unused_cols:
                self.register(input_centroids[col])

        return self.objects


CLASSES = ["background", "aeroplane", "bicycle", "bird", "boat",
           "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
           "dog", "horse", "motorbike", "person", "pottedplant", "sheep",
           "sofa", "train", "tvmonitor"]

BASE_DIR = Path(__file__).resolve().parent


def resolve_path(path_str):
    path = Path(path_str)
    if path.is_absolute():
        return path
    return BASE_DIR / path


def parse_args():
    parser = argparse.ArgumentParser(description="Count people moving up and down in a video.")
    parser.add_argument("--video", default="test.mp4", help="Path to the input video file.")
    parser.add_argument("--prototxt", default="deploy.prototxt", help="Path to the Caffe deploy prototxt file.")
    parser.add_argument("--model", default="mobilenet_iter_73000.caffemodel", help="Path to the MobileNet-SSD model file.")
    parser.add_argument("--confidence", type=float, default=0.5, help="Minimum detection confidence.")
    parser.add_argument(
        "--line-ratio",
        type=float,
        default=0.5,
        help="Horizontal counting line position as a fraction of frame height.",
    )
    parser.add_argument(
        "--line-buffer",
        type=int,
        default=20,
        help="Pixel buffer on each side of the counting line to suppress jitter-based double-counts.",
    )
    return parser.parse_args()


def main():
    args = parse_args()

    prototxt_path = resolve_path(args.prototxt)
    model_path = resolve_path(args.model)
    video_path = resolve_path(args.video)

    for file_path in (prototxt_path, model_path, video_path):
        if not file_path.exists():
            raise FileNotFoundError(f"Required file not found: {file_path}")

    if not 0 < args.line_ratio < 1:
        raise ValueError("--line-ratio must be between 0 and 1.")

    net = cv2.dnn.readNetFromCaffe(str(prototxt_path), str(model_path))
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"Unable to open video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    frame_duration = 1.0 / fps
    # Keep objects alive for ~2 real-time seconds regardless of FPS
    max_disappeared = max(1, int(fps * 2))

    up_count = 0
    down_count = 0
    ct = CentroidTracker(max_disappeared=max_disappeared)
    # Stores the last confirmed side for each object: 'above' or 'below'.
    # A side is confirmed only when the centroid is outside the buffer zone.
    confirmed_side = {}

    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    line_position = int(frame_height * args.line_ratio)
    line_buffer = args.line_buffer

    while cap.isOpened():
        t_frame_start = time.monotonic()

        ret, frame = cap.read()
        if not ret:
            break

        (h, w) = frame.shape[:2]
        blob = cv2.dnn.blobFromImage(cv2.resize(frame, (300, 300)), 0.007843, (300, 300), 127.5)
        net.setInput(blob)
        detections = net.forward()
        centroids = []

        for i in range(detections.shape[2]):
            confidence = detections[0, 0, i, 2]
            if confidence <= args.confidence:
                continue

            idx = int(detections[0, 0, i, 1])
            if CLASSES[idx] != "person":
                continue

            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            (x1, y1, x2, y2) = box.astype("int")

            centroid = (int((x1 + x2) / 2), int((y1 + y2) / 2))
            centroids.append(centroid)

            label = f"Person {confidence:.2f}"
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        objects = ct.update(centroids)

        for (object_id, centroid) in objects.items():
            current_y = centroid[1]

            # Determine which confirmed side of the line the centroid is on.
            # Centroids inside the buffer zone are ignored to suppress jitter.
            if current_y < line_position - line_buffer:
                new_side = "above"
            elif current_y > line_position + line_buffer:
                new_side = "below"
            else:
                new_side = None  # inside buffer zone — no update

            if new_side is not None:
                prev_side = confirmed_side.get(object_id)
                if prev_side is not None and prev_side != new_side:
                    if new_side == "above":
                        up_count += 1
                        print(f"Person {object_id} moved up.")
                    else:
                        down_count += 1
                        print(f"Person {object_id} moved down.")
                confirmed_side[object_id] = new_side

        cv2.line(frame, (0, line_position), (w, line_position), (0, 0, 255), 2)
        cv2.putText(frame, f"Up: {up_count}", (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        cv2.putText(frame, f"Down: {down_count}", (10, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        cv2.imshow("People Counting", frame)

        # Pace playback to the video's native FPS; inference already consumes
        # most of the frame budget, so wait_ms is often just 1 ms, but this
        # prevents artificial slow-motion on high-FPS sources like 60 fps footage.
        elapsed = time.monotonic() - t_frame_start
        wait_ms = max(1, int((frame_duration - elapsed) * 1000))
        if cv2.waitKey(wait_ms) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    print(f"Final count -> Up: {up_count}, Down: {down_count}")


if __name__ == "__main__":
    main()
