"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Star, TrendingUp, Loader2 } from "lucide-react"
import { useState } from "react"
import { useApiFetch } from "@/hooks/use-api-fetch"

interface LeaderboardEntry {
  rank: number
  id: number
  user_id: number
  store_id: number | null
  logo: string | null
  name: string
  badge: {
    name: string
    color: string
    class: string
  }
  rating: number
  products_count: number
  trend: {
    direction: string
    value: number
    display: string
  }
  points: number
  store: {
    id: number
    unique_id: string
    name: string
    logo: string | null
  } | null
  user: {
    id: number
    unique_id: string
    full_name: string
    image: string | null
  }
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-500" />
  if (rank === 2) return <Medal className="w-6 h-6 text-gray-400 fill-gray-400" />
  if (rank === 3) return <Award className="w-6 h-6 text-orange-500 fill-orange-500" />
  return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
}

const getBadgeColor = (badge: LeaderboardEntry['badge']) => {
  switch (badge.name) {
    case "Champion":
      return "bg-yellow-500 text-white"
    case "Elite":
      return "bg-purple-500 text-white"
    case "Pro":
      return "bg-blue-500 text-white"
    default:
      return "bg-green-500 text-white"
  }
}

export default function LeaderboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [page, setPage] = useState(1)
  const { data, loading, error, refetch } = useApiFetch<LeaderboardEntry[]>(`/leaderboard?limit=50&page=${page}`)

  const leaderboardData = data || []

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="px-6 py-12 bg-gradient-to-b from-white to-secondary/10">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-10 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Trophy className="w-10 h-10 text-primary" />
                <h1 className="text-5xl font-bold text-foreground">Producer Leaderboard</h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Top performing local producers and farmers
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <Card className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Retry
                </button>
              </Card>
            ) : leaderboardData.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No leaderboard data available yet.</p>
              </Card>
            ) : (
              <>
                {/* Top 3 Podium */}
                {leaderboardData.length >= 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    {leaderboardData.slice(0, 3).map((producer, index) => {
                      const imageUrl = producer.logo || producer.user?.image || "/placeholder.svg"
                      return (
                        <Card
                          key={producer.id}
                          className={`p-6 rounded-3xl border border-border text-center ${
                            index === 0 ? "bg-gradient-to-br from-yellow-50 to-white" : "bg-white"
                          }`}
                        >
                          <div className="flex justify-center mb-3">{getRankIcon(producer.rank)}</div>
                          <img
                            src={imageUrl}
                            alt={producer.name}
                            className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-white shadow-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg"
                            }}
                          />
                          <h3 className="font-bold text-lg text-foreground mb-1">{producer.name}</h3>
                          <Badge className={`mb-2 ${getBadgeColor(producer.badge)}`}>{producer.badge.name}</Badge>
                          <p className="text-2xl font-bold text-primary mb-1">{producer.points.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">points</p>
                        </Card>
                      )
                    })}
                  </div>
                )}

                {/* Leaderboard List */}
                <Card className="rounded-3xl border border-border bg-white overflow-hidden">
                  <div className="p-6 border-b border-border bg-secondary/30">
                    <h2 className="text-2xl font-bold text-foreground">All Rankings</h2>
                  </div>
                  <div className="divide-y divide-border">
                    {leaderboardData.map((producer) => {
                      const imageUrl = producer.logo || producer.user?.image || "/placeholder.svg"
                      return (
                        <div
                          key={producer.id}
                          className="p-6 hover:bg-secondary/30 transition-colors flex items-center gap-6"
                        >
                          <div className="flex-shrink-0 w-12 flex items-center justify-center">
                            {getRankIcon(producer.rank)}
                          </div>
                          <img
                            src={imageUrl}
                            alt={producer.name}
                            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg"
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-bold text-lg text-foreground">{producer.name}</h3>
                              <Badge className={getBadgeColor(producer.badge)}>{producer.badge.name}</Badge>
                              {producer.trend && producer.trend.direction === 'up' && (
                                <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                                  <TrendingUp className="w-4 h-4" />
                                  {producer.trend.display}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {producer.rating > 0 && (
                                <>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span>{producer.rating}</span>
                                  </div>
                                  <span>•</span>
                                </>
                              )}
                              <span>{producer.products_count} products</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-2xl font-bold text-primary">{producer.points.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">points</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </>
            )}

            {/* Info Section */}
            <Card className="mt-8 p-6 rounded-3xl border border-border bg-gradient-to-r from-primary/5 to-transparent">
              <h3 className="font-bold text-lg text-foreground mb-2">How Points Work</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Producers earn points based on sales, customer ratings, product quality, and community engagement.
                Rankings are updated daily.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-foreground mb-1">Sales Volume</p>
                  <p className="text-muted-foreground">Based on total orders</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Customer Ratings</p>
                  <p className="text-muted-foreground">Average review scores</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Community Impact</p>
                  <p className="text-muted-foreground">Local engagement & events</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}

