"use client"

import { ArrowRight } from "lucide-react"
import { ApiProducer } from "@/types/producer"
import { ApiDataFetcher } from "./api-data-fetcher"
import { ProducerCardSkeleton } from "./producer-card-skeleton"
import { ProducerCard } from "./producer-card"
import { useSafeTranslations } from "@/hooks/use-safe-translations"
import { Link } from "@/routing"

export function ProducersSection() {
  const t = useSafeTranslations("home")
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="font-bold text-2xl sm:text-4xl text-foreground">{t("meetOurProducers")}</h3>
          <p className="text-muted-foreground text-base mt-2 hidden sm:block">{t("producersDescription")}</p>
        </div>
        <Link href="/producers" className="text-[#5a9c3a] font-semibold hover:text-[#0d7a3f] text-sm transition-colors flex items-center gap-1">
          {t("viewAll")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <ApiDataFetcher<ApiProducer>
        url="/stores/producers"
        limit={4}
        page={1}
        gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        renderItem={(producer) => (
          <ProducerCard key={producer.id} producer={producer} />
        )}
        renderLoading={() => <ProducerCardSkeleton count={4} />}
        renderEmpty={() => (
          <div className="text-center py-12 col-span-full">
            <p className="text-muted-foreground">No producers available at the moment.</p>
          </div>
        )}
      />
    </div>
  )
}
