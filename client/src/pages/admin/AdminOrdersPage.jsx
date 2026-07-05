import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MdFilterList } from 'react-icons/md'
import api from '../../services/api'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']

const STATUS_STYLES = {
  Pending:           'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  Confirmed:         'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  Preparing:         'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  'Out for Delivery':'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  Delivered:         'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  Cancelled:         'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
}

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [updating, setUpdating] = useState(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15 }
      if (filter) params.orderStatus = filter
      const res = await api.get('/admin/orders', { params })
      setOrders(res.data.orders)
      setPagination(res.data.pagination)
    } catch { toast.error('Failed to load orders') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchOrders() }, [page, filter])
  useEffect(() => { setPage(1) }, [filter])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      const res = await api.put(`/admin/orders/${orderId}/status`, { orderStatus: newStatus })
      setOrders(o => o.map(item => item._id === orderId ? res.data.order : item))
      toast.success(`Updated to "${newStatus}"`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally { setUpdating(null) }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-secondary dark:text-white">Orders</h1>
          <p className="text-sm text-gray-400 mt-0.5">{pagination.total || 0} total orders</p>
        </div>
        <div className="relative sm:w-52">
          <MdFilterList size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="input-field pl-9 h-10 text-sm appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-3xl p-4 border border-gray-100 dark:border-white/5">
              <div className="shimmer h-14 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-gray-400">No orders found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5">
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Order</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Items</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {orders.map((order, i) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-semibold text-secondary dark:text-white bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg">
                        #{order._id?.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-secondary dark:text-white text-xs">{order.userId?.name || 'N/A'}</p>
                      <p className="text-gray-400 text-[11px] truncate max-w-[120px]">{order.userId?.email}</p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-gray-600 dark:text-gray-300 text-xs truncate max-w-[140px]">
                        {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} · {order.items?.[0]?.title}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-bold text-primary text-sm">₹{order.totalAmount}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`badge text-[10px] ${order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                          {order.paymentStatus}
                        </span>
                        <span className="badge bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-[10px]">
                          {order.paymentMethod}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={order.orderStatus}
                        onChange={e => handleStatusChange(order._id, e.target.value)}
                        disabled={updating === order._id}
                        className={`text-xs font-semibold rounded-xl px-3 py-1.5 border-0 cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/30 ${STATUS_STYLES[order.orderStatus] || ''}`}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400 hidden lg:table-cell">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-2xl text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:border-primary/40">← Prev</button>
          {[...Array(pagination.pages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-2xl text-sm font-semibold ${page === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 hover:border-primary/40'}`}>{i + 1}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="px-4 py-2 rounded-2xl text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:border-primary/40">Next →</button>
        </div>
      )}
    </div>
  )
}

export default AdminOrdersPage
