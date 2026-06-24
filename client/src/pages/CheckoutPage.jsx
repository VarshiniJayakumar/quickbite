import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdLocationOn, MdPhone, MdPayment } from 'react-icons/md'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

const PAYMENT_METHODS = [
  { value: 'COD', label: 'Cash on Delivery', icon: '💵' },
  { value: 'UPI', label: 'UPI', icon: '📱' },
  { value: 'Card', label: 'Debit / Credit Card', icon: '💳' },
]

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { cart, subtotal, tax, total, clearCart } = useCart()
  const { user } = useAuth()

  const [form, setForm] = useState({
    deliveryAddress: user?.address || '',
    phone: user?.phone || '',
    paymentMethod: 'COD',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.deliveryAddress.trim()) errs.deliveryAddress = 'Delivery address is required'
    if (!form.phone.trim()) errs.phone = 'Phone number is required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/orders', form)
      const order = res.data.order
      toast.success('Order placed successfully!')
      navigate(`/order-confirmation/${order._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const items = cart.items || []

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="section-title mb-8"
        >
          Checkout
        </motion.h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <h2 className="text-xl font-bold text-secondary dark:text-white mb-4 flex items-center gap-2">
                  <MdLocationOn className="text-primary" /> Delivery Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Delivery Address *
                    </label>
                    <textarea
                      value={form.deliveryAddress}
                      onChange={(e) => { setForm({ ...form, deliveryAddress: e.target.value }); setErrors({ ...errors, deliveryAddress: '' }) }}
                      placeholder="Enter your full delivery address"
                      rows={3}
                      className={`input-field resize-none ${errors.deliveryAddress ? 'border-red-500 ring-red-200' : ''}`}
                    />
                    {errors.deliveryAddress && <p className="text-red-500 text-sm mt-1">{errors.deliveryAddress}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <MdPhone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: '' }) }}
                        placeholder="+91 XXXXX XXXXX"
                        className={`input-field pl-10 ${errors.phone ? 'border-red-500 ring-red-200' : ''}`}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-6"
              >
                <h2 className="text-xl font-bold text-secondary dark:text-white mb-4 flex items-center gap-2">
                  <MdPayment className="text-primary" /> Payment Method
                </h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        form.paymentMethod === method.value
                          ? 'border-primary bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={form.paymentMethod === method.value}
                        onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                        className="accent-primary"
                      />
                      <span className="text-xl">{method.icon}</span>
                      <span className="font-medium text-secondary dark:text-white">{method.label}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-6 h-fit sticky top-24"
            >
              <h2 className="text-xl font-bold text-secondary dark:text-white mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {items.map((item) => item.foodId && (
                  <div key={item.foodId._id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 truncate flex-1 mr-2">
                      {item.foodId.title} × {item.quantity}
                    </span>
                    <span className="font-medium">₹{(item.foodId.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t dark:border-gray-700 pt-3 space-y-2 mb-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-300 text-sm">
                  <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300 text-sm">
                  <span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-secondary dark:text-white pt-2 border-t dark:border-gray-700">
                  <span>Total</span><span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CheckoutPage
