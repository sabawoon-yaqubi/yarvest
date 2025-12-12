"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HelpCircle, Search, MessageCircle, Mail, Phone, ChevronDown, ArrowRight } from "lucide-react"
import { useState, useMemo } from "react"
import { getAllCategoriesWithFAQs, searchFAQs } from "@/lib/faq-data"
import type { FAQCategory, FAQ } from "@/types/faq"

const contactOptions = [
  { icon: MessageCircle, title: "Live Chat", description: "Chat with our support team", action: "Start Chat" },
  { icon: Mail, title: "Email Support", description: "support@yarvest.com", action: "Send Email" },
  { icon: Phone, title: "Phone Support", description: "(415) 555-0123", action: "Call Now" },
]

export default function HelpPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)

  // Get all categories with FAQs
  const allCategories = useMemo(() => getAllCategoriesWithFAQs(), [])

  // Filter FAQs based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return allCategories
    }

    // Search through FAQs
    const matchingFAQs = searchFAQs(searchQuery)
    const categoryIds = new Set(matchingFAQs.map((faq) => faq.categoryId))

    // Return categories that have matching FAQs
    return allCategories
      .map((category) => {
        const matchingCategoryFAQs = matchingFAQs.filter(
          (faq) => faq.categoryId === category.id
        )
        if (matchingCategoryFAQs.length === 0) return null

        return {
          ...category,
          faqs: matchingCategoryFAQs.sort((a, b) => (a.order || 0) - (b.order || 0)),
        } as FAQCategory
      })
      .filter((category): category is FAQCategory => category !== null && category.faqs !== undefined)
  }, [searchQuery, allCategories])

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto bg-white">
        {/* Clean Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0A5D31]/10 rounded-2xl mb-4">
                <HelpCircle className="w-8 h-8 text-[#0A5D31]" />
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-3">How can we help?</h1>
              <p className="text-lg text-gray-600">Find answers to common questions or get in touch</p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 h-14 text-base rounded-2xl border-2 border-gray-200 focus:border-[#0A5D31] focus:ring-4 focus:ring-[#0A5D31]/20 bg-white"
              />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {contactOptions.map((option, idx) => (
              <div
                key={idx}
                className="bg-[#0A5D31] rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <option.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">{option.title}</h3>
                <p className="text-white/90 text-sm mb-4">{option.description}</p>
                <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
                  {option.action}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>

          {/* FAQ Categories */}
          <div className="space-y-4">
            {filteredCategories.map((category) => {
              const IconComponent = category.icon
              const isExpanded = expandedCategory === category.id
              
              return (
                <div key={category.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#0A5D31]/10 rounded-xl flex items-center justify-center">
                        {typeof IconComponent === "string" ? (
                          <HelpCircle className="w-5 h-5 text-[#0A5D31]" />
                        ) : (
                          <IconComponent className="w-5 h-5 text-[#0A5D31]" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {category.faqs?.length || 0}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isExpanded && category.faqs && category.faqs.length > 0 && (
                    <div className="px-6 pb-6 space-y-3 border-t border-gray-100 pt-4">
                      {category.faqs.map((faq) => {
                        const isQuestionExpanded = expandedQuestion === faq.id
                        return (
                          <div key={faq.id} className="group">
                            <button
                              onClick={() => setExpandedQuestion(isQuestionExpanded ? null : faq.id)}
                              className="w-full text-left p-4 rounded-xl hover:bg-[#0A5D31]/5 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <h4 className="font-semibold text-gray-900 flex-1">{faq.question}</h4>
                                <ChevronDown
                                  className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${
                                    isQuestionExpanded ? "rotate-180" : ""
                                  }`}
                                />
                              </div>
                            </button>
                            {isQuestionExpanded && (
                              <div className="px-4 pb-4 text-gray-600 leading-relaxed">
                                {faq.answer}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* No Results */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-16">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">Try different search terms or contact our support team</p>
              <Button className="bg-[#0A5D31] hover:bg-[#0d7a3f] text-white">
                Contact Support
              </Button>
            </div>
          )}
        </div>
        <Footer />
      </main>
    </div>
  )
}
