'use client'

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'

export type CartItem = {
  id: string
  name: string
  seller: string
  price: number
  quantity: number
  stock: number
  image?: string
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
  activeUserKey: string
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const [activeUserKey, setActiveUserKey] = useState<string>('public')
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const isHydratedRef = useRef(false)
  const activeKeyRef = useRef('public')

  // Helper to construct isolated storage keys
  const getStorageKeys = (userKey: string) => ({
    cartKey: `printhive:${userKey}:cart`,
    wishlistKey: `printhive:${userKey}:wishlist`,
  })

  // Load cart and wishlist for a specific user/role partition
  const loadPartition = (userKey: string) => {
    activeKeyRef.current = userKey
    setActiveUserKey(userKey)
    const { cartKey, wishlistKey } = getStorageKeys(userKey)

    try {
      const savedCart = localStorage.getItem(cartKey)
      const savedWishlist = localStorage.getItem(wishlistKey)
      const parsedCart = savedCart ? JSON.parse(savedCart) : []
      const parsedWishlist = savedWishlist ? JSON.parse(savedWishlist) : []

      setCart(Array.isArray(parsedCart) ? parsedCart : [])
      setWishlist(Array.isArray(parsedWishlist) ? parsedWishlist : [])
    } catch {
      setCart([])
      setWishlist([])
    }
    isHydratedRef.current = true
  }

  useEffect(() => {
    let isMounted = true

    async function initUserSession() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!isMounted) return

        let key = 'public'
        if (user?.id) {
          // Check user role in profile for role-based separation
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
          const role = profile?.role || 'buyer'
          key = `user_${user.id}_${role}`
        } else if (typeof document !== 'undefined') {
          const guestMatch = document.cookie.match(/printhive_guest_role=([^;]+)/)
          const guestRole = guestMatch ? guestMatch[1] : 'public'
          key = `guest_${guestRole}`
        }

        loadPartition(key)
      } catch {
        if (isMounted) loadPartition('public')
      }
    }

    initUserSession()

    // Listen to Supabase Auth state & cookie changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return
      let key = 'public'
      if (session?.user?.id) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
        const role = profile?.role || 'buyer'
        key = `user_${session.user.id}_${role}`
      } else if (typeof document !== 'undefined') {
        const guestMatch = document.cookie.match(/printhive_guest_role=([^;]+)/)
        const guestRole = guestMatch ? guestMatch[1] : 'public'
        key = `guest_${guestRole}`
      }
      loadPartition(key)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Sync cart to active user's partition
  useEffect(() => {
    if (!isHydratedRef.current) return
    const { cartKey } = getStorageKeys(activeKeyRef.current)
    try {
      localStorage.setItem(cartKey, JSON.stringify(cart))
    } catch {
      // ignore storage write errors
    }
  }, [cart])

  // Sync wishlist to active user's partition
  useEffect(() => {
    if (!isHydratedRef.current) return
    const { wishlistKey } = getStorageKeys(activeKeyRef.current)
    try {
      localStorage.setItem(wishlistKey, JSON.stringify(wishlist))
    } catch {
      // ignore storage write errors
    }
  }, [wishlist])

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

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        cartCount,
        cartSubtotal,
        activeUserKey,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}