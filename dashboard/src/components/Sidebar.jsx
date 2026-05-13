import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Video, BarChart2, Bell, LogOut, Shield } from 'lucide-react'

const NAV = [
  { to: '/overview', icon: LayoutDashboard, label: 'Overview' },
  { to: '/zones',    icon: Video,           label: 'Live Zones' },
  { to: '/reports',  icon: BarChart2,       label: 'Reports' },
  { to: '/alerts',   icon: Bell,            label: 'Alerts' },
]

export default function Sidebar({ user, onLogout }) {
  return (
    <aside className="w-60 flex-shrink-0 bg-slate-900 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">KIU People</p>
            <p className="text-slate-400 text-xs">Detection System</p>
          </div>
        </div>
      </div>

      {/* Live badge */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/40 border border-emerald-800/50 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-semibold tracking-wide">SYSTEM LIVE</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-1 space-y-0.5">
        <p className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
          Navigation
        </p>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* University name */}
      <div className="px-5 py-3 border-t border-slate-800 border-b">
        <p className="text-slate-500 text-[10px] leading-relaxed">
          Kampala International University<br />
          School of Mathematics &amp; Computing
        </p>
      </div>

      {/* User + logout */}
      <div className="px-3 py-3">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user.name}</p>
            <p className="text-slate-500 text-[10px]">{user.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white text-xs font-medium transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
