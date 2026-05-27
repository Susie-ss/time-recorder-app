import React from 'react'
import { X } from 'lucide-react'

export default function Modal({ children, onClose, fullscreen = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        className={`relative w-full bg-gradient-to-b from-slate-900 to-slate-950 rounded-t-3xl border-t border-slate-800 shadow-2xl animate-slide-up overflow-hidden
          ${fullscreen ? 'h-full rounded-none' : 'max-h-[90vh]'}`}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 active:scale-90 transition-all z-10 border border-slate-700"
        >
          <X size={15} />
        </button>
        <div className="overflow-y-auto max-h-[90vh] no-scrollbar p-6 pt-5">
          {children}
        </div>
      </div>
    </div>
  )
}
