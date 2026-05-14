import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SimulationProvider } from './context/SimulationContext'
import Login    from './pages/Login'
import Overview from './pages/Overview'
import Zones    from './pages/Zones'
import Reports  from './pages/Reports'
import Alerts   from './pages/Alerts'
import Sidebar  from './components/Sidebar'
import TopBar   from './components/TopBar'
import { getPermissions } from './data/roles'

function Layout({ user, onLogout, children }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)

  if (!user) return <Login onLogin={setUser} />

  const permissions = getPermissions(user.role)
  const defaultRoute = permissions.routes[0] || '/overview'

  return (
    <SimulationProvider>
      <BrowserRouter>
        <Layout user={user} onLogout={() => setUser(null)}>
          <Routes>
            <Route path="/"         element={<Navigate to={defaultRoute} replace />} />
            {permissions.routes.includes('/overview') && (
              <Route path="/overview" element={<Overview user={user} />} />
            )}
            {permissions.routes.includes('/zones') && (
              <Route path="/zones" element={<Zones user={user} />} />
            )}
            {permissions.routes.includes('/reports') && (
              <Route path="/reports" element={<Reports user={user} />} />
            )}
            {permissions.routes.includes('/alerts') && (
              <Route path="/alerts" element={<Alerts user={user} />} />
            )}
            <Route path="*"         element={<Navigate to={defaultRoute} replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </SimulationProvider>
  )
}
