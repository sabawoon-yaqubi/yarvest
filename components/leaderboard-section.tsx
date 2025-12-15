"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Award, Star, TrendingUp } from "lucide-react"
import Link from "next/link"
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

const LeaderboardSkeleton = () => {
  return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-10">
          <div>
            <div className="h-8 sm:h-10 w-48 sm:w-64 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 sm:h-5 w-64 sm:w-96 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-5 w-20 bg-gray-200 rounded animate-pulse self-start sm:self-auto" />
        </div>

        {/* Top 3 Podium Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-10">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border text-center">
              <div className="h-5 w-5 sm:h-6 sm:w-6 bg-gray-200 rounded mx-auto mb-2 sm:mb-3 animate-pulse" />
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-2 sm:mb-3 animate-pulse" />
              <div className="h-5 sm:h-6 w-24 sm:w-32 bg-gray-200 rounded mx-auto mb-2 animate-pulse" />
              <div className="h-4 sm:h-5 w-16 sm:w-20 bg-gray-200 rounded mx-auto mb-2 animate-pulse" />
              <div className="h-6 sm:h-8 w-20 sm:w-24 bg-gray-200 rounded mx-auto mb-1 animate-pulse" />
              <div className="h-3 sm:h-4 w-12 sm:w-16 bg-gray-200 rounded mx-auto animate-pulse" />
            </Card>
          ))}
      </div>

        {/* List Skeleton */}
        <Card className="rounded-2xl sm:rounded-3xl border border-border bg-white overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border bg-secondary/30">
            <div className="h-6 sm:h-8 w-40 sm:w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 sm:p-6 flex items-center gap-3 sm:gap-6">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-200 rounded animate-pulse flex-shrink-0" />
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-5 sm:h-6 w-32 sm:w-48 bg-gray-200 rounded mb-2 animate-pulse" />
                  <div className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="h-6 sm:h-8 w-16 sm:w-20 bg-gray-200 rounded mb-1 animate-pulse" />
                  <div className="h-3 sm:h-4 w-12 sm:w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </Card>
    </div>
  )
}

export function LeaderboardSection() {
  const { data, loading, error } = useApiFetch<LeaderboardEntry[]>('/leaderboard?limit=8&page=1')

  if (loading) {
    return <LeaderboardSkeleton />
  }

  if (error || !data || data.length === 0) {
    return null // Don't show anything if there's an error or no data
  }

  const leaderboardData = data
  const topThree = leaderboardData.slice(0, 3)
  const rest = leaderboardData.slice(3)

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-10">
        <div>
          <h3 className="font-bold text-2xl sm:text-4xl text-foreground">Top Contributors</h3>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">Anyone can be here - buyers and sellers alike</p>
        </div>
        <Link href="/leaderboard" className="text-[#5a9c3a] font-semibold hover:text-[#0d7a3f] text-sm transition-colors self-start sm:self-auto">
          View All
        </Link>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-10">
        {topThree.map((producer, index) => {
          const imageUrl = producer.logo || producer.user?.image || "/placeholder.png"
          return (
            <Card
              key={producer.id}
              className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border text-center ${
                index === 0 ? "bg-gradient-to-br from-yellow-50 to-white" : "bg-white"
              }`}
            >
              <div className="flex justify-center mb-2 sm:mb-3">{getRankIcon(producer.rank)}</div>
              <img
                src={imageUrl}
                alt={producer.user?.full_name || "User"}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-2 sm:mb-3 object-cover border-2 sm:border-4 border-white shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.png"
                }}
              />
              <h3 className="font-bold text-base sm:text-lg text-foreground mb-1 truncate px-2">{producer.user?.full_name || "User"}</h3>
              <Badge className={`mb-2 text-xs sm:text-sm ${getBadgeColor(producer.badge)}`}>{producer.badge.name}</Badge>
              <p className="text-xl sm:text-2xl font-bold text-primary mb-1">{producer.points.toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">points</p>
            </Card>
          )
        })}
      </div>

      {/* Leaderboard List */}
      {rest.length > 0 && (
        <Card className="rounded-2xl sm:rounded-3xl border border-border bg-white overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border bg-secondary/30">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">More Top Contributors</h3>
          </div>
          <div className="divide-y divide-border">
            {rest.map((producer) => {
              const imageUrl = producer.logo || producer.user?.image || "/placeholder.png"
              return (
                <div
                  key={producer.id}
                  className="p-4 sm:p-6 hover:bg-secondary/30 transition-colors flex items-center gap-3 sm:gap-6"
                >
                  <div className="flex-shrink-0 w-8 sm:w-12 flex items-center justify-center">
                    {getRankIcon(producer.rank)}
                  </div>
                  <img
                    src={imageUrl}
                    alt={producer.user?.full_name || "User"}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.png"
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                      <h3 className="font-bold text-base sm:text-lg text-foreground truncate">{producer.user?.full_name || "User"}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-xs sm:text-sm ${getBadgeColor(producer.badge)}`}>{producer.badge.name}</Badge>
                        {producer.trend && producer.trend.direction === 'up' && (
                          <span className="text-green-600 text-xs sm:text-sm font-semibold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                            {producer.trend.display}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
                      {producer.rating > 0 && (
                        <>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                            <span>{producer.rating}</span>
                          </div>
                          <span className="hidden sm:inline">•</span>
                        </>
                      )}
                      <span>{producer.products_count} products</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg sm:text-2xl font-bold text-primary">{producer.points.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* View All Button */}
      <div className="mt-6 sm:mt-8 text-center">
        <Link href="/leaderboard">
          <Button className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white font-semibold rounded-xl px-6 py-4 sm:px-8 sm:py-6 text-sm sm:text-base w-full sm:w-auto">
            View Full Leaderboard
          </Button>
        </Link>
      </div>
    </div>
  )
}

