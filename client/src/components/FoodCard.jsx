import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MdStar, MdAdd, MdFavorite, MdFavoriteBorder } from 'react-icons/md'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const CATEGORY_COLORS = {
  Burger:  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Pizza:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Noodles: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Drinks:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Dessert: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
}

const FoodCard = ({ food }) => {
  const { addToCart, cartLoading } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)
  const [adding, setAdding] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast.error('Please login to add items to cart')
      navigate('/login')
      return
    }
    setAdding(true)
    await addToCart(food._id, 1)
    setAdding(false)
  }

  const handleLike = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setLiked(!liked)
    if (!liked) toast.success('Added to favourites ❤️')
  }

  const fallbackImg = `https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=70`

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group relative bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-card hover:shadow-card-hover transition-all duration-300"
    >
      {/* Image */}
      <Link to={`/menu/${food._id}`}>
        <div className="food-img-wrap relative h-48 bg-gray-100 dark:bg-gray-800">
          <img
            src={(!imgError && food.image) ? food.image : fallbackImg}
            alt={food.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Overlay on unavailable */}
          {!food.available && (
            <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
                Unavailable
              </span>
            </div>
          )}

          {/* Category badge */}
          <span className={`absolute top-3 left-3 badge ${CATEGORY_COLORS[food.category] || 'bg-gray-100 text-gray-600'}`}>
            {food.category}
          </span>

          {/* Favourite button */}
          <button
            onClick={handleLike}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 dark:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            aria-label="Add to favourites"
          >
            {liked
              ? <MdFavorite size={16} className="text-red-500" />
              : <MdFavoriteBorder size={16} className="text-gray-500" />
            }
          </button>
        </div>

        {/* Content */}
        <div className="p-4 pb-3">
          <h3 className="font-semibold text-secondary dark:text-white text-base leading-snug mb-1 truncate">
            {food.title}
          </h3>
          <p className="text-gray-400 dark:text-gray-500 text-xs mb-3 line-clamp-2 leading-relaxed">
            {food.description || 'Freshly prepared just for you'}
          </p>

          <div className="flex items-center justify-between">
            {/* Rating */}
            <div className="flex items-center gap-1">
              <MdStar className="text-accent" size={14} />
              <span className="text-xs font-semibold text-secondary dark:text-white">
                {food.rating?.toFixed(1) || '4.5'}
              </span>
            </div>
            {/* Price */}
            <span className="text-lg font-bold text-primary">₹{food.price}</span>
          </div>
        </div>
      </Link>

      {/* Add to Cart */}
      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          disabled={!food.available || cartLoading || adding}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
            food.available
              ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20 active:scale-95'
              : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
          } disabled:opacity-60`}
        >
          {adding ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <MdAdd size={18} />
          )}
          {food.available ? (adding ? 'Adding...' : 'Add to Cart') : 'Unavailable'}
        </button>
      </div>
    </motion.div>
  )
}

export default FoodCard
