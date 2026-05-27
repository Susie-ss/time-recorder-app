import React, { useState, useEffect } from 'react'
import { useStore } from '../store'
import api from '../api/client'
import { User, Settings, LogOut, Bell } from 'lucide-react'

export default function ProfilePage() {
  const { user, assets, messages, relatives, logout, showToast, updateUser } = useStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', heartbeat_interval: user?.heartbeat_interval || 30 })
  const [loading, setLoading] = useState(false)

  // Sync form when user changes externally
  useEffect(() => {
    if (!editing) {
      setForm({ name: user?.name || '', heartbeat_interval: user?.heartbeat_interval || 30 })
    }
  }, [user?.name, user?.heartbeat_interval, editing])

  const save = async () => {
    setLoading(true)
    try {
      const data = await api.patch('/auth/profile', form)
      updateUser(data.user || { ...user, ...form })
      showToast('个人信息已更新', 'success')
      setEditing(false)
    } catch (e) { showToast(e, 'error') }
    finally { setLoading(false) }
  }

  const INTERVALS = [
    { v: 7,  l: '每 7 天' },
    { v: 14, l: '每 14 天' },
    { v: 30, l: '每 30 天' },
    { v: 60, l: '每 60 天' },
    { v: 90, l: '每 90 天' },
  ]

  return (
    <div className="space-y-5">
      {/* Avatar + Name */}
      <div className="glass-card rounded-3xl p-5 border border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-700/40 to-indigo-800/40 border border-purple-800/20 flex items-center justify-center">
            <User className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            {editing ? (
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="bg-slate-800 text-white text-base font-bold rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-purple-500 w-full" />
            ) : (
              <h2 className="text-base font-bold text-white">{user?.name}</h2>
            )}
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
          </div>
          <button onClick={() => setEditing(e => !e)}
            className="w-9 h-9 glass-card border border-slate-700 rounded-xl flex items-center justify-center text-slate-400 active:scale-90 transition-all">
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '资产凭证', count: assets.length, emoji: '📦' },
          { label: '留声舱', count: messages.length, emoji: '💌' },
          { label: 'AI 亲人', count: relatives.length, emoji: '👤' },
        ].map(({ label, count, emoji }) => (
          <div key={label} className="glass-card rounded-2xl p-3 border border-slate-800 text-center space-y-1">
            <span className="text-xl">{emoji}</span>
            <p className="text-xl font-bold text-white">{count}</p>
            <p className="text-[10px] text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Heartbeat setting */}
      <div className="glass-card rounded-3xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-200">心跳周期设置</h3>
        </div>
        <p className="text-xs text-slate-500">超过设定天数未确认，将通知紧急联系人</p>
        <div className="grid grid-cols-5 gap-2">
          {INTERVALS.map(({ v, l }) => (
            <button key={v} onClick={() => editing && setForm(f => ({ ...f, heartbeat_interval: v }))}
              className={`py-2 rounded-xl text-[10px] font-semibold border transition-all
                ${form.heartbeat_interval === v
                  ? 'bg-amber-700/40 border-amber-600 text-amber-300'
                  : 'glass-card border-slate-800 text-slate-500'
                } ${!editing ? 'opacity-60 cursor-default' : ''}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {editing && (
        <div className="flex space-x-3">
          <button onClick={save} disabled={loading}
            className="flex-1 py-3.5 bg-purple-600 text-white font-bold rounded-2xl active:scale-95 transition-all disabled:opacity-50 text-sm">
            {loading ? '保存中…' : '保存'}
          </button>
          <button onClick={() => setEditing(false)}
            className="py-3.5 px-5 glass-card border border-slate-700 text-slate-300 font-bold rounded-2xl active:scale-95 transition-all text-sm">
            取消
          </button>
        </div>
      )}

      {/* Account info */}
      <div className="glass-card rounded-3xl p-4 border border-slate-800 space-y-2">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">账号信息</p>
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">注册时间</span>
          <span className="text-slate-300">{user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '-'}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">上次心跳</span>
          <span className="text-slate-300">{user?.last_heartbeat ? new Date(user.last_heartbeat).toLocaleString('zh-CN') : '未确认'}</span>
        </div>
      </div>

      <button onClick={logout}
        className="w-full py-3.5 glass-card border border-red-900/20 text-red-400 font-bold rounded-2xl active:scale-95 transition-all flex items-center justify-center space-x-2 text-sm">
        <LogOut size={16} /><span>退出登录</span>
      </button>
    </div>
  )
}
