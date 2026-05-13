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

  return (
    <SimulationProvider>
      <BrowserRouter>
        <Layout user={user} onLogout={() => setUser(null)}>
          <Routes>
            <Route path="/"         element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/zones"    element={<Zones />} />
            <Route path="/reports"  element={<Reports />} />
            <Route path="/alerts"   element={<Alerts />} />
            <Route path="*"         element={<Navigate to="/overview" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </SimulationProvider>
  )
}
