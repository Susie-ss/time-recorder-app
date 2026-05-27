import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../store'
import Modal from '../components/Modal'
import api from '../api/client'
import { Plus, Trash2, MessageCircle, Send, Bot } from 'lucide-react'

export default function RelativesPage() {
  const { relatives, addRelative, deleteRelative, showToast } = useStore()
  const [modal, setModal] = useState(null) // null | 'add' | { type:'chat', rel }

  const handleDelete = async (id) => {
    if (!confirm('确定删除这个数字亲人？聊天记录将一并删除。')) return
    try {
      await deleteRelative(id)
      showToast('数字亲人已删除', 'success')
    } catch (e) { showToast(e, 'error') }
  }

  return (
    <div className="space-y-3">
      {relatives.length === 0 ? (
        <div className="text-center py-16 text-slate-600 space-y-2">
          <Bot className="w-10 h-10 mx-auto opacity-30" />
          <p className="text-sm">还没有数字亲人</p>
          <p className="text-xs text-slate-700">创建 AI 数字亲人，与逝去的人继续对话</p>
        </div>
      ) : (
        <div className="space-y-3">
          {relatives.map(rel => (
            <div key={rel.id} className="glass-card rounded-3xl p-4 border border-slate-800 hover:border-purple-500/20 transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-800/40 to-orange-900/40 border border-amber-800/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">👤</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-200">{rel.name}</p>
                  <p className="text-xs text-slate-500">{rel.relation} · {rel.personality}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => setModal({ type: 'chat', rel })}
                    className="w-9 h-9 bg-indigo-600/20 border border-indigo-700/30 rounded-xl flex items-center justify-center text-indigo-400 active:scale-90 transition-all">
                    <MessageCircle size={16} />
                  </button>
                  <button onClick={() => handleDelete(rel.id)}
                    className="w-9 h-9 bg-red-950/20 border border-red-900/20 rounded-xl flex items-center justify-center text-red-400 active:scale-90 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {rel.memories?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {rel.memories.slice(0, 3).map((m, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 bg-amber-950/40 text-amber-400 border border-amber-800/20 rounded-full">{m}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button onClick={() => setModal('add')}
        className="fixed bottom-24 right-5 flex items-center justify-center bg-gradient-to-br from-amber-600 to-orange-600 rounded-full shadow-xl text-white active:scale-90 transition-all glow-gold"
        style={{ width: 52, height: 52 }}>
        <Plus size={24} />
      </button>

      {modal === 'add' && <AddRelativeModal onClose={() => setModal(null)} />}
      {modal?.type === 'chat' && <ChatModal rel={modal.rel} onClose={() => setModal(null)} />}
    </div>
  )
}

function AddRelativeModal({ onClose }) {
  const { addRelative, showToast } = useStore()
  const [form, setForm] = useState({ name: '', relation: '', personality: '温暖慈爱', memories: '' })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.name.trim() || !form.relation.trim()) { showToast('请填写必填字段', 'warning'); return }
    setLoading(true)
    try {
      const memories = form.memories.split('\n').map(m => m.trim()).filter(Boolean)
      await addRelative({ ...form, memories })
      showToast('数字亲人已创建', 'success')
      onClose()
    } catch (e) { showToast(e, 'error') }
    finally { setLoading(false) }
  }

  const PERSONALITIES = ['温暖慈爱', '幽默风趣', '睿智稳重', '严肃认真']

  return (
    <Modal onClose={onClose}>
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">创建数字亲人</h3>
        <div className="grid grid-cols-2 gap-2">
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="亲人姓名 *"
            className="bg-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-amber-500" />
          <input value={form.relation} onChange={e => set('relation', e.target.value)} placeholder="关系（如：父亲）*"
            className="bg-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-amber-500" />
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-2">性格特点</p>
          <div className="grid grid-cols-2 gap-2">
            {PERSONALITIES.map(p => (
              <button key={p} onClick={() => set('personality', p)}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all
                  ${form.personality === p ? 'bg-amber-700/40 border-amber-600 text-amber-300' : 'glass-card border-slate-800 text-slate-400'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1.5">记忆碎片（每行一条）</p>
          <textarea value={form.memories} onChange={e => set('memories', e.target.value)}
            placeholder="例如：每年除夕都会包饺子&#10;喜欢喝茉莉花茶&#10;总说「身体是本钱」" rows={4}
            className="w-full bg-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-amber-500 resize-none" />
        </div>
        <button onClick={submit} disabled={loading}
          className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl active:scale-95 transition-all disabled:opacity-50">
          {loading ? '创建中…' : '创建数字亲人'}
        </button>
      </div>
    </Modal>
  )
}

function ChatModal({ rel, onClose }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const endRef = useRef()

  useEffect(() => {
    api.get(`/relatives/${rel.id}/chat`)
      .then(data => setMessages(data))
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [rel.id])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(m => [...m, { id: Date.now(), role: 'user', content: text }])
    setLoading(true)
    try {
      const data = await api.post(`/relatives/${rel.id}/chat`, { message: text })
      setMessages(m => [...m.filter(x => x.id !== data.userMsg.id), data.userMsg, data.aiMsg])
    } catch {
      setMessages(m => [...m, { id: Date.now() + 1, role: 'assistant', content: '抱歉，暂时无法回复…' }])
    }
    setLoading(false)
  }

  return (
    <Modal onClose={onClose} fullscreen>
      <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 48px)' }}>
        {/* Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800 mb-4 flex-shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-800/40 to-orange-900/40 border border-amber-800/20 flex items-center justify-center">
            <span className="text-xl">👤</span>
          </div>
          <div>
            <p className="font-bold text-slate-200">{rel.name}</p>
            <p className="text-xs text-slate-500">{rel.relation} · {rel.personality}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-4">
          {fetching && <p className="text-center text-slate-600 text-sm py-8">加载中…</p>}
          {!fetching && messages.length === 0 && (
            <div className="text-center py-8 space-y-2">
              <p className="text-slate-500 text-sm">和 {rel.name} 说说话吧</p>
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {['你好，我很想你', '最近发生了一些事', '今天过得怎么样'].map(t => (
                  <button key={t} onClick={() => setInput(t)}
                    className="text-xs px-3 py-1.5 glass-card border border-slate-700 text-slate-400 rounded-full">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                ${m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'glass-card border border-slate-800 text-slate-200 rounded-bl-sm'
                }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="glass-card border border-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 flex space-x-1.5">
                {[0,1,2].map(i => <div key={i} className={`w-1.5 h-1.5 bg-slate-400 rounded-full typing-dot`} />)}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="flex space-x-2 pt-3 border-t border-slate-800 flex-shrink-0">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder={`给 ${rel.name} 发消息…`}
            className="flex-1 bg-slate-800 text-white text-sm rounded-2xl px-4 py-3 outline-none focus:ring-1 focus:ring-indigo-500" />
          <button onClick={send} disabled={loading || !input.trim()}
            className="w-11 h-11 bg-indigo-600 hover:bg-indigo-500 rounded-2xl flex items-center justify-center text-white active:scale-90 transition-all disabled:opacity-40 flex-shrink-0">
            <Send size={17} />
          </button>
        </div>
      </div>
    </Modal>
  )
}
