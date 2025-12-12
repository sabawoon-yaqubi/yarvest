"use client"

import { Home, Store, Calendar, ShoppingBag, Users, Trophy, ChevronDown, Users2, Truck, Package, Heart, Gift, HelpCircle, Newspaper, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

interface SidebarProps {
  open?: boolean
  setOpen?: (open: boolean) => void
}

const menuItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: ShoppingBag, label: "Products", href: "/products" },
  { icon: Users, label: "Producers", href: "/producers" },
  { icon: ShoppingBag, label: "Harvesting Products", href: "/harvesting-products" },
  { icon: Store, label: "Stores", href: "/shops" },
  { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
]

const moreMenuItems = [
  { icon: Truck, label: "Volunteers", href: "/volunteers" },
  { icon: Package, label: "Harvesters", href: "/harvesters" },
  { icon: Users2, label: "Community", href: "/community" },
  { icon: Calendar, label: "Events", href: "/events" },
  { icon: Heart, label: "Donations", href: "/donations" },
  { icon: Gift, label: "Gift Cards", href: "/gift-cards" },
  { icon: Users2, label: "Invite Friends", href: "/invite" },
  { icon: HelpCircle, label: "Help Center", href: "/help" },
  { icon: Newspaper, label: "News", href: "/news" },
]

export function Sidebar({ open = true, setOpen }: SidebarProps) {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  return (
    <>
      {showMore && (
        <>
          <div 
            className="hidden md:block fixed inset-0 bg-black/20 z-[95]"
            onClick={() => setShowMore(false)}
          />
          <div 
            className="hidden md:block fixed top-[120px] left-1/2 -translate-x-1/2 bg-white shadow-2xl z-[100] rounded-3xl w-[95vw] max-w-[900px] overflow-hidden border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 bg-gradient-to-br from-white via-gray-50/50 to-white">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">More Options</h3>
                  <p className="text-sm text-gray-500">Explore additional features and services</p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowMore(false)
                  }}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all group"
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {moreMenuItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
                  return (
                    <Link
                      key={item.label} 
                      href={item.href}
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowMore(false)
                        setOpen?.(false)
                      }}
                    >
                      <div
                        className={`flex flex-col items-center gap-3 md:gap-4 px-4 md:px-5 py-5 md:py-6 rounded-2xl transition-all cursor-pointer group relative overflow-hidden h-full ${
                          isActive
                            ? "bg-gradient-to-br from-[#0A5D31] to-[#0d7a3f] text-white shadow-xl scale-105 ring-2 ring-[#0A5D31]/20"
                            : "bg-white text-gray-900 hover:bg-gradient-to-br hover:from-[#0A5D31] hover:to-[#0d7a3f] hover:text-white hover:shadow-xl hover:scale-105 border-2 border-gray-200 hover:border-transparent"
                        }`}
                      >
                        <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all ${
                          isActive 
                            ? "bg-white/20 backdrop-blur-sm shadow-lg" 
                            : "bg-gradient-to-br from-[#0A5D31]/10 to-[#0A5D31]/5 group-hover:bg-white/20 group-hover:backdrop-blur-sm shadow-md group-hover:shadow-lg"
                        }`}>
                          <item.icon className={`w-7 h-7 md:w-8 md:h-8 flex-shrink-0 transition-all ${
                            isActive 
                              ? "text-white drop-shadow-sm" 
                              : "text-[#0A5D31] group-hover:text-white group-hover:drop-shadow-sm"
                          }`} />
                        </div>
                        <span className={`text-xs md:text-sm font-bold text-center leading-tight transition-colors ${
                          isActive ? "text-white" : "text-gray-900 group-hover:text-white"
                        }`}>
                          {item.label}
                        </span>
                        {isActive && (
                          <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-white rounded-full shadow-lg animate-pulse"></div>
                        )}
                        <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity ${
                          isActive ? "opacity-100" : ""
                        }`}></div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
      <aside className="bg-white border-b border-gray-200 z-50 relative">
        <nav className="flex items-center justify-center gap-1 px-2 sm:px-3 md:px-4 py-2.5 md:py-3 overflow-x-auto relative scrollbar-hide">
          <div className="flex items-center gap-1 relative min-w-max mx-auto">
            {/* Main Menu Items */}
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
              return (
                <Link key={item.label} href={item.href} className="flex-shrink-0">
                  <div
                    className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-[#0A5D31] text-white"
                        : "text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-700"}`} />
                    <span className="text-xs md:text-sm font-medium">{item.label}</span>
                  </div>
                </Link>
              )
            })}
            
            {/* More Menu Items - Show on Mobile Only */}
            <div className="md:hidden flex items-center gap-1">
              {moreMenuItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
                return (
                  <Link key={item.label} href={item.href} className="flex-shrink-0">
                    <div
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                        isActive
                          ? "bg-[#0A5D31] text-white"
                          : "text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-gray-700"}`} />
                      <span className="text-xs font-medium">{item.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
            
            {/* Show More Button - Desktop Only */}
            <div className="hidden md:block relative flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMore(!showMore)
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  showMore
                    ? "bg-[#0A5D31] text-white"
                    : "text-gray-900 hover:bg-gray-100"
                }`}
              >
                <ChevronDown className={`w-5 h-5 transition-transform ${showMore ? "rotate-180" : ""}`} />
                <span className="text-sm font-medium">Show more</span>
              </button>
            </div>
          </div>

         
        </nav>
      </aside>
    </>
  )
}
