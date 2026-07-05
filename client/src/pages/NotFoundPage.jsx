import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdArrowForward, MdHome } from 'react-icons/md'

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-background dark:bg-secondary px-4 relative overflow-hidden">
    {/* Background orbs */}
    <div className="orb w-96 h-96 bg-primary/10 -top-20 -right-20" />
    <div className="orb w-72 h-72 bg-accent/10 bottom-0 -left-10" />

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center relative max-w-md"
    >
      {/* Animated emoji */}
      <motion.div
        animate={{ y: [0, -16, 0], rotate: [0, -5, 5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-7xl mb-6 block"
      >
        🍔
      </motion.div>

      {/* 404 */}
      <h1 className="text-8xl font-black gradient-text mb-2">404</h1>
      <h2 className="text-2xl font-bold text-secondary dark:text-white mb-3">
        Page Went Out for Delivery
      </h2>
      <p className="text-gray-400 mb-10 leading-relaxed">
        Looks like this page got lost on its way to you. Let's get you back to something delicious.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/" className="btn-primary gap-2 px-7 py-3.5">
          <MdHome size={18} /> Back to Home
        </Link>
        <Link to="/menu" className="btn-secondary gap-2 px-7 py-3.5">
          Browse Menu <MdArrowForward size={18} />
        </Link>
      </div>
    </motion.div>
  </div>
)

export default NotFoundPage
