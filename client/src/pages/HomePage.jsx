import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MdStar, MdLocalOffer, MdArrowForward, MdBolt } from 'react-icons/md'
import api from '../services/api'
import FoodCard from '../components/FoodCard'
import SkeletonCard from '../components/SkeletonCard'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { name: 'Burger',  emoji: '🍔', color: 'from-orange-400 to-red-400' },
  { name: 'Pizza',   emoji: '🍕', color: 'from-red-400 to-pink-400' },
  { name: 'Noodles', emoji: '🍜', color: 'from-yellow-400 to-orange-400' },
  { name: 'Drinks',  emoji: '🥤', color: 'from-blue-400 to-cyan-400' },
  { name: 'Dessert', emoji: '🍰', color: 'from-pink-400 to-purple-400' },
]

const TESTIMONIALS = [
  { name: 'Priya Sharma',  rating: 5, text: 'Best burger in town! Super fast delivery and incredible taste. QuickBite is my go-to every weekend!', avatar: 'P', role: 'Food Blogger' },
  { name: 'Rahul Mehta',   rating: 5, text: 'The pizza is absolutely divine — fresh ingredients and perfect crust every single time. Highly recommend!', avatar: 'R', role: 'Software Engineer' },
  { name: 'Anika Patel',   rating: 4, text: 'Great variety, super easy to use, and the tracking feature is so smooth. Love the dark mode too!', avatar: 'A', role: 'Designer' },
  { name: 'Dev Kumar',     rating: 5, text: 'Incredible quality at such affordable prices. My entire family orders from QuickBite every evening!', avatar: 'D', role: 'Entrepreneur' },
]

const OFFERS = [
  { title: '20% OFF', desc: 'On your first order', code: 'FIRST20', gradient: 'from-orange-500 via-primary to-red-500', emoji: '🎉' },
  { title: 'Buy 1 Get 1', desc: 'On all burgers today', code: 'BOGO', gradient: 'from-violet-500 via-purple-500 to-indigo-500', emoji: '🍔' },
  { title: 'Weekend Combo', desc: 'Pizza + Drinks at ₹299', code: 'WEEKEND', gradient: 'from-emerald-500 via-teal-500 to-cyan-500', emoji: '🎊' },
]

