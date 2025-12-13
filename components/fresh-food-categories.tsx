"use client"

import Link from "next/link"
import { useRef, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ApiDataFetcher } from "./api-data-fetcher"
import { ApiCategoryCard, ApiCategory } from "./api-category-card"
import { CategoryCardSkeleton } from "./category-card-skeleton"

export function FreshFoodCategories({ title = true }: { title?: boolean }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      const hasScroll = scrollWidth > clientWidth
      setCanScrollLeft(hasScroll && scrollLeft > 5)
      setCanScrollRight(hasScroll && scrollLeft < scrollWidth - clientWidth - 5)
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      // Check scrollability after a short delay to ensure content is rendered
      const timeoutId = setTimeout(() => {
        checkScrollability()
      }, 100)
      
      container.addEventListener('scroll', checkScrollability)
      window.addEventListener('resize', checkScrollability)
      
      return () => {
        clearTimeout(timeoutId)
        container.removeEventListener('scroll', checkScrollability)
        window.removeEventListener('resize', checkScrollability)
      }
    }
  }, [])

  // Check scrollability when component updates (data loads)
  useEffect(() => {
    const checkInterval = setInterval(() => {
      checkScrollability()
    }, 100)
    
    const timeoutId = setTimeout(() => {
      checkScrollability()
      clearInterval(checkInterval)
    }, 1000)
    
    return () => {
      clearTimeout(timeoutId)
      clearInterval(checkInterval)
    }
  })

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      const currentScroll = scrollContainerRef.current.scrollLeft
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount
      
      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      })
    }
  }

  const renderLoading = () => (
    <div className="flex gap-4 min-w-max">
      <CategoryCardSkeleton count={50} variant="compact" />
    </div>
  )

  const renderEmpty = () => (
    <div className="text-center py-8 text-gray-500 w-full">
      <p>No categories available at the moment.</p>
    </div>
  )

  const renderError = (error: string) => (
    <div className="text-center py-8 text-gray-500 w-full">
      <p>Unable to load categories. Please try again later.</p>
    </div>
  )

  return (
    <div className="w-full relative">
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-10 gap-4">
          <div>
            <h3 className="text-xl md:text-4xl font-bold text-foreground">Shop by Category</h3>
            <p className="text-muted-foreground text-sm md:text-base mt-1 md:mt-2">Explore fresh, local, and organic produce</p>
          </div>
          <Link href="/categories" className="text-[#0A5D31] font-semibold hover:text-[#0d7a3f] text-sm md:text-base transition-colors self-end sm:self-auto">
            View All →
          </Link>
        </div>
      )}
      <div className="relative w-full">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2.5 hover:bg-gray-50 transition-all border border-gray-200 hidden md:flex items-center justify-center w-10 h-10"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}
        
        {/* Scrollable Container */}
        <div 
          ref={scrollContainerRef}
          className="w-full overflow-x-auto overflow-y-hidden scroll-smooth md:px-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{ 
            WebkitOverflowScrolling: 'touch'
          }}
          onScroll={checkScrollability}
        >
          <div className="px-2">
            <ApiDataFetcher<ApiCategory>
              url="/categories"
              limit={1000}
              gridClassName="flex gap-4 py-2 min-w-max"
              renderItem={(category) => {
                if (!category.unique_id) {
                  console.warn("Category missing unique_id:", category)
                  return null
                }
                
                return (
                  <div key={category.id} className="flex-shrink-0">
                    <ApiCategoryCard
                      category={category}
                      variant="compact"
                    />
                  </div>
                )
              }}
              renderLoading={renderLoading}
              renderEmpty={renderEmpty}
              renderError={renderError}
            />
          </div>
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2.5 hover:bg-gray-50 transition-all border border-gray-200 hidden md:flex items-center justify-center w-10 h-10"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        )}
      </div>
    </div>
  )
}
