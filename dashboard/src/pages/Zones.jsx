import { useSimulation } from '../context/SimulationContext'
import { MapPin, Camera, TrendingUp, TrendingDown } from 'lucide-react'

const STATUS = {
  normal:  { label: 'Normal',  card: 'border-slate-200',   badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
  warning: { label: 'Warning', card: 'border-amber-300',   badge: 'bg-amber-100 text-amber-700',     bar: 'bg-amber-500'   },
  alert:   { label: 'Alert',   card: 'border-red-300',     badge: 'bg-red-100 text-red-700',         bar: 'bg-red-500'     },
}

function ZoneCard({ zone }) {
  const pct    = Math.round((zone.currentCount / zone.capacity) * 100)
  const status = pct >= 90 ? 'alert' : pct >= zone.threshold ? 'warning' : 'normal'
  const s      = STATUS[status]

  return (
    <div className={`bg-white rounded-2xl border-2 ${s.card} shadow-sm hover:shadow-md transition-shadow p-5 space-y-4`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-bold text-slate-800 text-sm leading-tight">{zone.name}</h3>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{zone.location}</span>
          </div>
        </div>
        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${s.badge}`}>
          {s.label}
        </span>
      </div>

      {/* Big count */}
      <div className="flex items-end gap-1.5">
        <span className="text-5xl font-black text-slate-800 tabular-nums leading-none">
          {zone.currentCount}
        </span>
        <div className="mb-1.5 text-slate-400">
          <span className="text-lg">/ </span>
          <span className="text-lg font-semibold">{zone.capacity}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Occupancy</span>
          <span className="font-bold tabular-nums">{pct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5">
          <div
            className={`${s.bar} h-2.5 rounded-full transition-all duration-500 relative`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        {/* Threshold marker */}
        <div className="relative h-0">
          <div
            className="absolute top-0 w-0.5 h-3 bg-slate-400 rounded"
            style={{ left: `${zone.threshold}%`, transform: 'translateY(-8px)' }}
            title={`Alert threshold: ${zone.threshold}%`}
          />
        </div>
      </div>

      {/* In / Out / Camera */}
      <div className="flex items-center gap-0 pt-3 border-t border-slate-100">
        <div className="flex-1 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">In</p>
            <p className="text-sm font-black text-slate-700 tabular-nums">{zone.inCount.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
            <TrendingDown className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Out</p>
            <p className="text-sm font-black text-slate-700 tabular-nums">{zone.outCount.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
          <Camera className="w-3 h-3" />
          {zone.camera}
        </div>
      </div>
    </div>
  )
}

export default function Zones() {
  const { zones, totalCount, alertCount } = useSimulation()

  const netFlow = zones.reduce((s, z) => s + z.inCount - z.outCount, 0)

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Live Zone Monitoring</h1>
          <p className="text-sm text-slate-500 mt-0.5">7 zones · 7 cameras · updated every 2 seconds</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-bold text-emerald-700 uppercase tracking-wide">LIVE</span>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
          <p className="text-3xl font-black text-slate-800 tabular-nums">{totalCount.toLocaleString()}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Total On Campus</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
          <p className="text-3xl font-black text-blue-600">{zones.length}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Active Cameras</p>
        </div>
        <div className={`border rounded-xl p-4 text-center shadow-sm ${
          alertCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'
        }`}>
          <p className={`text-3xl font-black tabular-nums ${alertCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
            {alertCount}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Zones Above Threshold</p>
        </div>
      </div>

      {/* Zone grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {zones.map(zone => <ZoneCard key={zone.id} zone={zone} />)}
      </div>

      {/* Legend */}
      <p className="text-xs text-slate-400 flex items-center gap-1.5">
        <span>│</span> The thin vertical marker on each bar shows the alert threshold.
        Cards highlight in amber (warning) or red (alert) when exceeded.
      </p>
    </div>
  )
}
