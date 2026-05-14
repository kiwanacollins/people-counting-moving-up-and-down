import { useState, useEffect } from 'react'
import { useSimulation } from '../context/SimulationContext'
import { Send, Clock } from 'lucide-react'

function fmtTime(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function fmtDate(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()
}

export default function Messages({ user }) {
  const { messages, sendMessage, markMessagesAsRead } = useSimulation()
  const [newMessage, setNewMessage] = useState('')

  const isAdmin = user.role === 'Administrator'
  const recipientRole = isAdmin ? 'Security Staff' : 'Administrator'

  // Both roles see ALL messages between admin and security
  const userMessages = messages.filter(m => {
    const isAdminToSecurity = m.from === 'Administrator' && m.to === 'Security Staff'
    const isSecurityToAdmin = m.from === 'Security Staff' && m.to === 'Administrator'
    return isAdminToSecurity || isSecurityToAdmin
  })

  // Mark messages from the other party as read when page is open
  useEffect(() => {
    const unread = userMessages.filter(m => m.from === recipientRole && !m.read).map(m => m.id)
    if (unread.length > 0) markMessagesAsRead(unread)
  }, [messages])

  const onSubmit = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    sendMessage(user.role, recipientRole, newMessage)
    setNewMessage('')
  }

  const groupedByDate = userMessages.reduce((acc, msg) => {
    const date = new Date(msg.timestamp).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(msg)
    return acc
  }, {})

  return (
    <div className="space-y-6 max-w-5xl h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black">Messages</h1>
            <p className="text-emerald-100 mt-1">Secure communication with {recipientRole}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{isAdmin ? '🛡️ Security Team' : '👤 Admin'}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-xs font-medium text-emerald-100">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-emerald-100 shadow-lg flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {userMessages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-lg font-bold text-emerald-900">Start a conversation</p>
                <p className="text-sm text-emerald-600">No messages yet. Send the first message to begin.</p>
              </div>
            </div>
          )}

          {Object.entries(groupedByDate).map(([date, msgs]) => (
            <div key={date}>
              <div className="flex items-center justify-center mb-6">
                <span className="text-[11px] uppercase tracking-widest font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full">
                  {date}
                </span>
              </div>
              <div className="space-y-3">
                {msgs.map(msg => {
                  const isOwn = msg.from === user.role
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      {!isOwn && (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-emerald-700">
                          {recipientRole.charAt(0)}
                        </div>
                      )}
                      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`max-w-sm px-4 py-3 rounded-2xl shadow-sm ${
                            isOwn
                              ? 'bg-emerald-600 text-white rounded-tr-none'
                              : 'bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-tl-none'
                          }`}
                        >
                          <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                        </div>
                        <p
                          className={`text-xs mt-1.5 font-medium ${
                            isOwn ? 'text-emerald-600' : 'text-emerald-500'
                          }`}
                        >
                          {fmtTime(msg.timestamp)}
                        </p>
                      </div>
                      {isOwn && (
                        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                          {user.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="border-t border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 p-4">
          <form onSubmit={onSubmit} className="flex items-center gap-3">
            <input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 rounded-2xl border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:from-emerald-300 disabled:to-teal-400 text-white transition-all shadow-md hover:shadow-lg active:scale-95"
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
