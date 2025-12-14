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
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-5 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Top 3 Podium Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 rounded-3xl border border-border text-center">
            <div className="h-6 w-6 bg-gray-200 rounded mx-auto mb-3 animate-pulse" />
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 rounded mx-auto mb-2 animate-pulse" />
            <div className="h-5 w-20 bg-gray-200 rounded mx-auto mb-2 animate-pulse" />
            <div className="h-8 w-24 bg-gray-200 rounded mx-auto mb-1 animate-pulse" />
            <div className="h-4 w-16 bg-gray-200 rounded mx-auto animate-pulse" />
          </Card>
        ))}
      </div>

      {/* List Skeleton */}
      <Card className="rounded-3xl border border-border bg-white overflow-hidden">
        <div className="p-6 border-b border-border bg-secondary/30">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-6 flex items-center gap-6">
              <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />
              <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="h-6 w-48 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="text-right">
                <div className="h-8 w-20 bg-gray-200 rounded mb-1 animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
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
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-bold text-foreground">Top Producers</h2>
          <p className="text-muted-foreground text-base mt-2">Leading local farmers and producers</p>
        </div>
        <Link href="/leaderboard" className="text-[#5a9c3a] font-semibold hover:text-[#0d7a3f] text-sm transition-colors">
          View All
        </Link>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {topThree.map((producer, index) => {
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

      {/* Leaderboard List */}
      {rest.length > 0 && (
        <Card className="rounded-3xl border border-border bg-white overflow-hidden">
          <div className="p-6 border-b border-border bg-secondary/30">
            <h3 className="text-2xl font-bold text-foreground">More Top Producers</h3>
          </div>
          <div className="divide-y divide-border">
            {rest.map((producer) => {
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
      )}

      {/* View All Button */}
      <div className="mt-8 text-center">
        <Link href="/leaderboard">
          <Button className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white font-semibold rounded-xl px-8 py-6">
            View Full Leaderboard
          </Button>
        </Link>
      </div>
    </div>
  )
}

