"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { getCurrentUser, logoutUser as logoutUserUtil, type User } from "@/lib/auth"

interface AuthContextType {
  user: Omit<User, "password"> | null
  isLoggedIn: boolean
  login: (user: Omit<User, "password">) => void
  logout: () => void
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Omit<User, "password"> | null>(null)

  useEffect(() => {
    // Initialize auth state from localStorage
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }, [])

  const login = (userData: Omit<User, "password">) => {
    setUser(userData)
  }

  const logout = () => {
    logoutUserUtil()
    setUser(null)
  }

  const refreshUser = () => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: user !== null,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

