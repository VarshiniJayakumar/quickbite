import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MdBlock, MdDelete, MdPerson, MdAdminPanelSettings } from 'react-icons/md'
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
      setUsers((u) => u.map((item) => item._id === userId ? res.data.user : item))
      toast.success('Role updated')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleBlock = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/block`)
      setUsers((u) => u.map((item) => item._id === userId ? res.data.user : item))
      toast.success(res.data.message)
    } catch { toast.error('Failed') }
  }

  const handleDelete = async (userId) => {
    if (userId === currentUser._id) { toast.error('Cannot delete your own account'); return }
    if (!window.confirm('Delete this user permanently?')) return
    try {
      await api.delete(`/admin/users/${userId}`)
      setUsers((u) => u.filter((item) => item._id !== userId))
      toast.success('User deleted')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary dark:text-white mb-6">Manage Users</h1>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 animate-pulse h-16" />)}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">User</th>
                  <th className="text-left px-4 py-3 font-semibold">Phone</th>
                  <th className="text-left px-4 py-3 font-semibold">Role</th>
                  <th className="text-left px-4 py-3 font-semibold">Registered</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-gray-400 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{user.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleRoleToggle(user._id, user.role)}
                        disabled={user._id === currentUser._id}
                        className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium transition-all ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title="Click to toggle role"
                      >
                        {user.role === 'admin' ? <MdAdminPanelSettings size={14} /> : <MdPerson size={14} />}
                        {user.role}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        user.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBlock(user._id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isBlocked
                              ? 'text-green-500 hover:bg-green-50 dark:hover:bg-gray-700'
                              : 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-gray-700'
                          }`}
                          title={user.isBlocked ? 'Unblock' : 'Block'}
                        >
                          <MdBlock size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          disabled={user._id === currentUser._id}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-30"
                          title="Delete user"
                        >
                          <MdDelete size={16} />
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

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl border dark:border-gray-700 disabled:opacity-50 hover:bg-gray-100">Prev</button>
          {[...Array(pagination.pages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`w-10 h-10 rounded-xl font-medium ${page === i + 1 ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 border dark:border-gray-700 hover:bg-gray-100'}`}>{i + 1}</button>
          ))}
          <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="px-4 py-2 rounded-xl border dark:border-gray-700 disabled:opacity-50 hover:bg-gray-100">Next</button>
        </div>
      )}
    </div>
  )
}

export default AdminUsersPage
