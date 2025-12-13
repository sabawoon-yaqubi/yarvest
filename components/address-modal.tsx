"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Search, Check, X, Navigation, Trash2, Edit, Send } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useAddressStore, type Address } from "@/stores/address-store"

interface AddressModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  address?: Address | null
}

export function AddressModal({ open, onOpenChange, onSuccess, address }: AddressModalProps) {
  const user = useAuthStore((state) => state.user)
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const {
    addresses,
    activeAddress,
    isLoading,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setActiveAddress,
    loadLocalAddresses,
    saveLocalAddress,
    updateLocalAddress,
    deleteLocalAddress,
    setLocalActiveAddress,
  } = useAddressStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedResult, setSelectedResult] = useState<any>(null)
  const [formData, setFormData] = useState<Partial<Address>>({
    street_address: "",
    apt: "",
    business_name: "",
    postal_code: "",
    city: "",
    state: "",
    country: "USA",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | string | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (open) {
      if (isLoggedIn && user) {
        fetchAddresses()
      } else {
        loadLocalAddresses()
      }
      // If an address is passed as prop, initialize edit mode
      if (address) {
        setFormData({
          street_address: address.street_address,
          city: address.city,
          state: address.state,
          country: address.country,
          postal_code: address.postal_code,
          apt: address.apt || "",
          business_name: address.business_name || "",
          latitude: address.latitude,
          longitude: address.longitude,
        })
        setEditingId(address.id || null)
        setShowForm(true)
      } else {
        // Reset form when opening without an address
        setShowForm(false)
        setEditingId(null)
        setFormData({
          street_address: "",
          apt: "",
          business_name: "",
          postal_code: "",
          city: "",
          state: "",
          country: "USA",
        })
      }
    }
  }, [open, isLoggedIn, user, address])

  const handleSearch = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", USA")}&countrycodes=us&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Yarvest App'
          }
        }
      )
      
      if (!response.ok) throw new Error('Search failed')
      
      const data = await response.json()
      setSearchResults(data.map((item: any) => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        address: item.address,
      })))
    } catch (err) {
      console.error("Search error:", err)
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(searchQuery)
      }, 500)
    } else {
      setSearchResults([])
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const parseAddressResult = (result: any) => {
    const addressParts = result.address || {}
    
    let streetAddress = ""
    if (addressParts.house_number) {
      streetAddress += addressParts.house_number + " "
    }
    if (addressParts.road) {
      streetAddress += addressParts.road
    }
    if (!streetAddress) {
      streetAddress = result.display_name.split(",")[0].trim()
    }
    
    const stateMap: Record<string, string> = {
      "California": "CA", "New York": "NY", "Texas": "TX", "Florida": "FL",
      "Illinois": "IL", "Pennsylvania": "PA", "Ohio": "OH", "Georgia": "GA",
      "North Carolina": "NC", "Michigan": "MI", "New Jersey": "NJ", "Virginia": "VA",
      "Washington": "WA", "Arizona": "AZ", "Massachusetts": "MA", "Tennessee": "TN",
      "Indiana": "IN", "Missouri": "MO", "Maryland": "MD", "Wisconsin": "WI",
      "Colorado": "CO", "Minnesota": "MN", "South Carolina": "SC", "Alabama": "AL",
      "Louisiana": "LA", "Kentucky": "KY", "Oregon": "OR", "Oklahoma": "OK",
      "Connecticut": "CT", "Utah": "UT", "Iowa": "IA", "Nevada": "NV",
      "Arkansas": "AR", "Mississippi": "MS", "Kansas": "KS", "New Mexico": "NM",
      "Nebraska": "NE", "West Virginia": "WV", "Idaho": "ID", "Hawaii": "HI",
      "New Hampshire": "NH", "Maine": "ME", "Montana": "MT", "Rhode Island": "RI",
      "Delaware": "DE", "South Dakota": "SD", "North Dakota": "ND", "Alaska": "AK",
      "Vermont": "VT", "Wyoming": "WY", "District of Columbia": "DC"
    }
    
    let state = addressParts.state || addressParts.region || ""
    if (stateMap[state]) {
      state = stateMap[state]
    }
    
    const city = addressParts.city || addressParts.town || addressParts.village || addressParts.municipality || ""
    const postalCode = addressParts.postcode || ""
    
    return {
      street_address: streetAddress.trim(),
      city,
      state,
      postal_code: postalCode,
      country: "USA",
      latitude: result.lat,
      longitude: result.lon,
    }
  }

  const handleSelectSearchResult = (result: any) => {
    const parsed = parseAddressResult(result)
    setSelectedResult(result)
    setFormData({
      ...parsed,
      apt: "",
      business_name: "",
    })
    setShowForm(true)
    setSearchQuery("")
    setSearchResults([])
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }

    setIsSearching(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'Yarvest App'
              }
            }
          )
          
          if (!response.ok) throw new Error('Reverse geocoding failed')
          
          const data = await response.json()
          const parsed = parseAddressResult(data)
          setSelectedResult({ ...data, lat: latitude, lon: longitude })
          setFormData({
            ...parsed,
            apt: "",
            business_name: "",
          })
          setShowForm(true)
        } catch (err) {
          console.error("Reverse geocoding error:", err)
          alert("Failed to get address from location")
        } finally {
          setIsSearching(false)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        alert("Unable to get your location")
        setIsSearching(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const handleSaveAddress = async () => {
    if (!formData.street_address || !formData.postal_code || !formData.city || !formData.state) {
      alert("Street address, city, state, and ZIP code are required")
      return
    }

    setIsSaving(true)
    try {
      const addressData: Address = {
        street_address: formData.street_address!,
        city: formData.city || "",
        state: formData.state || "",
        country: formData.country || "USA",
        postal_code: formData.postal_code!,
        apt: formData.apt || "",
        business_name: formData.business_name || "",
        latitude: formData.latitude,
        longitude: formData.longitude,
      }

      if (isLoggedIn && user) {
        if (editingId) {
          // When editing, make the address active
          await updateAddress(editingId, { ...addressData, status: true })
        } else {
          await addAddress(addressData)
        }
      } else {
        if (editingId) {
          // When editing, make the address active
          updateLocalAddress(editingId, { ...addressData, status: true })
        } else {
          saveLocalAddress(addressData)
        }
      }

      setShowForm(false)
      setFormData({
        street_address: "",
        apt: "",
        business_name: "",
        postal_code: "",
        city: "",
        state: "",
        country: "USA",
      })
      setSelectedResult(null)
      setEditingId(null)
      onSuccess?.()
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save address")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSelectAddress = async (address: Address) => {
    if (isLoggedIn && user) {
      if (address.id && typeof address.id === 'number') {
        await setActiveAddress(address.id)
      }
    } else {
      if (address.id) {
        setLocalActiveAddress(address.id)
      }
    }
    onSuccess?.()
    onOpenChange(false)
  }

  const handleEditAddress = (address: Address) => {
    setFormData({
      street_address: address.street_address,
      city: address.city,
      state: address.state,
      country: address.country,
      postal_code: address.postal_code,
      apt: address.apt || "",
      business_name: address.business_name || "",
      latitude: address.latitude,
      longitude: address.longitude,
    })
    setEditingId(address.id || null)
    setShowForm(true)
  }

  const handleDeleteAddress = async (addressId: number | string) => {
    if (!confirm("Are you sure you want to delete this address?")) return

    try {
      if (isLoggedIn && user) {
        await deleteAddress(addressId)
      } else {
        deleteLocalAddress(addressId)
      }
      // If we're in the form and deleting the current editing address, close form
      if (editingId === addressId) {
        setShowForm(false)
        setEditingId(null)
        setFormData({
          street_address: "",
          apt: "",
          business_name: "",
          postal_code: "",
          city: "",
          state: "",
          country: "USA",
        })
      }
      onSuccess?.()
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete address")
    }
  }

  const formatAddressDisplay = (addr: Address) => {
    const parts = []
    if (addr.street_address) parts.push(addr.street_address)
    if (addr.city && addr.state) {
      parts.push(`${addr.city}, ${addr.state} ${addr.postal_code || ''}`.trim())
    }
    return parts.join(', ')
  }

  if (showForm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange} >
        <DialogContent className="sm:max-w-[500px] overflow-y-auto  p-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{editingId ? "Edit address" : "Add address"}</DialogTitle>
            <DialogDescription>Fill in the details for your address</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Street address <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                value={formData.street_address || ""}
                onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                placeholder="Enter street address"
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Apt (optional)</label>
                <Input
                  type="text"
                  value={formData.apt || ""}
                  onChange={(e) => setFormData({ ...formData, apt: e.target.value })}
                  placeholder="Apt"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Business (optional)</label>
                <Input
                  type="text"
                  value={formData.business_name || ""}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  placeholder="Business name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  City <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.city || ""}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  State <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.state || ""}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase().slice(0, 2) })}
                  placeholder="CA"
                  className="w-full uppercase"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                ZIP code <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={formData.postal_code || ""}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                  placeholder="12345"
                  className="pl-10"
                  maxLength={5}
                />
              </div>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={() => handleDeleteAddress(editingId)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete address
              </button>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => {
              setShowForm(false)
              setEditingId(null)
              setFormData({
                street_address: "",
                apt: "",
                business_name: "",
                postal_code: "",
                city: "",
                state: "",
                country: "USA",
              })
            }} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAddress} 
              className="flex-1 bg-primary hover:bg-accent text-white" 
              disabled={isSaving || !formData.street_address || !formData.postal_code || !formData.city || !formData.state}
            >
              {isSaving ? "Saving..." : "Save Address"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] p-5 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">Choose address</DialogTitle>
          <DialogDescription className="text-base text-gray-600">Select a delivery location to see product availability</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0 py-4">
          {/* Search with Current Location */}
          <div className="mb-4 flex-shrink-0">
            <label className="text-sm font-medium text-gray-900 mb-2 block">Enter your address</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 z-10" />
              <Input
                type="text"
                placeholder="Enter your address"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    handleSearch(searchQuery)
                  }
                }}
                className="w-full pl-12 pr-12 py-3.5 text-base bg-white border-2 border-[#0A5D31] rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0A5D31] focus:border-[#0A5D31]"
              />
              <button
                type="button"
                onClick={() => {
                  if (searchQuery.trim()) {
                    handleSearch(searchQuery)
                  }
                }}
                disabled={!searchQuery.trim() || isSearching}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Search address"
              >
                <Send className="w-5 h-5 text-[#0A5D31]" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1 -mr-1">
            {/* Search Results */}
            {isSearching && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg" />
                ))}
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSearchResult(result)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-[#0A5D31] hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-[#0A5D31] mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-900 flex-1">{result.display_name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Saved Addresses */}
            {!searchQuery && addresses.length > 0 && (
              <div className="space-y-2">
                {addresses.map((addr) => {
                  const isActive = addr.id === activeAddress?.id
                  return (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        isActive
                          ? "border-[#0A5D31] bg-[#0A5D31]/5"
                          : "border-gray-200 hover:border-[#0A5D31]/50 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                            isActive
                              ? "border-[#0A5D31] bg-[#0A5D31]"
                              : "border-gray-300 bg-white"
                          }`}>
                            {isActive && (
                              <div className="w-2.5 h-2.5 rounded-full bg-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {addr.street_address}
                            </p>
                            {addr.city && addr.state && (
                              <p className="text-xs text-gray-600 mt-0.5">
                                {addr.city}, {addr.state} {addr.postal_code}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isActive && (
                            <Check className="w-5 h-5 text-[#0A5D31] flex-shrink-0" />
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditAddress(addr)
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="Edit address"
                          >
                            <Edit className="w-4 h-4 text-[#C5A000]" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteAddress(addr.id!)
                            }}
                            className="p-1.5 hover:bg-red-50 rounded transition-colors"
                            title="Delete address"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Empty State */}
            {!searchQuery && addresses.length === 0 && searchResults.length === 0 && !isSearching && (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">Start typing to search for your address</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200 flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50">
            Cancel
          </Button>
          <Button 
            onClick={() => setShowForm(true)} 
            className="flex-1 bg-[#0A5D31] hover:bg-[#0d7a3f] text-white"
          >
            Add manually
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
