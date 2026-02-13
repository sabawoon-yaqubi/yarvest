
"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight, Smartphone, Loader2, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useSafeTranslations, useSafeLocale } from "@/hooks/use-safe-translations"
import { getLocalizedPath } from "@/lib/locale-utils"
import { type Locale } from '@/i18n'
import { subscribeToNewsletter } from "@/lib/newsletter-api"

export function Footer() {
  const t = useSafeTranslations('footer')
  const locale = useSafeLocale()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      return
    }

    setIsLoading(true)
    try {
      await subscribeToNewsletter(email.trim())
      setEmail("")
      setSubscribed(true)
      setTimeout(() => setSubscribed(false), 5000)
    } catch (error) {
      // Error handling is done in the API function with toast notifications
      console.error("Newsletter subscription error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-5">
            <Link href={getLocalizedPath('/', locale as Locale)} className="flex items-center group">
              <img
                src="https://cdn.prod.website-files.com/67c12ad0bddda4257ffc4539/67c15cdb77981e22a226bc86_Navbar%20Brand.svg"
                alt="Yarvest"
                className="h-10 transition-transform group-hover:scale-105"
              />
            </Link>
            <p className="text-gray-600 leading-relaxed text-sm">
              {t('description')}
            </p>

            {/* Social Media */}
            <div className="flex gap-3 pt-2">
              <a href="https://www.facebook.com/profile.php?id=61585351620298" target="_blank" rel="noopener noreferrer" className="bg-gray-50 hover:bg-[#5a9c3a] p-3 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-md border border-gray-200 hover:border-[#5a9c3a]">
                <Facebook className="w-5 h-5 text-gray-600 hover:text-white transition-colors" />
              </a>
              <a href="https://x.com/YarvestHealth" target="_blank" rel="noopener noreferrer" className="bg-gray-50 hover:bg-[#5a9c3a] p-3 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-md border border-gray-200 hover:border-[#5a9c3a]">
                <Twitter className="w-5 h-5 text-gray-600 hover:text-white transition-colors" />
              </a>
              <a href="https://www.instagram.com/yarvesthealth/" target="_blank" rel="noopener noreferrer" className="bg-gray-50 hover:bg-[#5a9c3a] p-3 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-md border border-gray-200 hover:border-[#5a9c3a]">
                <Instagram className="w-5 h-5 text-gray-600 hover:text-white transition-colors" />
              </a>
              <a href="https://www.linkedin.com/company/yarvest-health/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="bg-gray-50 hover:bg-[#5a9c3a] p-3 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-md border border-gray-200 hover:border-[#5a9c3a]">
                <Linkedin className="w-5 h-5 text-gray-600 hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h3 className="text-gray-900 font-bold text-base mb-4">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href={getLocalizedPath('/products', locale as Locale)} className="text-gray-600 hover:text-[#5a9c3a] transition-colors text-sm">
                  {t('allProducts')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/producers', locale as Locale)} className="text-gray-600 hover:text-[#5a9c3a] transition-colors text-sm">
                  {t('ourProducers')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/events', locale as Locale)} className="text-gray-600 hover:text-[#5a9c3a] transition-colors text-sm">
                  {t('events')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/guides', locale as Locale)} className="text-gray-600 hover:text-[#5a9c3a] transition-colors text-sm">
                  {t('guides')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/shops', locale as Locale)} className="text-gray-600 hover:text-[#5a9c3a] transition-colors text-sm">
                  {t('shops')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/leaderboard', locale as Locale)} className="text-gray-600 hover:text-[#5a9c3a] transition-colors text-sm">
                  {t('leaderboard')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-5">
            <h3 className="text-gray-900 font-bold text-base mb-4">
              {t('customerService')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href={getLocalizedPath('/about', locale as Locale)} className="text-gray-600 hover:text-[#5a9c3a] transition-colors text-sm">
                  {t('aboutUs')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/contact', locale as Locale)} className="text-gray-600 hover:text-[#5a9c3a] transition-colors text-sm">
                  {t('contactUs')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/help', locale as Locale)} className="text-gray-600 hover:text-[#5a9c3a] transition-colors text-sm">
                  {t('helpCenter')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/shipping', locale as Locale)} className="text-gray-600 hover:text-[#5a9c3a] transition-colors text-sm">
                  {t('shippingInfo')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/returns', locale as Locale)} className="text-gray-600 hover:text-[#5a9c3a] transition-colors text-sm">
                  {t('returnsRefunds')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/become-partner', locale as Locale)} className="text-gray-600 hover:text-[#5a9c3a] transition-colors text-sm flex items-center gap-1">
                  {t('becomePartner')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter & Mobile Apps */}
          <div className="space-y-6">
            {/* Newsletter */}
            <div className="space-y-4">
              <h3 className="text-gray-900 font-bold text-base mb-3">
                {t('newsletter')}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t('newsletterDescription')}
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-[#5a9c3a] flex-shrink-0" />
                  <p className="text-sm text-[#5a9c3a] font-medium">{t('successfullySubscribed')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <Input
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#5a9c3a] focus:ring-2 focus:ring-[#5a9c3a]/20 transition-all rounded-lg text-sm"
                  />
                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('subscribing')}
                      </>
                    ) : (
                      <>
                        {t('subscribe')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Mobile Apps Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-sm mb-3">
                <div className="p-1.5 bg-[#5a9c3a]/10 rounded-lg">
                  <Smartphone className="w-4 h-4 text-[#5a9c3a]" />
                </div>
                <span>{t('mobileApps')}</span>
              </div>
              <div className="space-y-3">
                {/* App Store */}
                <div className="relative group">
                  <div className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3.5 opacity-60 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <svg className="w-9 h-9 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                        </svg>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">{t('downloadOnAppStore')}</span>
                        <span className="text-sm font-bold text-gray-400 leading-tight">{t('appStore')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="bg-[#5a9c3a] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {t('comingSoon')}
                    </span>
                  </div>
                </div>

                {/* Google Play */}
                <div className="relative group">
                  <div className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3.5 opacity-60 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <svg className="w-9 h-9 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                        </svg>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">{t('getItOn')}</span>
                        <span className="text-sm font-bold text-gray-400 leading-tight">{t('googlePlay')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="bg-[#5a9c3a] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {t('comingSoon')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-200 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#5a9c3a]/10 rounded-lg">
                <Mail className="w-4 h-4 text-[#5a9c3a]" />
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">{t('email')}</p>
                <p className="text-gray-900 font-medium text-sm">hello@yarvest.health</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#5a9c3a]/10 rounded-lg">
                <Phone className="w-4 h-4 text-[#5a9c3a]" />
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">{t('phone')}</p>
                <p className="text-gray-900 font-medium text-sm">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#5a9c3a]/10 rounded-lg">
                <MapPin className="w-4 h-4 text-[#5a9c3a]" />
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">{t('address')}</p>
                <p className="text-gray-900 font-medium text-sm">San Francisco, CA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-xs">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex flex-wrap gap-4 text-xs">
            <Link href={getLocalizedPath('/privacy', locale as Locale)} className="text-gray-600 hover:text-[#5a9c3a] transition-colors">
              {t('privacyPolicy')}
            </Link>
            <Link href={getLocalizedPath('/terms', locale as Locale)} className="text-gray-600 hover:text-[#5a9c3a] transition-colors">
              {t('termsOfService')}
            </Link>
            <Link href={getLocalizedPath('/cookies', locale as Locale)} className="text-gray-600 hover:text-[#5a9c3a] transition-colors">
              {t('cookiePolicy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
