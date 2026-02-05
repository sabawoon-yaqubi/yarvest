"use client"

import { Search, ShoppingCart, Truck, Heart } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useSafeTranslations } from "@/hooks/use-safe-translations"

export function HowItWorks() {
  const t = useSafeTranslations("home")
  
  const steps = [
    {
      icon: Search,
      title: t("browseDiscover"),
      description: t("browseDiscoverDescription"),
      step: "01",
    },
    {
      icon: ShoppingCart,
      title: t("addToCart"),
      description: t("addToCartDescription"),
      step: "02",
    },
    {
      icon: Truck,
      title: t("fastDelivery"),
      description: t("fastDeliveryDescription"),
      step: "03",
    },
    {
      icon: Heart,
      title: t("enjoySupport"),
      description: t("enjoySupportDescription"),
      step: "04",
    },
  ]
  
  return (
    <div className="w-full">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-foreground mb-3">{t("howItWorks")}</h2>
        <p className="text-muted-foreground text-base max-w-2xl mx-auto">
          {t("howItWorksDescription")}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <Card
              key={index}
              className="p-6 bg-card border border-border rounded-2xl hover:shadow-xl transition-all duration-300 text-center relative overflow-hidden group"
            >
              <div className="absolute top-4 right-4 text-6xl font-bold text-[#5a9c3a]/10 group-hover:text-[#5a9c3a]/20 transition-colors">
                {step.step}
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#5a9c3a]/10 rounded-2xl mb-4 group-hover:bg-[#5a9c3a] transition-colors">
                  <Icon className="w-8 h-8 text-[#5a9c3a] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

