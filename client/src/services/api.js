import axios from 'axios'
import toast from 'react-hot-toast'

// In dev, Vite proxies /api → http://localhost:5000
// In production (Netlify), set VITE_API_URL to your Render backend URL
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('Network error. Please check your connection.')
    } else if (error.response.status === 401) {
      const isAuthRoute = error.config.url?.includes('/auth/')
      if (!isAuthRoute) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    } else if (error.response.status >= 500) {
      toast.error('Server error. Please try again later.')
    }
    return Promise.reject(error)
  }
)

export default api
