import { Bell, Activity } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useSimulation } from '../context/SimulationContext'

const PAGE_TITLES = {
  '/overview': 'Dashboard Overview',
  '/zones':    'Live Zone Monitoring',
  '/reports':  'Occupancy Reports',
  '/alerts':   'Alerts & Notifications',
}

export default function TopBar({ user }) {
  const { alertCount } = useSimulation()
  const location = useLocation()
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  const title = PAGE_TITLES[location.pathname] || 'KIU Detection System'

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-4 flex-shrink-0">
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-bold text-slate-800 leading-tight">{title}</h2>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
          <Activity className="w-3 h-3 text-emerald-500 flex-shrink-0" />
          <span>Live monitoring</span>
          <span className="text-slate-300">·</span>
          <span>{dateStr}</span>
          <span className="text-slate-300">·</span>
          <span className="tabular-nums font-medium text-slate-500">{timeStr}</span>
        </div>
      </div>

      {/* Notification bell */}
      <div className="relative cursor-pointer">
        <Bell className="w-5 h-5 text-slate-500 hover:text-slate-700 transition-colors" />
        {alertCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
            {alertCount}
          </span>
        )}
      </div>

      {/* User */}
      <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
          {user.name.charAt(0)}
        </div>
        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-slate-700 leading-tight">{user.name.split(' ')[0]}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">{user.role}</p>
        </div>
      </div>
    </header>
  )
}
