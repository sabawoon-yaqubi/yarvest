import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getCurrentUser, logoutUser as logoutUserUtil, getAuthToken, type User } from '@/lib/auth'
import { transformBackendUser } from '@/lib/auth-utils'
import api from '@/lib/axios'
import { useAddressStore } from '@/stores/address-store'

interface AuthState {
  user: Omit<User, "password"> | null
  isLoggedIn: boolean
  isLoading: boolean
  isVerificationHandledInAuthModal: boolean
  login: (userData: Omit<User, "password">) => void
  logout: () => Promise<void>
  refreshUser: () => void
  initializeAuth: () => Promise<void>
  setVerificationHandledInAuthModal: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isLoading: true,
      isVerificationHandledInAuthModal: false,

      login: (userData: Omit<User, "password">) => {
        set({ user: userData, isLoggedIn: true })
        // Also update localStorage for backward compatibility
        localStorage.setItem("yarvest_current_user", JSON.stringify(userData))
      },

      setVerificationHandledInAuthModal: (value: boolean) => {
        set({ isVerificationHandledInAuthModal: value })
      },

      logout: async () => {
        try {
          // Save addresses to localStorage before logout
          const addressStore = useAddressStore.getState()
          addressStore.saveAddressesToLocalStorage()
          
          await api.post('/logout')
        } catch (error) {
          console.error('Logout API error:', error)
        } finally {
          logoutUserUtil()
          set({ user: null, isLoggedIn: false })
          
          // Load local addresses after logout
          const addressStore = useAddressStore.getState()
          addressStore.loadLocalAddresses()
        }
      },

      refreshUser: () => {
        const currentUser = getCurrentUser()
        set({ user: currentUser, isLoggedIn: currentUser !== null })
      },

      initializeAuth: async () => {
        set({ isLoading: true })
        
        const currentUser = getCurrentUser()
        const token = getAuthToken()
        
        if (token && !currentUser) {
          // If we have a token but no user, try to fetch user from backend
          try {
            const response = await api.get('/user')
            if (response.data) {
              const transformedUser = transformBackendUser(response.data)
              set({ user: transformedUser, isLoggedIn: true })
              localStorage.setItem("yarvest_current_user", JSON.stringify(transformedUser))
            }
          } catch (error) {
            // If fetch fails, clear auth data
            logoutUserUtil()
            set({ user: null, isLoggedIn: false })
          }
        } else if (currentUser) {
          // Refresh user data from backend to check email verification status
          try {
            const response = await api.get('/user')
            if (response.data) {
              const transformedUser = transformBackendUser(response.data)
              set({ user: transformedUser, isLoggedIn: true })
              localStorage.setItem("yarvest_current_user", JSON.stringify(transformedUser))
            }
          } catch (error: any) {
            if (error?.response?.status === 401) {
              logoutUserUtil()
              set({ user: null, isLoggedIn: false })
            } else {
              // Only use cached user for network errors, not auth errors
              set({ user: currentUser, isLoggedIn: true })
            }
          }
        } else {
          set({ user: currentUser, isLoggedIn: currentUser !== null })
        }
        
        set({ isLoading: false })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isLoggedIn: state.isLoggedIn }),
    }
  )
)

