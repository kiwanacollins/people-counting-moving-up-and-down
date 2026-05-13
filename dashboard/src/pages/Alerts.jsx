import { useState } from 'react'
import { AlertTriangle, Info, XCircle, CheckCircle } from 'lucide-react'
import { ALERTS } from '../data/mockData'
import { useSimulation } from '../context/SimulationContext'

const SEVERITY = {
  critical: {
    Icon: XCircle,
    ring:    'border-red-200 bg-red-50',
    icon:    'text-red-500',
    badge:   'bg-red-100 text-red-700',
    typeBg:  'bg-red-600',
  },
  warning: {
    Icon: AlertTriangle,
    ring:    'border-amber-200 bg-amber-50',
    icon:    'text-amber-500',
    badge:   'bg-amber-100 text-amber-700',
    typeBg:  'bg-amber-500',
  },
  info: {
    Icon: Info,
    ring:    'border-blue-200 bg-blue-50',
    icon:    'text-blue-400',
    badge:   'bg-blue-100 text-blue-700',
    typeBg:  'bg-blue-500',
  },
}

function fmt(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) +
    ' · ' +
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const FILTERS = [['all', 'All'], ['active', 'Active'], ['resolved', 'Resolved']]

export default function Alerts() {
  const [filter, setFilter]   = useState('all')
  const [alerts, setAlerts]   = useState(ALERTS)
  const { alertCount }        = useSimulation()

  const counts = {
    all:      alerts.length,
    active:   alerts.filter(a => a.status === 'active').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  }

  const visible = filter === 'all' ? alerts : alerts.filter(a => a.status === filter)

  const resolve = (id) =>
    setAlerts(prev =>
      prev.map(a =>
        a.id === id ? { ...a, status: 'resolved', resolvedAt: new Date().toISOString() } : a,
      ),
    )

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            Alerts &amp; Notifications
            {alertCount > 0 && (
              <span className="px-2.5 py-0.5 bg-red-100 text-red-600 text-sm font-bold rounded-full">
                {alertCount} live
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">System alerts from all monitoring zones</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              filter === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              filter === key ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-500'
            }`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {visible.length === 0 && (
          <div className="text-center py-16">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No alerts to display</p>
            <p className="text-slate-400 text-sm mt-1">All zones are operating normally</p>
          </div>
        )}

        {visible.map(alert => {
          const s = SEVERITY[alert.severity]
          const SIcon = s.Icon
          return (
            <div key={alert.id} className={`border rounded-2xl p-4 flex items-start gap-4 ${s.ring}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white border border-slate-200 shadow-sm`}>
                <SIcon className={`w-4.5 h-4.5 w-5 h-5 ${s.icon}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full text-white ${s.typeBg}`}>
                    {alert.type}
                  </span>
                  <span className="text-xs font-bold text-slate-700">{alert.zoneName}</span>
                  <span className="text-[10px] text-slate-400 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {alert.camera}
                  </span>
                  {alert.status === 'resolved' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      ✓ Resolved
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{alert.description}</p>
                <p className="text-xs text-slate-400 mt-1.5">
                  <span className="font-medium">Triggered:</span> {fmt(alert.triggeredAt)}
                  {alert.resolvedAt && (
                    <span className="ml-2">
                      <span className="font-medium">Resolved:</span> {fmt(alert.resolvedAt)}
                    </span>
                  )}
                </p>
              </div>

              {alert.status === 'active' && (
                <button
                  onClick={() => resolve(alert.id)}
                  className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 transition-colors shadow-sm"
                >
                  Resolve
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Info footer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700 leading-relaxed">
        <strong>Note:</strong> Alerts are generated automatically when zone occupancy exceeds the configured threshold.
        Critical alerts (≥ 90%) are escalated immediately. The system complies with KIU's Data Protection Policy —
        no biometric data is stored.
      </div>
    </div>
  )
}
