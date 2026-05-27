import React from 'react'
import { useStore } from '../store'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

export default function Toast() {
  const { toast, showToast } = useStore()
  if (!toast) return null

  const icons = { success: CheckCircle, error: AlertCircle, warning: Info }
  const colors = { success: 'text-emerald-400', error: 'text-red-400', warning: 'text-amber-400' }
  const Icon = icons[toast.type] || Info

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] animate-slide-up">
      <div className="glass-card flex items-center space-x-2.5 px-4 py-3 rounded-2xl border border-slate-700 shadow-xl">
        <Icon className={`w-4 h-4 ${colors[toast.type] || 'text-slate-300'}`} />
        <span className="text-sm text-slate-200 font-medium">{toast.msg}</span>
      </div>
    </div>
  )
}
