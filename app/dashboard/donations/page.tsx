"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { HeartHandshake, Loader2, Calendar, DollarSign } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/auth-store"
import { useSafeTranslations } from "@/hooks/use-safe-translations"

const COLORS = {
  primary: "#5a9c3a",
  primaryDark: "#0d7a3f",
  primaryLight: "#7ab856",
  accent: "#e8f5e9",
}

export default function DonationsPage() {
  const { user, isLoading: authLoading } = useAuthStore()
  const t = useSafeTranslations("donations")
  const [donations, setDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && user) {
      fetchDonations()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [authLoading, user])

  const fetchDonations = async () => {
    try {
      setLoading(true)
      const response = await api.get('/user/donations')
      const data = response.data?.data || response.data || []
      setDonations(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Error fetching donations:', error)
      if (error.response?.status === 401) {
        toast.error(t("pleaseLogin"))
      } else if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || t("failedToLoad"))
      }
      setDonations([])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: COLORS.primary }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-8xl mx-auto px-10 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-500 mt-1 text-sm">{t("subtitle")}</p>
        </div>

        {donations.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <HeartHandshake className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("noDonationsYet")}</h3>
              <p className="text-gray-500">{t("noDonationsMessage")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {donations.map((donation) => (
              <Card key={donation.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#5a9c3a]/10 rounded-lg">
                        <HeartHandshake className="w-5 h-5" style={{ color: COLORS.primary }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {donation.donation?.title || t("donation")}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {donation.donation?.description || t("supportingCommunity")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(donation.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" style={{ color: COLORS.primary }} />
                      <span className="text-lg font-bold" style={{ color: COLORS.primary }}>
                        {formatCurrency(parseFloat(donation.amount || 0))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

