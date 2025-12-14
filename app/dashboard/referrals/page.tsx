"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Loader2, UserPlus, Gift } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/auth-store"

const COLORS = {
  primary: "#5a9c3a",
  primaryDark: "#0d7a3f",
  primaryLight: "#7ab856",
  accent: "#e8f5e9",
}

export default function ReferralsPage() {
  const { user, isLoading: authLoading } = useAuthStore()
  const [referrals, setReferrals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [referralCode, setReferralCode] = useState<string>('')

  useEffect(() => {
    if (!authLoading && user) {
      fetchReferrals()
      fetchReferralCode()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [authLoading, user])

  const fetchReferrals = async () => {
    try {
      setLoading(true)
      const response = await api.get('/user/referrals')
      const data = response.data?.data || response.data || []
      setReferrals(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Error fetching referrals:', error)
      if (error.response?.status === 401) {
        toast.error('Please log in to view referrals')
      } else if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || 'Failed to load referrals')
      }
      setReferrals([])
    } finally {
      setLoading(false)
    }
  }

  const fetchReferralCode = async () => {
    try {
      const response = await api.get('/user/referral-code')
      const code = response.data?.data?.code || response.data?.code || ''
      setReferralCode(code)
    } catch (error: any) {
      console.error('Error fetching referral code:', error)
      // Don't show error toast for referral code as it's optional
    }
  }

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode)
      toast.success('Referral code copied to clipboard!')
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Referrals</h1>
          <p className="text-gray-500 mt-1 text-sm">Invite friends and earn rewards</p>
        </div>

        {/* Referral Code Card */}
        {referralCode && (
          <Card className="border-0 shadow-md mb-6" style={{ background: `linear-gradient(135deg, ${COLORS.primary}15 0%, ${COLORS.accent} 100%)` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Referral Code</h3>
                  <div className="flex items-center gap-3">
                    <code className="px-4 py-2 bg-white rounded-lg text-lg font-mono font-bold text-gray-900 border-2" style={{ borderColor: COLORS.primary }}>
                      {referralCode}
                    </code>
                    <Button
                      onClick={copyReferralCode}
                      variant="outline"
                      className="gap-2"
                    >
                      Copy Code
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Share this code with friends to earn rewards when they sign up!
                  </p>
                </div>
                <div className="p-4 bg-white rounded-full">
                  <Gift className="w-8 h-8" style={{ color: COLORS.primary }} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Referrals List */}
        {referrals.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No referrals yet</h3>
              <p className="text-gray-500">Start referring friends to see them here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {referrals.map((referral) => (
              <Card key={referral.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#5a9c3a] to-[#0d7a3f] rounded-full flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {referral.referred_user?.first_name && referral.referred_user?.last_name
                            ? `${referral.referred_user.first_name} ${referral.referred_user.last_name}`
                            : referral.referred_user?.email?.split('@')[0] || 'User'}
                        </h3>
                        <p className="text-sm text-gray-500">{referral.referred_user?.email}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Referred on {new Date(referral.created_at).toLocaleDateString()}</p>
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

