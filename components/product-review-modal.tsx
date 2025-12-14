"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { getImageUrl } from "@/lib/utils"
import api from "@/lib/axios"
import { toast } from "sonner"

interface ProductReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: {
    id: number
    unique_id: string
    name: string
    main_image?: string
  }
  orderId?: number
  onReviewSubmitted?: () => void
}

export function ProductReviewModal({
  open,
  onOpenChange,
  product,
  orderId,
  onReviewSubmitted,
}: ProductReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating before submitting your review.")
      return
    }

    setIsSubmitting(true)
    try {
      const payload: any = {
        stars: rating,
        message: message.trim() || null,
      }
      if (orderId) {
        payload.order_id = orderId
      }
      
      const response = await api.post(`/products/${product.id}/reviews`, payload)

      if (response.data.success) {
        toast.success("Thank you for your review!")
        // Reset form
        setRating(0)
        setMessage("")
        setHoveredRating(0)
        onOpenChange(false)
        onReviewSubmitted?.()
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to submit review. Please try again."
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with this product
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 pb-2">
          {/* Product Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            {product.main_image && (
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                <img
                  src={getImageUrl(product.main_image)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm truncate">
                {product.name}
              </h4>
              <p className="text-xs text-gray-500 font-mono">
                #{product.unique_id}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={isSubmitting}
                  className="focus:outline-none transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-sm text-gray-600 ml-2">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </span>
              )}
            </div>
          </div>

          {/* Review Message */}
          <div className="space-y-2">
            <label htmlFor="review-message" className="text-sm font-medium text-gray-900">
              Your Review (Optional)
            </label>
            <Textarea
              id="review-message"
              placeholder="Tell others about your experience with this product..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting}
              rows={4}
              maxLength={1000}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 text-right">
              {message.length}/1000 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            style={{ backgroundColor: "#5a9c3a" }}
            className="text-white hover:opacity-90"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

