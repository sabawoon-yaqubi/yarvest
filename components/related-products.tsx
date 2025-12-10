"use client"

import { ProductCard } from "./product-card"

interface Product {
  id: number
  name: string
  price: number | string
  unit: string
  code: string
  image: string
  producer: string
  rating: number
  reviews: number
  badge?: string | null
  organic?: boolean
}

interface RelatedProductsProps {
  products: Product[]
  favorites?: number[]
  onToggleFavorite?: (productId: number) => void
}

export function RelatedProducts({ products, favorites = [], onToggleFavorite }: RelatedProductsProps) {
  return (
    <div className="mt-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product) => (
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
            isFavorite={favorites.includes(product.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  )
}





