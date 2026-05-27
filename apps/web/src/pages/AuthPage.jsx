import React, { useState } from 'react'
import { useStore } from '../store'
import api from '../api/client'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setAuth, showToast } = useStore()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.post(`/auth/${mode}`, form)
      setAuth(data.token, data.user)
      showToast(mode === 'login' ? '欢迎回来 👋' : '账号创建成功', 'success')
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900 p-6">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center glow-purple shadow-2xl">
          <span className="text-4xl">🕰️</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">时光留声机</h1>
        <p className="text-slate-500 text-sm mt-1">数字遗产 · AI 情感陪伴</p>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm">
        <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">你的名字</label>
              <input
                value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="例如：李明"
                className="w-full bg-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-purple-500 border-none"
              />
            </div>
          )}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">邮箱</label>
            <input
              type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-purple-500 border-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">密码</label>
            <input
              type="password" value={form.password} onChange={e => set('password', e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && submit(e)}
              className="w-full bg-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-purple-500 border-none"
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            onClick={submit} disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl active:scale-95 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? '处理中…' : mode === 'login' ? '登录' : '创建账号'}
          </button>
        </div>

        <p className="text-center text-slate-500 text-sm mt-5">
          {mode === 'login' ? '还没有账号？' : '已有账号？'}
          <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
            className="text-purple-400 font-semibold ml-1">
            {mode === 'login' ? '立即注册' : '去登录'}
          </button>
        </p>
      </div>
    </div>
  )
}
