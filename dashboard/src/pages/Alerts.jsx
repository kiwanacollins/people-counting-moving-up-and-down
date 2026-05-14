import { useState } from 'react'
import { AlertTriangle, Info, XCircle, CheckCircle } from 'lucide-react'
import { ALERTS } from '../data/mockData'
import { useSimulation } from '../context/SimulationContext'
import { getPermissions } from '../data/roles'

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
    ring:    'border-emerald-200 bg-emerald-50',
    icon:    'text-emerald-500',
    badge:   'bg-emerald-100 text-emerald-700',
    typeBg:  'bg-teal-600',
  },
}

function fmt(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) +
    ' · ' +
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const FILTERS = [['all', 'All'], ['active', 'Active'], ['resolved', 'Resolved']]

export default function Alerts({ user }) {
  const [filter, setFilter]   = useState('all')
  const [alerts, setAlerts]   = useState(ALERTS)
  const { alertCount }        = useSimulation()
  const permissions = getPermissions(user.role)

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
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-emerald-900 flex items-center gap-3">
            Alerts &amp; Notifications
            {alertCount > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-full">
                {alertCount} live
              </span>
            )}
          </h1>
          <p className="text-sm text-emerald-600 mt-1">System alerts from all monitoring zones</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-emerald-50 p-1 rounded-xl w-fit border border-emerald-200">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filter === key ? 'bg-white text-emerald-900 shadow-sm border border-emerald-200' : 'text-emerald-600 hover:text-emerald-700'
            }`}
          >
            {label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              filter === key ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-100/60 text-emerald-600'
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
            <p className="text-emerald-700 font-medium">No alerts to display</p>
            <p className="text-emerald-600 text-sm mt-1">All zones are operating normally</p>
          </div>
        )}

        {visible.map(alert => {
          const s = SEVERITY[alert.severity]
          const SIcon = s.Icon
          return (
            <div key={alert.id} className={`border rounded-2xl p-4 flex items-start gap-4 ${s.ring}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white border border-emerald-200 shadow-sm`}>
                <SIcon className={`w-5 h-5 ${s.icon}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full text-white ${s.typeBg}`}>
                    {alert.type}
                  </span>
                  <span className="text-xs font-bold text-emerald-900">{alert.zoneName}</span>
                  <span className="text-[10px] text-emerald-600 font-mono bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {alert.camera}
                  </span>
                  {alert.status === 'resolved' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      ✓ Resolved
                    </span>
                  )}
                </div>
                <p className="text-sm text-emerald-900 leading-relaxed">{alert.description}</p>
                <p className="text-xs text-emerald-600 mt-2">
                  <span className="font-medium">Triggered:</span> {fmt(alert.triggeredAt)}
                  {alert.resolvedAt && (
                    <span className="ml-2">
                      <span className="font-medium">Resolved:</span> {fmt(alert.resolvedAt)}
                    </span>
                  )}
                </p>
              </div>

              {permissions.canResolveAlerts && alert.status === 'active' && (
                <button
                  onClick={() => resolve(alert.id)}
                  className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 transition-colors shadow-sm"
                >
                  Resolve
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Info footer */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-700 leading-relaxed">
        <strong>Note:</strong> Alerts are generated automatically when zone occupancy exceeds the configured threshold.
        Critical alerts (≥ 90%) are escalated immediately. The system complies with KIU's Data Protection Policy —
        no biometric data is stored.
      </div>
    </div>
  )
}
