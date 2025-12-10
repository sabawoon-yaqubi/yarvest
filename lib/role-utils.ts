"use client"

import { getUserRoles, type Role } from "@/lib/auth"

// Get current user's roles from localStorage
export function getCurrentUserRoles(): Role[] {
  if (typeof window === "undefined") return []
  
  const currentUser = localStorage.getItem("yarvest_current_user")
  if (!currentUser) return []
  
  try {
    const user = JSON.parse(currentUser)
    return getUserRoles(user.id)
  } catch {
    return []
  }
}

// Check if user has a specific role
export function hasRole(role: Role): boolean {
  const roles = getCurrentUserRoles()
  return roles.includes(role)
}

// Check if user has any of the specified roles
export function hasAnyRole(rolesToCheck: Role[]): boolean {
  const roles = getCurrentUserRoles()
  return rolesToCheck.some(role => roles.includes(role))
}

// Check if user has all of the specified roles
export function hasAllRoles(rolesToCheck: Role[]): boolean {
  const roles = getCurrentUserRoles()
  return rolesToCheck.every(role => roles.includes(role))
}

// Get role-specific navigation items
export function getRoleBasedNavigation() {
  const roles = getCurrentUserRoles()
  
  const navigation = []
  
  if (roles.includes("buyer")) {
    navigation.push(
      { label: "Shop", href: "/products" },
      { label: "Cart", href: "/cart" },
      { label: "Orders", href: "/profile" }
    )
  }
  
  if (roles.includes("seller")) {
    navigation.push(
      { label: "Producer Dashboard", href: "/admin" },
      { label: "My Products", href: "/admin/products" },
      { label: "Orders", href: "/admin/orders" }
    )
  }
  
  if (roles.includes("deliverer")) {
    navigation.push(
      { label: "Courier Dashboard", href: "/courier" },
      { label: "Deliveries", href: "/courier/deliveries" },
      { label: "Earnings", href: "/courier/earnings" }
    )
  }
  
  if (roles.includes("helper")) {
    navigation.push(
      { label: "Volunteer Dashboard", href: "/volunteers" },
      { label: "Harvesting", href: "/volunteers/harvesting" },
      { label: "Impact", href: "/volunteers/impact" }
    )
  }
  
  return navigation
}

