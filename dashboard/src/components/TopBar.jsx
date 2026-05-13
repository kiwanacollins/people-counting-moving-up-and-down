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
    <header className="h-14 bg-white border-b border-emerald-100 flex items-center px-6 gap-4 flex-shrink-0">
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-bold text-emerald-900 leading-tight">{title}</h2>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-0.5">
          <Activity className="w-3 h-3 text-emerald-500 flex-shrink-0" />
          <span>Live monitoring</span>
          <span className="text-emerald-300">·</span>
          <span>{dateStr}</span>
          <span className="text-emerald-300">·</span>
          <span className="tabular-nums font-medium text-emerald-700">{timeStr}</span>
        </div>
      </div>

      {/* Notification bell */}
      <div className="relative cursor-pointer">
        <Bell className="w-5 h-5 text-emerald-600 hover:text-emerald-800 transition-colors" />
        {alertCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
            {alertCount}
          </span>
        )}
      </div>

      {/* User */}
      <div className="flex items-center gap-2.5 pl-3 border-l border-emerald-100">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white text-sm font-bold">
          {user.name.charAt(0)}
        </div>
        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-emerald-900 leading-tight">{user.name.split(' ')[0]}</p>
          <p className="text-[10px] text-emerald-600 uppercase tracking-wide">{user.role}</p>
        </div>
      </div>
    </header>
  )
}
