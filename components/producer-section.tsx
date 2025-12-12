"use client"

import { ReactNode, useMemo } from "react"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { ApiProducerCard } from "./api-producer-card"
import { ProducerCardSkeleton } from "./producer-card-skeleton"
import { transformProducers, type TransformedProducer } from "@/lib/producer-api"
import { Button } from "@/components/ui/button"

interface ProducerSectionProps {
  url: string
  title: string
  description: string
  icon: ReactNode
  badge?: "Top Seller" | "Organic" | "Most Reviewed" | "New"
  limit?: number
  gridClassName?: string
}

interface ProducersResponse {
  stores?: any[]
  producers?: any[]
  data?: any[]
}

export function ProducerSection({
  url,
  title,
  description,
  icon,
  badge,
  limit = 4,
  gridClassName = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
}: ProducerSectionProps) {
  // Build URL with query parameters
  const params = new URLSearchParams()
  if (limit) params.set('limit', limit.toString())
  params.set('page', '1')
  const queryString = params.toString()
  const finalUrl = queryString ? `${url}?${queryString}` : url

  const { data, loading, error, refetch } = useApiFetch<ProducersResponse>(finalUrl, {
    enabled: true,
  })

  // Extract and transform producers
  const producers = useMemo(() => {
    if (!data) return []
    const rawProducers = data?.stores || data?.producers || data?.data || (Array.isArray(data) ? data : [])
    return transformProducers(rawProducers).slice(0, limit)
  }, [data, limit])

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {icon}
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          </div>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className={gridClassName}>
          <ProducerCardSkeleton count={limit} />
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            onClick={refetch}
            variant="outline"
            className="bg-[#0A5D31] text-white hover:bg-[#0d7a3f]"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && (!producers || producers.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No producers available at the moment.</p>
        </div>
      )}

      {/* Success state */}
      {!loading && !error && producers && producers.length > 0 && (
        <div className={gridClassName}>
          {producers.map((producer) => (
            <ApiProducerCard
              key={producer.id}
              producer={producer}
              badge={badge}
            />
          ))}
        </div>
      )}
    </div>
  )
}

