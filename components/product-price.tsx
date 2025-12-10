"use client"

interface Product {
  price: number
  unit: string
}

interface ProductPriceProps {
  product: Product
}

export function ProductPrice({ product }: ProductPriceProps) {
  return (
    <div className="mb-6 pb-6 border-b border-gray-200">
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-[#0A5D31]">${product.price.toFixed(2)}</span>
        <span className="text-gray-500">{product.unit}</span>
      </div>
    </div>
  )
}





