import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { MdPeople, MdShoppingCart, MdTrendingUp, MdPendingActions } from 'react-icons/md'
import api from '../../services/api'

const CHART_COLORS = ['#FF6B35', '#FFD166', '#06D6A0', '#118AB2', '#9B5DE5']

const StatCard = ({ title, value, icon: Icon, gradient, change, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-card hover:shadow-card-hover transition-all duration-300"
  >
    {loading ? (
      <div className="animate-pulse space-y-3">
        <div className="shimmer h-3 w-24 rounded-full" />
        <div className="shimmer h-8 w-20 rounded-full" />
        <div className="shimmer h-2 w-16 rounded-full" />
      </div>
    ) : (
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 font-medium mb-1">{title}</p>
          <p className="text-3xl font-black text-secondary dark:text-white tracking-tight">{value}</p>
          {change && (
            <p className="text-xs text-green-500 font-medium mt-1.5 flex items-center gap-1">
              <MdTrendingUp size={12} /> {change}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    )}
  </motion.div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-secondary text-white text-xs px-3 py-2 rounded-xl shadow-lg">
        <p className="font-semibold mb-0.5">{label}</p>
        <p>{payload[0].value} order{payload[0].value !== 1 ? 's' : ''}</p>
      </div>
    )
  }
  return null
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then((res) => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statCards = stats ? [
    { title: 'Total Users',    value: stats.totalUsers,    icon: MdPeople,          gradient: 'from-blue-500 to-indigo-500',  change: 'Active customers' },
    { title: 'Total Orders',   value: stats.totalOrders,   icon: MdShoppingCart,    gradient: 'from-primary to-orange-400',   change: 'All time orders' },
    { title: 'Total Revenue',  value: `₹${(stats.totalRevenue || 0).toFixed(0)}`, icon: MdTrendingUp, gradient: 'from-emerald-500 to-teal-500', change: 'Lifetime earnings' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: MdPendingActions,  gradient: 'from-amber-500 to-yellow-400', change: 'Awaiting action' },
  ] : Array(4).fill({})

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-black text-secondary dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="text-xs text-gray-400 bg-white dark:bg-gray-900 px-3 py-2 rounded-xl border border-gray-100 dark:border-white/5">
          {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} loading={loading} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Bar chart — 3/5 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-card"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-secondary dark:text-white">Orders Overview</h2>
              <p className="text-xs text-gray-400 mt-0.5">Daily orders — last 7 days</p>
            </div>
          </div>
          {loading ? (
            <div className="shimmer h-52 rounded-2xl" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={stats?.ordersPerDay || []} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,107,53,0.05)', radius: 8 }} />
                <Bar dataKey="count" fill="#FF6B35" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Pie chart — 2/5 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-card"
        >
          <div className="mb-5">
            <h2 className="font-bold text-secondary dark:text-white">Revenue Split</h2>
            <p className="text-xs text-gray-400 mt-0.5">By food category</p>
          </div>
          {loading ? (
            <div className="shimmer h-52 rounded-2xl" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={stats?.revenueByCategory || []}
                    dataKey="revenue"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                  >
                    {(stats?.revenueByCategory || []).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`₹${v?.toFixed(0)}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="space-y-2 mt-3">
                {(stats?.revenueByCategory || []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-gray-600 dark:text-gray-400">{item._id}</span>
                    </div>
                    <span className="font-semibold text-secondary dark:text-white">₹{item.revenue?.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
