'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type CartItem = {
  id: string
  name: string
  seller: string
  price: number
  quantity: number
  stock: number
}

export type WishlistItem = {
  id: string
  name: string
  price: number
  type: 'product' | 'design'
}

type StoreContextType = {
  cart: CartItem[]
  wishlist: WishlistItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  removeFromCart: (id: string) => void
  updateCartQuantity: (id: string, qty: number) => void
  clearCart: () => void
  addToWishlist: (item: WishlistItem) => void
  removeFromWishlist: (id: string) => void
  isInWishlist: (id: string) => boolean
  cartCount: number
  cartSubtotal: number
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

const CART_KEY = 'printhive:cart'
const WISHLIST_KEY = 'printhive:wishlist'

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY)
      const savedWishlist = localStorage.getItem(WISHLIST_KEY)
      if (savedCart) setCart(JSON.parse(savedCart))
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist))
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart, hydrated])

  useEffect(() => {
    if (hydrated) localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist))
  }, [wishlist, hydrated])

  const addToCart: StoreContextType['addToCart'] = (item, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: Math.min(i.stock, i.quantity + qty) } : i
        )
      }
      return [...prev, { ...item, quantity: Math.min(item.stock, qty) }]
    })
  }

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id))

  const updateCartQuantity = (id: string, qty: number) => {
    if (qty <= 0) return removeFromCart(id)
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: Math.min(i.stock, qty) } : i)))
  }

  const clearCart = () => setCart([])

  const addToWishlist = (item: WishlistItem) => {
    setWishlist((prev) => (prev.some((i) => i.id === item.id) ? prev : [...prev, item]))
  }

  const removeFromWishlist = (id: string) => setWishlist((prev) => prev.filter((i) => i.id !== id))

  const isInWishlist = (id: string) => wishlist.some((i) => i.id === id)

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)
  const cartSubtotal = cart.reduce((sum, i) => sum + i.quantity * i.price, 0)

  return (
    <StoreContext.Provider value={{
      cart, wishlist, addToCart, removeFromCart, updateCartQuantity, clearCart,
      addToWishlist, removeFromWishlist, isInWishlist, cartCount, cartSubtotal,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within a StoreProvider')
  return ctx
}