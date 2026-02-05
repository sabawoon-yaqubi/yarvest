"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react"
import { useState } from "react"
import { submitContactForm } from "@/lib/contact-api"
import { useSafeTranslations } from "@/hooks/use-safe-translations"

export default function ContactPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const t = useSafeTranslations("contact")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await submitContactForm(formData)
      setFormData({ name: "", email: "", subject: "", message: "" })
    } catch (error) {
      // Error handling is done in the API function with toast notifications
      console.error("Contact form submission error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen bg-white">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{t("title")}</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t("subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Information */}
              <div className="space-y-6">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-3 bg-[#5a9c3a]/10 rounded-lg">
                        <Mail className="w-5 h-5 text-[#5a9c3a]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{t("email")}</h3>
                        <a href="mailto:hello@yarvest.health" className="text-[#5a9c3a] hover:underline text-sm">
                          {t("emailAddress")}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-3 bg-[#5a9c3a]/10 rounded-lg">
                        <Phone className="w-5 h-5 text-[#5a9c3a]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{t("phone")}</h3>
                        <a href="tel:+15551234567" className="text-[#5a9c3a] hover:underline text-sm">
                          {t("phoneNumber")}
                        </a>
                        <p className="text-gray-500 text-xs mt-1">{t("phoneHours")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#5a9c3a]/10 rounded-lg">
                        <MapPin className="w-5 h-5 text-[#5a9c3a]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{t("address")}</h3>
                        <p className="text-gray-600 text-sm">
                          {t("addressLine1")}<br />
                          {t("addressLine2")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("sendMessage")}</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            {t("name")}
                          </label>
                          <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="bg-white border-gray-300"
                            placeholder={t("namePlaceholder")}
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            {t("emailLabel")}
                          </label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="bg-white border-gray-300"
                            placeholder={t("emailPlaceholder")}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                          {t("subject")}
                        </label>
                        <Input
                          id="subject"
                          type="text"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          required
                          className="bg-white border-gray-300"
                          placeholder={t("subjectPlaceholder")}
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                          {t("message")}
                        </label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          required
                          rows={6}
                          className="bg-white border-gray-300"
                          placeholder={t("messagePlaceholder")}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t("sending")}
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            {t("sendMessageButton")}
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
