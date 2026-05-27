import axios from 'axios'

const isCapacitorNative = typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform || window.location.protocol === 'capacitor:')

const baseURL = isCapacitorNative
  ? 'https://time-recorder-app.vercel.app/api'
  : '/api'

const api = axios.create({ baseURL })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('tr_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r.data,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tr_token')
      window.location.reload()
    }
    return Promise.reject(err.response?.data?.error || '请求失败')
  }
)

export default api
