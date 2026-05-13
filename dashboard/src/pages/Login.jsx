import { useState } from 'react'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { USERS } from '../data/mockData'
import heroImage from '../assets/ai-people-tracking-hero.avif'

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
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex">
      {/* Left side - Hero image */}
      <div className="hidden lg:flex lg:w-1/2 relative items-end justify-start p-12">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-black text-white leading-tight mb-2">
            Real-Time<br />People Detection
          </h2>
          <p className="text-emerald-200 text-lg font-semibold">
            Capturing Moments, Creating Intelligence
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-black">KIU Campus</h1>
                <p className="text-xs text-emerald-600 font-semibold">People Detection System</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Welcome Back</h2>
            <p className="text-sm text-slate-600 mb-5">Sign in to your account to continue</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-slate-900 placeholder-slate-400 transition-all"
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-slate-900 placeholder-slate-400 pr-11 transition-all"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-300 px-3 py-2.5 rounded-xl">
                  <span className="text-red-500">⚠</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-emerald-400 disabled:to-teal-400 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-600/30 mt-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-5 pt-5 border-t border-gray-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                Demo Accounts — tap to fill
              </p>
              <div className="space-y-1.5">
                {USERS.map(u => (
                  <button
                    key={u.username}
                    type="button"
                    onClick={() => fillDemo(u.username, u.password)}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-300 transition-all text-[11px]"
                  >
                    <span className="font-mono font-bold text-slate-700">{u.username}</span>
                    <span className="font-mono text-slate-500 text-[9px]">{u.password}</span>
                    <span className="text-emerald-400 text-[9px] font-bold uppercase tracking-wide">{u.role}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-600 text-[10px] mt-6 leading-relaxed">
            © 2026 Kampala International University<br />
            <span className="text-slate-500">Final Year Project • SOMAC 2025/2026</span>
          </p>
        </div>
      </div>
    </div>
  )
}
