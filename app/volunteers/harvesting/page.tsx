"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Leaf,
  Search,
  MapPin,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Loader2,
  User,
  Package
} from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { fetchHarvestRequests, offerHelpForHarvestRequest, fetchMyHarvestOffers, type HarvestRequest } from "@/lib/harvest-requests-api"
import { useRouter } from "next/navigation"
import { getImageUrl } from "@/lib/utils"
import { getCurrentUser } from "@/lib/auth"

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-800", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
}

export default function HarvestingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'requests' | 'myHarvests' | 'myOffers'>('requests')
  const [harvestRequests, setHarvestRequests] = useState<HarvestRequest[]>([])
  const [myHarvestOffers, setMyHarvestOffers] = useState<HarvestRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<HarvestRequest | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [offeringHelp, setOfferingHelp] = useState<number | null>(null)

  const getMyOfferStatus = (request: HarvestRequest) => {
    if (!request.accepted || !Array.isArray(request.accepted)) return null
    // Get current user ID
    const currentUser = getCurrentUser()
    if (!currentUser) return null
    
    // Find the offer that belongs to the current user
    const myOffer = request.accepted.find((offer: any) => {
      const offerUserId = offer.harvest_id || offer.harvester?.id
      return offerUserId && String(offerUserId) === String(currentUser.id)
    })
    return myOffer?.status || null
  }

  const hasOfferedHelp = (request: HarvestRequest) => {
    if (!request.accepted) return false
    return request.accepted.some((offer: any) => offer.status === 'pending' || offer.status === 'accepted')
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load all data upfront so counts are accurate for all tabs
        const [requests, offers] = await Promise.all([
          fetchHarvestRequests(),
          fetchMyHarvestOffers()
        ])
        setHarvestRequests(requests)
        setMyHarvestOffers(offers)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter my harvests to only show accepted offers
  const acceptedMyHarvests = myHarvestOffers.filter((request) => {
    const myOfferStatus = getMyOfferStatus(request)
    return myOfferStatus === 'accepted'
  })

  // Filter my offers to show pending/rejected offers (not accepted)
  const pendingRejectedOffers = myHarvestOffers.filter((request) => {
    const myOfferStatus = getMyOfferStatus(request)
    return myOfferStatus === 'pending' || myOfferStatus === 'rejected'
  })

  // Filter available requests - only show pending requests where user hasn't offered yet
  const filteredRequests = harvestRequests.filter((request) => {
    // Only show pending requests (not accepted or completed)
    if (request.status !== 'pending') return false
    
    // Don't show requests where user already offered help
    if (hasOfferedHelp(request)) return false
    
    const matchesSearch = 
      request.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.address?.full_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredMyHarvests = acceptedMyHarvests.filter((request) => {
    const matchesSearch = 
      request.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.address?.full_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredMyOffers = pendingRejectedOffers.filter((request) => {
    const matchesSearch = 
      request.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.address?.full_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate stats from all loaded data (not just filtered) so counts are accurate for all tabs
  const stats = {
    totalRequests: harvestRequests.filter((request) => {
      // Only count pending requests where user hasn't offered yet
      if (request.status !== 'pending') return false
      return !hasOfferedHelp(request)
    }).length,
    pendingRequests: harvestRequests.filter((request) => {
      if (request.status !== 'pending') return false
      return !hasOfferedHelp(request)
    }).length,
    acceptedRequests: 0, // Not showing accepted in available requests anymore
    totalMyHarvests: acceptedMyHarvests.length,
    acceptedMyHarvests: acceptedMyHarvests.filter(r => r.status === 'accepted').length,
    completedMyHarvests: acceptedMyHarvests.filter(r => r.status === 'completed').length,
    totalMyOffers: pendingRejectedOffers.length,
    pendingOffers: pendingRejectedOffers.filter(r => getMyOfferStatus(r) === 'pending').length,
    rejectedOffers: pendingRejectedOffers.filter(r => getMyOfferStatus(r) === 'rejected').length,
  }

  const handleOfferHelp = async (requestId: number) => {
    setOfferingHelp(requestId)
    try {
      await offerHelpForHarvestRequest(requestId)
      // Reload all data to update counts
      const [requests, offers] = await Promise.all([
        fetchHarvestRequests(),
        fetchMyHarvestOffers()
      ])
      setHarvestRequests(requests)
      setMyHarvestOffers(offers)
      setShowDetailsModal(false)
      setSelectedRequest(null)
    } catch (error) {
      console.error('Error offering help:', error)
    } finally {
      setOfferingHelp(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-8xl mx-auto px-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Harvest Requests</h1>
          <p className="text-gray-500 mt-1 text-sm">View and offer help for harvest requests from farmers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'requests'
              ? 'border-b-2 border-[#5a9c3a] text-[#5a9c3a]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Available Requests ({filteredRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('myHarvests')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'myHarvests'
              ? 'border-b-2 border-[#5a9c3a] text-[#5a9c3a]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Harvests ({acceptedMyHarvests.length})
        </button>
        <button
          onClick={() => setActiveTab('myOffers')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'myOffers'
              ? 'border-b-2 border-[#5a9c3a] text-[#5a9c3a]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Offers ({pendingRejectedOffers.length})
        </button>
      </div>

      {/* Stats */}
      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Available Requests</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</p>
          </div>
        </div>
      )}
      {activeTab === 'myHarvests' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Total Harvests</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalMyHarvests}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Accepted</p>
            <p className="text-2xl font-bold text-green-600">{stats.acceptedMyHarvests}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Completed</p>
            <p className="text-2xl font-bold text-blue-600">{stats.completedMyHarvests}</p>
          </div>
        </div>
      )}
      {activeTab === 'myOffers' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Total Offers</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalMyOffers}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingOffers}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejectedOffers}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by title, description, location, or farmer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border border-gray-300"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-[#5a9c3a] focus:border-[#5a9c3a]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      {activeTab === 'requests' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#5a9c3a]" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Leaf className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No harvest requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volunteers</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => {
                    const StatusIcon = statusConfig[request.status as keyof typeof statusConfig]?.icon || Clock
                    return (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">{request.title || `Harvest Request #${request.id}`}</p>
                            {request.description && (
                              <p className="text-gray-500 text-xs line-clamp-1 mt-1">{request.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">{request.user?.name || 'N/A'}</p>
                            {request.user?.email && (
                              <p className="text-gray-500 text-xs">{request.user.email}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-start gap-1 max-w-xs">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {request.address?.full_address || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(request.date).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Package className="w-4 h-4" />
                            <span>{request.products_count || request.products?.length || 0}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{request.accepted_count || 0}/{request.number_of_people || '?'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge className={`${statusConfig[request.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'} gap-1 px-3 py-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[request.status as keyof typeof statusConfig]?.label || request.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {request.status === "pending" && (
                              <Button
                                size="sm"
                                className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white h-8"
                                onClick={() => handleOfferHelp(request.id)}
                                disabled={offeringHelp === request.id || hasOfferedHelp(request)}
                              >
                                {offeringHelp === request.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : hasOfferedHelp(request) ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Offered
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Offer Help
                                  </>
                                )}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest(request)
                                setShowDetailsModal(true)
                              }}
                              className="h-8"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* My Offers Table */}
      {activeTab === 'myOffers' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#5a9c3a]" />
            </div>
          ) : filteredMyOffers.length === 0 ? (
            <div className="text-center py-12">
              <Leaf className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No pending or rejected offers found</p>
              <p className="text-gray-400 text-sm mt-2">Your offers that are pending or rejected will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volunteers</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">My Offer Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMyOffers.map((request) => {
                    const StatusIcon = statusConfig[request.status as keyof typeof statusConfig]?.icon || Clock
                    const myStatus = getMyOfferStatus(request)
                    return (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">{request.title || `Harvest Request #${request.id}`}</p>
                            {request.description && (
                              <p className="text-gray-500 text-xs line-clamp-1 mt-1">{request.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">{request.user?.name || 'N/A'}</p>
                            {request.user?.email && (
                              <p className="text-gray-500 text-xs">{request.user.email}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-start gap-1 max-w-xs">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {request.address?.full_address || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(request.date).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Package className="w-4 h-4" />
                            <span>{request.products_count || request.products?.length || 0}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{request.accepted_count || 0}/{request.number_of_people || '?'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {myStatus && (
                            <Badge className={
                              myStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                              myStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              myStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {myStatus.charAt(0).toUpperCase() + myStatus.slice(1)}
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge className={`${statusConfig[request.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'} gap-1 px-3 py-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[request.status as keyof typeof statusConfig]?.label || request.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest(request)
                                setShowDetailsModal(true)
                              }}
                              className="h-8"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white h-8"
                              onClick={() => router.push(`/admin/harvest-requests/${request.id}`)}
                            >
                              View Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* My Harvests Table */}
      {activeTab === 'myHarvests' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#5a9c3a]" />
            </div>
          ) : filteredMyHarvests.length === 0 ? (
            <div className="text-center py-12">
              <Leaf className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No accepted harvests found</p>
              <p className="text-gray-400 text-sm mt-2">Your offers need to be accepted by farmers to appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volunteers</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">My Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMyHarvests.map((request) => {
                    const StatusIcon = statusConfig[request.status as keyof typeof statusConfig]?.icon || Clock
                    const myStatus = getMyOfferStatus(request)
                    return (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">{request.title || `Harvest Request #${request.id}`}</p>
                            {request.description && (
                              <p className="text-gray-500 text-xs line-clamp-1 mt-1">{request.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">{request.user?.name || 'N/A'}</p>
                            {request.user?.email && (
                              <p className="text-gray-500 text-xs">{request.user.email}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-start gap-1 max-w-xs">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {request.address?.full_address || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(request.date).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Package className="w-4 h-4" />
                            <span>{request.products_count || request.products?.length || 0}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{request.accepted_count || 0}/{request.number_of_people || '?'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {myStatus && (
                            <Badge className={
                              myStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                              myStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              myStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {myStatus.charAt(0).toUpperCase() + myStatus.slice(1)}
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge className={`${statusConfig[request.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'} gap-1 px-3 py-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[request.status as keyof typeof statusConfig]?.label || request.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest(request)
                                setShowDetailsModal(true)
                              }}
                              className="h-8"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white h-8"
                              onClick={() => router.push(`/admin/harvest-requests/${request.id}`)}
                            >
                              View Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl p-6">
            <DialogHeader className="pb-4">
              <DialogTitle>{selectedRequest.title || `Harvest Request #${selectedRequest.id}`}</DialogTitle>
              <DialogDescription>
                Request from {selectedRequest.user?.name || 'a farmer'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              {selectedRequest.description && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-gray-900">{selectedRequest.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedRequest.address && (
                  <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Location</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-sm font-medium text-gray-900">{selectedRequest.address.full_address}</p>
                    </div>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-900">{new Date(selectedRequest.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">People Needed</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedRequest.number_of_people || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Volunteers Joined</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedRequest.accepted_count || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                  <Badge className={statusConfig[selectedRequest.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'}>
                    {statusConfig[selectedRequest.status as keyof typeof statusConfig]?.label || selectedRequest.status}
                  </Badge>
                </div>
                {(activeTab === 'myHarvests' || activeTab === 'myOffers') && selectedRequest && (() => {
                  const myStatus = getMyOfferStatus(selectedRequest)
                  return myStatus ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">My Offer Status</p>
                      <Badge className={
                        myStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                        myStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        myStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {myStatus.charAt(0).toUpperCase() + myStatus.slice(1)}
                      </Badge>
                    </div>
                  ) : null
                })()}
              </div>

              {selectedRequest.products && selectedRequest.products.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Products</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRequest.products.map((product: any) => (
                      <div key={product.id} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                        {product.main_image && (
                          <img 
                            src={getImageUrl(product.main_image, product.name)} 
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="text-sm font-semibold">{product.name}</p>
                          {product.unit && (
                            <p className="text-xs text-gray-500">{product.unit.name}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 gap-3">
              {activeTab === 'requests' && selectedRequest.status === "pending" && (
                <Button
                  className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
                  onClick={() => handleOfferHelp(selectedRequest.id)}
                  disabled={offeringHelp === selectedRequest.id || hasOfferedHelp(selectedRequest)}
                >
                  {offeringHelp === selectedRequest.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Offering...
                    </>
                  ) : hasOfferedHelp(selectedRequest) ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Already Offered
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Offer Help
                    </>
                  )}
                </Button>
              )}
              {(activeTab === 'myHarvests' || activeTab === 'myOffers') && (
                <Button
                  className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
                  onClick={() => {
                    router.push(`/admin/harvest-requests/${selectedRequest.id}`)
                    setShowDetailsModal(false)
                  }}
                >
                  View Full Details
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
