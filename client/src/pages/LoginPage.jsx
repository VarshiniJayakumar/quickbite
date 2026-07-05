import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdArrowForward } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = 'Email is required'
    if (!form.password) errs.password = 'Password is required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex bg-background dark:bg-secondary">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-orange-500 to-accent relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white" style={{ width: `${80 + i * 60}px`, height: `${80 + i * 60}px`, top: `${10 + i * 12}%`, left: `${5 + i * 8}%`, opacity: 0.1 - i * 0.01 }} />
          ))}
        </div>
        <div className="relative text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <span className="text-white font-black text-3xl">QB</span>
          </div>
          <h2 className="text-4xl font-black mb-3">Welcome Back!</h2>
          <p className="text-white/80 text-lg max-w-xs">Sign in to continue ordering your favourite food.</p>
          <div className="mt-10 grid grid-cols-3 gap-6 text-center">
            {[['500+', 'Menu Items'], ['50K+', 'Orders'], ['4.9★', 'Rating']].map(([v, l]) => (
              <div key={l}>
                <p className="text-2xl font-black">{v}</p>
                <p className="text-white/60 text-xs mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo — mobile only */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-orange-400 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">QB</span>
            </div>
            <span className="text-xl font-black text-secondary dark:text-white">Quick<span className="text-primary">Bite</span></span>
          </div>

          <h1 className="text-3xl font-black text-secondary dark:text-white mb-1">Sign In</h1>
          <p className="text-gray-400 mb-8">Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Email</label>
              <div className="relative">
                <MdEmail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }) }}
                  placeholder="you@example.com"
                  className={`input-field pl-11 h-12 ${errors.email ? 'border-red-400 focus:ring-red-200' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <MdLock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }) }}
                  placeholder="••••••••"
                  className={`input-field pl-11 pr-12 h-12 ${errors.password ? 'border-red-400 focus:ring-red-200' : ''}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-12 text-base gap-2 disabled:opacity-60 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><span>Sign In</span> <MdArrowForward size={18} /></>
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">Create one →</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage
