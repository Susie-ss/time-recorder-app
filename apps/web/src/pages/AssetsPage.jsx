import React, { useState, useRef } from 'react'
import { useStore } from '../store'
import Modal from '../components/Modal'
import { Plus, FileText, Image, File, Trash2, Eye, Tag } from 'lucide-react'

const TYPE_INFO = {
  text:     { label: '文字凭证', icon: FileText, color: 'purple' },
  image:    { label: '图片资产', icon: Image,    color: 'blue' },
  document: { label: '重要文件', icon: File,     color: 'amber' },
}

export default function AssetsPage() {
  const { assets, addAsset, deleteAsset, showToast } = useStore()
  const [modal, setModal] = useState(null) // null | 'add' | { asset }
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? assets : assets.filter(a => a.type === filter)

  const openDetail = (asset) => setModal({ asset })
  const closeModal = () => setModal(null)

  const handleDelete = async (id) => {
    if (!confirm('确定删除这个资产凭证？')) return
    try {
      await deleteAsset(id)
      showToast('资产已删除', 'success')
      closeModal()
    } catch (e) { showToast(e, 'error') }
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
        {[['all','全部'], ['text','文字'], ['image','图片'], ['document','文件']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all
              ${filter === v ? 'bg-purple-600 text-white' : 'glass-card border border-slate-800 text-slate-400'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-600 space-y-2">
          <File className="w-10 h-10 mx-auto opacity-30" />
          <p className="text-sm">暂无资产凭证</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(asset => {
            const ti = TYPE_INFO[asset.type]
            const Icon = ti.icon
            return (
              <div key={asset.id}
                onClick={() => openDetail(asset)}
                className="glass-card p-4 rounded-3xl border border-slate-800 hover:border-purple-500/30 cursor-pointer active:scale-[0.97] transition-all space-y-3 group relative">
                <button onClick={e => { e.stopPropagation(); handleDelete(asset.id) }}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all">
                  <Trash2 size={13} />
                </button>
                <div className={`w-9 h-9 rounded-xl bg-${ti.color}-950/60 border border-${ti.color}-800/30 flex items-center justify-center`}>
                  <Icon className={`w-4.5 h-4.5 text-${ti.color}-400`} size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200 line-clamp-1">{asset.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{ti.label}</p>
                </div>
                {asset.file_url && asset.type === 'image' && (
                  <img src={asset.file_url} alt={asset.title} className="w-full h-20 object-cover rounded-xl opacity-70" />
                )}
                {asset.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.slice(0,3).map(t => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded-full">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setModal('add')}
        className="fixed bottom-24 right-5 w-13 h-13 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full shadow-xl flex items-center justify-center text-white active:scale-90 transition-all glow-purple"
        style={{ width: 52, height: 52 }}>
        <Plus size={24} />
      </button>

      {/* Add Modal */}
      {modal === 'add' && (
        <AddAssetModal onClose={closeModal} />
      )}

      {/* Detail Modal */}
      {modal?.asset && (
        <AssetDetailModal asset={modal.asset} onClose={closeModal} onDelete={handleDelete} />
      )}
    </div>
  )
}

function AddAssetModal({ onClose }) {
  const { addAsset, showToast } = useStore()
  const [form, setForm] = useState({ type: 'text', title: '', content: '', tags: '' })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.title.trim()) { showToast('请填写标题', 'warning'); return }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('type', form.type)
      fd.append('title', form.title)
      fd.append('content', form.content)
      fd.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)))
      if (file) fd.append('file', file)
      await addAsset(fd)
      showToast('资产已添加', 'success')
      onClose()
    } catch (e) { showToast(e, 'error') }
    finally { setLoading(false) }
  }

  return (
    <Modal onClose={onClose}>
      <div className="space-y-5">
        <h3 className="text-lg font-bold text-white">添加资产凭证</h3>
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
        {/* Title */}
        <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="凭证名称"
          className="w-full bg-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-purple-500" />
        {/* Content */}
        {form.type === 'text' && (
          <textarea value={form.content} onChange={e => set('content', e.target.value)} placeholder="内容描述（账号密码、遗嘱内容等）" rows={4}
            className="w-full bg-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-purple-500 resize-none" />
        )}
        {/* File */}
        {form.type !== 'text' && (
          <div>
            <input ref={fileRef} type="file" className="hidden"
              accept={form.type === 'image' ? 'image/*' : '*'} onChange={e => setFile(e.target.files[0])} />
            <button onClick={() => fileRef.current.click()}
              className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-sm text-slate-400 hover:border-purple-500/50 transition-all">
              {file ? `📎 ${file.name}` : '点击上传文件'}
            </button>
          </div>
        )}
        {/* Tags */}
        <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="标签（逗号分隔，如：银行,保险）"
          className="w-full bg-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-purple-500" />
        <button onClick={submit} disabled={loading}
          className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl active:scale-95 transition-all disabled:opacity-50">
          {loading ? '保存中…' : '保存凭证'}
        </button>
      </div>
    </Modal>
  )
}

function AssetDetailModal({ asset, onClose, onDelete }) {
  const ti = TYPE_INFO[asset.type]
  const Icon = ti.icon

  return (
    <Modal onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl bg-${ti.color}-950/60 border border-${ti.color}-800/30 flex items-center justify-center`}>
            <Icon className={`text-${ti.color}-400`} size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">{asset.title}</h2>
            <p className="text-[10px] text-slate-500">{ti.label} · {new Date(asset.created_at).toLocaleDateString('zh-CN')}</p>
          </div>
        </div>

        {asset.content && (
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700">
            <p className="text-xs text-slate-400 mb-2">内容</p>
            <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{asset.content}</p>
          </div>
        )}

        {asset.file_url && (
          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700">
            {asset.type === 'image' ? (
              <img src={asset.file_url} alt={asset.title} className="w-full rounded-xl" />
            ) : (
              <a href={asset.file_url} target="_blank" rel="noreferrer"
                className="flex items-center space-x-2 text-sm text-blue-400">
                <File size={16} />
                <span>{asset.file_name || '查看文件'}</span>
              </a>
            )}
          </div>
        )}

        {asset.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {asset.tags.map(t => (
              <span key={t} className="text-xs px-2.5 py-1 bg-slate-800 text-slate-400 rounded-full border border-slate-700">{t}</span>
            ))}
          </div>
        )}

        <button onClick={() => onDelete(asset.id)}
          className="w-full py-3 bg-red-950/20 border border-red-900/20 text-red-400 font-semibold rounded-2xl active:scale-95 transition-all text-sm">
          删除此凭证
        </button>
      </div>
    </Modal>
  )
}
