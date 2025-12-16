import { create } from 'zustand'

interface AuthModalState {
  isOpen: boolean
  mode: 'login' | 'signup'
  returnUrl: string | undefined
  openModal: (mode?: 'login' | 'signup', returnUrl?: string) => void
  closeModal: () => void
  setMode: (mode: 'login' | 'signup') => void
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  mode: 'login',
  returnUrl: undefined,
  openModal: (mode = 'login', returnUrl = undefined) => {
    set({ isOpen: true, mode, returnUrl })
  },
  closeModal: () => {
    set({ isOpen: false, returnUrl: undefined })
  },
  setMode: (mode) => {
    set({ mode })
  },
}))

