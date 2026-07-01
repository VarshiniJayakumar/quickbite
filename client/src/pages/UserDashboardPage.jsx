import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MdPerson, MdShoppingBag, MdEdit, MdCheck, MdClose } from 'react-icons/md'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const STATUS_STEPS = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered']

const StatusTimeline = ({ currentStatus }) => {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus)

  return (
    <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1">
      {STATUS_STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-1 flex-shrink-0">
          <div className={`flex flex-col items-center`}>
            <div className={`w-3 h-3 rounded-full border-2 ${
              i <= currentIndex
                ? 'bg-primary border-primary'
                : 'bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500'
            }`} />
            <span className={`text-xs mt-1 whitespace-nowrap ${
              i === currentIndex
                ? 'text-primary font-semibold'
                : i < currentIndex
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-400'
            }`}>
              {step}
            </span>
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`h-0.5 w-8 mb-4 ${i < currentIndex ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'}`} />
          )}
        </div>
      ))}
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
      .then((res) => setOrders(res.data.orders || []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoadingOrders(false))

    // Poll for order status updates every 30s
    const interval = setInterval(() => {
      api.get('/orders/my').then((res) => setOrders(res.data.orders || [])).catch(() => {})
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
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const getStatusColor = (status) => {
    const map = {
      Pending: 'bg-yellow-100 text-yellow-700',
      Confirmed: 'bg-blue-100 text-blue-700',
      Preparing: 'bg-orange-100 text-orange-700',
      'Out for Delivery': 'bg-purple-100 text-purple-700',
      Delivered: 'bg-green-100 text-green-700',
      Cancelled: 'bg-red-100 text-red-700',
    }
    return map[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="section-title mb-6">
          My Dashboard
        </motion.h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b dark:border-gray-700">
          {[
            { id: 'orders', label: 'My Orders', icon: MdShoppingBag },
            { id: 'profile', label: 'Profile', icon: MdPerson },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3 font-medium text-sm border-b-2 transition-all ${
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-primary'
              }`}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {loadingOrders ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card p-4 animate-pulse">
                    <div className="skeleton h-4 w-1/3 mb-2 rounded" />
                    <div className="skeleton h-4 w-2/3 rounded" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <MdShoppingBag size={64} className="text-gray-300 mx-auto mb-3" />
                <p className="text-xl font-semibold text-secondary dark:text-white mb-2">No orders yet</p>
                <p className="text-gray-500 mb-4">Your order history will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order, i) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-mono text-xs text-gray-400 mb-1">
                          #{order._id?.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                        <span className="text-lg font-bold text-primary">₹{order.totalAmount}</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {order.items?.length} items · {order.paymentMethod} · {order.paymentStatus}
                    </div>

                    {/* Delivery partner mini card */}
                    {order.deliveryPartner?.name && (
                      <div className="flex items-center gap-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 mb-3">
                        <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {order.deliveryPartner.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-secondary dark:text-white truncate">
                            {order.deliveryPartner.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {order.deliveryPartner.vehicle}
                          </p>
                        </div>
                        <a
                          href={`tel:${order.deliveryPartner.phone}`}
                          className="text-green-600 hover:text-green-700 bg-green-100 hover:bg-green-200 p-2 rounded-xl transition-colors"
                          title="Call delivery partner"
                        >
                          📞
                        </a>
                      </div>
                    )}

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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6 max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-secondary dark:text-white">Profile Info</h2>
              {!editMode ? (
                <button onClick={() => setEditMode(true)} className="flex items-center gap-2 text-primary hover:underline text-sm">
                  <MdEdit /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={saveProfile} disabled={savingProfile} className="flex items-center gap-1 text-green-500 hover:underline text-sm">
                    <MdCheck /> Save
                  </button>
                  <button onClick={() => setEditMode(false)} className="flex items-center gap-1 text-red-400 hover:underline text-sm">
                    <MdClose /> Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email', readOnly: true, value: user?.email },
                { label: 'Phone', key: 'phone', type: 'tel' },
                { label: 'Address', key: 'address', type: 'text' },
              ].map(({ label, key, type, readOnly, value }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                  <input
                    type={type}
                    value={readOnly ? (value || '') : (profile[key] || '')}
                    onChange={(e) => !readOnly && setProfile({ ...profile, [key]: e.target.value })}
                    disabled={!editMode || readOnly}
                    className={`input-field ${(!editMode || readOnly) ? 'bg-gray-50 dark:bg-gray-700 cursor-default' : ''}`}
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
