"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  Leaf,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Calendar,
  Users,
  AlertCircle
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { fetchHarvestRequest, type HarvestRequest } from "@/lib/harvest-requests-api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import api from "@/lib/axios"
import Link from "next/link"

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-800", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
}

interface Offer {
  id: number
  harvest_id: number
  status: string
  harvester?: {
    id: number
    name: string
    email: string
    phone?: string
  }
  created_at: string
}

export default function HarvestRequestDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const requestId = params.id as string
  
  const [request, setRequest] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState(false)
  const [selectedOffers, setSelectedOffers] = useState<number[]>([])
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [shareContact, setShareContact] = useState(false)
  const [sharePhone, setSharePhone] = useState(false)

  useEffect(() => {
    const loadRequest = async () => {
      setIsLoading(true)
      try {
        const requestData = await fetchHarvestRequest(requestId)
        setRequest(requestData)
      } catch (error) {
        console.error('Error loading harvest request:', error)
      } finally {
        setIsLoading(false)
      }
    }
    if (requestId) {
      loadRequest()
    }
  }, [requestId])

  const handleAcceptOffers = async () => {
    if (selectedOffers.length === 0) {
      toast.error("Please select at least one offer to accept")
      return
    }

    if (selectedOffers.length > 2) {
      toast.error("You can only accept up to 2 offers")
      return
    }

    setIsAccepting(true)
    try {
      const response = await api.post(`/harvest-requests/${requestId}/accept-offers`, {
        offer_ids: selectedOffers,
        share_contact: shareContact,
        share_phone: sharePhone,
      })
      
      toast.success(response.data?.message || 'Offers accepted successfully')
      
      // Reload request
      const requestData = await fetchHarvestRequest(requestId)
      setRequest(requestData)
      setSelectedOffers([])
      setShareContact(false)
      setSharePhone(false)
      setShowAcceptModal(false)
    } catch (error: any) {
      console.error('Error accepting offers:', error)
      const errorMessage = error.response?.data?.message || 'Failed to accept offers'
      toast.error(errorMessage)
    } finally {
      setIsAccepting(false)
    }
  }

  const toggleOfferSelection = (offerId: number) => {
    if (selectedOffers.includes(offerId)) {
      setSelectedOffers(selectedOffers.filter(id => id !== offerId))
    } else {
      if (selectedOffers.length >= 2) {
        toast.error("You can only select up to 2 offers")
        return
      }
      setSelectedOffers([...selectedOffers, offerId])
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#0A5D31]" />
          <p className="text-gray-600">Loading harvest request...</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-gray-500">Harvest request not found</p>
        </div>
      </div>
    )
  }

  const statusInfo = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.pending
  const StatusIcon = statusInfo.icon
  const offers: Offer[] = request.accepted || []
  const pendingOffers = offers.filter(o => o.status === 'pending')
  const acceptedOffers = offers.filter(o => o.status === 'accepted')
  const rejectedOffers = offers.filter(o => o.status === 'rejected')

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Leaf className="w-8 h-8 text-[#5a9c3a]" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{request.title}</h1>
              <p className="text-gray-500 mt-1 text-sm">Request ID: {request.id}</p>
            </div>
          </div>
          <Badge className={`${statusInfo.color} gap-1`}>
            <StatusIcon className="w-3 h-3" />
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Information</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <p className="text-gray-900 mt-1">{request.description || 'No description provided'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Harvest Date
                  </Label>
                  <p className="text-gray-900 mt-1">{new Date(request.date).toLocaleDateString()}</p>
                </div>
                {request.number_of_people && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      People Needed
                    </Label>
                    <p className="text-gray-900 mt-1">{request.number_of_people}</p>
                  </div>
                )}
              </div>

              {request.address && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </Label>
                  <p className="text-gray-900 mt-1">{request.address.full_address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Products */}
          {request.products && request.products.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Products ({request.products_count || request.products.length})
              </h2>
              <div className="space-y-3">
                {request.products.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      {product.unit && (
                        <p className="text-sm text-gray-500">{product.unit.name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Offers */}
        <div className="space-y-6">
          {/* Offers Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Offers ({offers.length})
              </h2>
              {pendingOffers.length > 0 && (
                <Button
                  size="sm"
                  onClick={() => setShowAcceptModal(true)}
                  className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
                  disabled={selectedOffers.length === 0}
                >
                  Accept Selected ({selectedOffers.length})
                </Button>
              )}
            </div>

            {/* Offers Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-lg font-bold text-yellow-600">{pendingOffers.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Accepted</p>
                <p className="text-lg font-bold text-green-600">{acceptedOffers.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Rejected</p>
                <p className="text-lg font-bold text-red-600">{rejectedOffers.length}</p>
              </div>
            </div>

            {offers.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No offers yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedOffers.includes(offer.id)
                        ? 'border-[#5a9c3a] bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleOfferSelection(offer.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => toggleOfferSelection(offer.id)}
                      >
                        {offer.harvester ? (
                          <>
                            <Link 
                              href={`/harvesters/${offer.harvester.id}`}
                              className="font-medium text-gray-900 hover:text-[#5a9c3a] transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {offer.harvester.name}
                            </Link>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <Mail className="w-3 h-3" />
                              {offer.harvester.email}
                            </p>
                            {offer.harvester.phone && (
                              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <Phone className="w-3 h-3" />
                                {offer.harvester.phone}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">Unknown harvester</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Offered {new Date(offer.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedOffers.includes(offer.id) && (
                          <CheckCircle className="w-5 h-5 text-[#5a9c3a]" />
                        )}
                        <input
                          type="checkbox"
                          checked={selectedOffers.includes(offer.id)}
                          onChange={() => toggleOfferSelection(offer.id)}
                          className="w-4 h-4 text-[#5a9c3a] border-gray-300 rounded focus:ring-[#5a9c3a] focus:ring-2 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {acceptedOffers.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Accepted Offers ({acceptedOffers.length})
                    </h3>
                    {acceptedOffers.map((offer) => (
                      <div
                        key={offer.id}
                        className="p-3 border border-green-200 bg-green-50 rounded-lg mb-3"
                      >
                        {offer.harvester ? (
                          <>
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <Link 
                                href={`/harvesters/${offer.harvester.id}`}
                                className="font-medium text-gray-900 hover:text-[#5a9c3a] transition-colors"
                              >
                                {offer.harvester.name}
                              </Link>
                            </div>
                            <p className="text-sm text-gray-600">{offer.harvester.email}</p>
                            {offer.harvester.phone && (
                              <p className="text-sm text-gray-600">{offer.harvester.phone}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              Accepted {new Date(offer.created_at).toLocaleDateString()}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">Unknown harvester</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {rejectedOffers.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Rejected Offers ({rejectedOffers.length})
                    </h3>
                    {rejectedOffers.map((offer) => (
                      <div
                        key={offer.id}
                        className="p-3 border border-red-200 bg-red-50 rounded-lg mb-3 opacity-75"
                      >
                        {offer.harvester ? (
                          <>
                            <div className="flex items-center gap-2 mb-2">
                              <XCircle className="w-4 h-4 text-red-600" />
                              <Link 
                                href={`/harvesters/${offer.harvester.id}`}
                                className="font-medium text-gray-700 hover:text-[#5a9c3a] transition-colors"
                              >
                                {offer.harvester.name}
                              </Link>
                            </div>
                            <p className="text-sm text-gray-600">{offer.harvester.email}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              Rejected {new Date(offer.created_at).toLocaleDateString()}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">Unknown harvester</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Request Owner Info */}
          {request.user && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Request Owner
              </h2>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{request.user.name}</p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {request.user.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Accept Offers Modal */}
      <Dialog open={showAcceptModal} onOpenChange={setShowAcceptModal}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-bold">Accept Offers</DialogTitle>
            <DialogDescription className="pt-2">
              You are about to accept <strong>{selectedOffers.length}</strong> offer(s). Emails will be sent to the selected harvesters.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-3">Selected Harvesters:</p>
              <div className="space-y-2">
                {selectedOffers.map((offerId) => {
                  const offer = pendingOffers.find(o => o.id === offerId)
                  return offer && offer.harvester ? (
                    <div key={offerId} className="flex items-center gap-2 text-sm text-blue-900">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{offer.harvester.name}</span>
                      <span className="text-blue-600">({offer.harvester.email})</span>
                    </div>
                  ) : null
                })}
              </div>
            </div>

            {/* Share Contact Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Share Contact Information</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="share-contact"
                  checked={shareContact}
                  onChange={(e) => setShareContact(e.target.checked)}
                />
                <Label htmlFor="share-contact" className="font-normal cursor-pointer text-sm text-gray-700">
                  Share my email address with accepted harvesters
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="share-phone"
                  checked={sharePhone}
                  onChange={(e) => setSharePhone(e.target.checked)}
                />
                <Label htmlFor="share-phone" className="font-normal cursor-pointer text-sm text-gray-700">
                  Share my phone number with accepted harvesters
                </Label>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Selected offers will be accepted and emails will be sent. Other pending offers will be automatically rejected.
              </p>
            </div>
          </div>
          
          <DialogFooter className="pt-4 gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAcceptModal(false)
                setShareContact(false)
                setSharePhone(false)
              }}
              disabled={isAccepting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAcceptOffers}
              disabled={isAccepting}
              className="flex-1 bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Accept Offers"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

