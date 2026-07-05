import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdMenu, MdClose, MdShoppingCart, MdDarkMode, MdLightMode,
  MdPerson, MdLogout, MdDashboard, MdKeyboardArrowDown
} from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { cartItemCount } = useCart()
  const { darkMode, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const userMenuRef = useRef(null)

  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
    setUserMenuOpen(false)
  }

  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/menu', label: 'Menu' },
  ]

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 navbar-glass transition-all duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-white font-black text-xs tracking-tight">QB</span>
            </div>
            <span className="text-xl font-black tracking-tight text-secondary dark:text-white">
              Quick<span className="text-primary">Bite</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-secondary dark:hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Dark mode */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="btn-ghost w-9 h-9 p-0 rounded-xl"
            >
              {darkMode
                ? <MdLightMode size={18} className="text-accent" />
                : <MdDarkMode size={18} className="text-gray-600" />
              }
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="btn-ghost relative w-9 h-9 p-0 rounded-xl"
              aria-label="Cart"
            >
              <MdShoppingCart size={20} className="text-gray-600 dark:text-gray-300" />
              <AnimatePresence>
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-black w-4.5 h-4.5 min-w-[1.1rem] min-h-[1.1rem] rounded-full flex items-center justify-center leading-none"
                  >
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* User menu — desktop */}
            {user ? (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-primary to-orange-400 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-secondary dark:text-white max-w-[80px] truncate">
                    {user.name?.split(' ')[0]}
                  </span>
                  <MdKeyboardArrowDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-semibold text-secondary dark:text-white truncate">{user.email}</p>
                      </div>
                      {user.role === 'admin' ? (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <MdDashboard size={16} className="text-primary" />
                          Admin Panel
                        </Link>
                      ) : (
                        <Link
                          to="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <MdPerson size={16} className="text-primary" />
                          My Orders
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <MdLogout size={16} />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex btn-primary py-2 px-5 text-sm rounded-2xl">
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden btn-ghost w-9 h-9 p-0 rounded-xl"
              aria-label="Toggle menu"
            >
              {menuOpen ? <MdClose size={20} /> : <MdMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-100 dark:border-white/5"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-secondary dark:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              {user ? (
                <>
                  <Link
                    to={user.role === 'admin' ? '/admin' : '/dashboard'}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 rounded-2xl text-sm font-medium text-secondary dark:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    {user.role === 'admin' ? '⚡ Admin Panel' : '📦 My Orders'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block btn-primary text-center rounded-2xl"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
