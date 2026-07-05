import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MdDashboard, MdFastfood, MdShoppingCart, MdPeople, MdLogout, MdMenu, MdClose } from 'react-icons/md'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { to: '/admin',        icon: MdDashboard,  label: 'Dashboard', end: true },
  { to: '/admin/foods',  icon: MdFastfood,   label: 'Foods' },
  { to: '/admin/orders', icon: MdShoppingCart, label: 'Orders' },
  { to: '/admin/users',  icon: MdPeople,     label: 'Users' },
]

const SidebarContent = ({ user, onLogout, onClose }) => (
  <div className="flex flex-col h-full bg-secondary text-white w-64 py-7 px-4">
    {/* Logo */}
    <div className="flex items-center gap-2.5 px-2 mb-10">
      <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
        <span className="text-white font-black text-xs">QB</span>
      </div>
      <div>
        <h1 className="text-base font-black text-white tracking-tight">QuickBite</h1>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Admin Console</p>
      </div>
    </div>

    {/* Nav */}
    <nav className="flex-1 space-y-1">
      {navItems.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-150 ${
              isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <Icon size={19} />
          {label}
        </NavLink>
      ))}
    </nav>

    {/* User & logout */}
    <div className="mt-auto pt-5 border-t border-white/5">
      <div className="flex items-center gap-3 px-3 py-3 mb-2">
        <div className="w-9 h-9 bg-gradient-to-br from-primary to-orange-400 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-2xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
      >
        <MdLogout size={18} />
        Sign Out
      </button>
    </div>
  </div>
)

const AdminLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="flex h-screen overflow-hidden bg-background dark:bg-gray-950">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0 shadow-xl">
        <SidebarContent user={user} onLogout={handleLogout} onClose={() => {}} />
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
            >
              <SidebarContent user={user} onLogout={handleLogout} onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center justify-between bg-secondary px-4 py-3 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-primary to-orange-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-[10px]">QB</span>
            </div>
            <span className="text-white font-bold text-sm">Admin</span>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="text-white p-1">
            <MdMenu size={22} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-7 bg-background dark:bg-gray-950">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
