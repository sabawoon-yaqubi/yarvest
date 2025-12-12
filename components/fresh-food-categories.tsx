"use client"

import Link from "next/link"
import { ApiDataFetcher } from "./api-data-fetcher"
import { ApiCategoryCard, ApiCategory } from "./api-category-card"
import { CategoryCardSkeleton } from "./category-card-skeleton"

export function FreshFoodCategories({ title = true }: { title?: boolean }) {
  const renderLoading = () => (
    <CategoryCardSkeleton count={12} variant="compact" />
  )

  const renderEmpty = () => (
    <div className="text-center py-8 text-gray-500 col-span-full">
      <p>No categories available at the moment.</p>
    </div>
  )

  const renderError = (error: string) => (
    <div className="text-center py-8 text-gray-500 col-span-full">
      <p>Unable to load categories. Please try again later.</p>
    </div>
  )

  return (
    <div className="w-full">
      {title && (
        <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-bold text-foreground">Shop by Category</h2>
          <p className="text-muted-foreground text-base mt-2">Explore fresh, local, and organic produce</p>
        </div>
        <Link href="/categories" className="text-[#0A5D31] font-semibold hover:text-[#0d7a3f] text-sm transition-colors">
          View All
        </Link>
      </div>
      )}
      <ApiDataFetcher<ApiCategory>
        url="/categories"
        gridClassName="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-4"
        renderItem={(category) => {
          if (!category.unique_id) {
            console.warn("Category missing unique_id:", category)
            return null
          }
          
          return (
            <ApiCategoryCard
              key={category.id}
              category={category}
              variant="compact"
            />
          )
        }}
        renderLoading={renderLoading}
        renderEmpty={renderEmpty}
        renderError={renderError}
      />
    </div>
  )
}
