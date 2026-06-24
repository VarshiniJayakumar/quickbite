import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MdStar, MdAddShoppingCart } from 'react-icons/md'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const FoodCard = ({ food }) => {
  const { addToCart, cartLoading } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please login to add items to cart')
      navigate('/login')
      return
    }
    addToCart(food._id, 1)
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card overflow-hidden group"
    >
      <Link to={`/menu/${food._id}`}>
        <div className="relative overflow-hidden h-48">
          <img
            src={food.image ? food.image : `https://via.placeholder.com/400x300?text=${encodeURIComponent(food.title)}`}
            alt={food.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {!food.available && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Unavailable
              </span>
            </div>
          )}
          <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full font-medium">
            {food.category}
          </span>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-secondary dark:text-white text-lg mb-1 truncate">
            {food.title}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {food.description}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <MdStar className="text-accent" size={16} />
                <span className="text-sm font-medium text-secondary dark:text-white">
                  {food.rating?.toFixed(1) || '0.0'}
                </span>
              </div>
              <span className="text-xl font-bold text-primary">₹{food.price}</span>
            </div>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          disabled={!food.available || cartLoading}
          className="w-full flex items-center justify-center gap-2 btn-primary py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MdAddShoppingCart size={18} />
          {food.available ? 'Add to Cart' : 'Unavailable'}
        </button>
      </div>
    </motion.div>
  )
}

export default FoodCard
