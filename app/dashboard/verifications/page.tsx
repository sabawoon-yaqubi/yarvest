"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
// Using native select for now
import { FileCheck, Loader2, CheckCircle2, Clock, Plus, Shield, Upload, File, X } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/auth-store"
import { getImageUrl } from "@/lib/utils"

const COLORS = {
  primary: "#5a9c3a",
  primaryDark: "#0d7a3f",
  primaryLight: "#7ab856",
  accent: "#e8f5e9",
}

interface VerificationType {
  id: number
  name: string
}

interface Verification {
  id: number
  verification_type_id: number
  verification_type?: VerificationType
  document?: string | null
  created_at: string
  updated_at: string
}

export default function VerificationsPage() {
  const { user, isLoading: authLoading } = useAuthStore()
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [verificationTypes, setVerificationTypes] = useState<VerificationType[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [selectedTypeId, setSelectedTypeId] = useState<string>("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    if (!authLoading && user) {
      fetchData()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [authLoading, user])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [verificationsResponse, typesResponse] = await Promise.all([
        api.get('/user/verifications'),
        api.get('/verification-types'),
      ])
      
      const verificationsData = verificationsResponse.data?.data || []
      const typesData = typesResponse.data?.data || []
      
      setVerifications(Array.isArray(verificationsData) ? verificationsData : [])
      setVerificationTypes(Array.isArray(typesData) ? typesData : [])
    } catch (error: any) {
      console.error('Error fetching data:', error)
      if (error.response?.status === 401) {
        toast.error('Please log in to view verifications')
      } else if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || 'Failed to load verifications')
      }
      setVerifications([])
      setVerificationTypes([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitVerification = async () => {
    if (!selectedTypeId) {
      toast.error('Please select a verification type')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('verification_type_id', selectedTypeId)
      
      if (selectedFile) {
        formData.append('document', selectedFile)
      }

      const response = await api.post('/user/verifications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data?.success) {
        toast.success('Verification request submitted successfully!')
        setShowSubmitModal(false)
        setSelectedTypeId("")
        setSelectedFile(null)
        // Refresh verifications
        await fetchData()
      } else {
        toast.error(response.data?.message || 'Failed to submit verification')
      }
    } catch (error: any) {
      console.error('Error submitting verification:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.document?.[0] || 'Failed to submit verification request'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        toast.error('File type not supported. Please upload PDF, JPG, PNG, or DOC files')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  const getFileUrl = (documentPath: string | null | undefined) => {
    if (!documentPath) return null
    if (documentPath.startsWith('http')) return documentPath
    return getImageUrl(documentPath)
  }

  // Get available verification types (not already submitted)
  const availableTypes = verificationTypes.filter(
    type => !verifications.some(v => v.verification_type_id === type.id)
  )

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Verifications</h1>
            <p className="text-gray-500 mt-1 text-sm">Your verification status and documents</p>
          </div>
          {availableTypes.length > 0 && (
            <Button
              onClick={() => setShowSubmitModal(true)}
              className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Request Verification
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 mb-1">Total Verifications</p>
              <p className="text-2xl font-bold text-gray-900">{verifications.length}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 mb-1">Available Types</p>
              <p className="text-2xl font-bold text-blue-600">{availableTypes.length}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 mb-1">Submitted</p>
              <p className="text-2xl font-bold text-green-600">{verifications.length}</p>
            </CardContent>
          </Card>
        </div>

        {verifications.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No verifications</h3>
              <p className="text-gray-500 mb-4">You haven't submitted any verification requests yet</p>
              {availableTypes.length > 0 && (
                <Button
                  onClick={() => setShowSubmitModal(true)}
                  className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Request Your First Verification
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verifications.map((verification) => (
              <Card key={verification.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {verification.verification_type?.name || 'Verification'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Submitted {new Date(verification.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Submitted</Badge>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    <p className="text-xs text-gray-500">
                      Status: <span className="font-medium text-gray-700">Under Review</span>
                    </p>
                    {verification.document && (
                      <div className="flex items-center gap-2 mt-2">
                        <File className="w-4 h-4 text-gray-500" />
                        <a
                          href={getFileUrl(verification.document) || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline truncate"
                        >
                          View Document
                        </a>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Your verification request is being processed by our team.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Submit Verification Modal */}
        <Dialog open={showSubmitModal} onOpenChange={(open) => {
          setShowSubmitModal(open)
          if (!open) {
            setSelectedTypeId("")
            setSelectedFile(null)
          }
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-xl">Request New Verification</DialogTitle>
              <DialogDescription className="text-sm">
                Select a verification type and upload supporting documents. Your request will be reviewed by our team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 p-4">
              <div className="space-y-2">
                <Label htmlFor="verification-type" className="text-sm font-medium">
                  Verification Type <span className="text-red-500">*</span>
                </Label>
                <select
                  id="verification-type"
                  value={selectedTypeId}
                  onChange={(e) => setSelectedTypeId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-[#5a9c3a] focus:border-[#5a9c3a]"
                >
                  <option value="">Select a verification type</option>
                  {availableTypes.map((type) => (
                    <option key={type.id} value={type.id.toString()}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document" className="text-sm font-medium">
                  Supporting Document <span className="text-gray-500 text-xs">(Optional)</span>
                </Label>
                <div className="space-y-2">
                  {!selectedFile ? (
                    <label
                      htmlFor="document"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#5a9c3a] hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG, DOC (MAX. 10MB)</p>
                      </div>
                      <input
                        id="document"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileSelect}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <File className="w-5 h-5 text-gray-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSubmitModal(false)
                  setSelectedTypeId("")
                  setSelectedFile(null)
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitVerification}
                disabled={submitting || !selectedTypeId}
                className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
