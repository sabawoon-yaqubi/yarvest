"use client"

import { useEffect, useRef, useState } from "react"
import { Users, Package, Leaf, Heart } from "lucide-react"
import { useSafeTranslations } from "@/hooks/use-safe-translations"

function AnimatedNumber({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const duration = 1500
          const startTime = Date.now()
          const startValue = 0

          const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easeOutQuart = 1 - Math.pow(1 - progress, 4)
            const current = startValue + (value - startValue) * easeOutQuart

            setDisplayValue(current)

            if (progress < 1) {
              requestAnimationFrame(animate)
            } else {
              setDisplayValue(value)
            }
          }

          animate()
        }
      },
      { threshold: 0.2 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [value, hasAnimated])

  return (
    <span ref={ref}>
      {decimals > 0 ? displayValue.toFixed(decimals) : Math.floor(displayValue).toLocaleString()}
      {suffix}
    </span>
  )
}

export function StatsSection() {
  const t = useSafeTranslations("home")
  
  const stats = [
    {
      icon: Users,
      number: "500+",
      value: 500,
      label: t("communityMembers"),
      description: t("growingTogether"),
      iconColor: "text-blue-600",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100/50",
    },
    {
      icon: Package,
      number: "1,000+",
      value: 1000,
      label: t("productsAvailable"),
      description: t("freshLocal"),
      iconColor: "text-primary",
      gradient: "from-primary to-[#4d8236]",
      bgGradient: "from-primary/10 to-[#4d8236]/10",
    },
    {
      icon: Leaf,
      number: "50+",
      value: 50,
      label: t("localPartners"),
      description: t("supportingFarmers"),
      iconColor: "text-primary",
      gradient: "from-primary to-[#7ab856]",
      bgGradient: "from-primary/15 to-[#7ab856]/15",
    },
    {
      icon: Heart,
      number: "100%",
      value: 100,
      label: t("sustainable"),
      description: t("ecoFriendly"),
      iconColor: "text-red-500",
      gradient: "from-red-500 to-pink-500",
      bgGradient: "from-red-50 to-pink-50",
    },
  ]
  
  return (
    <section className="w-full relative overflow-hidden">
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-primary/5" />
      
      <div className="relative w-full bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-primary/10 shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {t("ourCommunity")}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            {t("communityDescription")}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            const isPercentage = stat.value === 100
            
            return (
              <div
                key={index}
                className="group relative text-center p-4 md:p-5 bg-white rounded-xl border border-gray-200/60 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 mb-3 bg-gradient-to-br ${stat.bgGradient} rounded-xl group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 md:w-7 md:h-7 ${stat.iconColor}`} />
                  </div>
                  
                  {/* Number */}
                  <div className="text-2xl md:text-3xl font-bold mb-1 text-foreground">
                    {isPercentage ? (
                      <AnimatedNumber value={stat.value} suffix="%" />
                    ) : (
                      <AnimatedNumber value={stat.value} suffix="+" />
                    )}
                  </div>
                  
                  {/* Label */}
                  <div className="text-foreground text-sm md:text-base font-semibold mb-1">{stat.label}</div>
                  
                  {/* Description */}
                  <div className="text-muted-foreground text-xs">{stat.description}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

