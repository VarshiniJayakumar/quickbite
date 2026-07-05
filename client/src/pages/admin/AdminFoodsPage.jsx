import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdAdd, MdEdit, MdDelete, MdToggleOn, MdToggleOff, MdClose, MdStar } from 'react-icons/md'
import api from '../../services/api'
import toast from 'react-hot-toast'

const CATEGORIES = ['Burger', 'Pizza', 'Noodles', 'Drinks', 'Dessert']
const EMPTY_FORM = { title: '', description: '', price: '', category: 'Burger', ingredients: '', available: true, featured: false }

const AdminFoodsPage = () => {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editFood, setEditFood] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  const fetchFoods = async () => {
    setLoading(true)
    try {
      const res = await api.get('/foods', { params: { page, limit: 12 } })
      setFoods(res.data.foods)
      setPagination(res.data.pagination)
    } catch { toast.error('Failed to load foods') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchFoods() }, [page])

  const openCreate = () => { setEditFood(null); setForm(EMPTY_FORM); setImageFile(null); setShowModal(true) }
  const openEdit = (food) => {
    setEditFood(food)
    setForm({
      title: food.title, description: food.description || '',
      price: food.price, category: food.category,
      ingredients: food.ingredients?.join(', ') || '',
      available: food.available, featured: food.featured,
    })
    setImageFile(null)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.price || !form.category) { toast.error('Title, price and category are required'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (imageFile) fd.append('image', imageFile)
      const headers = { 'Content-Type': 'multipart/form-data' }
      if (editFood) {
        const res = await api.put(`/foods/${editFood._id}`, fd, { headers })
        setFoods(f => f.map(item => item._id === editFood._id ? res.data.food : item))
        toast.success('Food updated!')
      } else {
        const res = await api.post('/foods', fd, { headers })
        setFoods(f => [res.data.food, ...f])
        toast.success('Food created!')
      }
      setShowModal(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this food item?')) return
    try {
      await api.delete(`/foods/${id}`)
      setFoods(f => f.filter(item => item._id !== id))
      toast.success('Food deleted')
    } catch { toast.error('Delete failed') }
  }

  const handleToggle = async (id) => {
    try {
      const res = await api.patch(`/foods/${id}/availability`)
      setFoods(f => f.map(item => item._id === id ? res.data.food : item))
    } catch { toast.error('Failed to toggle') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-secondary dark:text-white">Foods</h1>
          <p className="text-sm text-gray-400 mt-0.5">{pagination.total || 0} menu items</p>
        </div>
        <button onClick={openCreate} className="btn-primary gap-2 py-2.5 px-5 text-sm rounded-2xl">
          <MdAdd size={18} /> Add Food
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5">
              <div className="shimmer h-40" />
              <div className="p-4 space-y-2">
                <div className="shimmer h-3 w-3/4 rounded-full" />
                <div className="shimmer h-3 w-1/2 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {foods.map((food) => (
            <motion.div
              key={food._id}
              layout
              className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-card hover:shadow-card-hover transition-all duration-300 group"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={food.image || `https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=70`}
                  alt={food.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={e => { e.target.src = `https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=70` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute top-2.5 left-2.5 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {food.category}
                </span>
                {food.featured && (
                  <span className="absolute top-2.5 right-2.5 bg-accent text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <MdStar size={10} /> Featured
                  </span>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-secondary dark:text-white text-sm truncate flex-1 mr-2">{food.title}</h3>
                  <span className="font-black text-primary text-sm">₹{food.price}</span>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  <MdStar size={12} className="text-accent" />
                  <span className="text-xs text-gray-400">{food.rating?.toFixed(1) || '0.0'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleToggle(food._id)}
                    className={`flex items-center gap-1 text-xs font-medium transition-colors ${food.available ? 'text-emerald-500 hover:text-emerald-600' : 'text-gray-400 hover:text-gray-500'}`}
                  >
                    {food.available
                      ? <MdToggleOn size={22} />
                      : <MdToggleOff size={22} />
                    }
                    {food.available ? 'Live' : 'Hidden'}
                  </button>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(food)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                    >
                      <MdEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(food._id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-2xl text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 disabled:opacity-40">← Prev</button>
          {[...Array(pagination.pages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-2xl text-sm font-semibold ${page === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10'}`}>{i + 1}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="px-4 py-2 rounded-2xl text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 disabled:opacity-40">Next →</button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-secondary dark:text-white">
                  {editFood ? 'Edit Food Item' : 'Add New Food'}
                </h2>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                  <MdClose size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Title *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="e.g. Classic Beef Burger" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field resize-none" rows={3} placeholder="Describe the dish..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Price (₹) *</label>
                    <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field" placeholder="199" min="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Category *</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field appearance-none cursor-pointer">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Ingredients (comma separated)</label>
                  <input value={form.ingredients} onChange={e => setForm({ ...form, ingredients: e.target.value })} className="input-field" placeholder="Beef, Lettuce, Tomato, Cheese" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Image (max 5MB)</label>
                  <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={e => setImageFile(e.target.files[0])} className="input-field text-sm file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-primary/10 file:text-primary file:font-medium file:text-xs cursor-pointer" />
                </div>
                <div className="flex gap-5">
                  {[
                    { key: 'available', label: 'Available' },
                    { key: 'featured', label: 'Featured' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                      <div
                        onClick={() => setForm({ ...form, [key]: !form[key] })}
                        className={`w-10 h-6 rounded-full transition-colors duration-200 flex items-center px-1 ${form[key] ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${form[key] ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                      <span className="text-sm font-medium text-secondary dark:text-white">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-3 text-sm rounded-2xl">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-3 text-sm rounded-2xl disabled:opacity-50">
                  {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : (editFood ? 'Update Food' : 'Create Food')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminFoodsPage
