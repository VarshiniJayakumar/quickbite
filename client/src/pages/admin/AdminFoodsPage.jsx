import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdAdd, MdEdit, MdDelete, MdToggleOn, MdToggleOff, MdClose } from 'react-icons/md'
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

      if (editFood) {
        const res = await api.put(`/foods/${editFood._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        setFoods((f) => f.map((item) => item._id === editFood._id ? res.data.food : item))
        toast.success('Food updated!')
      } else {
        const res = await api.post('/foods', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        setFoods((f) => [res.data.food, ...f])
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
      setFoods((f) => f.filter((item) => item._id !== id))
      toast.success('Food deleted')
    } catch { toast.error('Delete failed') }
  }

  const handleToggle = async (id) => {
    try {
      const res = await api.patch(`/foods/${id}/availability`)
      setFoods((f) => f.map((item) => item._id === id ? res.data.food : item))
    } catch { toast.error('Failed to toggle availability') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-secondary dark:text-white">Manage Foods</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 py-2.5 px-5">
          <MdAdd size={20} /> Add Food
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 animate-pulse">
              <div className="skeleton h-40 rounded-xl mb-3" />
              <div className="skeleton h-4 w-3/4 mb-2 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {foods.map((food) => (
            <motion.div
              key={food._id}
              layout
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md"
            >
              <div className="relative h-40">
                <img
                  src={food.image || `https://via.placeholder.com/400x200?text=${encodeURIComponent(food.title)}`}
                  alt={food.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                  {food.category}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-secondary dark:text-white truncate flex-1 mr-2">{food.title}</h3>
                  <span className="font-bold text-primary">₹{food.price}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={() => handleToggle(food._id)}
                    className={`flex items-center gap-1 text-sm ${food.available ? 'text-green-500' : 'text-gray-400'}`}
                    title={food.available ? 'Mark unavailable' : 'Mark available'}
                  >
                    {food.available ? <MdToggleOn size={24} /> : <MdToggleOff size={24} />}
                    {food.available ? 'Available' : 'Unavailable'}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(food)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <MdEdit size={18} />
                    </button>
                    <button onClick={() => handleDelete(food._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <MdDelete size={18} />
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
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(pagination.pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-10 h-10 rounded-xl font-medium ${page === i + 1 ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 border dark:border-gray-700 hover:bg-gray-100'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-secondary dark:text-white">
                  {editFood ? 'Edit Food' : 'Add New Food'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <MdClose size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Classic Beef Burger"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input-field resize-none"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="input-field"
                      placeholder="199"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="input-field"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ingredients (comma separated)
                  </label>
                  <input
                    value={form.ingredients}
                    onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                    className="input-field"
                    placeholder="Beef, Lettuce, Tomato, Cheese"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Image (JPG/PNG/WEBP, max 5MB)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="input-field"
                  />
                </div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.available}
                      onChange={(e) => setForm({ ...form, available: e.target.checked })}
                      className="accent-primary w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Available</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="accent-primary w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-3">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : 'Save'}
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
