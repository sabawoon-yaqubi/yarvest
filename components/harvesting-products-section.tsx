"use client"

import { ProductCard } from "./product-card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, ArrowRight } from "lucide-react"
import Link from "next/link"

const featuredHarvestingProducts = [
  {
    id: 1,
    name: "Professional Harvesting Basket",
    price: 45.99,
    unit: "each",
    code: "HB001",
    image: "https://images.unsplash.com/photo-1585320806297-9794b0e4ee87?w=500&h=500&fit=crop",
    producer: "Farm Tools Co.",
    rating: 4.8,
    reviews: 156,
    badge: "Best Seller",
    organic: false,
  },
  {
    id: 2,
    name: "Stainless Steel Pruning Shears",
    price: 29.99,
    unit: "pair",
    code: "PS002",
    image: "https://images.unsplash.com/photo-1585320806297-9794b0e4ee87?w=500&h=500&fit=crop",
    producer: "Garden Essentials",
    rating: 4.9,
    reviews: 203,
    badge: "New",
    organic: false,
  },
  {
    id: 3,
    name: "Harvesting Gloves Set",
    price: 18.99,
    unit: "pair",
    code: "HG003",
    image: "https://images.unsplash.com/photo-1585320806297-9794b0e4ee87?w=500&h=500&fit=crop",
    producer: "Farm Tools Co.",
    rating: 4.7,
    reviews: 89,
    badge: null,
    organic: false,
  },
  {
    id: 4,
    name: "Fruit Picking Pole",
    price: 39.99,
    unit: "each",
    code: "FP004",
    image: "https://images.unsplash.com/photo-1585320806297-9794b0e4ee87?w=500&h=500&fit=crop",
    producer: "Harvest Pro",
    rating: 4.6,
    reviews: 67,
    badge: null,
    organic: false,
  },
]

export function HarvestingProductsSection() {
  return (
    <div className="py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Harvesting Products</h2>
          <p className="text-lg text-gray-600">Essential tools and equipment for efficient harvesting</p>
        </div>
        <Link href="/harvesting-products">
          <Button variant="outline" className="hidden md:flex items-center gap-2 border-2 border-gray-200 hover:border-[#0A5D31] rounded-full">
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredHarvestingProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            unit={product.unit}
            code={product.code}
            image={product.image}
            producer={product.producer}
            rating={product.rating}
            reviews={product.reviews}
            badge={product.badge}
            organic={product.organic}
          />
        ))}
      </div>
      <div className="mt-8 text-center md:hidden">
        <Link href="/harvesting-products">
          <Button className="bg-[#0A5D31] hover:bg-[#0d7a3f] text-white rounded-full px-8">
            View All Products
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}





