import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdStar, MdAdd, MdRemove, MdArrowBack } from 'react-icons/md'
import api from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const FoodDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, cartLoading } = useCart()
  const { user } = useAuth()

  const [food, setFood] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    api.get(`/foods/${id}`)
      .then((res) => setFood(res.data.food))
      .catch(() => toast.error('Food item not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to add items to cart')
      navigate('/login')
      return
    }
    addToCart(food._id, quantity)
  }

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-background dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-10 animate-pulse">
          <div className="skeleton rounded-2xl h-80" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-5/6 rounded" />
            <div className="skeleton h-10 w-1/3 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!food) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">😔</p>
          <h2 className="text-2xl font-bold mb-2">Food not found</h2>
          <button onClick={() => navigate('/menu')} className="btn-primary mt-4">Back to Menu</button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors"
        >
          <MdArrowBack size={20} /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative rounded-2xl overflow-hidden shadow-xl h-80 md:h-auto"
          >
            <img
              src={food.image || `https://via.placeholder.com/600x400?text=${encodeURIComponent(food.title)}`}
              alt={food.title}
              className="w-full h-full object-cover"
            />
            {!food.available && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-red-500 text-white px-6 py-3 rounded-full text-lg font-bold">
                  Currently Unavailable
                </span>
              </div>
            )}
            <span className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
              {food.category}
            </span>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <h1 className="text-3xl font-extrabold text-secondary dark:text-white mb-3">{food.title}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <MdStar
                    key={i}
                    size={20}
                    className={i < Math.round(food.rating) ? 'text-accent' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {food.rating?.toFixed(1)} ({food.numReviews} reviews)
              </span>
            </div>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{food.description}</p>

            {/* Ingredients */}
            {food.ingredients?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-secondary dark:text-white mb-2">Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {food.ingredients.map((ing, i) => (
                    <span key={i} className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-extrabold text-primary">₹{food.price}</span>
            </div>

            {/* Quantity selector */}
            {food.available && (
              <div className="flex items-center gap-4 mb-6">
                <span className="font-medium text-secondary dark:text-white">Quantity</span>
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-md">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                  >
                    <MdRemove />
                  </button>
                  <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                  >
                    <MdAdd />
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={!food.available || cartLoading}
              className="btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {food.available ? `Add to Cart — ₹${(food.price * quantity).toFixed(0)}` : 'Currently Unavailable'}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default FoodDetailPage
