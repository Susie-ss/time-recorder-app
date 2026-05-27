import { create } from 'zustand'
import api from '../api/client'

export const useStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('tr_token'),
  assets: [],
  messages: [],
  relatives: [],
  toast: null,

  // Auth
  setAuth: (token, user) => {
    localStorage.setItem('tr_token', token)
    set({ token, user })
  },
  logout: () => {
    localStorage.removeItem('tr_token')
    set({ token: null, user: null, assets: [], messages: [], relatives: [] })
  },

  // Toast
  showToast: (msg, type = 'success') => {
    set({ toast: { msg, type } })
    setTimeout(() => set({ toast: null }), 2800)
  },

  // Assets
  fetchAssets: async () => {
    const data = await api.get('/assets')
    set({ assets: data })
  },
  addAsset: async (form) => {
    const data = await api.post('/assets', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    set(s => ({ assets: [data, ...s.assets] }))
    return data
  },
  updateAsset: async (id, form) => {
    const data = await api.patch(`/assets/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    set(s => ({ assets: s.assets.map(a => a.id === id ? data : a) }))
    return data
  },
  deleteAsset: async (id) => {
    await api.delete(`/assets/${id}`)
    set(s => ({ assets: s.assets.filter(a => a.id !== id) }))
  },

  // Messages
  fetchMessages: async () => {
    const data = await api.get('/messages')
    set({ messages: data })
  },
  addMessage: async (body) => {
    const data = await api.post('/messages', body)
    set(s => ({ messages: [data, ...s.messages] }))
    return data
  },
  updateMessage: async (id, body) => {
    const data = await api.patch(`/messages/${id}`, body)
    set(s => ({ messages: s.messages.map(m => m.id === id ? data : m) }))
    return data
  },
  deleteMessage: async (id) => {
    await api.delete(`/messages/${id}`)
    set(s => ({ messages: s.messages.filter(m => m.id !== id) }))
  },

  // Relatives
  fetchRelatives: async () => {
    const data = await api.get('/relatives')
    set({ relatives: data })
  },
  addRelative: async (body) => {
    const data = await api.post('/relatives', body)
    set(s => ({ relatives: [data, ...s.relatives] }))
    return data
  },
  deleteRelative: async (id) => {
    await api.delete(`/relatives/${id}`)
    set(s => ({ relatives: s.relatives.filter(r => r.id !== id) }))
  },

  // Heartbeat
  sendHeartbeat: async () => {
    const data = await api.post('/heartbeat')
    set(s => ({ user: s.user ? { ...s.user, last_heartbeat: data.timestamp } : s.user }))
    return data
  }
}))
