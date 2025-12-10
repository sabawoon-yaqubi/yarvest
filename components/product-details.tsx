"use client"

import { Card } from "@/components/ui/card"
import { MapPin, Leaf, Shield } from "lucide-react"

interface Product {
  description: string
  details?: {
    origin: string
    organic: boolean
    pesticide_free: boolean
    season: string
    harvested: string
  }
  nutritionFacts?: {
    calories: number
    protein: string
    carbs: string
    fiber: string
  }
}

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 rounded-xl border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">About This Product</h3>
          <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>

          {product.details && (
            <>
              <h4 className="font-semibold text-gray-900 mb-3">Farm Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#0A5D31]" />
                  <span className="text-gray-700">Origin: {product.details.origin}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-[#0A5D31]" />
                  <span className="text-gray-700">Certified Organic: {product.details.organic ? "Yes" : "No"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#0A5D31]" />
                  <span className="text-gray-700">Pesticide Free: {product.details.pesticide_free ? "Yes" : "No"}</span>
                </div>
                <div className="pt-2 space-y-1">
                  <p className="text-gray-700">
                    <span className="font-medium">Season:</span> {product.details.season}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Harvested:</span> {product.details.harvested}
                  </p>
                </div>
              </div>
            </>
          )}
        </Card>

        {product.nutritionFacts && (
          <Card className="p-6 rounded-xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Nutrition Facts</h3>
            <p className="text-sm text-gray-500 mb-4">Per serving (100g)</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-700">Calories</span>
                <span className="font-semibold">{product.nutritionFacts.calories}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-700">Protein</span>
                <span className="font-semibold">{product.nutritionFacts.protein}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-700">Carbohydrates</span>
                <span className="font-semibold">{product.nutritionFacts.carbs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Dietary Fiber</span>
                <span className="font-semibold">{product.nutritionFacts.fiber}</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}





