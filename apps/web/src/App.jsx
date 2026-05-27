import React, { useState, useEffect } from 'react'
import { useStore } from './store'
import api from './api/client'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import AssetsPage from './pages/AssetsPage'
import MessagesPage from './pages/MessagesPage'
import RelativesPage from './pages/RelativesPage'
import ProfilePage from './pages/ProfilePage'
import Toast from './components/Toast'
import { Home, Package, Mic, Users, UserCircle } from 'lucide-react'

const TABS = [
  { id: 'home',      label: '首页',    Icon: Home,        Page: HomePage },
  { id: 'assets',    label: '资产库',  Icon: Package,     Page: AssetsPage },
  { id: 'messages',  label: '留声',    Icon: Mic,         Page: MessagesPage },
  { id: 'relatives', label: 'AI陪伴',  Icon: Users,       Page: RelativesPage },
  { id: 'profile',   label: '我的',    Icon: UserCircle,  Page: ProfilePage },
]

export default function App() {
  const { token, user, setAuth, fetchAssets, fetchMessages, fetchRelatives } = useStore()
  const [activeTab, setActiveTab] = useState('home')
  const [loading, setLoading] = useState(!!localStorage.getItem('tr_token'))

  // Auto-restore session
  useEffect(() => {
    if (!token) { setLoading(false); return }
    api.get('/auth/me')
      .then(u => {
        setAuth(token, u)
        return Promise.all([fetchAssets(), fetchMessages(), fetchRelatives()])
      })
      .catch(() => {
        localStorage.removeItem('tr_token')
        useStore.setState({ token: null })
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-4xl animate-pulse-slow">🕰️</div>
      </div>
    )
  }

  if (!token || !user) return <><AuthPage /><Toast /></>

  const ActivePage = TABS.find(t => t.id === activeTab)?.Page || HomePage

  return (
    <div className="flex flex-col h-screen bg-slate-950 max-w-md mx-auto relative">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-12 pb-4 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🕰️</span>
            <h1 className="text-base font-bold text-white tracking-tight">时光留声机</h1>
          </div>
          <div className="text-[10px] text-slate-600 font-mono">
            {user?.name}
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4">
        <ActivePage key={activeTab} />
      </div>

      {/* Bottom Tab Bar */}
      <div className="flex-shrink-0 border-t border-slate-800/50 pb-safe">
        <div className="flex">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center py-3 space-y-0.5 transition-all active:scale-90
                ${activeTab === id ? 'text-purple-400' : 'text-slate-600 hover:text-slate-400'}`}>
              <Icon size={20} strokeWidth={activeTab === id ? 2.5 : 1.8} />
              <span className="text-[9px] font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <Toast />
    </div>
  )
}
