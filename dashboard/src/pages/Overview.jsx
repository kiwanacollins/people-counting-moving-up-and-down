import { useSimulation } from '../context/SimulationContext'
import StatCard from '../components/StatCard'
import { Users, MapPin, AlertTriangle, TrendingUp } from 'lucide-react'
import {
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { HOURLY_TREND } from '../data/mockData'

const ZONE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

function StatusDot({ status }) {
  const c = status === 'alert' ? 'bg-red-500' : status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${c}`} />
}

export default function Overview() {
  const { zones, totalCount, alertCount } = useSimulation()

  const peakToday = 1247

  const zoneBarData = zones.map(z => ({
    name: z.shortName,
    Current: z.currentCount,
    Capacity: z.capacity,
  }))

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Page intro */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">Campus Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          KIU Kansanga Main Campus · Real-time occupancy monitoring across all 7 zones
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Campus Population"
          value={totalCount.toLocaleString()}
          subtitle="People on campus now"
          icon={Users}
          color="blue"
          trend={{ positive: true, text: '+12 from last hour' }}
        />
        <StatCard
          title="Active Zones"
          value={`${zones.length}/${zones.length}`}
          subtitle="All cameras operational"
          icon={MapPin}
          color="emerald"
        />
        <StatCard
          title="Active Alerts"
          value={alertCount}
          subtitle="Zones above threshold"
          icon={AlertTriangle}
          color={alertCount > 0 ? 'amber' : 'emerald'}
          trend={alertCount > 0 ? { positive: false, text: 'Requires attention' } : undefined}
        />
        <StatCard
          title="Today's Peak"
          value={peakToday.toLocaleString()}
          subtitle="Recorded at 11:00 AM"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Chart row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Hourly trend */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">Campus Traffic – Today (Hourly)</h3>
            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              13 May 2026
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={HOURLY_TREND} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                formatter={(v) => [v.toLocaleString(), 'Total People']}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ fill: '#2563eb', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#1d4ed8' }}
                name="Total"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Zone status */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Zone Status</h3>
          <div className="space-y-3.5">
            {zones.map(zone => {
              const pct = Math.round((zone.currentCount / zone.capacity) * 100)
              const status = pct >= 90 ? 'alert' : pct >= zone.threshold ? 'warning' : 'normal'
              const barColor =
                status === 'alert' ? 'bg-red-500' :
                status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
              const textColor =
                status === 'alert' ? 'text-red-600' :
                status === 'warning' ? 'text-amber-600' : 'text-emerald-600'
              return (
                <div key={zone.id}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <StatusDot status={status} />
                      <span className="text-xs text-slate-600 font-medium truncate max-w-[140px]">
                        {zone.name}
                      </span>
                    </div>
                    <span className={`text-xs font-bold tabular-nums ${textColor}`}>{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`${barColor} h-1.5 rounded-full transition-all duration-700`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Zone vs capacity bar chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Zone Occupancy vs. Capacity</h3>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={zoneBarData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Bar dataKey="Capacity" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Current"  fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
