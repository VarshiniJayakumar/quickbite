import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MdPerson, MdShoppingBag, MdEdit, MdCheck, MdClose, MdStar } from 'react-icons/md'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const STATUS_STEPS = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered']

const STATUS_STYLES = {
  Pending:            'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  Confirmed:          'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  Preparing:          'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  'Out for Delivery': 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  Delivered:          'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  Cancelled:          'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
}

const StatusTimeline = ({ currentStatus }) => {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus)
  return (
    <div className="flex items-center gap-0 mt-4 overflow-x-auto pb-1">
      {STATUS_STEPS.map((step, i) => {
        const isDone = i < currentIndex
        const isActive = i === currentIndex
        return (
          <div key={step} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center">
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                isDone    ? 'bg-emerald-500' :
                isActive  ? 'bg-primary ring-4 ring-primary/20' :
                'bg-gray-200 dark:bg-white/10'
              }`} />
              <span className={`text-[9px] mt-1 whitespace-nowrap font-medium ${
                isActive ? 'text-primary' : isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
              }`}>
                {step}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`h-px w-6 sm:w-10 mb-3.5 mx-0.5 transition-colors ${i < currentIndex ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-white/10'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

const UserDashboardPage = () => {
  const { user, updateUser } = useAuth()
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [activeTab, setActiveTab] = useState('orders')
  const [editMode, setEditMode] = useState(false)
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' })
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    api.get('/orders/my')
      .then(res => setOrders(res.data.orders || []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoadingOrders(false))

    const interval = setInterval(() => {
      api.get('/orders/my').then(res => setOrders(res.data.orders || [])).catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      const res = await api.put('/users/profile', profile)
      updateUser(res.data.user)
      setEditMode(false)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update profile') }
    finally { setSavingProfile(false) }
  }

  const tabs = [
    { id: 'orders',  label: 'My Orders',  icon: MdShoppingBag },
    { id: 'profile', label: 'Profile',    icon: MdPerson },
  ]

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background dark:bg-secondary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-orange-400 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/25 flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black text-secondary dark:text-white">{user?.name}</h1>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 dark:bg-white/5 rounded-2xl p-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === id
                  ? 'bg-white dark:bg-gray-900 text-secondary dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-secondary dark:hover:text-white'
              }`}
            >
              <Icon size={17} /> {label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {loadingOrders ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-white/5">
                    <div className="shimmer h-16 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5">
                <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <MdShoppingBag size={32} className="text-gray-300 dark:text-gray-600" />
                </div>
                <p className="font-semibold text-secondary dark:text-white mb-1">No orders yet</p>
                <p className="text-gray-400 text-sm">Your order history will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order, i) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-white/5 shadow-card"
                  >
                    {/* Order header */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="font-mono text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                          #{order._id?.slice(-8).toUpperCase()}
                        </span>
                        <p className="text-xs text-gray-400 mt-1.5">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`badge text-xs ${STATUS_STYLES[order.orderStatus]}`}>
                          {order.orderStatus}
                        </span>
                        <span className="font-black text-primary">₹{order.totalAmount}</span>
                      </div>
                    </div>

                    {/* Items summary */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} · {order.paymentMethod} · {order.paymentStatus === 'Paid' ? '✓ Paid' : order.paymentStatus}
                    </p>

                    {/* Delivery partner */}
                    {order.deliveryPartner?.name && (
                      <div className="flex items-center gap-3 bg-orange-50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/10 rounded-2xl p-3 mb-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary to-orange-400 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                          {order.deliveryPartner.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-secondary dark:text-white truncate">{order.deliveryPartner.name}</p>
                          <div className="flex items-center gap-1">
                            <MdStar size={11} className="text-accent" />
                            <span className="text-xs text-gray-400">{order.deliveryPartner.rating} · {order.deliveryPartner.vehicle}</span>
                          </div>
                        </div>
                        <a
                          href={`tel:${order.deliveryPartner.phone}`}
                          className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
                        >
                          📞 Call
                        </a>
                      </div>
                    )}

                    {/* Timeline */}
                    {order.orderStatus !== 'Cancelled' && (
                      <StatusTimeline currentStatus={order.orderStatus} />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-card max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-secondary dark:text-white">Profile Information</h2>
              {!editMode ? (
                <button onClick={() => setEditMode(true)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                  <MdEdit size={16} /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={saveProfile} disabled={savingProfile} className="flex items-center gap-1 text-sm text-emerald-600 font-medium hover:underline disabled:opacity-50">
                    <MdCheck size={16} /> Save
                  </button>
                  <button onClick={() => setEditMode(false)} className="flex items-center gap-1 text-sm text-red-500 font-medium hover:underline">
                    <MdClose size={16} /> Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {[
                { label: 'Full Name',  key: 'name',    type: 'text' },
                { label: 'Email',      key: 'email',   type: 'email', readOnly: true, value: user?.email },
                { label: 'Phone',      key: 'phone',   type: 'tel' },
                { label: 'Address',    key: 'address', type: 'text' },
              ].map(({ label, key, type, readOnly, value }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={readOnly ? (value || '') : (profile[key] || '')}
                    onChange={e => !readOnly && setProfile({ ...profile, [key]: e.target.value })}
                    disabled={!editMode || readOnly}
                    className={`input-field h-11 ${(!editMode || readOnly) ? 'opacity-60 cursor-default' : ''}`}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default UserDashboardPage
