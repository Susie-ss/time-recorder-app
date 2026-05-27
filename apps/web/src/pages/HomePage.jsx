import React, { useState, useEffect } from 'react'
import { useStore } from '../store'
import { Shield, Clock, FileText, Mic, Users, Plus } from 'lucide-react'

export default function HomePage() {
  const { user, assets, messages, relatives, sendHeartbeat, showToast } = useStore()
  const [beating, setBeating] = useState(false)

  const handleHeartbeat = async () => {
    setBeating(true)
    try {
      await sendHeartbeat()
      showToast('已确认"我很好" ❤️', 'success')
    } catch {
      showToast('确认失败', 'error')
    }
    setTimeout(() => setBeating(false), 1000)
  }

  const formatHb = () => {
    if (!user?.last_heartbeat) return '未确认'
    const d = new Date(user.last_heartbeat)
    return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`
  }

  const daysSinceHb = () => {
    if (!user?.last_heartbeat) return null
    const diff = Date.now() - new Date(user.last_heartbeat).getTime()
    return Math.floor(diff / 86400000)
  }

  const days = daysSinceHb()
  const safeColor = days === null ? 'amber' : days < 7 ? 'emerald' : days < 14 ? 'amber' : 'red'

  const colorMap = {
    emerald: { ring: 'ring-emerald-500/30', dot: 'bg-emerald-400', text: 'text-emerald-400', label: '状态安全' },
    amber:   { ring: 'ring-amber-500/30',   dot: 'bg-amber-400',   text: 'text-amber-400',   label: '请确认状态' },
    red:     { ring: 'ring-red-500/30',      dot: 'bg-red-400',     text: 'text-red-400',      label: '已超时未响应' },
  }
  const c = colorMap[safeColor]

  // Feed items
  const feed = [
    ...assets.slice(0, 3).map(a => ({ type: 'asset', item: a })),
    ...messages.slice(0, 3).map(m => ({ type: 'message', item: m })),
  ].sort((a, b) => new Date(b.item.created_at) - new Date(a.item.created_at)).slice(0, 5)

  return (
    <div className="space-y-5">
      {/* Status Ring */}
      <div className="glass-card rounded-3xl p-5 border border-slate-800 text-center space-y-3">
        <div className={`w-24 h-24 mx-auto rounded-full ring-4 ${c.ring} flex items-center justify-center relative`}>
          <div className={`absolute w-3 h-3 ${c.dot} rounded-full top-1 right-1 ${safeColor === 'emerald' ? 'animate-pulse' : ''}`} />
          <Shield className={`w-10 h-10 ${c.text}`} />
        </div>
        <div>
          <p className={`font-bold text-base ${c.text}`}>{c.label}</p>
          <p className="text-xs text-slate-500 mt-0.5">上次确认：{formatHb()}</p>
        </div>
        <button
          onClick={handleHeartbeat}
          className={`w-full py-3.5 font-bold text-sm rounded-2xl transition-all active:scale-95
            ${beating
              ? 'bg-emerald-600 text-white scale-95'
              : 'bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-700/30 text-emerald-300 hover:border-emerald-600/50'
            }`}
        >
          {beating ? '✓ 已确认' : '❤️  我很好'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: FileText, label: '凭证资产', count: assets.length, color: 'text-purple-400' },
          { icon: Mic, label: '留声舱', count: messages.length, color: 'text-blue-400' },
          { icon: Users, label: 'AI 亲人', count: relatives.length, color: 'text-amber-400' },
        ].map(({ icon: Icon, label, count, color }) => (
          <div key={label} className="glass-card rounded-2xl p-3 border border-slate-800 text-center space-y-1">
            <Icon className={`w-5 h-5 mx-auto ${color}`} />
            <p className="text-xl font-bold text-white">{count}</p>
            <p className="text-[10px] text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Activity Feed */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">近期动态</h3>
        {feed.length === 0 ? (
          <div className="glass-card rounded-2xl p-4 border border-slate-800 text-center text-slate-600 text-sm">
            暂无动态 — 开始添加你的资产或留声
          </div>
        ) : (
          <div className="space-y-2">
            {feed.map(({ type, item }) => (
              <div key={item.id} className="glass-card rounded-2xl px-4 py-3 border border-slate-800 flex items-center space-x-3">
                <span className="text-lg">{type === 'asset' ? '📦' : '💌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{item.title}</p>
                  <p className="text-[10px] text-slate-500">{type === 'asset' ? '资产凭证' : '留声舱'} · {new Date(item.created_at).toLocaleDateString('zh-CN')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
