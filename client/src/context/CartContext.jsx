import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const { user } = useAuth()
  const [cart, setCart] = useState({ items: [] })
  const [cartLoading, setCartLoading] = useState(false)

  const TAX_RATE = 0.05

  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      setCart({ items: [] })
    }
  }, [user])

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart')
      setCart(res.data.cart || { items: [] })
    } catch {
      // silent fail
    }
  }

  const addToCart = async (foodId, quantity = 1) => {
    try {
      setCartLoading(true)
      const res = await api.post('/cart', { foodId, quantity })
      setCart(res.data.cart)
      toast.success('Added to cart!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart')
    } finally {
      setCartLoading(false)
    }
  }

  const updateQuantity = async (foodId, quantity) => {
    try {
      setCartLoading(true)
      const res = await api.put(`/cart/${foodId}`, { quantity })
      setCart(res.data.cart)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart')
    } finally {
      setCartLoading(false)
    }
  }

  const removeFromCart = async (foodId) => {
    try {
      setCartLoading(true)
      const res = await api.delete(`/cart/${foodId}`)
      setCart(res.data.cart)
      toast.success('Item removed')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove item')
    } finally {
      setCartLoading(false)
    }
  }

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear')
      setCart({ items: [] })
    } catch {
      // silent
    }
  }

  const cartItemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  const subtotal = parseFloat(
    (cart.items?.reduce((sum, item) => {
      const price = item.foodId?.price || 0
      return sum + price * item.quantity
    }, 0) || 0).toFixed(2)
  )

  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2))
  const total = parseFloat((subtotal + tax).toFixed(2))

  return (
    <CartContext.Provider value={{
      cart,
      cartLoading,
      cartItemCount,
      subtotal,
      tax,
      total,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
