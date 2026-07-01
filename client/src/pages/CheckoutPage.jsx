import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdLocationOn, MdPhone, MdPayment, MdCreditCard, MdLocalShipping } from 'react-icons/md'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import MapAddressPicker from '../components/MapAddressPicker'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { cart, subtotal, tax, total, clearCart } = useCart()
  const { user } = useAuth()

  const [form, setForm] = useState({
    phone: user?.phone || '',
    paymentMethod: 'Razorpay',
  })
  const [addressData, setAddressData] = useState(null)
  const [manualAddress, setManualAddress] = useState(user?.address || '')
  const [useManual, setUseManual] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const items = cart.items || []

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => { if (document.body.contains(script)) document.body.removeChild(script) }
  }, [])

  const getFinalAddress = () => {
    if (useManual) return { address: manualAddress, lat: null, lng: null }
    return addressData
  }

  const validate = () => {
    const errs = {}
    const addr = getFinalAddress()
    if (!addr?.address?.trim()) errs.address = 'Delivery address is required'
    if (!form.phone.trim()) errs.phone = 'Phone number is required'
    return errs
  }

  const buildOrderItems = () => items.map((item) => ({
    foodId: item.foodId._id,
    title: item.foodId.title,
    price: item.foodId.price,
    image: item.foodId.image,
    category: item.foodId.category,
    quantity: item.quantity,
  }))

  const handleRazorpay = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const addr = getFinalAddress()

      // Create Razorpay order on server
      const { data } = await api.post('/payment/create-order', { amount: total })

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'QuickBite',
        description: `Order of ${items.length} item(s)`,
        order_id: data.orderId,
        prefill: {
          name: user.name,
          email: user.email,
          contact: form.phone,
        },
        theme: { color: '#FF6B35' },
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: {
                deliveryAddress: addr.address,
                coordinates: addr.lat ? { lat: addr.lat, lng: addr.lng } : undefined,
                phone: form.phone,
                items: buildOrderItems(),
                subtotal,
                tax,
                totalAmount: total,
              },
            })
            await clearCart()
            toast.success('Payment successful! Order placed 🎉')
            navigate(`/order-confirmation/${verifyRes.data.order._id}`)
          } catch {
            toast.error('Payment verification failed. Contact support.')
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled')
            setLoading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment')
      setLoading(false)
    }
  }

  const handleCOD = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const addr = getFinalAddress()
    try {
      const res = await api.post('/payment/cod', {
        deliveryAddress: addr.address,
        coordinates: addr.lat ? { lat: addr.lat, lng: addr.lng } : undefined,
        phone: form.phone,
        items: buildOrderItems(),
        subtotal,
        tax,
        totalAmount: total,
      })
      await clearCart()
      toast.success('Order placed successfully!')
      navigate(`/order-confirmation/${res.data.order._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (form.paymentMethod === 'COD') handleCOD()
    else handleRazorpay()
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="section-title mb-8">
          Checkout
        </motion.h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">

              {/* Delivery Address */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                <h2 className="text-xl font-bold text-secondary dark:text-white mb-4 flex items-center gap-2">
                  <MdLocationOn className="text-primary" /> Delivery Address
                </h2>

                {/* Toggle between map and manual */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setUseManual(false)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                      !useManual ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    🗺️ Search on Map
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseManual(true)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                      useManual ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    ✏️ Type Manually
                  </button>
                </div>

                {!useManual ? (
                  <MapAddressPicker
                    onAddressSelect={(data) => {
                      setAddressData(data)
                      setErrors({ ...errors, address: '' })
                    }}
                  />
                ) : (
                  <textarea
                    value={manualAddress}
                    onChange={(e) => { setManualAddress(e.target.value); setErrors({ ...errors, address: '' }) }}
                    placeholder="Enter your full delivery address"
                    rows={3}
                    className={`input-field resize-none ${errors.address ? 'border-red-500' : ''}`}
                  />
                )}
                {errors.address && <p className="text-red-500 text-sm mt-2">{errors.address}</p>}

                {/* Phone */}
                <div className="mt-4">
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
                      className={`input-field pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
                <h2 className="text-xl font-bold text-secondary dark:text-white mb-4 flex items-center gap-2">
                  <MdPayment className="text-primary" /> Payment Method
                </h2>
                <div className="space-y-3">
                  {/* Razorpay */}
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    form.paymentMethod === 'Razorpay'
                      ? 'border-primary bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                  }`}>
                    <input
                      type="radio" name="paymentMethod" value="Razorpay"
                      checked={form.paymentMethod === 'Razorpay'}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                      className="accent-primary"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <MdCreditCard size={24} className="text-primary" />
                      <div>
                        <p className="font-semibold text-secondary dark:text-white">Pay Online</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">UPI • Cards • Net Banking • Wallets via Razorpay</p>
                      </div>
                    </div>
                    <img src="https://razorpay.com/favicon.ico" alt="Razorpay" className="w-6 h-6 rounded" />
                  </label>

                  {/* COD */}
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    form.paymentMethod === 'COD'
                      ? 'border-primary bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                  }`}>
                    <input
                      type="radio" name="paymentMethod" value="COD"
                      checked={form.paymentMethod === 'COD'}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                      className="accent-primary"
                    />
                    <div className="flex items-center gap-3">
                      <MdLocalShipping size={24} className="text-green-600" />
                      <div>
                        <p className="font-semibold text-secondary dark:text-white">Cash on Delivery</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Pay when your order arrives</p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Razorpay supported methods */}
                {form.paymentMethod === 'Razorpay' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex flex-wrap gap-2">
                    {['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net Banking', 'Wallets'].map((m) => (
                      <span key={m} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full">
                        {m}
                      </span>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Order Summary */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6 h-fit sticky top-24">
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
                <div className="flex justify-between text-gray-600 dark:text-gray-300 text-sm">
                  <span>Delivery</span><span className="text-green-600 font-medium">FREE</span>
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
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                ) : form.paymentMethod === 'Razorpay' ? (
                  <>💳 Pay ₹{total.toFixed(2)}</>
                ) : (
                  <>🛵 Place Order (COD)</>
                )}
              </button>

              <p className="text-xs text-center text-gray-400 mt-3">
                {form.paymentMethod === 'Razorpay' ? '🔒 Secured by Razorpay' : '🛵 Pay on delivery'}
              </p>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CheckoutPage
