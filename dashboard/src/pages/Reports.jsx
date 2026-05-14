import { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { REPORT_DATA, WEEKLY_DATA } from '../data/mockData'
import { getPermissions } from '../data/roles'

const PERIODS = [
  ['today', 'Today'],
  ['week',  'This Week'],
  ['month', 'This Month'],
]

export default function Reports({ user }) {
  const [period, setPeriod] = useState('today')
  const permissions = getPermissions(user.role)
  const data = REPORT_DATA[period]

  const totals = {
    avgOccupancy:  data.reduce((s, r) => s + r.avgOccupancy,  0),
    peakOccupancy: Math.max(...data.map(r => r.peakOccupancy)),
    totalIn:       data.reduce((s, r) => s + r.totalIn,       0),
    totalOut:      data.reduce((s, r) => s + r.totalOut,      0),
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-emerald-900">Occupancy Reports</h1>
          <p className="text-sm text-emerald-600 mt-1">Historical zone occupancy data — KIU Kansanga Campus</p>
        </div>
        {permissions.canExportReports ? (
          <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-600/20">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        ) : (
          <span className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide border border-emerald-200 bg-white text-emerald-700">
            Read Only
          </span>
        )}
      </div>

      {/* Period tabs */}
      <div className="flex gap-1 bg-emerald-50 p-1 rounded-xl w-fit border border-emerald-200">
        {PERIODS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              period === key
                ? 'bg-white text-emerald-900 shadow-sm border border-emerald-200'
                : 'text-emerald-600 hover:text-emerald-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Weekly bar chart */}
      <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
        <div className="mb-5">
          <h3 className="text-sm font-bold text-emerald-900">Daily Campus Traffic — Past 7 Days</h3>
          <p className="text-xs text-emerald-600 mt-0.5">Total entries and peak occupancy per day</p>
        </div>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={WEEKLY_DATA} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#10b981' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#10b981' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #dcfce7' }} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Bar dataKey="total" fill="#059669"  name="Total Entries"   radius={[4, 4, 0, 0]} />
            <Bar dataKey="peak"  fill="#a7f3d0"  name="Peak Occupancy"  radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data table */}
      <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-emerald-900">
              {period === 'today' ? "Today's Summary" : period === 'week' ? "This Week's Summary" : "This Month's Summary"}
            </h3>
          </div>
          <span className="text-xs text-emerald-600 font-medium">{data.length} zones</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-50">
                {['Zone', 'Avg. Occupancy', 'Peak', 'Total In', 'Total Out'].map(h => (
                  <th key={h} className={`px-6 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wide ${
                    h === 'Zone' ? 'text-left' : 'text-right'
                  }`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-t border-emerald-100 hover:bg-emerald-50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-emerald-900">{row.zone}</td>
                  <td className="px-6 py-3 text-right text-emerald-700 tabular-nums">{row.avgOccupancy}</td>
                  <td className="px-6 py-3 text-right font-bold text-emerald-900 tabular-nums">{row.peakOccupancy}</td>
                  <td className="px-6 py-3 text-right font-semibold text-emerald-600 tabular-nums">
                    {row.totalIn.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-right font-semibold text-red-500 tabular-nums">
                    {row.totalOut.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-emerald-200 bg-emerald-50">
                <td className="px-6 py-3 font-black text-emerald-900">Campus Total</td>
                <td className="px-6 py-3 text-right font-black text-emerald-900 tabular-nums">{totals.avgOccupancy}</td>
                <td className="px-6 py-3 text-right font-black text-emerald-900 tabular-nums">{totals.peakOccupancy}</td>
                <td className="px-6 py-3 text-right font-black text-emerald-600 tabular-nums">
                  {totals.totalIn.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-right font-black text-red-500 tabular-nums">
                  {totals.totalOut.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* System performance box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Model Accuracy',     value: '91.4%',  sub: 'Detection rate on KIU dataset',  color: 'text-emerald-600' },
          { label: 'Mean Abs. Error',    value: '3.2',    sub: 'Persons per frame (MAE)',          color: 'text-teal-600'    },
          { label: 'Processing Speed',   value: '28 FPS', sub: 'Average inference speed',          color: 'text-emerald-600'  },
        ].map(m => (
          <div key={m.label} className="bg-white border border-emerald-100 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">{m.label}</p>
            <p className={`text-3xl font-black mt-2 ${m.color}`}>{m.value}</p>
            <p className="text-xs text-emerald-600 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
