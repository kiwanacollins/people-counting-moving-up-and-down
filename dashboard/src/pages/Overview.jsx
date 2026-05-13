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

  // Stat cards grid - make first one larger like Donezo
  const statCardClasses = (index) => index === 0 ? 'md:col-span-2 lg:col-span-1' : ''

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page intro */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-emerald-900">Campus Dashboard</h1>
          <p className="text-sm text-emerald-600 mt-1">
            KIU Kansanga Main Campus · Real-time occupancy monitoring across all 7 zones
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-600/20">
          + Add Zone
        </button>
      </div>

      {/* Stat cards - first one spans 2 cols on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">Campus Population</p>
              <p className="text-5xl font-black text-emerald-900 mt-2 tabular-nums">{totalCount.toLocaleString()}</p>
              <p className="text-sm text-emerald-700 font-medium mt-3 flex items-center gap-1">
                <span className="text-emerald-600">↑</span>
                <span>+12 from last hour</span>
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <StatCard
          title="Active Zones"
          value={`${zones.length}/${zones.length}`}
          subtitle="All cameras operational"
          icon={MapPin}
          color="teal"
        />
        <StatCard
          title="Active Alerts"
          value={alertCount}
          subtitle={alertCount > 0 ? 'Zones above threshold' : 'All zones normal'}
          icon={AlertTriangle}
          color={alertCount > 0 ? 'amber' : 'emerald'}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Hourly trend */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-emerald-900">Campus Traffic – Today (Hourly)</h3>
              <p className="text-xs text-emerald-600 mt-0.5">Total people entering and occupying campus</p>
            </div>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-medium">
              13 May 2026
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={HOURLY_TREND} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#10b981' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#10b981' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #dcfce7', boxShadow: '0 4px 12px rgba(16,185,129,0.1)' }}
                formatter={(v) => [v.toLocaleString(), 'Total People']}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#059669"
                strokeWidth={3}
                dot={{ fill: '#059669', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#047857' }}
                name="Total"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Zone status */}
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-emerald-900 mb-5">Zone Status</h3>
          <div className="space-y-4">
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
                    <span className="text-xs text-emerald-700 font-medium truncate max-w-[140px]">
                      {zone.name}
                    </span>
                    <span className={`text-xs font-bold tabular-nums ${textColor}`}>{pct}%</span>
                  </div>
                  <div className="w-full bg-emerald-100 rounded-full h-2">
                    <div
                      className={`${barColor} h-2 rounded-full transition-all duration-700`}
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
      <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
        <div className="mb-5">
          <h3 className="text-sm font-bold text-emerald-900">Zone Occupancy vs. Capacity</h3>
          <p className="text-xs text-emerald-600 mt-0.5">Current occupancy levels across all zones</p>
        </div>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={zoneBarData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#10b981' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#10b981' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #dcfce7' }}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Bar dataKey="Capacity" fill="#e0f2fe" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Current"  fill="#059669" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
