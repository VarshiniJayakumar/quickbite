import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdPerson, MdEmail, MdLock, MdPhone, MdVisibility, MdVisibilityOff, MdArrowForward } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const RegisterPage = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email) errs.email = 'Email is required'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'Must be at least 8 characters'
    else if (!/[A-Z]/.test(form.password)) errs.password = 'Need at least one uppercase letter'
    else if (!/[0-9]/.test(form.password)) errs.password = 'Need at least one number'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const user = await register(form)
      toast.success(`Welcome to QuickBite, ${user.name.split(' ')[0]}! 🎉`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const fields = [
    { name: 'name',  label: 'Full Name',        placeholder: 'John Doe',          type: 'text',  icon: MdPerson },
    { name: 'email', label: 'Email Address',     placeholder: 'you@example.com',   type: 'email', icon: MdEmail },
    { name: 'phone', label: 'Phone (optional)',  placeholder: '+91 98765 43210',   type: 'tel',   icon: MdPhone },
  ]

  return (
    <div className="min-h-screen flex bg-background dark:bg-secondary">
      {/* Left decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary via-gray-900 to-gray-800 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0">
          <div className="orb w-72 h-72 bg-primary/20 -top-10 -left-10" />
          <div className="orb w-64 h-64 bg-accent/10 bottom-0 right-0" />
        </div>
        <div className="relative text-white text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-orange-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/30">
            <span className="text-white font-black text-3xl">QB</span>
          </div>
          <h2 className="text-4xl font-black mb-3">Join QuickBite</h2>
          <p className="text-gray-400 text-lg max-w-xs">Create your account and start ordering in minutes.</p>
          <div className="mt-10 space-y-4 text-left max-w-xs mx-auto">
            {['Free delivery on first order', 'Real-time order tracking', 'Exclusive member discounts', 'Pay securely via Razorpay'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
                <span className="text-gray-300 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-orange-400 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">QB</span>
            </div>
            <span className="text-xl font-black text-secondary dark:text-white">Quick<span className="text-primary">Bite</span></span>
          </div>

          <h1 className="text-3xl font-black text-secondary dark:text-white mb-1">Create Account</h1>
          <p className="text-gray-400 mb-8">Join thousands of happy customers today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ name, label, placeholder, type, icon: Icon }) => (
              <div key={name}>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
                <div className="relative">
                  <Icon size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={type}
                    value={form[name]}
                    onChange={e => { setForm({ ...form, [name]: e.target.value }); setErrors({ ...errors, [name]: '' }) }}
                    placeholder={placeholder}
                    className={`input-field pl-11 h-12 ${errors[name] ? 'border-red-400' : ''}`}
                  />
                </div>
                {errors[name] && <p className="text-red-500 text-xs mt-1.5">{errors[name]}</p>}
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <MdLock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }) }}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className={`input-field pl-11 pr-12 h-12 ${errors.password ? 'border-red-400' : ''}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
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
                <><span>Create Account</span><MdArrowForward size={18} /></>
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in →</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default RegisterPage
