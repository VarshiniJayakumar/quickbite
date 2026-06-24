import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MdAdd, MdRemove, MdDelete, MdShoppingCart } from 'react-icons/md'
import { useCart } from '../context/CartContext'

const CartPage = () => {
  const { cart, cartLoading, subtotal, tax, total, updateQuantity, removeFromCart } = useCart()
  const navigate = useNavigate()

  const items = cart.items || []

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center bg-background dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <MdShoppingCart size={80} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-secondary dark:text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Add some delicious food to get started!</p>
          <Link to="/menu" className="btn-primary text-lg px-8 py-3">
            Browse Menu
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="section-title mb-8"
        >
          Your Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
        </motion.h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => {
                const food = item.foodId
                if (!food) return null
                const lineTotal = (food.price * item.quantity).toFixed(2)

                return (
                  <motion.div
                    key={food._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="card p-4 flex gap-4 items-center"
                  >
                    <img
                      src={food.image || `https://via.placeholder.com/80x80?text=Food`}
                      alt={food.title}
                      className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-secondary dark:text-white truncate">{food.title}</h3>
                      <p className="text-primary font-bold">₹{food.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(food._id, item.quantity - 1)}
                        disabled={cartLoading}
                        className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                      >
                        <MdRemove size={16} />
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(food._id, item.quantity + 1)}
                        disabled={cartLoading}
                        className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                      >
                        <MdAdd size={16} />
                      </button>
                    </div>
                    <div className="text-right min-w-[60px]">
                      <p className="font-bold text-secondary dark:text-white">₹{lineTotal}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(food._id)}
                      disabled={cartLoading}
                      className="text-red-400 hover:text-red-600 transition-colors p-1 disabled:opacity-50"
                      aria-label="Remove item"
                    >
                      <MdDelete size={20} />
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6 h-fit sticky top-24"
          >
            <h2 className="text-xl font-bold text-secondary dark:text-white mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="border-t dark:border-gray-700 pt-3 flex justify-between text-lg font-bold text-secondary dark:text-white">
                <span>Total</span>
                <span className="text-primary">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full py-4 text-lg"
            >
              Proceed to Checkout
            </button>

            <Link
              to="/menu"
              className="block text-center text-primary hover:underline mt-4 text-sm"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
