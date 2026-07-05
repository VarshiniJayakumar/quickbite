import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MdAdd, MdRemove, MdDelete, MdShoppingCart, MdArrowForward, MdLocalOffer } from 'react-icons/md'
import { useCart } from '../context/CartContext'

const CartPage = () => {
  const { cart, cartLoading, subtotal, tax, total, updateQuantity, removeFromCart } = useCart()
  const navigate = useNavigate()
  const items = cart.items || []

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center bg-background dark:bg-secondary">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm mx-auto px-4"
        >
          <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <MdShoppingCart size={40} className="text-gray-300 dark:text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-secondary dark:text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Looks like you haven't added anything yet. Browse our menu to find something delicious!
          </p>
          <Link to="/menu" className="btn-primary gap-2 w-full justify-center">
            Browse Menu <MdArrowForward size={18} />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background dark:bg-secondary">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="section-title mb-2"
        >
          Your Cart
        </motion.h1>
        <p className="section-subtitle mb-8">{items.length} item{items.length !== 1 ? 's' : ''} ready to order</p>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {items.map((item) => {
                const food = item.foodId
                if (!food) return null
                const lineTotal = (food.price * item.quantity).toFixed(2)
                return (
                  <motion.div
                    key={food._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                    className="bg-white dark:bg-gray-900 rounded-3xl p-4 flex items-center gap-4 border border-gray-100 dark:border-white/5 shadow-card"
                  >
                    <img
                      src={food.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=120&q=70'}
                      alt={food.title}
                      className="w-20 h-20 object-cover rounded-2xl flex-shrink-0"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=120&q=70' }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-secondary dark:text-white text-sm truncate mb-0.5">{food.title}</h3>
                      <p className="text-primary font-bold text-sm">₹{food.price} <span className="text-gray-400 font-normal">each</span></p>
                    </div>
                    {/* Quantity */}
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-2xl p-1">
                      <button
                        onClick={() => updateQuantity(food._id, item.quantity - 1)}
                        disabled={cartLoading}
                        className="w-8 h-8 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-40 text-gray-600 dark:text-gray-300"
                      >
                        <MdRemove size={16} />
                      </button>
                      <span className="w-7 text-center font-bold text-sm text-secondary dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(food._id, item.quantity + 1)}
                        disabled={cartLoading}
                        className="w-8 h-8 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-40 text-gray-600 dark:text-gray-300"
                      >
                        <MdAdd size={16} />
                      </button>
                    </div>
                    <div className="text-right min-w-[64px]">
                      <p className="font-bold text-secondary dark:text-white text-sm">₹{lineTotal}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(food._id)}
                      disabled={cartLoading}
                      className="w-8 h-8 flex items-center justify-center rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-all disabled:opacity-40"
                      aria-label="Remove item"
                    >
                      <MdDelete size={18} />
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Offer hint */}
            <div className="flex items-center gap-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-3xl p-4">
              <MdLocalOffer className="text-primary flex-shrink-0" size={20} />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Have a promo code? Apply it at checkout.
              </p>
            </div>
          </div>

          {/* Order summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-6 h-fit sticky top-24 border border-gray-100 dark:border-white/5 shadow-card"
          >
            <h2 className="font-bold text-secondary dark:text-white text-lg mb-5">Order Summary</h2>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-medium text-secondary dark:text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>GST (5%)</span>
                <span className="font-medium text-secondary dark:text-white">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Delivery</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              <div className="border-t dark:border-white/10 pt-3 flex justify-between font-bold text-secondary dark:text-white">
                <span>Total</span>
                <span className="text-primary text-xl">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full py-4 text-base gap-2 rounded-2xl"
            >
              Checkout <MdArrowForward size={18} />
            </button>

            <Link to="/menu" className="block text-center text-sm text-gray-400 hover:text-primary mt-4 transition-colors">
              ← Continue Shopping
            </Link>

            {/* Trust badges */}
            <div className="mt-5 pt-4 border-t dark:border-white/10 flex items-center justify-center gap-4 text-xs text-gray-400">
              <span>🔒 Secure checkout</span>
              <span>🚀 Fast delivery</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
