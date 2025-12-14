"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileCheck, Loader2, CheckCircle2, Clock, XCircle } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/auth-store"

const COLORS = {
  primary: "#5a9c3a",
  primaryDark: "#0d7a3f",
  primaryLight: "#7ab856",
  accent: "#e8f5e9",
}

export default function VerificationsPage() {
  const { user, isLoading: authLoading } = useAuthStore()
  const [verifications, setVerifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && user) {
      fetchVerifications()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [authLoading, user])

  const fetchVerifications = async () => {
    try {
      setLoading(true)
      const response = await api.get('/user/verifications')
      const data = response.data?.data || response.data || []
      setVerifications(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Error fetching verifications:', error)
      if (error.response?.status === 401) {
        toast.error('Please log in to view verifications')
      } else if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || 'Failed to load verifications')
      }
      setVerifications([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'verified':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status || 'Pending'}</Badge>
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
          <h1 className="text-3xl font-bold text-gray-900">Verifications</h1>
          <p className="text-gray-500 mt-1 text-sm">Your verification status and documents</p>
        </div>

        {verifications.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No verifications</h3>
              <p className="text-gray-500">You haven't submitted any verification requests yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verifications.map((verification) => (
              <Card key={verification.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        verification.status === 'verified' ? 'bg-green-100' : 
                        verification.status === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        {getStatusIcon(verification.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {verification.verification_type?.name || 'Verification'}
                        </h3>
                        <p className="text-sm text-gray-500">Submitted {new Date(verification.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {getStatusBadge(verification.status)}
                  </div>
                  {verification.notes && (
                    <p className="text-sm text-gray-600 mt-4">{verification.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

