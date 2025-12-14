"use client"

import { Menu, Search, ShoppingCart, MapPin, ChevronDown, User, LogOut, Settings, LayoutDashboard } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthModal } from "@/components/auth-modal"
import { AddressModal } from "@/components/address-modal"
import { useAddressStore } from "@/stores/address-store"
import { useAuthStore } from "@/stores/auth-store"
import { useCartStore } from "@/stores/cart-store"
import api from "@/lib/axios"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface HeaderProps {
  toggleSidebar?: () => void
}

export function Header({ toggleSidebar }: HeaderProps) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const router = useRouter()
  const [deliveryAddress, setDeliveryAddress] = useState("Add your address")
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const { activeAddress, fetchAddresses, loadLocalAddresses } = useAddressStore()
  const { totalQuantity, fetchCart } = useCartStore()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login')
  const [searchQuery, setSearchQuery] = useState("")
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  // Load addresses from store
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchAddresses()
    } else {
      loadLocalAddresses()
    }
  }, [isLoggedIn, user])

  // Load cart when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      fetchCart()
    }
  }, [isLoggedIn, fetchCart])

  // Update delivery address display when active address changes
  useEffect(() => {
    if (activeAddress) {
      const formatted = formatAddress(activeAddress)
      setDeliveryAddress(formatted)
    } else {
      setDeliveryAddress("Add your address")
    }
  }, [activeAddress])

  const formatAddress = (address: any) => {
    if (!address) return "Add your address"
    const parts = [
      address.street_address,
      address.city,
      address.state,
    ].filter(Boolean)
    return parts.join(", ") || "Add your address"
  }

  const handleLocationClick = () => {
    // Allow both logged-in and non-logged-in users to select address
    setAddressModalOpen(true)
  }

  const handleAddressSuccess = () => {
    if (isLoggedIn && user) {
      fetchAddresses()
    } else {
      loadLocalAddresses()
    }
  }

  const handleLogout = async () => {
    setLogoutDialogOpen(false)
    // Redirect immediately to home
    router.push("/")
    router.refresh()
    // Then logout in background
    await logout()
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setMobileSearchOpen(false)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 w-full">
        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="md:hidden px-4 py-3 border-b border-gray-200 bg-white">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 z-10" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch()
                    }
                  }}
                  autoFocus
                  className="w-full pl-10 pr-3 py-3 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5a9c3a] focus:border-[#5a9c3a]"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white px-4 py-2.5 rounded-lg"
              >
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setMobileSearchOpen(false)
                  setSearchQuery("")
                }}
                className="px-3 py-2.5"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Main Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 md:py-4 gap-2 md:gap-4 max-w-full">
          {/* Logo */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <img
                src="https://cdn.prod.website-files.com/67c12ad0bddda4257ffc4539/67c15cdb77981e22a226bc86_Navbar%20Brand.svg"
                alt="Yarvest"
                className="h-8 md:h-10"
              />
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-2xl lg:max-w-5xl">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 z-10" />
              <Input
                type="text"
                placeholder="Search home grown fruits, vegetables, and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    handleSearch()
                  }
                }}
                className="w-full h-12 pl-12 pr-4 py-3.5 md:py-4 text-sm md:text-base bg-white border border-gray-300 rounded-full text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5a9c3a] focus:border-[#5a9c3a] shadow-sm hover:border-gray-400 transition-all"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
            {/* Mobile Search Button */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden flex items-center justify-center hover:bg-gray-100 rounded-lg p-2 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-gray-900" />
            </button>

            {/* Location - Desktop Only */}
            <button
              className="hidden lg:flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors max-w-xs"
              onClick={handleLocationClick}
            >
              <MapPin className="w-5 h-5 text-gray-700 flex-shrink-0" />
              <span className="text-sm text-gray-900 truncate">{deliveryAddress.split(",")[0]}</span>
              <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
            </button>

            {/* Cart */}
            <Link href="/cart" className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 md:px-4 py-2.5 transition-all relative group">
              <div className="relative">
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-gray-900 group-hover:text-[#5a9c3a] transition-colors" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#5a9c3a] text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 font-semibold shadow-md">
                    {totalQuantity > 99 ? '99+' : totalQuantity}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-900 hidden sm:inline">{totalQuantity > 0 ?'' : 'Cart'}</span>
            </Link>

            {/* User Menu */}
            {isLoggedIn && user ? (
              <div className="flex items-center gap-0">
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-1 hover:bg-gray-100 rounded-lg px-2 md:px-3 py-2 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-900" />
                  <span className="text-sm font-medium text-gray-900 hidden lg:inline">
                    {user.first_name}
                  </span>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center justify-center hover:bg-gray-100 rounded-lg px-1 py-2 transition-colors">
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 shadow-lg border border-gray-200 rounded-xl">
                    <DropdownMenuLabel className="px-3 py-3 mb-1">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-gray-500 leading-tight mt-0.5">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem asChild className="px-3 py-2.5 rounded-lg cursor-pointer focus:bg-gray-100 focus:text-gray-900">
                      <Link href="/dashboard" className="flex items-center w-full">
                        <LayoutDashboard className="mr-3 h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium">Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="px-3 py-2.5 rounded-lg cursor-pointer focus:bg-gray-100 focus:text-gray-900">
                      <Link href="/panels" className="flex items-center w-full">
                        <Settings className="mr-3 h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium">Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setLogoutDialogOpen(true)}
                      className="px-3 py-2.5 rounded-lg cursor-pointer focus:bg-red-50 focus:text-red-600"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span className="text-sm font-medium">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setAuthModalMode('login')
                    setAuthModalOpen(true)
                  }}
                  className="flex items-center gap-1.5 hover:bg-gray-100 rounded-lg px-2 md:px-3 py-2 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-900" />
                  <span className="text-sm text-gray-900 font-medium hidden sm:inline">Login</span>
                </button>
                <Button
                  onClick={() => {
                    setAuthModalMode('signup')
                    setAuthModalOpen(true)
                  }}
                  className="hidden sm:flex bg-[#0A8542] hover:bg-[#097038] text-white text-sm px-4 py-2"
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Address Modal - available for both logged-in and non-logged-in users */}
      <AddressModal
        open={addressModalOpen}
        onOpenChange={setAddressModalOpen}
        onSuccess={handleAddressSuccess}
      />
      
      <AuthModal
        open={authModalOpen}
        onOpenChange={(open) => {
          setAuthModalOpen(open)
        }}
        initialMode={authModalMode}
      />

      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Logout?</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Are you sure you want to logout?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setLogoutDialogOpen(false)}
              className="flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="flex-1 sm:flex-initial"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
