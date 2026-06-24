import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900 px-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-8xl mb-6"
      >
        🍔
      </motion.div>
      <h1 className="text-7xl font-extrabold text-primary mb-3">404</h1>
      <h2 className="text-2xl font-bold text-secondary dark:text-white mb-3">Page Not Found</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
        Oops! Looks like this page went out for delivery and got lost.
      </p>
      <Link to="/" className="btn-primary text-lg px-8 py-3">
        Back to Home
      </Link>
    </motion.div>
  </div>
)

export default NotFoundPage
