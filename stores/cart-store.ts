import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types/cart'
import { getCartItems, addToCart, updateCartItem, removeFromCart, clearCart, getCartCount } from '@/lib/cart-api'
import { useAuthStore } from './auth-store'

interface CartState {
  items: CartItem[]
  isLoading: boolean
  error: string | null
  totalItems: number
  totalQuantity: number
  
  // Actions
  fetchCart: () => Promise<void>
  addItem: (productId: number, quantity?: number) => Promise<void>
  updateItemQuantity: (cartItemId: number, quantity: number) => Promise<void>
  removeItem: (cartItemId: number) => Promise<void>
  clear: () => Promise<void>
  refreshCartCount: () => Promise<void>
  setError: (error: string | null) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      totalItems: 0,
      totalQuantity: 0,

      setError: (error: string | null) => {
        set({ error })
      },

      fetchCart: async () => {
        const { isLoggedIn } = useAuthStore.getState()
        if (!isLoggedIn) {
          set({ items: [], totalItems: 0, totalQuantity: 0 })
          return
        }

        set({ isLoading: true, error: null })
        try {
          const items = await getCartItems()
          // Calculate totals once
          const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
          set({ 
            items, 
            totalItems: items.length,
            totalQuantity,
            isLoading: false 
          })
        } catch (error: any) {
          console.error('Error fetching cart:', error)
          set({ 
            error: error.message || 'Failed to load cart',
            isLoading: false,
            items: [],
            totalItems: 0,
            totalQuantity: 0
          })
        }
      },

      addItem: async (productId: number, quantity: number = 1) => {
        const { isLoggedIn } = useAuthStore.getState()
        if (!isLoggedIn) {
          set({ error: 'Please log in to add items to cart' })
          return
        }

        set({ isLoading: true, error: null })
        try {
          const newItem = await addToCart(productId, quantity)
          
          // Check if item already exists in cart
          const existingItemIndex = get().items.findIndex(item => item.product_id === productId)
          
          if (existingItemIndex >= 0) {
            // Update existing item
            const updatedItems = [...get().items]
            updatedItems[existingItemIndex] = newItem
            // Calculate total quantity once
            const totalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
            set({ 
              items: updatedItems,
              totalQuantity,
              isLoading: false 
            })
          } else {
            // Add new item
            const updatedItems = [...get().items, newItem]
            // Calculate total quantity once
            const totalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
            set({ 
              items: updatedItems,
              totalItems: updatedItems.length,
              totalQuantity,
              isLoading: false 
            })
          }
        } catch (error: any) {
          console.error('Error adding to cart:', error)
          set({ 
            error: error.message || 'Failed to add item to cart',
            isLoading: false 
          })
          throw error
        }
      },

      updateItemQuantity: async (cartItemId: number, quantity: number) => {
        const { isLoggedIn } = useAuthStore.getState()
        if (!isLoggedIn) {
          set({ error: 'Please log in to update your cart' })
          return
        }

        set({ isLoading: true, error: null })
        try {
          const updatedItem = await updateCartItem(cartItemId, quantity)
          const items = get().items.map(item => 
            item.id === cartItemId ? updatedItem : item
          )
          // Calculate total quantity once
          const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
          set({ 
            items,
            totalQuantity,
            isLoading: false 
          })
        } catch (error: any) {
          console.error('Error updating cart item:', error)
          set({ 
            error: error.message || 'Failed to update cart item',
            isLoading: false 
          })
          throw error
        }
      },

      removeItem: async (cartItemId: number) => {
        const { isLoggedIn } = useAuthStore.getState()
        if (!isLoggedIn) {
          set({ error: 'Please log in to remove items from cart' })
          return
        }

        set({ isLoading: true, error: null })
        try {
          await removeFromCart(cartItemId)
          const items = get().items.filter(item => item.id !== cartItemId)
          // Calculate total quantity once
          const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
          set({ 
            items,
            totalItems: items.length,
            totalQuantity,
            isLoading: false 
          })
        } catch (error: any) {
          console.error('Error removing from cart:', error)
          set({ 
            error: error.message || 'Failed to remove item from cart',
            isLoading: false 
          })
          throw error
        }
      },

      clear: async () => {
        const { isLoggedIn } = useAuthStore.getState()
        if (!isLoggedIn) {
          set({ error: 'Please log in to clear your cart' })
          return
        }

        set({ isLoading: true, error: null })
        try {
          await clearCart()
          set({ 
            items: [],
            totalItems: 0,
            totalQuantity: 0,
            isLoading: false 
          })
        } catch (error: any) {
          console.error('Error clearing cart:', error)
          set({ 
            error: error.message || 'Failed to clear cart',
            isLoading: false 
          })
          throw error
        }
      },

      refreshCartCount: async () => {
        const { isLoggedIn } = useAuthStore.getState()
        if (!isLoggedIn) {
          set({ totalItems: 0, totalQuantity: 0 })
          return
        }

        try {
          const count = await getCartCount()
          set({ 
            totalItems: count.total_items,
            totalQuantity: count.total_quantity 
          })
        } catch (error) {
          console.error('Error refreshing cart count:', error)
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ 
        items: state.items,
        totalItems: state.totalItems,
        totalQuantity: state.totalQuantity 
      }),
    }
  )
)

