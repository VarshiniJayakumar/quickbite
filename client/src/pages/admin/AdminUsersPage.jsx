import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MdBlock, MdDelete, MdPerson, MdAdminPanelSettings, MdSearch } from 'react-icons/md'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/users', { params: { page, limit: 20 } })
      setUsers(res.data.users)
      setPagination(res.data.pagination)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [page])

  const handleRoleToggle = async (userId, currentRole) => {
    if (userId === currentUser._id) { toast.error('Cannot change your own role'); return }
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole })
      setUsers(u => u.map(item => item._id === userId ? res.data.user : item))
      toast.success(`Role changed to ${newRole}`)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleBlock = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/block`)
      setUsers(u => u.map(item => item._id === userId ? res.data.user : item))
      toast.success(res.data.message)
    } catch { toast.error('Failed') }
  }

  const handleDelete = async (userId) => {
    if (userId === currentUser._id) { toast.error('Cannot delete your own account'); return }
    if (!window.confirm('Permanently delete this user?')) return
    try {
      await api.delete(`/admin/users/${userId}`)
      setUsers(u => u.filter(item => item._id !== userId))
      toast.success('User deleted')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-secondary dark:text-white">Users</h1>
          <p className="text-sm text-gray-400 mt-0.5">{pagination.total || 0} registered users</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-3xl p-4 border border-gray-100 dark:border-white/5">
              <div className="shimmer h-12 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5">
                  {['User', 'Phone', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {users.map((user, i) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary/20 to-orange-100 dark:from-primary/20 dark:to-orange-900/20 rounded-2xl flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-secondary dark:text-white text-xs truncate">{user.name}</p>
                          <p className="text-gray-400 text-[11px] truncate max-w-[150px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">{user.phone || '—'}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleRoleToggle(user._id, user.role)}
                        disabled={user._id === currentUser._id}
                        title="Click to toggle role"
                        className={`badge transition-all ${
                          user.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 hover:bg-purple-100'
                            : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400 hover:bg-gray-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {user.role === 'admin' ? <MdAdminPanelSettings size={12} /> : <MdPerson size={12} />}
                        {user.role}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge text-[11px] ${user.isBlocked ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleBlock(user._id)}
                          title={user.isBlocked ? 'Unblock' : 'Block'}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                            user.isBlocked
                              ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                              : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                          }`}
                        >
                          <MdBlock size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          disabled={user._id === currentUser._id}
                          title="Delete user"
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <MdDelete size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

export default AdminUsersPage
