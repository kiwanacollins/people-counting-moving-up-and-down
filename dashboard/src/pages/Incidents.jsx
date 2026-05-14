import { useMemo } from 'react'
import { useSimulation } from '../context/SimulationContext'

const STATUS_OPTIONS = ['new', 'acknowledged', 'in-progress', 'escalated', 'resolved', 'closed']
const OWNER_OPTIONS = ['Unassigned', 'Security Team', 'Duty Officer', 'Campus Admin']

function fmtDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function fmtDuration(ms) {
  if (!ms) return '-'
  const totalMinutes = Math.round(ms / 60000)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function Incidents({ user }) {
  const {
    incidents,
    incidentStats,
    predictions,
  } = useSimulation()


  const predictedHotspots = useMemo(
    () => predictions.filter(pred => pred.expectedBreach).sort((a, b) => b.p30Percent - a.p30Percent).slice(0, 3),
    [predictions],
  )

  const submitNote = (event) => {
    event.preventDefault()
    if (!selected || !note.trim()) return
    addIncidentNote(selected.id, note, user.name)
    setNote('')
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-emerald-900">Incident Workflow Center</h1>
          <p className="text-sm text-emerald-600 mt-1">Auto-generated incidents from prediction signals and live monitoring events.</p>
        </div>
        <div className="px-3 py-2 rounded-xl border border-emerald-200 bg-white text-xs text-emerald-700 font-semibold">
          Signed in as {user.role}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">Active Incidents</p>
          <p className="text-3xl font-black text-emerald-900 mt-1">{incidentStats.active}</p>
        </div>
        <div className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">Predicted Breaches Prevented</p>
          <p className="text-3xl font-black text-emerald-900 mt-1">{incidentStats.predictedPrevented}</p>
        </div>
      </div>

      <div className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-emerald-900">Predicted Hotspots (30 min)</h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          {predictedHotspots.length === 0 && (
            <p className="text-sm text-emerald-700">No predicted threshold breaches in the next 30 minutes.</p>
          )}
          {predictedHotspots.map(spot => (
            <div key={spot.zoneId} className="border border-amber-200 bg-amber-50 rounded-lg p-3">
              <p className="text-sm font-bold text-emerald-900">{spot.zoneName}</p>
              <p className="text-xs text-emerald-700 mt-1">Forecast: {spot.p30} / {spot.current} currently</p>
              <p className="text-xs text-amber-700 font-semibold mt-1">Expected occupancy {spot.p30Percent}% · Confidence {spot.confidence}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-emerald-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-emerald-100">
          <h3 className="text-sm font-bold text-emerald-900">Incident Queue</h3>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          {incidents.length === 0 && (
            <p className="p-4 text-sm text-emerald-700">No incidents yet. Auto-generated incidents from the prediction engine will appear here.</p>
          )}
          {incidents.map(incident => (
            <div
              key={incident.id}
              className="p-4 border-b border-emerald-100 hover:bg-emerald-50 transition-colors"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-sm font-semibold text-emerald-900">{incident.zoneName}</p>
                <span className={`text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full font-bold ${
                  incident.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {incident.severity}
                </span>
              </div>
              <p className="text-xs text-emerald-700 mb-2">{incident.title}</p>
              <div className="flex items-center justify-between gap-2 text-[11px] text-emerald-600">
                <span>{incident.source === 'predicted' ? '🔮 Predicted' : '⚠️ Live'}</span>
                <span>{fmtDate(incident.createdAt)}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center gap-2">
                <span className="text-[10px] font-semibold text-emerald-700 uppercase">{incident.status}</span>
                <span className="text-[10px] text-emerald-600">•</span>
                <span className="text-[10px] text-emerald-600">{incident.owner}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
