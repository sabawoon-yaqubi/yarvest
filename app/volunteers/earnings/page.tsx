"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign,
  TrendingUp,
  Download,
  ArrowUpRight,
  Loader2,
  Truck,
  Calendar,
  Clock
} from "lucide-react"
import { useState, useEffect } from "react"
import { getEarnings, type EarningsData, type DailyEarning } from "@/lib/earnings-api"

export default function EarningsPage() {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year' | 'all'>('week')
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadEarnings = async () => {
      setIsLoading(true)
      try {
        const data = await getEarnings(timeFilter)
        setEarningsData(data)
      } catch (error) {
        console.error('Error loading earnings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadEarnings()
  }, [timeFilter])

  const summary = earningsData?.summary || {
    total_earnings: 0,
    total_base_pay: 0,
    total_tips: 0,
    total_deliveries: 0,
    estimated_hours: 0,
    average_per_delivery: 0,
    hourly_rate: 0,
    deliveries_per_hour: 0,
    tip_percentage: 0,
  }

  const dailyEarnings = earningsData?.daily_earnings || []

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export earnings')
  }

  return (
    <div className="p-4 sm:p-6 max-w-8xl mx-auto px-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-500 mt-1 text-sm">Track your delivery earnings and performance</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as 'week' | 'month' | 'year' | 'all')}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-[#5a9c3a] focus:border-[#5a9c3a]"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleExport}
            disabled={dailyEarnings.length === 0}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#5a9c3a]" />
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-200 hover:shadow-lg transition-all bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-emerald-100">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">${summary.total_earnings.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-2">{summary.total_deliveries} deliveries</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:shadow-lg transition-all bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-blue-100">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Base Pay</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">${summary.total_base_pay.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-2">{summary.total_deliveries} deliveries</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:shadow-lg transition-all bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-yellow-100">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Tips</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">${summary.total_tips.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {summary.total_deliveries > 0 
                    ? `$${(summary.total_tips / summary.total_deliveries).toFixed(2)} avg per delivery`
                    : 'No deliveries'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:shadow-lg transition-all bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-purple-100">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Hourly Rate</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">${summary.hourly_rate.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-2">{summary.estimated_hours.toFixed(1)} hours worked</p>
              </CardContent>
            </Card>
          </div>

          {/* Earnings Breakdown */}
          {dailyEarnings.length > 0 ? (
            <Card className="border border-gray-200 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gray-50">
                <CardTitle>Daily Earnings Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-4 px-4 sm:px-6 font-semibold text-gray-900 text-sm">Date</th>
                        <th className="text-left py-4 px-4 sm:px-6 font-semibold text-gray-900 text-sm">Deliveries</th>
                        <th className="text-left py-4 px-4 sm:px-6 font-semibold text-gray-900 text-sm">Base Pay</th>
                        <th className="text-left py-4 px-4 sm:px-6 font-semibold text-gray-900 text-sm">Tips</th>
                        <th className="text-left py-4 px-4 sm:px-6 font-semibold text-gray-900 text-sm">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyEarnings.map((day: DailyEarning, index: number) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <p className="font-semibold text-gray-900 text-sm">
                                {new Date(day.date).toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4 sm:px-6">
                            <Badge className="bg-blue-100 text-blue-800">{day.deliveries}</Badge>
                          </td>
                          <td className="py-4 px-4 sm:px-6 font-semibold text-gray-900 text-sm">
                            ${day.basePay.toFixed(2)}
                          </td>
                          <td className="py-4 px-4 sm:px-6 font-semibold text-emerald-600 text-sm">
                            +${day.tips.toFixed(2)}
                          </td>
                          <td className="py-4 px-4 sm:px-6">
                            <p className="font-bold text-[#5a9c3a] text-base sm:text-lg">${day.total.toFixed(2)}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td className="py-4 px-4 sm:px-6 font-bold text-gray-900">Total</td>
                        <td className="py-4 px-4 sm:px-6">
                          <Badge className="bg-[#5a9c3a] text-white">{summary.total_deliveries}</Badge>
                        </td>
                        <td className="py-4 px-4 sm:px-6 font-bold text-gray-900">
                          ${summary.total_base_pay.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 sm:px-6 font-bold text-emerald-600">
                          +${summary.total_tips.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 sm:px-6">
                          <p className="font-bold text-[#5a9c3a] text-lg sm:text-xl">
                            ${summary.total_earnings.toFixed(2)}
                          </p>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-gray-200 shadow-lg">
              <CardContent className="p-12 text-center">
                <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No earnings data available</p>
                <p className="text-gray-400 text-sm">
                  Complete deliveries to start earning!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Performance Metrics */}
          {dailyEarnings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Average per Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-[#5a9c3a]">${summary.average_per_delivery.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-2">Based on {summary.total_deliveries} deliveries</p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Deliveries per Hour</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{summary.deliveries_per_hour.toFixed(1)}</p>
                  <p className="text-sm text-gray-500 mt-2">Average delivery rate</p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Tip Percentage</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-600">{summary.tip_percentage.toFixed(1)}%</p>
                  <p className="text-sm text-gray-500 mt-2">Of total earnings</p>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
