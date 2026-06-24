import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  MdDashboard, MdFastfood, MdShoppingCart, MdPeople, MdLogout, MdMenu, MdClose
} from 'react-icons/md'
import { useState } from 'react'

const navItems = [
  { to: '/admin', icon: MdDashboard, label: 'Dashboard', end: true },
  { to: '/admin/foods', icon: MdFastfood, label: 'Foods' },
  { to: '/admin/orders', icon: MdShoppingCart, label: 'Orders' },
  { to: '/admin/users', icon: MdPeople, label: 'Users' },
]

const AdminLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-secondary text-white w-64 py-8 px-4">
      <div className="mb-10 px-2">
        <h1 className="text-2xl font-bold text-primary">QuickBite</h1>
        <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-6 border-t border-white/10">
        <p className="text-sm text-gray-400 mb-3 px-2">Logged in as</p>
        <p className="text-white font-medium px-2 mb-4">{user?.name}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 px-2 py-2 rounded-xl hover:bg-white/10 transition-all w-full"
        >
          <MdLogout size={20} />
          Logout
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-64 flex-shrink-0">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between bg-secondary text-white px-4 py-3">
          <h1 className="text-xl font-bold text-primary">QuickBite Admin</h1>
          <button onClick={() => setSidebarOpen(true)}>
            <MdMenu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
