"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Heart,
  Leaf,
  Package,
  Users,
  Award,
  TrendingUp,
  Trophy,
  Star,
  Loader2,
  Truck,
  Calendar,
  Clock
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { getUserRanking, getUserPoints, getUserPointsBreakdown, type UserRanking, type PointsBreakdown, type PointHistory } from "@/lib/leaderboard-api"
import { fetchCourierRequests } from "@/lib/courier-requests-api"
import { fetchMyHarvestOffers } from "@/lib/harvest-requests-api"

interface Achievement {
  id: string
  title: string
  description: string
  icon: any
  earned: boolean
  date?: string
  threshold: number
  current: number
}

export default function ImpactPage() {
  const [ranking, setRanking] = useState<UserRanking | null>(null)
  const [pointsData, setPointsData] = useState<{ total_points: number; breakdown: PointsBreakdown[]; history: PointHistory[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [courierRequests, setCourierRequests] = useState<any[]>([])
  const [harvestRequests, setHarvestRequests] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load all data in parallel
        const [rankingData, points, breakdown, deliveries, harvests] = await Promise.all([
          getUserRanking(),
          getUserPoints(1, 50),
          getUserPointsBreakdown(),
          fetchCourierRequests('accepted'),
          fetchMyHarvestOffers()
        ])

        setRanking(rankingData)
        if (points) {
          setPointsData({
            total_points: points.total_points,
            breakdown: points.breakdown || [],
            history: points.history || []
          })
        } else if (breakdown) {
          setPointsData({
            total_points: breakdown.total_points,
            breakdown: breakdown.breakdown || [],
            history: []
          })
        }
        setCourierRequests(deliveries)
        setHarvestRequests(harvests)
      } catch (error) {
        console.error('Error loading impact data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Calculate impact metrics from actual data
  const impactStats = useMemo(() => {
    const deliveriesCompleted = courierRequests.length
    const harvestsCompleted = harvestRequests.filter(h => h.status === 'accepted' || h.status === 'completed').length
    const totalPoints = pointsData?.total_points || 0
    
    // Calculate from points breakdown - ensure breakdown is an array
    const breakdown = Array.isArray(pointsData?.breakdown) ? pointsData.breakdown : []
    const deliverPoints = breakdown.find(b => b.action === 'deliver')?.total_points || 0
    const harvestPoints = breakdown.find(b => b.action === 'harvest')?.total_points || 0
    
    return {
      totalImpact: totalPoints,
      deliveriesCompleted,
      harvestsCompleted,
      totalPoints,
      deliverPoints,
      harvestPoints,
    }
  }, [courierRequests, harvestRequests, pointsData])

  // Calculate achievements based on actual data
  const achievements = useMemo((): Achievement[] => {
    const totalPoints = impactStats.totalPoints
    const deliveries = impactStats.deliveriesCompleted
    const harvests = impactStats.harvestsCompleted
    
    return [
      {
        id: 'first_delivery',
        title: "First Delivery",
        description: "Complete your first delivery",
        icon: Truck,
        earned: deliveries >= 1,
        threshold: 1,
        current: deliveries,
      },
      {
        id: 'delivery_hero',
        title: "Delivery Hero",
        description: "Complete 10+ deliveries",
        icon: Truck,
        earned: deliveries >= 10,
        threshold: 10,
        current: deliveries,
      },
      {
        id: 'first_harvest',
        title: "First Harvest",
        description: "Complete your first harvest",
        icon: Leaf,
        earned: harvests >= 1,
        threshold: 1,
        current: harvests,
      },
      {
        id: 'harvest_champion',
        title: "Harvest Champion",
        description: "Complete 5+ harvests",
        icon: Leaf,
        earned: harvests >= 5,
        threshold: 5,
        current: harvests,
      },
      {
        id: 'points_milestone_100',
        title: "Points Starter",
        description: "Earn 100+ points",
        icon: Star,
        earned: totalPoints >= 100,
        threshold: 100,
        current: totalPoints,
      },
      {
        id: 'points_milestone_500',
        title: "Points Master",
        description: "Earn 500+ points",
        icon: Trophy,
        earned: totalPoints >= 500,
        threshold: 500,
        current: totalPoints,
      },
      {
        id: 'points_milestone_1000',
        title: "Points Legend",
        description: "Earn 1,000+ points",
        icon: Award,
        earned: totalPoints >= 1000,
        threshold: 1000,
        current: totalPoints,
      },
      {
        id: 'community_champion',
        title: "Community Champion",
        description: "Complete 20+ total activities",
        icon: Users,
        earned: (deliveries + harvests) >= 20,
        threshold: 20,
        current: deliveries + harvests,
      },
    ]
  }, [impactStats])

  const earnedAchievements = achievements.filter(a => a.earned)
  const unearnedAchievements = achievements.filter(a => !a.earned)

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Impact</h1>
          <p className="text-gray-500 mt-1 text-sm">Track your volunteer contributions and earned rewards</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#5a9c3a]" />
        </div>
      ) : (
        <>
          {/* Main Impact Score */}
          <Card className="border-2 border-[#5a9c3a] bg-gradient-to-r from-[#5a9c3a] to-[#0d7a3f] shadow-lg">
            <CardContent className="p-8 sm:p-12 text-center text-white">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Heart className="w-12 h-12 sm:w-16 sm:h-16" />
                <div>
                  <p className="text-2xl sm:text-3xl font-bold mb-2">Your Impact Score</p>
                  <p className="text-green-100 text-base sm:text-lg">Making a real difference!</p>
                </div>
              </div>
              <p className="text-6xl sm:text-8xl font-bold mb-4">{impactStats.totalImpact.toLocaleString()}</p>
              <p className="text-green-100 text-lg sm:text-xl">points earned through your volunteer work</p>
              {ranking && (
                <div className="mt-6 flex items-center justify-center gap-4">
                  <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-base">
                    <Trophy className="w-4 h-4 mr-2" />
                    Rank #{ranking.rank}
                  </Badge>
                  {ranking.badge && (
                    <Badge className={`${
                      ranking.badge.name === 'Champion' ? 'bg-yellow-500' :
                      ranking.badge.name === 'Elite' ? 'bg-purple-500' :
                      ranking.badge.name === 'Pro' ? 'bg-blue-500' :
                      'bg-gray-500'
                    } text-white px-4 py-2 text-base`}>
                      {ranking.badge.name}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Impact Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-200 hover:shadow-lg transition-all bg-white">
              <CardContent className="p-4 text-center">
                <Truck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-1">Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{impactStats.deliveriesCompleted}</p>
                {impactStats.deliverPoints > 0 && (
                  <p className="text-xs text-gray-500 mt-1">+{impactStats.deliverPoints} pts</p>
                )}
              </CardContent>
            </Card>
            <Card className="border border-gray-200 hover:shadow-lg transition-all bg-white">
              <CardContent className="p-4 text-center">
                <Leaf className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-1">Harvests</p>
                <p className="text-2xl font-bold text-green-600">{impactStats.harvestsCompleted}</p>
                {impactStats.harvestPoints > 0 && (
                  <p className="text-xs text-gray-500 mt-1">+{impactStats.harvestPoints} pts</p>
                )}
              </CardContent>
            </Card>
            <Card className="border border-gray-200 hover:shadow-lg transition-all bg-white">
              <CardContent className="p-4 text-center">
                <Award className="w-8 h-8 text-[#5a9c3a] mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-1">Achievements</p>
                <p className="text-2xl font-bold text-[#5a9c3a]">{earnedAchievements.length}</p>
                <p className="text-xs text-gray-500 mt-1">of {achievements.length}</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 hover:shadow-lg transition-all bg-white">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-1">Total Points</p>
                <p className="text-2xl font-bold text-yellow-600">{impactStats.totalPoints.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Points Breakdown */}
          {pointsData && Array.isArray(pointsData.breakdown) && pointsData.breakdown.length > 0 && (
            <Card className="border border-gray-200 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gray-50">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#5a9c3a]" />
                  Points Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {pointsData.breakdown.map((item) => (
                    <div key={item.action} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm font-semibold text-gray-900 mb-1">{item.action_name}</p>
                      <p className="text-2xl font-bold text-[#5a9c3a] mb-1">{item.total_points}</p>
                      <p className="text-xs text-gray-500">{item.count} {item.count === 1 ? 'activity' : 'activities'}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Achievements */}
          <Card className="border border-gray-200 shadow-lg">
            <CardHeader className="border-b border-gray-200 bg-gray-50">
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#5a9c3a]" />
                Achievements & Rewards
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Earned Achievements */}
              {earnedAchievements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Earned ({earnedAchievements.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {earnedAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="p-6 rounded-xl border-2 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300 shadow-lg"
                      >
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 bg-yellow-100">
                          <achievement.icon className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">{achievement.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                        <Badge className="bg-emerald-500 text-white w-full justify-center">
                          Earned
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unearned Achievements */}
              {unearnedAchievements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Available ({unearnedAchievements.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {unearnedAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="p-6 rounded-xl border-2 bg-gray-50 border-gray-200 opacity-75"
                      >
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 bg-gray-200">
                          <achievement.icon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">{achievement.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                        <div className="space-y-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#5a9c3a] h-2 rounded-full transition-all"
                              style={{ width: `${Math.min((achievement.current / achievement.threshold) * 100, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 text-center">
                            {achievement.current} / {achievement.threshold}
                          </p>
                        </div>
                        <Badge className="bg-gray-400 text-white w-full justify-center mt-2">
                          Not earned yet
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Points History */}
          {pointsData && Array.isArray(pointsData.history) && pointsData.history.length > 0 && (
            <Card className="border border-gray-200 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gray-50">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#5a9c3a]" />
                  Recent Points History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {pointsData.history.slice(0, 10).map((point) => (
                    <div key={point.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 capitalize">{point.action.replace('_', ' ')}</p>
                        {point.description && (
                          <p className="text-sm text-gray-600 mt-1">{point.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(point.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-[#5a9c3a]">+{point.points}</p>
                        <p className="text-xs text-gray-500">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Impact Story */}
          <Card className="border border-gray-200 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-8">
              <div className="text-center">
                <Heart className="w-16 h-16 text-[#5a9c3a] mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Thank You for Making a Difference!</h2>
                <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto mb-6">
                  Through your {impactStats.deliveriesCompleted} {impactStats.deliveriesCompleted === 1 ? 'delivery' : 'deliveries'} and {impactStats.harvestsCompleted} {impactStats.harvestsCompleted === 1 ? 'harvest' : 'harvests'}, 
                  you've earned {impactStats.totalPoints.toLocaleString()} points and unlocked {earnedAchievements.length} {earnedAchievements.length === 1 ? 'achievement' : 'achievements'}. 
                  Your dedication to your community is truly inspiring!
                </p>
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-6 h-6 text-[#5a9c3a]" />
                  <span className="text-xl font-bold text-[#5a9c3a]">Keep up the amazing work!</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
