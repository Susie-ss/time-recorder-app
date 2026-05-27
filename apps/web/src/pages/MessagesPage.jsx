import React, { useState } from 'react'
import { useStore } from '../store'
import Modal from '../components/Modal'
import { Plus, FileText, Mic, Video, Trash2, Edit3 } from 'lucide-react'

const TYPE_INFO = {
  text:  { label: '纯文字信件',  icon: FileText, color: 'purple' },
  audio: { label: '语音克隆',    icon: Mic,      color: 'blue' },
  video: { label: '3D神态摄制',  icon: Video,    color: 'red' },
}

const SEND_TYPES = [
  { value: 'death_immediate', label: '⌛ 确认离世后立即发送' },
  { value: 'fixed_date',      label: '⏰ 指定日期定时发送' },
  { value: 'death_delay',     label: '⏳ 离世后延后发送' },
]
const DELAY_OPTIONS = ['1个月后', '3个月后', '1年后', '3年后', '5年后']

function sendLabel(msg) {
  if (msg.send_type === 'death_immediate') return '离世后立即发送'
  if (msg.send_type === 'fixed_date') return `定时：${msg.send_time}`
  if (msg.send_type === 'death_delay') return `离世 ${msg.send_time} 后发送`
  return ''
}

export default function MessagesPage() {
  const { messages, addMessage, updateMessage, deleteMessage, showToast } = useStore()
  const [modal, setModal] = useState(null)

  const handleDelete = async (id) => {
    if (!confirm('确定删除这个留声舱？')) return
    try {
      await deleteMessage(id)
      showToast('留声舱已删除', 'success')
      setModal(null)
    } catch (e) { showToast(e, 'error') }
  }

  return (
    <div className="space-y-3">
      {messages.length === 0 ? (
        <div className="text-center py-16 text-slate-600 space-y-2">
          <Mic className="w-10 h-10 mx-auto opacity-30" />
          <p className="text-sm">还没有留声舱</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {messages.map(msg => {
            const ti = TYPE_INFO[msg.type]
            const Icon = ti.icon
            return (
              <div key={msg.id}
                onClick={() => setModal({ type: 'detail', msg })}
                className="glass-card p-4 rounded-3xl border border-slate-800 hover:border-purple-500/30 cursor-pointer active:scale-[0.97] transition-all space-y-3 group relative">
                <button onClick={e => { e.stopPropagation(); handleDelete(msg.id) }}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all">
                  <Trash2 size={13} />
                </button>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border bg-${ti.color}-950/50 text-${ti.color}-300 border-${ti.color}-800/30`}>
                  {ti.label}
                </span>
                <p className="text-sm font-semibold text-slate-200 line-clamp-2 leading-snug">{msg.title}</p>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-500 truncate">致：{msg.recipient}</p>
                  <p className="text-[10px] text-slate-600 truncate">{sendLabel(msg)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button onClick={() => setModal({ type: 'add' })}
        className="fixed bottom-24 right-5 flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full shadow-xl text-white active:scale-90 transition-all glow-purple"
        style={{ width: 52, height: 52 }}>
        <Plus size={24} />
      </button>

      {modal?.type === 'add' && (
        <AddMessageModal onClose={() => setModal(null)} />
      )}
      {modal?.type === 'detail' && (
        <MessageDetailModal
          msg={modal.msg}
          onClose={() => setModal(null)}
          onDelete={handleDelete}
          onEdit={() => setModal({ type: 'edit', msg: modal.msg })}
        />
      )}
      {modal?.type === 'edit' && (
        <EditMessageModal
          msg={modal.msg}
          onClose={() => setModal(null)}
          onDone={(updated) => setModal({ type: 'detail', msg: updated })}
        />
      )}
    </div>
  )
}

function AddMessageModal({ onClose }) {
  const { addMessage, showToast } = useStore()
  const [form, setForm] = useState({ type: 'text', title: '', content: '', recipient: '', contact: '', send_type: 'death_immediate', send_time: '' })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.title.trim() || !form.recipient.trim() || !form.content.trim()) {
      showToast('请填写必填字段', 'warning'); return
    }
    setLoading(true)
    try {
      await addMessage(form)
      showToast('留声舱已创建', 'success')
      onClose()
    } catch (e) { showToast(e, 'error') }
    finally { setLoading(false) }
  }

  return (
    <Modal onClose={onClose}>
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">新建留声舱</h3>
        {/* Type */}
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(TYPE_INFO).map(([v, { label, icon: Icon, color }]) => (
            <button key={v} onClick={() => set('type', v)}
              className={`p-3 rounded-2xl border text-center transition-all
                ${form.type === v ? `border-${color}-600 bg-${color}-950/40` : 'border-slate-800 glass-card'}`}>
              <Icon className={`w-5 h-5 mx-auto mb-1 ${form.type === v ? `text-${color}-400` : 'text-slate-500'}`} size={20} />
              <p className={`text-[10px] font-semibold ${form.type === v ? `text-${color}-300` : 'text-slate-500'}`}>{label}</p>
            </button>
          ))}
        </div>
        <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="留声标题 *"
          className="w-full bg-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-purple-500" />
        <div className="grid grid-cols-2 gap-2">
          <input value={form.recipient} onChange={e => set('recipient', e.target.value)} placeholder="收件人称呼 *"
            className="bg-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-purple-500" />
          <input value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="联系方式"
            className="bg-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-purple-500" />
        </div>
        <textarea value={form.content} onChange={e => set('content', e.target.value)} placeholder="信件内容 *" rows={5}
          className="w-full bg-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-purple-500 resize-none" />
        {/* Send type */}
        <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 space-y-3">
          <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">发送时机</p>
          <select value={form.send_type} onChange={e => set('send_type', e.target.value)}
            className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-4 py-3 outline-none">
            {SEND_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {form.send_type === 'fixed_date' && (
            <input type="date" value={form.send_time} onChange={e => set('send_time', e.target.value)}
              className="w-full bg-slate-800 text-white text-xs rounded-xl px-4 py-3 outline-none" />
          )}
          {form.send_type === 'death_delay' && (
            <select value={form.send_time} onChange={e => set('send_time', e.target.value)}
              className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-4 py-3 outline-none">
              {DELAY_OPTIONS.map(d => <option key={d} value={d}>离世 {d}</option>)}
            </select>
          )}
        </div>
        <button onClick={submit} disabled={loading}
          className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl active:scale-95 transition-all disabled:opacity-50">
          {loading ? '保存中…' : '创建留声舱'}
        </button>
      </div>
    </Modal>
  )
}

function MessageDetailModal({ msg, onClose, onDelete, onEdit }) {
  const ti = TYPE_INFO[msg.type]
  return (
    <Modal onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border bg-${ti.color}-950/50 text-${ti.color}-300 border-${ti.color}-800/30`}>
            {ti.label}
          </span>
          <span className="text-xs text-slate-500">{new Date(msg.created_at).toLocaleDateString('zh-CN')}</span>
        </div>
        <h2 className="text-xl font-bold text-white">{msg.title}</h2>
        <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 space-y-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">收件人</p>
          <p className="text-sm font-semibold text-slate-200">{msg.recipient}</p>
          {msg.contact && <p className="text-xs text-slate-500">{msg.contact}</p>}
        </div>
        <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 space-y-2">
          <p className="text-[10px] text-indigo-300 uppercase tracking-widest">发送时机</p>
          <p className="text-sm text-slate-200">{sendLabel(msg)}</p>
        </div>
        <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 space-y-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">内容</p>
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto no-scrollbar">{msg.content}</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={onEdit} className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl active:scale-95 transition-all flex items-center justify-center space-x-2 text-sm">
            <Edit3 size={15} /><span>编辑</span>
          </button>
          <button onClick={() => onDelete(msg.id)} className="py-3.5 px-5 bg-red-950/20 border border-red-900/20 text-red-400 font-bold rounded-2xl active:scale-95 transition-all flex items-center justify-center space-x-2 text-sm">
            <Trash2 size={15} /><span>删除</span>
          </button>
        </div>
      </div>
    </Modal>
  )
}

function EditMessageModal({ msg, onClose, onDone }) {
  const { updateMessage, showToast } = useStore()
  const [form, setForm] = useState({
    title: msg.title, content: msg.content, recipient: msg.recipient,
    contact: msg.contact || '', send_type: msg.send_type, send_time: msg.send_time || ''
  })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.title.trim() || !form.recipient.trim() || !form.content.trim()) {
      showToast('请填写必填字段', 'warning'); return
    }
    setLoading(true)
    try {
      const updated = await updateMessage(msg.id, form)
      showToast('留声舱已更新', 'success')
      onDone(updated)
    } catch (e) { showToast(e, 'error') }
    finally { setLoading(false) }
  }

  return (
    <Modal onClose={onClose}>
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">编辑留声舱</h3>
        <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="标题"
          className="w-full bg-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-purple-500" />
        <div className="grid grid-cols-2 gap-2">
          <input value={form.recipient} onChange={e => set('recipient', e.target.value)} placeholder="收件人"
            className="bg-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-purple-500" />
          <input value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="联系方式"
            className="bg-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-purple-500" />
        </div>
        <textarea value={form.content} onChange={e => set('content', e.target.value)} rows={5}
          className="w-full bg-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-purple-500 resize-none" />
        <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 space-y-3">
          <select value={form.send_type} onChange={e => set('send_type', e.target.value)}
            className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-4 py-3 outline-none">
            {SEND_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {form.send_type === 'fixed_date' && (
            <input type="date" value={form.send_time} onChange={e => set('send_time', e.target.value)}
              className="w-full bg-slate-800 text-white text-xs rounded-xl px-4 py-3 outline-none" />
          )}
          {form.send_type === 'death_delay' && (
            <select value={form.send_time} onChange={e => set('send_time', e.target.value)}
              className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-4 py-3 outline-none">
              {DELAY_OPTIONS.map(d => <option key={d} value={d}>离世 {d}</option>)}
            </select>
          )}
        </div>
        <div className="flex space-x-3">
          <button onClick={submit} disabled={loading} className="flex-1 py-3.5 bg-purple-600 text-white font-bold rounded-2xl active:scale-95 transition-all disabled:opacity-50 text-sm">
            {loading ? '保存中…' : '保存修改'}
          </button>
          <button onClick={onClose} className="py-3.5 px-5 glass-card border border-slate-700 text-slate-300 font-bold rounded-2xl active:scale-95 transition-all text-sm">取消</button>
        </div>
      </div>
    </Modal>
  )
}
