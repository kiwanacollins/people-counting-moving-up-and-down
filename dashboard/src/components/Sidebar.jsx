import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Video, BarChart2, Bell, ClipboardList, Mail, LogOut, Shield } from 'lucide-react'
import { getPermissions } from '../data/roles'
import { useSimulation } from '../context/SimulationContext'

const NAV = [
  { to: '/overview', icon: LayoutDashboard, label: 'Overview' },
  { to: '/zones',    icon: Video,           label: 'Live Zones' },
  { to: '/reports',  icon: BarChart2,       label: 'Reports' },
  { to: '/alerts',   icon: Bell,            label: 'Alerts' },
  { to: '/incidents', icon: ClipboardList,  label: 'Incidents' },
  { to: '/messages',  icon: Mail,           label: 'Messages' },
]

export default function Sidebar({ user, onLogout }) {
  const permissions = getPermissions(user.role)
  const visibleNav = NAV.filter(item => permissions.routes.includes(item.to))
  const { messages } = useSimulation()

  const senderRole = user.role === 'Administrator' ? 'Security Staff' : 'Administrator'
  const unreadCount = messages.filter(m => m.from === senderRole && m.to === user.role && !m.read).length

  return (
    <aside className="w-60 flex-shrink-0 bg-gradient-to-b from-emerald-800 to-teal-900 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-emerald-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">KIU People</p>
            <p className="text-emerald-200 text-xs">Detection</p>
          </div>
        </div>
      </div>

      {/* Live badge */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/30 border border-emerald-500/50 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300 text-xs font-semibold tracking-wide">SYSTEM LIVE</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-1 space-y-0.5">
        <p className="text-emerald-300/60 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
          Navigation
        </p>
        {visibleNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                  : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {to === '/messages' && unreadCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* University name */}
      <div className="px-5 py-3 border-t border-emerald-700 border-b">
        <p className="text-emerald-200 text-[10px] leading-relaxed font-medium">
          Kampala International University<br />
          School of Mathematics &amp; Computing
        </p>
      </div>

      {/* User + logout */}
      <div className="px-3 py-3">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user.name}</p>
            <p className="text-emerald-300 text-[10px]">{user.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-emerald-200 hover:bg-emerald-700 hover:text-white text-xs font-medium transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
