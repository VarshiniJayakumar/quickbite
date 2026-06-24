import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MdStar, MdChevronLeft, MdChevronRight, MdLocalOffer } from 'react-icons/md'
import api from '../services/api'
import FoodCard from '../components/FoodCard'
import SkeletonCard from '../components/SkeletonCard'

const CATEGORIES = [
  { name: 'Burger', emoji: '🍔' },
  { name: 'Pizza', emoji: '🍕' },
  { name: 'Noodles', emoji: '🍜' },
  { name: 'Drinks', emoji: '🥤' },
  { name: 'Dessert', emoji: '🍰' },
]

const TESTIMONIALS = [
  { name: 'Priya Sharma', rating: 5, text: 'Best burger in town! Super fast delivery and amazing taste. Will definitely order again!', avatar: 'P' },
  { name: 'Rahul Mehta', rating: 5, text: 'The pizza was absolutely delicious. Fresh ingredients and perfect crust. QuickBite never disappoints!', avatar: 'R' },
  { name: 'Anika Patel', rating: 4, text: 'Great variety of food options. The app is very easy to use and tracking is smooth.', avatar: 'A' },
  { name: 'Dev Kumar', rating: 5, text: 'Incredible food quality at such affordable prices. My go-to app for dinner every evening!', avatar: 'D' },
]

const OFFERS = [
  { title: '20% OFF', desc: 'On your first order', code: 'FIRST20', color: 'from-orange-500 to-red-500' },
  { title: 'Buy 1 Get 1', desc: 'On all burgers today', code: 'BOGO', color: 'from-purple-500 to-indigo-500' },
  { title: 'Weekend Combo', desc: 'Pizza + Drinks at ₹299', code: 'WEEKEND', color: 'from-green-500 to-teal-500' },
]

const HomePage = () => {
  const [featuredFoods, setFeaturedFoods] = useState([])
  const [loadingFoods, setLoadingFoods] = useState(true)
  const [testimonialIndex, setTestimonialIndex] = useState(0)

  useEffect(() => {
    api.get('/foods/featured')
      .then((res) => setFeaturedFoods(res.data.foods || []))
      .catch(() => {})
      .finally(() => setLoadingFoods(false))
  }, [])

  // Auto-slide testimonials every 4s
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((i) => (i + 1) % TESTIMONIALS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-20 h-20 rounded-full bg-primary/10"
              style={{ left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 20}%` }}
              animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center py-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6"
            >
              🔥 #1 Restaurant App in Your City
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl font-extrabold text-secondary dark:text-white leading-tight mb-4"
            >
              Delicious Food <span className="text-primary">Delivered</span> To Your Door
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-500 dark:text-gray-300 mb-8"
            >
              Fresh • Fast • Affordable
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-4 flex-wrap"
            >
              <Link to="/menu" className="btn-primary text-lg px-8 py-4">
                Order Now 🍕
              </Link>
              <Link to="/menu" className="btn-secondary text-lg px-8 py-4">
                View Menu
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-8 mt-10"
            >
              {[
                { value: '500+', label: 'Menu Items' },
                { value: '10K+', label: 'Happy Customers' },
                { value: '30 min', label: 'Avg Delivery' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-primary">{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:flex justify-center"
          >
            <div className="relative w-96 h-96">
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
              <img
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80"
                alt="Delicious burger"
                className="relative z-10 w-full h-full object-cover rounded-3xl shadow-2xl"
              />
              <motion.div
                className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2 z-20"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="text-xs text-gray-500">Rating</p>
                  <p className="font-bold text-secondary dark:text-white">4.9/5</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="section-title">Popular Categories</h2>
            <p className="text-gray-500 dark:text-gray-400">Explore our wide variety of food categories</p>
          </motion.div>

          <div className="flex gap-4 overflow-x-auto pb-4 md:justify-center scrollbar-hide snap-x">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="snap-start"
              >
                <Link
                  to={`/menu?category=${cat.name}`}
                  className="flex flex-col items-center gap-3 min-w-[100px] bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-xl hover:border-primary border-2 border-transparent transition-all duration-200"
                >
                  <span className="text-4xl">{cat.emoji}</span>
                  <span className="font-semibold text-secondary dark:text-white text-sm">{cat.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Foods */}
      <section className="py-16 bg-background dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-10"
          >
            <div>
              <h2 className="section-title">Featured Foods</h2>
              <p className="text-gray-500 dark:text-gray-400">Hand-picked favourites just for you</p>
            </div>
            <Link to="/menu" className="btn-secondary py-2 px-5 text-sm">
              View All
            </Link>
          </motion.div>

          {loadingFoods ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : featuredFoods.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🍽️</p>
              <p className="text-gray-500 dark:text-gray-400 text-lg">No featured items available</p>
              <Link to="/menu" className="btn-primary mt-4 inline-block">Browse Menu</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredFoods.slice(0, 8).map((food, i) => (
                <motion.div
                  key={food._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <FoodCard food={food} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="section-title">Special Offers</h2>
            <p className="text-gray-500 dark:text-gray-400">Use these codes at checkout to save big</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {OFFERS.map((offer, i) => (
              <motion.div
                key={offer.code}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ scale: 1.03 }}
                className={`bg-gradient-to-r ${offer.color} text-white rounded-2xl p-6 shadow-lg cursor-pointer`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <MdLocalOffer size={24} />
                  <span className="text-3xl font-extrabold">{offer.title}</span>
                </div>
                <p className="text-white/90 mb-4">{offer.desc}</p>
                <div className="bg-white/20 rounded-xl px-4 py-2 inline-block">
                  <span className="font-mono font-bold tracking-widest">{offer.code}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-background dark:bg-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <h2 className="section-title">What Our Customers Say</h2>
          </motion.div>

          <div className="relative h-56">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 card p-8 flex flex-col items-center justify-center"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(TESTIMONIALS[testimonialIndex].rating)].map((_, i) => (
                    <MdStar key={i} className="text-accent" size={20} />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic text-lg mb-4">
                  "{TESTIMONIALS[testimonialIndex].text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {TESTIMONIALS[testimonialIndex].avatar}
                  </div>
                  <p className="font-semibold text-secondary dark:text-white">
                    {TESTIMONIALS[testimonialIndex].name}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === testimonialIndex ? 'bg-primary w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
