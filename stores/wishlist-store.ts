import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WishlistProduct } from '@/lib/wishlist-api'
import { 
  getWishlistItems, 
  getWishlistProductIds, 
  addToWishlist, 
  removeFromWishlist, 
  toggleWishlist,
  checkWishlist 
} from '@/lib/wishlist-api'
import { useAuthStore } from './auth-store'

interface WishlistState {
  items: WishlistProduct[]
  productIds: number[]
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchWishlist: () => Promise<void>
  fetchProductIds: () => Promise<void>
  addItem: (productId: number) => Promise<void>
  removeItem: (productId: number) => Promise<void>
  toggleItem: (productId: number) => Promise<boolean>
  isFavorite: (productId: number) => boolean
  checkFavorite: (productId: number) => Promise<boolean>
  setError: (error: string | null) => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      productIds: [],
      isLoading: false,
      error: null,

      setError: (error: string | null) => {
        set({ error })
      },

      fetchWishlist: async () => {
        const { isLoggedIn } = useAuthStore.getState()
        if (!isLoggedIn) {
          set({ items: [], productIds: [] })
          return
        }

        set({ isLoading: true, error: null })
        try {
          const items = await getWishlistItems()
          const productIds = items.map(item => item.product_id)
          set({ 
            items, 
            productIds,
            isLoading: false 
          })
        } catch (error: any) {
          console.error('Error fetching wishlist:', error)
          set({ 
            error: error.message || 'Failed to load wishlist',
            isLoading: false,
            items: [],
            productIds: []
          })
        }
      },

      fetchProductIds: async () => {
        const { isLoggedIn } = useAuthStore.getState()
        if (!isLoggedIn) {
          set({ productIds: [] })
          return
        }

        try {
          const productIds = await getWishlistProductIds()
          set({ productIds })
        } catch (error: any) {
          console.error('Error fetching wishlist product IDs:', error)
          set({ productIds: [] })
        }
      },

      addItem: async (productId: number) => {
        const { isLoggedIn } = useAuthStore.getState()
        if (!isLoggedIn) {
          set({ error: 'Please log in to add items to wishlist' })
          return
        }

        set({ isLoading: true, error: null })
        try {
          await addToWishlist(productId)
          const productIds = [...get().productIds, productId]
          set({ 
            productIds,
            isLoading: false 
          })
          // Optionally refresh the full wishlist
          await get().fetchWishlist()
        } catch (error: any) {
          console.error('Error adding to wishlist:', error)
          set({ 
            error: error.message || 'Failed to add item to wishlist',
            isLoading: false 
          })
          throw error
        }
      },

      removeItem: async (productId: number) => {
        const { isLoggedIn } = useAuthStore.getState()
        if (!isLoggedIn) {
          set({ error: 'Please log in to remove items from wishlist' })
          return
        }

        set({ isLoading: true, error: null })
        try {
          await removeFromWishlist(productId)
          const productIds = get().productIds.filter(id => id !== productId)
          const items = get().items.filter(item => item.product_id !== productId)
          set({ 
            productIds,
            items,
            isLoading: false 
          })
        } catch (error: any) {
          console.error('Error removing from wishlist:', error)
          set({ 
            error: error.message || 'Failed to remove item from wishlist',
            isLoading: false 
          })
          throw error
        }
      },

      toggleItem: async (productId: number): Promise<boolean> => {
        const { isLoggedIn } = useAuthStore.getState()
        if (!isLoggedIn) {
          set({ error: 'Please log in to toggle wishlist items' })
          return false
        }

        set({ isLoading: true, error: null })
        try {
          const result = await toggleWishlist(productId)
          const isFavorite = result.is_favorite
          
          if (isFavorite) {
            // Add to productIds if not already there
            const productIds = get().productIds.includes(productId) 
              ? get().productIds 
              : [...get().productIds, productId]
            set({ productIds })
          } else {
            // Remove from productIds
            const productIds = get().productIds.filter(id => id !== productId)
            const items = get().items.filter(item => item.product_id !== productId)
            set({ productIds, items })
          }
          
          set({ isLoading: false })
          return isFavorite
        } catch (error: any) {
          console.error('Error toggling wishlist:', error)
          set({ 
            error: error.message || 'Failed to toggle wishlist item',
            isLoading: false 
          })
          throw error
        }
      },

      isFavorite: (productId: number): boolean => {
        return get().productIds.includes(productId)
      },

      checkFavorite: async (productId: number): Promise<boolean> => {
        const { isLoggedIn } = useAuthStore.getState()
        if (!isLoggedIn) {
          return false
        }

        try {
          const isFavorite = await checkWishlist(productId)
          // Update local state
          if (isFavorite && !get().productIds.includes(productId)) {
            set({ productIds: [...get().productIds, productId] })
          } else if (!isFavorite && get().productIds.includes(productId)) {
            set({ productIds: get().productIds.filter(id => id !== productId) })
          }
          return isFavorite
        } catch (error) {
          console.error('Error checking wishlist:', error)
          return false
        }
      },
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ 
        productIds: state.productIds,
      }),
    }
  )
)

