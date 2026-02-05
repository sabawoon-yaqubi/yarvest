"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Gift,
  Percent,
  Calendar,
  Tag,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Search
} from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useSafeTranslations } from "@/hooks/use-safe-translations"

const mockPromotions = [
  {
    id: 1,
    name: "Free Organic Tomatoes",
    type: "free_product",
    product: "Organic Heirloom Tomatoes",
    discount: 100,
    minPurchase: 0,
    maxUses: 100,
    used: 45,
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    code: "FREETOMATO",
  },
  {
    id: 2,
    name: "Buy 2 Get 1 Free",
    type: "buy_x_get_y",
    product: "Fresh Local Carrots",
    discount: 33,
    minPurchase: 2,
    maxUses: 50,
    used: 12,
    status: "active",
    startDate: "2024-01-10",
    endDate: "2024-01-31",
    code: "B2G1CARROT",
  },
  {
    id: 3,
    name: "20% Off All Fruits",
    type: "percentage",
    category: "Fruits",
    discount: 20,
    minPurchase: 25,
    maxUses: 200,
    used: 89,
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    code: "FRUIT20",
  },
  {
    id: 4,
    name: "Free Shipping",
    type: "free_shipping",
    discount: 0,
    minPurchase: 50,
    maxUses: 500,
    used: 234,
    status: "expired",
    startDate: "2023-12-01",
    endDate: "2023-12-31",
    code: "FREESHIP50",
  },
]

