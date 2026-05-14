# People Counting Moving Up and Down

This project detects people in a video with MobileNet-SSD, tracks their centroids across frames, and counts how many move upward or downward across a horizontal line.

## Project Files

- `main.py` - application entrypoint
- `deploy.prototxt` - Caffe network definition
- `mobilenet_iter_73000.caffemodel` - trained MobileNet-SSD weights
- `test.mp4` - sample input video
- `old-building-footage.mp4` - alternate sample video

## Requirements

- Python 3.10+ recommended
- macOS, Linux, or Windows
- A Python environment with the packages in `requirements.txt`

## Quick Start

1. Open a terminal in this project folder.
2. Create and activate a virtual environment.
3. Install dependencies.
4. Run the script.

### macOS / Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 main.py
```

### Windows PowerShell

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
py main.py
```

## Run With a Different Video

```bash
python3 main.py --video old-building-footage.mp4
```

You can also provide absolute paths for the video, model, or prototxt files.

## Available Options

```bash
python3 main.py --help
```

Options:

- `--video` - input video file path
- `--prototxt` - path to the deploy prototxt file
- `--model` - path to the `.caffemodel` weights file
- `--confidence` - minimum confidence threshold for detections
- `--line-ratio` - vertical position of the counting line as a fraction of frame height

Example:

```bash
python3 main.py --video test.mp4 --confidence 0.6 --line-ratio 0.45
```

## How It Works

1. The model detects people in each frame.
2. A centroid tracker assigns a stable ID to each detected person.
3. The script compares each tracked person's current position to their previous position.
4. When a person crosses the counting line, the script increments either the up or down counter.

## Controls

- Press `q` while the video window is focused to stop the program.


## Start Command Summary

Use this command after installing dependencies:

```bash
python3 main.py
```

admin	admin123	Administrator
security	sec123	Security Staff
viewer	view123	Viewer




python3 main.py                                            
python3 main.py --video old-building-footage-converted.mp4