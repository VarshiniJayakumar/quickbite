import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdCheckCircle } from 'react-icons/md'
import api from '../services/api'

const OrderConfirmationPage = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data.order)).catch(() => {})
  }, [id])

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background dark:bg-gray-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-10 max-w-lg w-full mx-4 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <MdCheckCircle size={80} className="text-green-500 mx-auto mb-4" />
        </motion.div>

        <h1 className="text-3xl font-extrabold text-secondary dark:text-white mb-2">Order Placed!</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Your order has been placed successfully. We'll start preparing it shortly.
        </p>

        {order && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500 text-sm">Order ID</span>
              <span className="font-mono text-xs text-secondary dark:text-white">#{order._id?.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500 text-sm">Total Amount</span>
              <span className="font-bold text-primary">₹{order.totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Payment</span>
              <span className="font-medium text-secondary dark:text-white">{order.paymentMethod}</span>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Link to="/dashboard" className="btn-primary flex-1 py-3">
            Track Order
          </Link>
          <Link to="/menu" className="btn-secondary flex-1 py-3">
            Order More
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default OrderConfirmationPage
