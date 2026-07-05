import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdSearch, MdClose, MdTune } from 'react-icons/md'
import api from '../services/api'
import FoodCard from '../components/FoodCard'
import SkeletonCard from '../components/SkeletonCard'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'Burger', 'Pizza', 'Noodles', 'Drinks', 'Dessert']
const CATEGORY_EMOJI = { All: '🍽️', Burger: '🍔', Pizza: '🍕', Noodles: '🍜', Drinks: '🥤', Dessert: '🍰' }

const SORT_OPTIONS = [
  { value: '',           label: 'Default' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Top Rated' },
]

const MenuPage = () => {
  const [searchParams] = useSearchParams()
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [sort, setSort] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const fetchFoods = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 12 }
      if (debouncedSearch) params.search = debouncedSearch
      if (category !== 'All') params.category = category
      if (sort) {
        const [sortBy, order] = sort.split('_')
        params.sortBy = sortBy
        if (order) params.order = order
      }
      const res = await api.get('/foods', { params })
      setFoods(res.data.foods)
      setPagination(res.data.pagination)
    } catch {
      toast.error('Failed to load menu')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, category, sort, page])

  useEffect(() => { fetchFoods() }, [fetchFoods])
  useEffect(() => { setPage(1) }, [debouncedSearch, category, sort])

  const clearFilters = () => { setSearch(''); setCategory('All'); setSort('') }
  const hasFilters = search || category !== 'All' || sort

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background dark:bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="section-title">Our Menu</h1>
          <p className="section-subtitle">
            {pagination.total ? `${pagination.total} delicious items` : 'Explore our menu'}
          </p>
        </motion.div>

        {/* Search + Sort */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-5"
        >
          <div className="relative flex-1">
            <MdSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for food, cuisine, ingredients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-11 pr-10 h-12"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/10 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MdClose size={15} />
              </button>
            )}
          </div>
          <div className="relative sm:w-52">
            <MdTune size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input-field pl-9 h-12 appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Category pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
                category === cat
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:border-primary/40 hover:text-primary'
              }`}
            >
              <span className="text-base">{CATEGORY_EMOJI[cat]}</span>
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Active filters hint */}
        {hasFilters && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-5 px-1"
          >
            <p className="text-sm text-gray-500">
              {pagination.total || 0} result{pagination.total !== 1 ? 's' : ''} found
            </p>
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:underline font-medium"
            >
              Clear all filters
            </button>
          </motion.div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : foods.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <p className="text-6xl mb-4">🔍</p>
            <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">Nothing found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
              Try different keywords or reset the filters
            </p>
            <button onClick={clearFilters} className="btn-primary">
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {foods.map((food, i) => (
                <motion.div
                  key={food._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <FoodCard food={food} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-2.5 rounded-2xl text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:border-primary/40 transition-all"
                >
                  ← Prev
                </button>
                {[...Array(Math.min(pagination.pages, 7))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-2xl text-sm font-semibold transition-all ${
                      page === i + 1
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 hover:border-primary/40'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-5 py-2.5 rounded-2xl text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:border-primary/40 transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MenuPage
