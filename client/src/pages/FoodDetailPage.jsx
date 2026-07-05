import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdStar, MdAdd, MdRemove, MdArrowBack, MdShoppingCart } from 'react-icons/md'
import api from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const CATEGORY_COLORS = {
  Burger:  'bg-orange-100 text-orange-700',
  Pizza:   'bg-red-100 text-red-700',
  Noodles: 'bg-yellow-100 text-yellow-700',
  Drinks:  'bg-blue-100 text-blue-700',
  Dessert: 'bg-pink-100 text-pink-700',
}

const FoodDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, cartLoading } = useCart()
  const { user } = useAuth()
  const [food, setFood] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [imgError, setImgError] = useState(false)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    api.get(`/foods/${id}`)
      .then(res => setFood(res.data.food))
      .catch(() => toast.error('Food item not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login to add items to cart'); navigate('/login'); return }
    setAdding(true)
    await addToCart(food._id, quantity)
    setAdding(false)
  }

  if (loading) return (
    <div className="pt-24 pb-16 min-h-screen bg-background dark:bg-secondary">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10 animate-pulse">
        <div className="shimmer rounded-3xl h-96" />
        <div className="space-y-4 pt-4">
          <div className="shimmer h-6 w-1/3 rounded-full" />
          <div className="shimmer h-10 w-3/4 rounded-2xl" />
          <div className="shimmer h-4 w-full rounded-full" />
          <div className="shimmer h-4 w-5/6 rounded-full" />
          <div className="shimmer h-12 w-1/3 rounded-2xl" />
        </div>
      </div>
    </div>
  )

  if (!food) return (
    <div className="pt-24 pb-16 min-h-screen flex items-center justify-center bg-background dark:bg-secondary">
      <div className="text-center">
        <p className="text-6xl mb-4">😔</p>
        <h2 className="text-2xl font-bold mb-3 text-secondary dark:text-white">Food not found</h2>
        <button onClick={() => navigate('/menu')} className="btn-primary mt-2">Back to Menu</button>
      </div>
    </div>
  )

  const fallbackImg = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80'

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background dark:bg-secondary">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary mb-7 transition-colors group"
        >
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all">
            <MdArrowBack size={16} />
          </div>
          Back to menu
        </button>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden h-80 md:h-full min-h-[320px] shadow-xl">
              <img
                src={(!imgError && food.image) ? food.image : fallbackImg}
                alt={food.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
              {!food.available && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center rounded-3xl">
                  <span className="bg-red-500 text-white px-6 py-3 rounded-2xl text-lg font-bold shadow-xl">
                    Currently Unavailable
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            {/* Category */}
            <span className={`badge w-fit mb-3 ${CATEGORY_COLORS[food.category] || 'bg-gray-100 text-gray-600'}`}>
              {food.category}
            </span>

            <h1 className="text-3xl font-black text-secondary dark:text-white mb-3 leading-tight">
              {food.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <MdStar key={i} size={18} className={i < Math.round(food.rating) ? 'text-accent' : 'text-gray-200 dark:text-gray-700'} />
                ))}
              </div>
              <span className="text-sm font-semibold text-secondary dark:text-white">{food.rating?.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({food.numReviews || 0} reviews)</span>
            </div>

            <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-5">{food.description}</p>

            {/* Ingredients */}
            {food.ingredients?.length > 0 && (
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {food.ingredients.map((ing, i) => (
                    <span key={i} className="bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-xs font-medium">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-black text-primary">₹{food.price}</span>
              <span className="text-sm text-gray-400">per serving</span>
            </div>

            {/* Quantity */}
            {food.available && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Quantity</span>
                <div className="flex items-center gap-3 bg-gray-100 dark:bg-white/5 rounded-2xl p-1.5">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-all text-gray-600 dark:text-gray-300"
                  >
                    <MdRemove size={18} />
                  </button>
                  <span className="w-8 text-center font-black text-lg text-secondary dark:text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-all text-gray-600 dark:text-gray-300"
                  >
                    <MdAdd size={18} />
                  </button>
                </div>
                <span className="text-sm text-gray-400 font-medium">
                  = <span className="text-primary font-bold">₹{(food.price * quantity).toFixed(0)}</span>
                </span>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={!food.available || cartLoading || adding}
              className="btn-primary py-4 text-base gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <MdShoppingCart size={20} />
              )}
              {food.available
                ? (adding ? 'Adding...' : `Add ${quantity} to Cart · ₹${(food.price * quantity).toFixed(0)}`)
                : 'Currently Unavailable'
              }
            </button>

            {/* Trust badges */}
            <div className="flex items-center gap-4 mt-5 text-xs text-gray-400">
              <span>🍃 Fresh daily</span>
              <span>🚀 30 min delivery</span>
              <span>✅ Hygienic prep</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default FoodDetailPage
