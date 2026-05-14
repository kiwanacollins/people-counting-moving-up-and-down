import { useState } from 'react'
import { useSimulation } from '../context/SimulationContext'
import StatCard from '../components/StatCard'
import { Users, MapPin, AlertTriangle } from 'lucide-react'
import {
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { HOURLY_TREND } from '../data/mockData'
import { getPermissions } from '../data/roles'

export default function Overview({ user }) {
  const { zones, totalCount, alertCount, addZone } = useSimulation()
  const permissions = getPermissions(user.role)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    shortName: '',
    location: '',
    camera: '',
    capacity: 100,
    currentCount: 0,
    inCount: 0,
    outCount: 0,
    threshold: 80,
  })

  const zoneBarData = zones.map(z => ({
    name: z.shortName,
    Current: z.currentCount,
    Capacity: z.capacity,
  }))

  const onFormChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const resetForm = () => {
    setForm({
      name: '',
      shortName: '',
      location: '',
      camera: '',
      capacity: 100,
      currentCount: 0,
      inCount: 0,
      outCount: 0,
      threshold: 80,
    })
  }

  const onSubmitZone = (e) => {
    e.preventDefault()
    addZone(form)
    resetForm()
    setShowAddForm(false)
  }

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
        {permissions.canAddZone ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
          >
            + Add Zone
          </button>
        ) : (
          <span className="px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-xl border border-emerald-200 bg-white text-emerald-700">
            {user.role} Mode
          </span>
        )}
      </div>

      {/* Role banner */}
      <div className="bg-white border border-emerald-100 rounded-xl px-4 py-3 text-sm text-emerald-700 shadow-sm">
        {permissions.canAddZone
          ? 'Administrator access: You can add zones, export reports, and manage all alerts.'
          : user.role === 'Security Staff'
            ? 'Security access: Focus on live zones and alerts. Reporting and zone setup are restricted.'
            : 'Viewer access: Read-only monitoring for zones and reports.'}
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
          subtitle={
            user.role === 'Viewer'
              ? 'Read-only status feed'
              : alertCount > 0
                ? 'Zones above threshold'
                : 'All zones normal'
          }
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

      {/* Add zone modal */}
      {permissions.canAddZone && showAddForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={onSubmitZone}
            className="w-full max-w-2xl bg-white rounded-2xl border border-emerald-200 shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-emerald-900">Add New Zone</h3>
                <p className="text-sm text-emerald-600 mt-0.5">Create a monitored campus zone and attach a camera source.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetForm()
                  setShowAddForm(false)
                }}
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                value={form.name}
                onChange={e => onFormChange('name', e.target.value)}
                placeholder="Zone name"
                className="px-3 py-2.5 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                value={form.shortName}
                onChange={e => onFormChange('shortName', e.target.value)}
                placeholder="Short name (optional)"
                className="px-3 py-2.5 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                required
                value={form.location}
                onChange={e => onFormChange('location', e.target.value)}
                placeholder="Location"
                className="px-3 py-2.5 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                required
                value={form.camera}
                onChange={e => onFormChange('camera', e.target.value)}
                placeholder="Camera ID (e.g. CAM-08)"
                className="px-3 py-2.5 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                required
                type="number"
                min="1"
                value={form.capacity}
                onChange={e => onFormChange('capacity', Number(e.target.value))}
                placeholder="Capacity"
                className="px-3 py-2.5 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                required
                type="number"
                min="50"
                max="99"
                value={form.threshold}
                onChange={e => onFormChange('threshold', Number(e.target.value))}
                placeholder="Threshold %"
                className="px-3 py-2.5 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="number"
                min="0"
                value={form.currentCount}
                onChange={e => onFormChange('currentCount', Number(e.target.value))}
                placeholder="Current count"
                className="px-3 py-2.5 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="number"
                min="0"
                value={form.inCount}
                onChange={e => onFormChange('inCount', Number(e.target.value))}
                placeholder="Total in"
                className="px-3 py-2.5 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <input
                type="number"
                min="0"
                value={form.outCount}
                onChange={e => onFormChange('outCount', Number(e.target.value))}
                placeholder="Total out"
                className="w-full md:w-[calc(50%-0.375rem)] px-3 py-2.5 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  resetForm()
                  setShowAddForm(false)
                }}
                className="px-4 py-2 rounded-xl border border-emerald-200 text-emerald-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Save Zone
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