const STATS = [
  { value: '500+', label: 'Menu Items', icon: '🍽️' },
  { value: '50K+', label: 'Happy Customers', icon: '😊' },
  { value: '4.9★', label: 'Average Rating', icon: '⭐' },
  { value: '30 min', label: 'Avg Delivery', icon: '🚀' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
})

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

  useEffect(() => {
    const t = setInterval(() => setTestimonialIndex(i => (i + 1) % TESTIMONIALS.length), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="pt-16 overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center bg-background dark:bg-secondary overflow-hidden">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 bg-hero-mesh opacity-60 dark:opacity-20" />
        {/* Orbs */}
        <div className="orb w-96 h-96 bg-primary/20 -top-20 -left-20" />
        <div className="orb w-80 h-80 bg-accent/20 top-1/3 right-0" />
        <div className="orb w-64 h-64 bg-purple-400/10 bottom-0 left-1/3" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center py-20 w-full">
          {/* Left */}
          <div>
            <motion.div {...fadeUp(0.1)} className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <MdBolt size={16} />
              #1 Restaurant App · Free Delivery Today
            </motion.div>

            <motion.h1 {...fadeUp(0.2)} className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-secondary dark:text-white leading-[1.05] mb-5">
              Delicious Food{' '}
              <span className="gradient-text">Delivered</span>{' '}
              Fast
            </motion.h1>

            <motion.p {...fadeUp(0.3)} className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-lg leading-relaxed">
              Fresh ingredients, bold flavours, lightning-fast delivery. Your favourite restaurant meals at your doorstep in 30 minutes.
            </motion.p>

            <motion.div {...fadeUp(0.4)} className="flex flex-wrap gap-3 mb-12">
              <Link to="/menu" className="btn-primary text-base px-7 py-3.5 rounded-2xl gap-2">
                Order Now <MdArrowForward size={18} />
              </Link>
              <Link to="/menu" className="btn-secondary text-base px-7 py-3.5 rounded-2xl">
                Explore Menu
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div {...fadeUp(0.5)} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STATS.map(({ value, label, icon }) => (
                <div key={label} className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/40 dark:border-white/5">
                  <span className="text-lg block mb-0.5">{icon}</span>
                  <p className="text-lg font-black text-secondary dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — hero image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:flex justify-center items-center relative"
          >
            <div className="relative w-[420px] h-[420px]">
              {/* Spinning ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-4 rounded-full border-2 border-dashed border-primary/20"
              />
              {/* Outer glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-2xl" />
              {/* Main image */}
              <img
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=85"
                alt="Delicious burger"
                className="relative z-10 w-full h-full object-cover rounded-[2.5rem] shadow-2xl shadow-primary/20"
              />
              {/* Floating rating pill */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-4 -left-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2.5 z-20 border border-gray-100 dark:border-white/10"
              >
                <div className="w-9 h-9 bg-accent/20 rounded-xl flex items-center justify-center">
                  <MdStar className="text-accent" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Rated</p>
                  <p className="font-black text-secondary dark:text-white text-sm">4.9 / 5.0</p>
                </div>
              </motion.div>
              {/* Floating order pill */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -top-4 -right-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2.5 z-20 border border-gray-100 dark:border-white/10"
              >
                <span className="text-xl">🚀</span>
                <div>
                  <p className="text-xs text-gray-400">Delivery in</p>
                  <p className="font-black text-primary text-sm">30 min</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Popular Categories ────────────────────── */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="section-title">Popular Categories</h2>
            <p className="section-subtitle">What are you craving today?</p>
          </motion.div>

          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide lg:justify-center">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, scale: 1.03 }}
                className="flex-shrink-0"
              >
                <Link
                  to={`/menu?category=${cat.name}`}
                  className="flex flex-col items-center gap-3 w-28 bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-white/5 shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-300"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${cat.color} rounded-2xl flex items-center justify-center shadow-lg text-2xl`}>
                    {cat.emoji}
                  </div>
                  <span className="font-semibold text-secondary dark:text-white text-sm">{cat.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Foods ────────────────────────── */}
      <section className="py-20 bg-background dark:bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <h2 className="section-title">Featured Picks</h2>
              <p className="section-subtitle">Hand-curated favourites loved by thousands</p>
            </div>
            <Link to="/menu" className="btn-ghost text-sm gap-1 hidden sm:flex">
              View All <MdArrowForward size={16} />
            </Link>
          </motion.div>

          {loadingFoods ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : featuredFoods.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🍽️</p>
              <p className="text-gray-400 text-lg mb-4">No featured items yet</p>
              <Link to="/menu" className="btn-primary">Browse Full Menu</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

          <div className="text-center mt-8 sm:hidden">
            <Link to="/menu" className="btn-secondary">View All Items</Link>
          </div>
        </div>
      </section>

      {/* ── Special Offers ────────────────────────── */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title">Special Offers</h2>
            <p className="section-subtitle">Tap any card to copy the code — use at checkout</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {OFFERS.map((offer, i) => (
              <motion.div
                key={offer.code}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => {
                  navigator.clipboard.writeText(offer.code)
                  toast.success(`Code "${offer.code}" copied!`)
                }}
                className={`relative overflow-hidden bg-gradient-to-br ${offer.gradient} text-white rounded-3xl p-6 cursor-pointer select-none shadow-lg`}
              >
                {/* Decorative circle */}
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute -bottom-10 -left-6 w-40 h-40 bg-white/5 rounded-full" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{offer.emoji}</span>
                    <span className="text-3xl font-black tracking-tight">{offer.title}</span>
                  </div>
                  <p className="text-white/80 text-sm mb-4">{offer.desc}</p>
                  <div className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors rounded-2xl px-4 py-2">
                    <span className="font-mono font-bold tracking-[0.15em] text-sm">{offer.code}</span>
                    <span className="text-xs opacity-70">📋 tap to copy</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why QuickBite ─────────────────────────── */}
      <section className="py-20 bg-background dark:bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title">Why Choose QuickBite?</h2>
            <p className="section-subtitle">Everything you need for a perfect meal experience</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '🚀', title: 'Lightning Fast', desc: 'Average 30-minute delivery guaranteed across the city' },
              { icon: '👨‍🍳', title: 'Fresh Quality', desc: 'Prepared with premium ingredients by top chefs daily' },
              { icon: '💰', title: 'Best Prices', desc: 'Competitive pricing with exclusive member-only discounts' },
              { icon: '📍', title: 'Live Tracking', desc: 'Real-time order status with your delivery partner details' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-white/5 hover:border-primary/20 hover:shadow-card-hover transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-primary/10 group-hover:bg-primary/20 rounded-2xl flex items-center justify-center text-2xl mb-4 transition-colors">
                  {item.icon}
                </div>
                <h3 className="font-bold text-secondary dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────── */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle">Real reviews from real foodies</p>
          </motion.div>

          <div className="relative">
            <div className="relative min-h-[200px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonialIndex}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.35 }}
                  className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-card"
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <MdStar
                        key={i}
                        size={18}
                        className={i < TESTIMONIALS[testimonialIndex].rating ? 'text-accent' : 'text-gray-200 dark:text-gray-700'}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6 italic">
                    "{TESTIMONIALS[testimonialIndex].text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-primary to-orange-400 rounded-2xl flex items-center justify-center text-white font-black shadow-md">
                      {TESTIMONIALS[testimonialIndex].avatar}
                    </div>
                    <div>
                      <p className="font-bold text-secondary dark:text-white">
                        {TESTIMONIALS[testimonialIndex].name}
                      </p>
                      <p className="text-xs text-gray-400">{TESTIMONIALS[testimonialIndex].role}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIndex(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === testimonialIndex
                      ? 'bg-primary w-6 h-2'
                      : 'bg-gray-200 dark:bg-white/10 w-2 h-2 hover:bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-primary via-orange-500 to-accent">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              Hungry? We've Got You Covered.
            </h2>
            <p className="text-white/80 mb-8 text-lg">
              Order now and get your first delivery free with code FIRST20
            </p>
            <Link to="/menu" className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
              Browse Menu <MdArrowForward size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  )
}

export default HomePage
