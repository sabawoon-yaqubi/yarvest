// Static authentication utility functions

export interface User {
  id: string
  unique_id: string
  first_name: string
  last_name: string
  email: string
  password: string // In a real app, this would be hashed
  phone: string
  email_verified_at: string | null
  phone_verified_at: string | null
  image: string | null
  status: string
  user_vehicle_id: string | null
  referral_code: string
  createdAt: string
}

export interface UserAddress {
  id: string
  city: string
  country: string
  state: string
  street_address: string
  postal_code: string
  latitude: string | null
  longitude: string | null
  apt: string
  business_name: string
  user_id: string
  status: string
}

export interface UserRole {
  id: string
  user_id: string
  role_id: string
}

export type Role = "buyer" | "seller" | "helper" | "deliverer"

export const ROLES = {
  BUYER: { id: "1", name: "buyer", label: "Buyer", description: "Purchase fresh produce from local farmers" },
  SELLER: { id: "2", name: "seller", label: "Seller/Producer", description: "Sell your farm products" },
  HELPER: { id: "3", name: "helper", label: "Helper/Volunteer", description: "Help with harvesting and community work" },
  DELIVERER: { id: "4", name: "deliverer", label: "Delivery Driver", description: "Deliver products to customers" },
} as const

// Initialize with some default users for testing
const DEFAULT_USERS: User[] = [
  {
    id: "1",
    unique_id: "USR001",
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    password: "password123",
    phone: "+1234567890",
    email_verified_at: new Date().toISOString(),
    phone_verified_at: null,
    image: null,
    status: "active",
    user_vehicle_id: null,
    referral_code: "JOHN123",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    unique_id: "USR002",
    first_name: "Jane",
    last_name: "Smith",
    email: "jane@example.com",
    password: "password123",
    phone: "+1987654321",
    email_verified_at: new Date().toISOString(),
    phone_verified_at: null,
    image: null,
    status: "active",
    user_vehicle_id: null,
    referral_code: "JANE123",
    createdAt: new Date().toISOString(),
  },
]

// Initialize localStorage with default users if it doesn't exist
export function initializeUsers() {
  if (typeof window === "undefined") return

  const stored = localStorage.getItem("yarvest_users")
  if (!stored) {
    localStorage.setItem("yarvest_users", JSON.stringify(DEFAULT_USERS))
  }
}

// Get all users
export function getUsers(): User[] {
  if (typeof window === "undefined") return []

  initializeUsers()
  const stored = localStorage.getItem("yarvest_users")
  return stored ? JSON.parse(stored) : DEFAULT_USERS
}

// Get user by email
export function getUserByEmail(email: string): User | null {
  const users = getUsers()
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null
}

// Generate unique referral code
function generateReferralCode(firstName: string): string {
  const timestamp = Date.now().toString().slice(-4)
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${firstName.substring(0, 3).toUpperCase()}${timestamp}${randomStr}`
}

// Generate unique user ID
function generateUniqueId(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `USR${timestamp}${random}`
}

// Register a new user
export function registerUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  phone: string,
  roles: Role[],
  address?: {
    street_address: string
    city: string
    state: string
    country: string
    postal_code: string
    apt?: string
    business_name?: string
  }
): { success: boolean; message: string } {
  if (typeof window === "undefined") {
    return { success: false, message: "Cannot register on server side" }
  }

  initializeUsers()
  const users = getUsers()

  // Check if user already exists
  if (getUserByEmail(email)) {
    return { success: false, message: "User with this email already exists" }
  }

  // Validate roles
  if (!roles || roles.length === 0) {
    return { success: false, message: "Please select at least one role" }
  }

  const userId = Date.now().toString()

  // Create new user
  const newUser: User = {
    id: userId,
    unique_id: generateUniqueId(),
    first_name: firstName,
    last_name: lastName,
    email: email.toLowerCase(),
    password, // In a real app, this would be hashed
    phone,
    email_verified_at: null,
    phone_verified_at: null,
    image: null,
    status: "active",
    user_vehicle_id: null,
    referral_code: generateReferralCode(firstName),
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  localStorage.setItem("yarvest_users", JSON.stringify(users))

  // Store user roles
  const userRoles = JSON.parse(localStorage.getItem("yarvest_user_roles") || "[]")
  roles.forEach(roleName => {
    const roleInfo = Object.values(ROLES).find(r => r.name === roleName)
    if (roleInfo) {
      const userRole: UserRole = {
        id: `ROLE${Date.now()}${Math.random()}`,
        user_id: userId,
        role_id: roleInfo.id,
      }
      userRoles.push(userRole)
    }
  })
  localStorage.setItem("yarvest_user_roles", JSON.stringify(userRoles))

  // Store address if provided
  if (address) {
    const addresses = JSON.parse(localStorage.getItem("yarvest_addresses") || "[]")
    const newAddress: UserAddress = {
      id: `ADDR${Date.now()}`,
      city: address.city,
      country: address.country,
      state: address.state,
      street_address: address.street_address,
      postal_code: address.postal_code,
      latitude: null,
      longitude: null,
      apt: address.apt || "",
      business_name: address.business_name || "",
      user_id: userId,
      status: "active",
    }
    addresses.push(newAddress)
    localStorage.setItem("yarvest_addresses", JSON.stringify(addresses))
  }

  return { success: true, message: "Registration successful!" }
}

// Get user roles
export function getUserRoles(userId: string): Role[] {
  if (typeof window === "undefined") return []
  
  const userRoles = JSON.parse(localStorage.getItem("yarvest_user_roles") || "[]") as UserRole[]
  const roleIds = userRoles.filter(ur => ur.user_id === userId).map(ur => ur.role_id)
  
  return Object.values(ROLES)
    .filter(role => roleIds.includes(role.id))
    .map(role => role.name as Role)
}

// Login user
export function loginUser(email: string, password: string): { success: boolean; message: string; user?: User; roles?: Role[] } {
  if (typeof window === "undefined") {
    return { success: false, message: "Cannot login on server side" }
  }

  initializeUsers()
  const user = getUserByEmail(email)

  if (!user) {
    return { success: false, message: "Invalid email or password" }
  }

  if (user.password !== password) {
    return { success: false, message: "Invalid email or password" }
  }

  // Store current user in localStorage
  const { password: _, ...userWithoutPassword } = user
  localStorage.setItem("yarvest_current_user", JSON.stringify(userWithoutPassword))

  // Get user roles
  const roles = getUserRoles(user.id)

  return { success: true, message: "Login successful!", user: userWithoutPassword as User, roles }
}

// Get dashboard path based on user's primary role
export function getDashboardPath(roles: Role[]): string {
  if (!roles || roles.length === 0) return "/"
  
  // Priority order: seller > deliverer > helper > buyer
  if (roles.includes("seller")) return "/admin"
  if (roles.includes("deliverer")) return "/courier"
  if (roles.includes("helper")) return "/volunteers"
  if (roles.includes("buyer")) return "/"
  
  return "/"
}

// Get current logged in user
export function getCurrentUser(): Omit<User, "password"> | null {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem("yarvest_current_user")
  return stored ? JSON.parse(stored) : null
}

// Logout user
export function logoutUser() {
  if (typeof window === "undefined") return
  localStorage.removeItem("yarvest_current_user")
}

// Check if user is logged in
export function isLoggedIn(): boolean {
  return getCurrentUser() !== null
}

