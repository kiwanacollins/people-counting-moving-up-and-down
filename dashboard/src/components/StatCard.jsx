export default function StatCard({ title, value, subtitle, icon: Icon, color = 'emerald', trend }) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600',
    teal:    'bg-teal-50 text-teal-600',
    amber:   'bg-amber-50 text-amber-600',
    red:     'bg-red-50 text-red-600',
    purple:  'bg-purple-50 text-purple-600',
    slate:   'bg-slate-100 text-slate-600',
  }

  const bgMap = {
    emerald: 'bg-gradient-to-br from-emerald-600 to-teal-700',
    teal:    'bg-gradient-to-br from-teal-600 to-emerald-700',
    amber:   'bg-gradient-to-br from-amber-500 to-amber-600',
    red:     'bg-gradient-to-br from-red-500 to-red-600',
    purple:  'bg-gradient-to-br from-purple-500 to-purple-600',
    slate:   'bg-gradient-to-br from-slate-500 to-slate-600',
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-black text-emerald-900 mt-1 tabular-nums">{value}</p>
          {subtitle && <p className="text-xs text-emerald-600/70 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs mt-1.5 font-semibold flex items-center gap-1 ${trend.positive ? 'text-emerald-600' : 'text-red-500'}`}>
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>{trend.text}</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bgMap[color]}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
    </div>
  )
}
