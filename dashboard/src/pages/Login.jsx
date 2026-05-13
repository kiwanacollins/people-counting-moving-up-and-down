import { useState } from 'react'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { USERS } from '../data/mockData'
import kiuImage from '../assets/kiu-image.jpg'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const user = USERS.find(u => u.username === username && u.password === password)
      if (user) {
        onLogin(user)
      } else {
        setError('Invalid username or password. Please try again.')
      }
      setLoading(false)
    }, 800)
  }

  const fillDemo = (u, p) => { setUsername(u); setPassword(p); setError('') }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
      />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-xl shadow-blue-900/50 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Kampala International University
          </h1>
          <p className="text-blue-300 mt-1.5 font-medium">People Detection &amp; Counting System</p>
          <p className="text-slate-500 text-xs mt-1">School of Mathematics &amp; Computing (SOMAC) · 2025/2026</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4">
            <h2 className="text-white font-bold text-base">Sign In to Dashboard</h2>
            <p className="text-blue-200 text-xs mt-0.5">Authorized personnel only</p>
          </div>

          <div className="px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-slate-50 transition-all"
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-slate-50 pr-11 transition-all"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2.5 rounded-xl">
                  <span className="text-red-500">⚠</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-600/30 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating…
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                Demo Accounts — click to fill
              </p>
              <div className="space-y-1.5">
                {USERS.map(u => (
                  <button
                    key={u.username}
                    type="button"
                    onClick={() => fillDemo(u.username, u.password)}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all text-xs"
                  >
                    <span className="font-mono font-semibold text-slate-700">{u.username}</span>
                    <span className="font-mono text-slate-400">{u.password}</span>
                    <span className="text-blue-500 text-[10px] font-semibold uppercase tracking-wide">{u.role}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          © 2026 Kampala International University · Final Year Project<br />
          <span className="text-slate-700">KIWANA COLLINS · MUMARASHAVU YVETTE · NDAGIRE PATRICIA · GIFT PROSCOVIA</span>
        </p>
      </div>
    </div>
  )
}
