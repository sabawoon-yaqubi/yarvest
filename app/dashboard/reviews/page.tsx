"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Loader2, Download, User } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { getImageUrl } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"

const COLORS = {
  primary: "#5a9c3a",
  primaryDark: "#0d7a3f",
  primaryLight: "#7ab856",
  accent: "#e8f5e9",
}

export default function ReviewsPage() {
  const { user, isLoading: authLoading } = useAuthStore()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && user) {
      fetchReviews()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [authLoading, user])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await api.get('/user/reviews')
      const data = response.data?.data || response.data || []
      setReviews(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Error fetching reviews:', error)
      if (error.response?.status === 401) {
        toast.error('Please log in to view reviews')
      } else if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || 'Failed to load reviews')
      }
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const handleExportReviews = async () => {
    try {
      const response = await api.get('/user/reviews/export', {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `reviews_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
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
            <p className="text-gray-500 mt-1 text-sm">Reviews you've received from other users</p>
          </div>
          {reviews.length > 0 && (
            <Button
              variant="outline"
              onClick={handleExportReviews}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          )}
        </div>

        {reviews.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-500">You haven't received any reviews yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#5a9c3a] to-[#0d7a3f] rounded-full flex items-center justify-center flex-shrink-0">
                      {review.from?.image || review.from?.profile_picture ? (
                        <img
                          src={getImageUrl(review.from.image || review.from.profile_picture)}
                          alt={review.from.first_name || 'User'}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {review.from?.first_name && review.from?.last_name
                              ? `${review.from.first_name} ${review.from.last_name}`
                              : review.from?.email?.split('@')[0] || 'Anonymous'}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              {renderStars(review.rating || 0)}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

