"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Plus, Edit, Trash2, Loader2, Save, X } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/auth-store"
import { useSafeTranslations } from "@/hooks/use-safe-translations"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const COLORS = {
  primary: "#5a9c3a",
  primaryDark: "#0d7a3f",
  primaryLight: "#7ab856",
  accent: "#e8f5e9",
}

export default function BankAccountsPage() {
  const { user, isLoading: authLoading } = useAuthStore()
  const t = useSafeTranslations("bankAccounts")
  const [bankAccounts, setBankAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null as number | null })
  const [editingAccount, setEditingAccount] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    account_name: '',
    bank_name: '',
    account_number: '',
    routing_number: '',
    account_type: '',
    status: true
  })

  useEffect(() => {
    if (!authLoading && user) {
      fetchBankAccounts()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [authLoading, user])

  const fetchBankAccounts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/user/bank-accounts')
      const data = response.data?.data || response.data || []
      setBankAccounts(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Error fetching bank accounts:', error)
      if (error.response?.status === 401) {
        toast.error(t("pleaseLogin"))
      } else if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || t("failedToLoad"))
      }
      setBankAccounts([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (account?: any) => {
    setErrors({})
    if (account) {
      setEditingAccount(account)
      setFormData({
        account_name: account.account_name || '',
        bank_name: account.bank_name || '',
        account_number: account.account_number || '',
        routing_number: account.routing_number || '',
        account_type: account.account_type || '',
        status: account.status ?? true
      })
    } else {
      setEditingAccount(null)
      setFormData({
        account_name: '',
        bank_name: '',
        account_number: '',
        routing_number: '',
        account_type: '',
        status: true
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    // Reset errors
    setErrors({})
    
    // Validate form
    const newErrors: Record<string, string> = {}
    if (!formData.account_name.trim()) {
      newErrors.account_name = t("accountNameRequired")
    }
    if (!formData.bank_name.trim()) {
      newErrors.bank_name = t("bankNameRequired")
    }
    if (!formData.account_number.trim()) {
      newErrors.account_number = t("accountNumberRequired")
    } else if (formData.account_number.length < 4) {
      newErrors.account_number = t("accountNumberMinLength")
    }
    if (formData.routing_number && formData.routing_number.length < 9) {
      newErrors.routing_number = t("routingNumberLength")
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    try {
      setSaving(true)
      if (editingAccount) {
        await api.put(`/user/bank-accounts/${editingAccount.id}`, formData)
        toast.success(t("bankAccountUpdated"))
      } else {
        await api.post('/user/bank-accounts', formData)
        toast.success(t("bankAccountAdded"))
      }
      setDialogOpen(false)
      setErrors({})
      await fetchBankAccounts()
    } catch (error: any) {
      console.error('Error saving bank account:', error)
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        toast.error(error.response?.data?.message || t("failedToSave"))
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.id) return
    try {
      await api.delete(`/user/bank-accounts/${deleteDialog.id}`)
      toast.success(t("bankAccountDeleted"))
      setDeleteDialog({ open: false, id: null })
      await fetchBankAccounts()
    } catch (error: any) {
      console.error('Error deleting bank account:', error)
      toast.error(error.response?.data?.message || t("failedToDelete"))
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
      <div className="max-w-8xl mx-auto px-10 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
            <p className="text-gray-500 mt-1 text-sm">{t("subtitle")}</p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            style={{ backgroundColor: COLORS.primary }}
            className="text-white hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("addAccount")}
          </Button>
        </div>

        {bankAccounts.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("noBankAccounts")}</h3>
              <p className="text-gray-500 mb-6">{t("noBankAccountsMessage")}</p>
              <Button
                onClick={() => handleOpenDialog()}
                style={{ backgroundColor: COLORS.primary }}
                className="text-white hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("addYourFirstAccount")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankAccounts.map((account) => (
              <Card key={account.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" style={{ color: COLORS.primary }} />
                      {account.account_name}
                    </CardTitle>
                    <Badge className={account.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {account.status ? t("active") : t("inactive")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t("bankName")}</p>
                      <p className="text-sm font-medium text-gray-900">{account.bank_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t("accountNumber")}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {account.account_number?.replace(/\d(?=\d{4})/g, '*') || '****'}
                      </p>
                    </div>
                    {account.routing_number && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t("routingNumber")}</p>
                        <p className="text-sm font-medium text-gray-900">{account.routing_number}</p>
                      </div>
                    )}
                    {account.account_type && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t("accountType")}</p>
                        <p className="text-sm font-medium text-gray-900">{account.account_type}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-6 pt-6 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(account)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {t("edit")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteDialog({ open: true, id: account.id })}
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t("delete")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-6">
          <DialogHeader className="pb-4">
            <DialogTitle>{editingAccount ? t("editBankAccount") : t("addBankAccount")}</DialogTitle>
            <DialogDescription>
              {editingAccount ? t("updateBankAccountInfo") : t("addNewBankAccount")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="account_name">{t("accountName")}</Label>
              <Input
                id="account_name"
                value={formData.account_name}
                onChange={(e) => {
                  setFormData({ ...formData, account_name: e.target.value })
                  if (errors.account_name) setErrors({ ...errors, account_name: '' })
                }}
                placeholder={t("accountNamePlaceholder")}
                className={`mt-1 ${errors.account_name ? 'border-red-500' : ''}`}
              />
              {errors.account_name && (
                <p className="text-sm text-red-500 mt-1">{errors.account_name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="bank_name">{t("bankName")}</Label>
              <Input
                id="bank_name"
                value={formData.bank_name}
                onChange={(e) => {
                  setFormData({ ...formData, bank_name: e.target.value })
                  if (errors.bank_name) setErrors({ ...errors, bank_name: '' })
                }}
                placeholder={t("bankNamePlaceholder")}
                className={`mt-1 ${errors.bank_name ? 'border-red-500' : ''}`}
              />
              {errors.bank_name && (
                <p className="text-sm text-red-500 mt-1">{errors.bank_name}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="account_number">{t("accountNumber")}</Label>
                <Input
                  id="account_number"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.account_number}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    setFormData({ ...formData, account_number: value })
                    if (errors.account_number) setErrors({ ...errors, account_number: '' })
                  }}
                  placeholder={t("accountNumberPlaceholder")}
                  className={`mt-1 ${errors.account_number ? 'border-red-500' : ''}`}
                />
                {errors.account_number && (
                  <p className="text-sm text-red-500 mt-1">{errors.account_number}</p>
                )}
              </div>
              <div>
                <Label htmlFor="routing_number">{t("routingNumber")}</Label>
                <Input
                  id="routing_number"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.routing_number}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    setFormData({ ...formData, routing_number: value })
                    if (errors.routing_number) setErrors({ ...errors, routing_number: '' })
                  }}
                  placeholder={t("routingNumberPlaceholder")}
                  className={`mt-1 ${errors.routing_number ? 'border-red-500' : ''}`}
                />
                {errors.routing_number && (
                  <p className="text-sm text-red-500 mt-1">{errors.routing_number}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="account_type">{t("accountType")}</Label>
              <Input
                id="account_type"
                value={formData.account_type}
                onChange={(e) => {
                  setFormData({ ...formData, account_type: e.target.value })
                  if (errors.account_type) setErrors({ ...errors, account_type: '' })
                }}
                placeholder={t("selectAccountType")}
                className={`mt-1 ${errors.account_type ? 'border-red-500' : ''}`}
              />
              {errors.account_type && (
                <p className="text-sm text-red-500 mt-1">{errors.account_type}</p>
              )}
            </div>
          </div>
          <DialogFooter className="pt-4 gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              style={{ backgroundColor: COLORS.primary }}
              className="text-white hover:opacity-90"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t("save")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteBankAccount")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteBankAccountWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

