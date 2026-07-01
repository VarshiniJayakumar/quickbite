import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdCheckCircle, MdPhone, MdStar, MdDirectionsBike, MdLocationOn, MdReceipt } from 'react-icons/md'
import api from '../services/api'

const STATUS_STEPS = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered']

const OrderConfirmationPage = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then((res) => setOrder(res.data.order))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center bg-background dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Success header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <MdCheckCircle size={80} className="text-green-500 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-secondary dark:text-white mb-2">Order Placed!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Your order has been placed successfully.
          </p>
          {order?.paymentMethod === 'Razorpay' && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-medium">
              ✓ Payment Confirmed
            </span>
          )}
          {order?.paymentMethod === 'COD' && (
            <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-sm px-3 py-1 rounded-full font-medium">
              💵 Pay on Delivery
            </span>
          )}
        </motion.div>

        {/* Order details */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <h2 className="font-bold text-secondary dark:text-white flex items-center gap-2 mb-4">
              <MdReceipt className="text-primary" /> Order Details
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID</span>
                <span className="font-mono font-medium">#{order._id?.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Items</span>
                <span className="font-medium">{order.items?.length} item(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>₹{order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax (5%)</span>
                <span>₹{order.tax?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t dark:border-gray-700 pt-2 mt-2">
                <span>Total Paid</span>
                <span className="text-primary">₹{order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            {/* Delivery address */}
            {order.deliveryAddress && (
              <div className="mt-4 flex items-start gap-2 bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                <MdLocationOn className="text-primary mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Delivering to</p>
                  <p className="text-sm text-secondary dark:text-white">{order.deliveryAddress}</p>
                </div>
              </div>
            )}

            {/* Map preview if coordinates exist */}
            {order.coordinates?.lat && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <iframe
                  title="Delivery Map"
                  width="100%"
                  height="160"
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${order.coordinates.lng - 0.01}%2C${order.coordinates.lat - 0.01}%2C${order.coordinates.lng + 0.01}%2C${order.coordinates.lat + 0.01}&layer=mapnik&marker=${order.coordinates.lat}%2C${order.coordinates.lng}`}
                  style={{ border: 'none' }}
                />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Delivery Partner card */}
        {order?.deliveryPartner?.name && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h2 className="font-bold text-secondary dark:text-white flex items-center gap-2 mb-4">
              <MdDirectionsBike className="text-primary" size={22} /> Your Delivery Partner
            </h2>
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center text-white font-extrabold text-2xl flex-shrink-0 shadow-lg">
                {order.deliveryPartner.avatar}
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg text-secondary dark:text-white">
                  {order.deliveryPartner.name}
                </p>
                <div className="flex items-center gap-1 mb-1">
                  <MdStar className="text-accent" size={16} />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {order.deliveryPartner.rating} Rating
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {order.deliveryPartner.vehicle}
                </p>
              </div>
              <a
                href={`tel:${order.deliveryPartner.phone}`}
                className="flex flex-col items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-2xl transition-colors shadow-md"
              >
                <MdPhone size={22} />
                <span className="text-xs font-medium">Call</span>
              </a>
            </div>

            <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <MdDirectionsBike size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary dark:text-white">
                  Estimated delivery: 30–45 min
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {order.deliveryPartner.name} is on the way!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Order status timeline */}
        {order && order.orderStatus !== 'Cancelled' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <h2 className="font-bold text-secondary dark:text-white mb-4">Order Status</h2>
            <div className="flex items-center justify-between overflow-x-auto pb-2">
              {STATUS_STEPS.map((step, i) => {
                const currentIndex = STATUS_STEPS.indexOf(order.orderStatus)
                const isActive = i === currentIndex
                const isDone = i < currentIndex
                return (
                  <div key={step} className="flex items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                        isDone ? 'bg-green-500 border-green-500' :
                        isActive ? 'bg-primary border-primary ring-4 ring-primary/20' :
                        'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500'
                      }`} />
                      <span className={`text-xs text-center whitespace-nowrap max-w-[60px] ${
                        isActive ? 'text-primary font-bold' :
                        isDone ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {step}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`h-0.5 w-8 mx-1 mb-4 ${i < currentIndex ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4"
        >
          <Link to="/dashboard" className="btn-primary flex-1 py-3 text-center">
            Track Order
          </Link>
          <Link to="/menu" className="btn-secondary flex-1 py-3 text-center">
            Order More
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default OrderConfirmationPage
