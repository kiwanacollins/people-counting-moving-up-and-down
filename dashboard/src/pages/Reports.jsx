import { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { REPORT_DATA, WEEKLY_DATA } from '../data/mockData'

const PERIODS = [
  ['today', 'Today'],
  ['week',  'This Week'],
  ['month', 'This Month'],
]

export default function Reports() {
  const [period, setPeriod] = useState('today')
  const data = REPORT_DATA[period]

  const totals = {
    avgOccupancy:  data.reduce((s, r) => s + r.avgOccupancy,  0),
    peakOccupancy: Math.max(...data.map(r => r.peakOccupancy)),
    totalIn:       data.reduce((s, r) => s + r.totalIn,       0),
    totalOut:      data.reduce((s, r) => s + r.totalOut,      0),
  }

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Occupancy Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">Historical zone occupancy data — KIU Kansanga Campus</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/20">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Period tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {PERIODS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              period === key
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Weekly bar chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Daily Campus Traffic — Past 7 Days</h3>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={WEEKLY_DATA} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0' }} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Bar dataKey="total" fill="#2563eb"  name="Total Entries"   radius={[4, 4, 0, 0]} />
            <Bar dataKey="peak"  fill="#93c5fd"  name="Peak Occupancy"  radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-700">
              {period === 'today' ? "Today's Summary" : period === 'week' ? "This Week's Summary" : "This Month's Summary"}
            </h3>
          </div>
          <span className="text-xs text-slate-400">{data.length} zones</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['Zone', 'Avg. Occupancy', 'Peak', 'Total In', 'Total Out'].map(h => (
                  <th key={h} className={`px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide ${
                    h === 'Zone' ? 'text-left' : 'text-right'
                  }`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-700">{row.zone}</td>
                  <td className="px-5 py-3 text-right text-slate-600 tabular-nums">{row.avgOccupancy}</td>
                  <td className="px-5 py-3 text-right font-bold text-slate-700 tabular-nums">{row.peakOccupancy}</td>
                  <td className="px-5 py-3 text-right font-semibold text-emerald-600 tabular-nums">
                    {row.totalIn.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-red-400 tabular-nums">
                    {row.totalOut.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td className="px-5 py-3 font-black text-slate-700">Campus Total</td>
                <td className="px-5 py-3 text-right font-black text-slate-700 tabular-nums">{totals.avgOccupancy}</td>
                <td className="px-5 py-3 text-right font-black text-slate-700 tabular-nums">{totals.peakOccupancy}</td>
                <td className="px-5 py-3 text-right font-black text-emerald-600 tabular-nums">
                  {totals.totalIn.toLocaleString()}
                </td>
                <td className="px-5 py-3 text-right font-black text-red-400 tabular-nums">
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
          { label: 'Mean Abs. Error',    value: '3.2',    sub: 'Persons per frame (MAE)',          color: 'text-blue-600'    },
          { label: 'Processing Speed',   value: '28 FPS', sub: 'Average inference speed',          color: 'text-purple-600'  },
        ].map(m => (
          <div key={m.label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{m.label}</p>
            <p className={`text-3xl font-black mt-1 ${m.color}`}>{m.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
