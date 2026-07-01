import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdMyLocation, MdSearch, MdLocationOn, MdClose } from 'react-icons/md'
import toast from 'react-hot-toast'

const MapAddressPicker = ({ onAddressSelect }) => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [selected, setSelected] = useState(null)
  const debounceRef = useRef(null)

  // Debounced search using Nominatim (OpenStreetMap) — free, no API key
  useEffect(() => {
    if (!query || query.length < 3) { setSuggestions([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        )
        const data = await res.json()
        setSuggestions(data)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  // Use browser geolocation + reverse geocode
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await res.json()
          const addr = data.display_name || ''
          setQuery(addr)
          setSuggestions([])
          setSelected({ address: addr, lat: coords.latitude, lng: coords.longitude })
          onAddressSelect({ address: addr, lat: coords.latitude, lng: coords.longitude })
          toast.success('Location detected!')
        } catch {
          toast.error('Could not fetch address for your location')
        } finally {
          setLocating(false)
        }
      },
      () => {
        toast.error('Location permission denied')
        setLocating(false)
      },
      { timeout: 10000 }
    )
  }

  const handleSelect = (place) => {
    const addr = place.display_name
    const lat = parseFloat(place.lat)
    const lng = parseFloat(place.lon)
    setQuery(addr)
    setSuggestions([])
    setSelected({ address: addr, lat, lng })
    onAddressSelect({ address: addr, lat, lng })
  }

  const handleClear = () => {
    setQuery('')
    setSuggestions([])
    setSelected(null)
    onAddressSelect(null)
  }

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(null) }}
          placeholder="Search your delivery address..."
          className="input-field pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button onClick={handleClear} className="p-1 text-gray-400 hover:text-gray-600">
              <MdClose size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={handleCurrentLocation}
            disabled={locating}
            title="Use current location"
            className="flex items-center gap-1 bg-primary text-white px-2 py-1.5 rounded-lg text-xs font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {locating ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <MdMyLocation size={14} />
            )}
            {locating ? 'Locating...' : 'Live'}
          </button>
        </div>
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
          >
            {loading && (
              <div className="px-4 py-2 text-xs text-gray-400">Searching...</div>
            )}
            {suggestions.map((place, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(place)}
                className="w-full text-left px-4 py-3 hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors border-b last:border-0 dark:border-gray-700 flex items-start gap-3"
              >
                <MdLocationOn size={18} className="text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-secondary dark:text-white line-clamp-1">
                    {place.address?.road || place.address?.suburb || place.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                    {place.display_name}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected address confirmation */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-3"
        >
          <MdLocationOn size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-0.5">
              ✓ Delivery location set
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{selected.address}</p>
            {selected.lat && (
              <p className="text-xs text-gray-400 mt-1">
                {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Map preview iframe (OpenStreetMap embed — free) */}
      {selected?.lat && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 200 }}
          className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md"
        >
          <iframe
            title="Delivery Location Map"
            width="100%"
            height="200"
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${selected.lng - 0.01}%2C${selected.lat - 0.01}%2C${selected.lng + 0.01}%2C${selected.lat + 0.01}&layer=mapnik&marker=${selected.lat}%2C${selected.lng}`}
            style={{ border: 'none' }}
          />
        </motion.div>
      )}
    </div>
  )
}

export default MapAddressPicker