export default function PromotionsPage() {
  const t = useSafeTranslations("admin.promotions")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPromo, setEditingPromo] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    type: "free_product",
    product: "",
    category: "",
    discount: "",
    minPurchase: "",
    maxUses: "",
    startDate: "",
    endDate: "",
    code: "",
  })

  const handleSave = () => {
    console.log("Saving promotion:", formData)
    setShowAddModal(false)
    setEditingPromo(null)
    setFormData({
      name: "",
      type: "free_product",
      product: "",
      category: "",
      discount: "",
      minPurchase: "",
      maxUses: "",
      startDate: "",
      endDate: "",
      code: "",
    })
  }

  const handleEdit = (promo: any) => {
    setEditingPromo(promo)
    setFormData({
      name: promo.name,
      type: promo.type,
      product: promo.product || "",
      category: promo.category || "",
      discount: promo.discount.toString(),
      minPurchase: promo.minPurchase?.toString() || "",
      maxUses: promo.maxUses.toString(),
      startDate: promo.startDate,
      endDate: promo.endDate,
      code: promo.code,
    })
    setShowAddModal(true)
  }

  const filteredPromotions = mockPromotions.filter((promo) =>
    promo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    promo.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t("title")}</h1>
          <p className="text-gray-600">{t("subtitle")}</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-[#5a9c3a] to-[#0d7a3f] hover:from-[#0d7a3f] hover:to-[#5a9c3a] text-white gap-2 shadow-lg"
          onClick={() => {
            setEditingPromo(null)
            setFormData({
              name: "",
              type: "free_product",
              product: "",
              category: "",
              discount: "",
              minPurchase: "",
              maxUses: "",
              startDate: "",
              endDate: "",
              code: "",
            })
            setShowAddModal(true)
          }}
        >
          <Plus className="w-5 h-5" />
          {t("createPromotion")}
        </Button>
      </div>

      {/* Search */}
      <Card className="border-2 shadow-lg">
        <CardContent className="p-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder={t("searchPromotions")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 border-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPromotions.map((promo) => (
          <Card key={promo.id} className="border-2 hover:shadow-xl transition-all overflow-hidden">
            <div className={`h-2 ${
              promo.status === "active" ? "bg-gradient-to-r from-[#5a9c3a] to-[#0d7a3f]" : "bg-gray-300"
            }`} />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{promo.name}</CardTitle>
                  <Badge className={`${
                    promo.status === "active" 
                      ? "bg-emerald-500 text-white" 
                      : "bg-gray-400 text-white"
                  }`}>
                    {promo.status === "active" ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {promo.status}
                  </Badge>
                </div>
                {promo.type === "free_product" && (
                  <Gift className="w-6 h-6 text-[#5a9c3a]" />
                )}
                {promo.type === "percentage" && (
                  <Percent className="w-6 h-6 text-[#5a9c3a]" />
                )}
                {promo.type === "free_shipping" && (
                  <Tag className="w-6 h-6 text-[#5a9c3a]" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">{t("promoCode")}</p>
                <p className="font-mono font-bold text-lg text-[#5a9c3a]">{promo.code}</p>
              </div>
              
              <div className="space-y-2 text-sm">
                {promo.product && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t("product")}</span>
                    <span className="font-semibold text-gray-900">{promo.product}</span>
                  </div>
                )}
                {promo.category && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t("category")}</span>
                    <span className="font-semibold text-gray-900">{promo.category}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t("discount")}</span>
                  <span className="font-semibold text-[#5a9c3a]">
                    {promo.type === "free_product" ? t("hundredPercentFree") : 
                     promo.type === "free_shipping" ? t("freeShipping") :
                     t("percentOff", { percent: promo.discount })}
                  </span>
                </div>
                {promo.minPurchase > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t("minPurchase")}</span>
                    <span className="font-semibold text-gray-900">${promo.minPurchase}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t("usage")}</span>
                  <span className="font-semibold text-gray-900">{promo.used} / {promo.maxUses}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
                <Calendar className="w-4 h-4" />
                <span>{new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-2 hover:border-[#5a9c3a] hover:bg-[#5a9c3a] hover:text-white"
                  onClick={() => handleEdit(promo)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {t("edit")}
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Promotion Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingPromo ? t("editPromotion") : t("createNewPromotion")}
            </DialogTitle>
            <DialogDescription>
              {t("setUpDiscounts")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div>
              <Label htmlFor="name" className="text-base font-semibold">{t("promotionName")}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Free Organic Tomatoes"
                className="mt-2 h-12 border-2"
              />
            </div>

            <div>
              <Label htmlFor="type" className="text-base font-semibold">{t("promotionType")}</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-2 w-full h-12 px-4 rounded-lg border-2 border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-[#5a9c3a] focus:border-[#5a9c3a]"
              >
                <option value="free_product">{t("freeProduct")}</option>
                <option value="buy_x_get_y">{t("buyXGetYFree")}</option>
                <option value="percentage">{t("percentageDiscount")}</option>
                <option value="free_shipping">{t("freeShipping")}</option>
                <option value="fixed_amount">{t("fixedAmountDiscount")}</option>
              </select>
            </div>

            {formData.type === "free_product" && (
              <div>
                <Label htmlFor="product" className="text-base font-semibold">{t("selectProduct")}</Label>
                <select
                  id="product"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  className="mt-2 w-full h-12 px-4 rounded-lg border-2 border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-[#5a9c3a] focus:border-[#5a9c3a]"
                >
                  <option value="">{t("selectAProduct")}</option>
                  <option value="Organic Heirloom Tomatoes">Organic Heirloom Tomatoes</option>
                  <option value="Fresh Local Carrots">Fresh Local Carrots</option>
                  <option value="Sweet Local Apples">Sweet Local Apples</option>
                </select>
              </div>
            )}

            {formData.type === "percentage" && (
              <div>
                <Label htmlFor="category" className="text-base font-semibold">{t("selectCategory")}</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-2 w-full h-12 px-4 rounded-lg border-2 border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-[#5a9c3a] focus:border-[#5a9c3a]"
                >
                  <option value="">{t("allProducts")}</option>
                  <option value="Vegetables">{t("vegetables")}</option>
                  <option value="Fruits">{t("fruits")}</option>
                  <option value="Herbs">{t("herbs")}</option>
                </select>
              </div>
            )}

            {(formData.type === "percentage" || formData.type === "fixed_amount") && (
              <div>
                <Label htmlFor="discount" className="text-base font-semibold">
                  {formData.type === "percentage" ? t("discountPercentage") : t("discountAmount")}
                </Label>
                <Input
                  id="discount"
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder={formData.type === "percentage" ? "e.g., 20" : "e.g., 10.00"}
                  className="mt-2 h-12 border-2"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minPurchase" className="text-base font-semibold">{t("minimumPurchase")}</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  step="0.01"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                  placeholder="0.00"
                  className="mt-2 h-12 border-2"
                />
              </div>
              <div>
                <Label htmlFor="maxUses" className="text-base font-semibold">{t("maxUses")}</Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  placeholder="100"
                  className="mt-2 h-12 border-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-base font-semibold">{t("startDate")}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-2 h-12 border-2"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-base font-semibold">{t("endDate")}</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-2 h-12 border-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="code" className="text-base font-semibold">{t("promoCodeLabel")}</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="FREETOMATO"
                className="mt-2 h-12 border-2 font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">{t("customersWillUseCode")}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)} className="h-12">
              {t("cancel", { ns: "common" })}
            </Button>
            <Button 
              className="bg-gradient-to-r from-[#5a9c3a] to-[#0d7a3f] hover:from-[#0d7a3f] hover:to-[#5a9c3a] text-white h-12"
              onClick={handleSave}
            >
              {editingPromo ? t("updatePromotion") : t("createPromotionButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

