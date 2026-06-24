import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { MdPeople, MdShoppingCart, MdAttachMoney, MdPendingActions } from 'react-icons/md'
import api from '../../services/api'

const COLORS = ['#FF6B35', '#FFD166', '#06D6A0', '#118AB2', '#073B4C']

const StatCard = ({ title, value, icon: Icon, color, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md"
  >
    {loading ? (
      <div className="animate-pulse">
        <div className="skeleton h-4 w-24 mb-3 rounded" />
        <div className="skeleton h-8 w-16 rounded" />
      </div>
    ) : (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-extrabold text-secondary dark:text-white">{value}</p>
        </div>
        <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center`}>
          <Icon size={28} className="text-white" />
        </div>
      </div>
    )}
  </motion.div>
)

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then((res) => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statCards = stats
    ? [
        { title: 'Total Users', value: stats.totalUsers, icon: MdPeople, color: 'bg-blue-500' },
        { title: 'Total Orders', value: stats.totalOrders, icon: MdShoppingCart, color: 'bg-primary' },
        { title: 'Revenue', value: `₹${stats.totalRevenue?.toFixed(0)}`, icon: MdAttachMoney, color: 'bg-green-500' },
        { title: 'Pending Orders', value: stats.pendingOrders, icon: MdPendingActions, color: 'bg-yellow-500' },
      ]
    : Array(4).fill({})

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary dark:text-white mb-6">Dashboard Overview</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} loading={loading} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders per day bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md"
        >
          <h2 className="text-lg font-bold text-secondary dark:text-white mb-4">Orders (Last 7 Days)</h2>
          {loading ? (
            <div className="skeleton h-48 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats?.ordersPerDay || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#FF6B35" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Revenue by category pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md"
        >
          <h2 className="text-lg font-bold text-secondary dark:text-white mb-4">Revenue by Category</h2>
          {loading ? (
            <div className="skeleton h-48 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats?.revenueByCategory || []}
                  dataKey="revenue"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                >
                  {(stats?.revenueByCategory || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `₹${val?.toFixed(0)}`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
