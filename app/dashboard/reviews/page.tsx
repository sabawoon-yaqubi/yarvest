"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Loader2, Download, User, Table2, List, Package, Users } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { getImageUrl } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const COLORS = {
  primary: "#5a9c3a",
  primaryDark: "#0d7a3f",
  primaryLight: "#7ab856",
  accent: "#e8f5e9",
}

export default function ReviewsPage() {
  const { user, isLoading: authLoading } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'user' | 'product'>('user')
  const [userReviews, setUserReviews] = useState<any[]>([])
  const [productReviewsReceived, setProductReviewsReceived] = useState<any[]>([])
  const [productReviewsGiven, setProductReviewsGiven] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [searchQuery, setSearchQuery] = useState("")
  const [ratingFilter, setRatingFilter] = useState<string>("all")

  useEffect(() => {
    if (!authLoading && user) {
      fetchAllReviews()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [authLoading, user])

  const fetchAllReviews = async () => {
    try {
      setLoading(true)
      
      // Fetch user reviews (both received and given)
      const userReviewsResponse = await api.get('/user-reviews?include_given=true')
      const userReviewsData = userReviewsResponse.data?.data || userReviewsResponse.data || []
      setUserReviews(Array.isArray(userReviewsData) ? userReviewsData : [])
      
      // Fetch product reviews received (for products I own)
      try {
        const productReviewsReceivedResponse = await api.get('/product-reviews/my-products')
        const productReceivedData = productReviewsReceivedResponse.data?.data || []
        setProductReviewsReceived(Array.isArray(productReceivedData) ? productReceivedData : [])
      } catch (error: any) {
        console.error('Error fetching product reviews received:', error)
        setProductReviewsReceived([])
      }
      
      // Fetch product reviews given (reviews I gave)
      try {
        const productReviewsGivenResponse = await api.get('/product-reviews/my-given')
        const productGivenData = productReviewsGivenResponse.data?.data || []
        setProductReviewsGiven(Array.isArray(productGivenData) ? productGivenData : [])
      } catch (error: any) {
        console.error('Error fetching product reviews given:', error)
        setProductReviewsGiven([])
      }
      
    } catch (error: any) {
      console.error('Error fetching reviews:', error)
      if (error.response?.status === 401) {
        toast.error('Please log in to view reviews')
      } else if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || 'Failed to load reviews')
      }
    } finally {
      setLoading(false)
    }
  }

  // Get current reviews based on active tab
  const getCurrentReviews = () => {
    if (activeTab === 'user') {
      return userReviews
    } else {
      // Combine product reviews received and given
      return [...productReviewsReceived, ...productReviewsGiven]
    }
  }

  const currentReviews = getCurrentReviews()

  const filteredReviews = currentReviews.filter((review) => {
    const matchesRating = ratingFilter === "all" || review.star?.toString() === ratingFilter || review.stars?.toString() === ratingFilter
    let reviewerName = ''
    let reviewText = ''
    
    if (activeTab === 'user') {
      // User reviews
      reviewerName = review.review_type === 'given' 
        ? (review.to_user?.name || review.to_user?.email || 'Anonymous')
        : (review.from_user?.name || review.from_user?.email || 'Anonymous')
      reviewText = review.review || ''
    } else {
      // Product reviews
      if (review.review_type === 'received') {
        reviewerName = review.buyer?.name || review.buyer?.email || 'Anonymous'
      } else {
        reviewerName = review.product?.name || 'Product'
      }
      reviewText = review.message || review.review || ''
    }
    
    const matchesSearch = 
      reviewerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reviewText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.product?.name && review.product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesRating && matchesSearch
  })

  const reviewsReceived = activeTab === 'user' 
    ? userReviews.filter(r => r.review_type === 'received')
    : productReviewsReceived
  const reviewsGiven = activeTab === 'user'
    ? userReviews.filter(r => r.review_type === 'given')
    : productReviewsGiven

  const getRating = (review: any) => review.star || review.stars || 0

  const stats = {
    totalReviews: currentReviews.length,
    reviewsReceived: reviewsReceived.length,
    reviewsGiven: reviewsGiven.length,
    averageRating: reviewsReceived.length > 0 
      ? (reviewsReceived.reduce((sum, r) => sum + getRating(r), 0) / reviewsReceived.length).toFixed(1)
      : '0.0',
    fiveStar: reviewsReceived.filter(r => getRating(r) === 5).length,
    fourStar: reviewsReceived.filter(r => getRating(r) === 4).length,
    threeStar: reviewsReceived.filter(r => getRating(r) === 3).length,
    twoStar: reviewsReceived.filter(r => getRating(r) === 2).length,
    oneStar: reviewsReceived.filter(r => getRating(r) === 1).length,
  }

  const handleExportReviews = async () => {
    try {
      // Create CSV content from reviews
      const headers = activeTab === 'user' 
        ? ['Review Type', 'User', 'Email', 'Rating', 'Review Type (Delivery/Harvesting)', 'Review', 'Date']
        : ['Review Type', 'Product', 'Reviewer', 'Email', 'Rating', 'Review', 'Date']
      
      const rows = currentReviews.map(review => {
        if (activeTab === 'user') {
          const isGiven = review.review_type === 'given'
          const userName = isGiven 
            ? (review.to_user?.name || 'Anonymous')
            : (review.from_user?.name || 'Anonymous')
          const userEmail = isGiven 
            ? (review.to_user?.email || '')
            : (review.from_user?.email || '')
          return [
            review.review_type === 'given' ? 'Given' : 'Received',
            userName,
            userEmail,
            getReviewRating(review),
            review.type || 'N/A',
            getReviewText(review).replace(/"/g, '""'), // Escape quotes for CSV
            new Date(review.created_at).toLocaleDateString()
          ]
        } else {
          // Product reviews
          const reviewerName = review.review_type === 'received'
            ? (review.buyer?.name || review.buyer?.email || 'Anonymous')
            : 'You'
          const reviewerEmail = review.review_type === 'received'
            ? (review.buyer?.email || '')
            : ''
          return [
            review.review_type === 'given' ? 'Given' : 'Received',
            review.product?.name || 'Product',
            reviewerName,
            reviewerEmail,
            getReviewRating(review),
            getReviewText(review).replace(/"/g, '""'), // Escape quotes for CSV
            new Date(review.created_at).toLocaleDateString()
          ]
        }
      })
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `reviews_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Reviews exported successfully')
    } catch (error: any) {
      console.error('Error exporting reviews:', error)
      toast.error('Failed to export reviews')
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getReviewRating = (review: any) => review.star || review.stars || 0
  const getReviewText = (review: any) => review.review || review.message || ''

  const getTypeBadgeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'delivery':
        return 'bg-blue-100 text-blue-800'
      case 'harvesting':
        return 'bg-green-100 text-green-800'
      case 'other':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: COLORS.primary }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
            <p className="text-gray-500 mt-1 text-sm">
              {activeTab === 'user' 
                ? 'User reviews you have given and received' 
                : 'Product reviews for your products and reviews you gave'}
            </p>
          </div>
          {currentReviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="gap-2"
                >
                  <List className="w-4 h-4" />
                  Cards
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="gap-2"
                >
                  <Table2 className="w-4 h-4" />
                  Table
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={handleExportReviews}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          )}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'user' | 'product')} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="user" className="gap-2">
              <Users className="w-4 h-4" />
              User Reviews
            </TabsTrigger>
            <TabsTrigger value="product" className="gap-2">
              <Package className="w-4 h-4" />
              Product Reviews
            </TabsTrigger>
          </TabsList>

          {/* User Reviews Tab */}
          <TabsContent value="user" className="mt-6">
            {userReviews.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No user reviews yet</h3>
                  <p className="text-gray-500">You haven't received or given any user reviews yet</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-8 gap-4 mb-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500 mb-1">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500 mb-1">Received</p>
                  <p className="text-2xl font-bold text-green-600">{stats.reviewsReceived}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500 mb-1">Given</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.reviewsGiven}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500 mb-1">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500 mb-1">5 Stars</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.fiveStar}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500 mb-1">4 Stars</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.fourStar}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500 mb-1">3 Stars</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.threeStar}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500 mb-1">2-1 Stars</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.twoStar + stats.oneStar}</p>
                </CardContent>
              </Card>
            </div>

            {/* Summary Info */}
            {(reviewsReceived.length > 0 || reviewsGiven.length > 0) && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Showing:</strong> {reviewsReceived.length} review{reviewsReceived.length !== 1 ? 's' : ''} received • {reviewsGiven.length} review{reviewsGiven.length !== 1 ? 's' : ''} given
                </p>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search by reviewer name, review text, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Tabs value={ratingFilter} onValueChange={setRatingFilter}>
                <TabsList>
                  <TabsTrigger value="all">All Ratings</TabsTrigger>
                  <TabsTrigger value="5">5 Stars</TabsTrigger>
                  <TabsTrigger value="4">4 Stars</TabsTrigger>
                  <TabsTrigger value="3">3 Stars</TabsTrigger>
                  <TabsTrigger value="2">2 Stars</TabsTrigger>
                  <TabsTrigger value="1">1 Star</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Reviews Display */}
            {viewMode === 'cards' ? (
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <Card key={`user-${review.review_type || 'received'}-${review.id}`} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#5a9c3a] to-[#0d7a3f] rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">
                                  {review.review_type === 'given' 
                                    ? (review.to_user?.name || review.to_user?.email || 'Anonymous')
                                    : (review.from_user?.name || review.from_user?.email || 'Anonymous')}
                                </h4>
                                <Badge className={review.review_type === 'given' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                                  {review.review_type === 'given' ? 'Given' : 'Received'}
                                </Badge>
                                {review.type && (
                                  <Badge className={getTypeBadgeColor(review.type)}>
                                    {review.type}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center">
                                  {renderStars(getReviewRating(review))}
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          {getReviewText(review) && (
                            <p className="text-sm text-gray-700 mt-2">{getReviewText(review)}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-md">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reviewer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rating
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Review
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredReviews.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                              No reviews found matching your search criteria
                            </td>
                          </tr>
                        ) : (
                          filteredReviews.map((review) => (
                            <tr key={`user-${review.review_type || 'received'}-${review.id}`} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gradient-to-br from-[#5a9c3a] to-[#0d7a3f] rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                                    <User className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <div className="text-sm font-medium text-gray-900">
                                        {review.review_type === 'given' 
                                          ? (review.to_user?.name || review.to_user?.email || 'Anonymous')
                                          : (review.from_user?.name || review.from_user?.email || 'Anonymous')}
                                      </div>
                                      <Badge className={review.review_type === 'given' ? 'bg-blue-100 text-blue-800 text-xs' : 'bg-green-100 text-green-800 text-xs'}>
                                        {review.review_type === 'given' ? 'Given' : 'Received'}
                                      </Badge>
                                    </div>
                                    {(review.review_type === 'given' ? review.to_user?.email : review.from_user?.email) && (
                                      <div className="text-sm text-gray-500">
                                        {review.review_type === 'given' ? review.to_user?.email : review.from_user?.email}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {renderStars(getReviewRating(review))}
                                  <span className="ml-2 text-sm text-gray-600">
                                    ({getReviewRating(review)}/5)
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {review.type ? (
                                  <Badge className={getTypeBadgeColor(review.type)}>
                                    {review.type}
                                  </Badge>
                                ) : (
                                  <span className="text-sm text-gray-400">N/A</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm text-gray-900 max-w-md line-clamp-2">
                                  {getReviewText(review) || 'No review text'}
                                </p>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
              </>
            )}
          </TabsContent>

          {/* Product Reviews Tab */}
          <TabsContent value="product" className="mt-6">
            {(productReviewsReceived.length === 0 && productReviewsGiven.length === 0) ? (
              <Card className="border-0 shadow-md">
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No product reviews yet</h3>
                  <p className="text-gray-500">You haven't received or given any product reviews yet</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-8 gap-4 mb-6">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500 mb-1">Total Reviews</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500 mb-1">Received</p>
                      <p className="text-2xl font-bold text-green-600">{stats.reviewsReceived}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500 mb-1">Given</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.reviewsGiven}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500 mb-1">Avg Rating</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500 mb-1">5 Stars</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.fiveStar}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500 mb-1">4 Stars</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.fourStar}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500 mb-1">3 Stars</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.threeStar}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500 mb-1">2-1 Stars</p>
                      <p className="text-2xl font-bold text-gray-600">{stats.twoStar + stats.oneStar}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Summary Info */}
                {(reviewsReceived.length > 0 || reviewsGiven.length > 0) && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Showing:</strong> {reviewsReceived.length} review{reviewsReceived.length !== 1 ? 's' : ''} received for your products • {reviewsGiven.length} review{reviewsGiven.length !== 1 ? 's' : ''} you gave
                    </p>
                  </div>
                )}

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by product name, reviewer name, or review text..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Tabs value={ratingFilter} onValueChange={setRatingFilter}>
                    <TabsList>
                      <TabsTrigger value="all">All Ratings</TabsTrigger>
                      <TabsTrigger value="5">5 Stars</TabsTrigger>
                      <TabsTrigger value="4">4 Stars</TabsTrigger>
                      <TabsTrigger value="3">3 Stars</TabsTrigger>
                      <TabsTrigger value="2">2 Stars</TabsTrigger>
                      <TabsTrigger value="1">1 Star</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Reviews Display */}
                {viewMode === 'cards' ? (
                  <div className="space-y-4">
                    {filteredReviews.map((review) => (
                      <Card key={`product-${review.review_type || 'received'}-${review.id}`} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            {review.product?.main_image ? (
                              <img
                                src={getImageUrl(review.product.main_image)}
                                alt={review.product.name}
                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-br from-[#5a9c3a] to-[#0d7a3f] rounded-lg flex items-center justify-center flex-shrink-0">
                                <Package className="w-8 h-8 text-white" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-semibold text-gray-900">
                                      {review.product?.name || 'Product'}
                                    </h4>
                                    <Badge className={review.review_type === 'given' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                                      {review.review_type === 'given' ? 'Given' : 'Received'}
                                    </Badge>
                                    {review.review_type === 'received' && review.buyer && (
                                      <span className="text-sm text-gray-600">
                                        by {review.buyer.name || review.buyer.email || 'Anonymous'}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center">
                                      {renderStars(getReviewRating(review))}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {new Date(review.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {getReviewText(review) && (
                                <p className="text-sm text-gray-700 mt-2">{getReviewText(review)}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Reviewer
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rating
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Review
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredReviews.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                  No reviews found matching your search criteria
                                </td>
                              </tr>
                            ) : (
                              filteredReviews.map((review) => (
                                <tr key={`product-${review.review_type || 'received'}-${review.id}`} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                      {review.product?.main_image ? (
                                        <img
                                          src={getImageUrl(review.product.main_image)}
                                          alt={review.product.name}
                                          className="w-12 h-12 rounded-lg object-cover"
                                        />
                                      ) : (
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#5a9c3a] to-[#0d7a3f] rounded-lg flex items-center justify-center">
                                          <Package className="w-6 h-6 text-white" />
                                        </div>
                                      )}
                                      <div>
                                        <div className="text-sm font-medium text-gray-900">
                                          {review.product?.name || 'Product'}
                                        </div>
                                        <Badge className={review.review_type === 'given' ? 'bg-blue-100 text-blue-800 text-xs mt-1' : 'bg-green-100 text-green-800 text-xs mt-1'}>
                                          {review.review_type === 'given' ? 'Given' : 'Received'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {review.review_type === 'received' 
                                        ? (review.buyer?.name || review.buyer?.email || 'Anonymous')
                                        : 'You'}
                                    </div>
                                    {review.review_type === 'received' && review.buyer?.email && (
                                      <div className="text-sm text-gray-500">
                                        {review.buyer.email}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      {renderStars(getReviewRating(review))}
                                      <span className="ml-2 text-sm text-gray-600">
                                        ({getReviewRating(review)}/5)
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <p className="text-sm text-gray-900 max-w-md line-clamp-2">
                                      {getReviewText(review) || 'No review text'}
                                    </p>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(review.created_at).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

