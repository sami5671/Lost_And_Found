'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { GlassCard } from '@/components/glass-card'
import { Users, Package, AlertCircle, CheckCircle2, TrendingUp, BarChart3, Clock, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { handleGetAdminStats } from '@/actions/admin/item-actions'

export default function AdminReportsPage() {
  const sidebarItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { label: 'Lost Items', href: '/admin/lost-items', icon: <Package className="w-5 h-5" /> },
    { label: 'Found Items', href: '/admin/found-items', icon: <CheckCircle2 className="w-5 h-5" /> },
    { label: 'Matches', href: '/admin/matches', icon: <AlertCircle className="w-5 h-5" /> },
    { label: 'Reports', href: '/admin/reports', icon: <TrendingUp className="w-5 h-5" /> },
  ]

  const [statsData, setStatsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await handleGetAdminStats()
        if (res.status && res.data) {
          setStatsData(res.data)
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  function formatRelativeTime(dateString: string) {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      
      if (diffMs < 0) return 'Just now'
      
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } catch (e) {
      return 'Some time ago'
    }
  }

  // Calculate items stats percentages
  const lostCount = statsData?.totalLostItems ?? 0
  const foundCount = statsData?.totalFoundItems ?? 0
  const totalItemsCount = lostCount + foundCount
  const lostPercent = totalItemsCount > 0 ? (lostCount / totalItemsCount) * 100 : 50
  const foundPercent = totalItemsCount > 0 ? (foundCount / totalItemsCount) * 100 : 50

  const totalMatchesCount = (statsData?.totalMatches ?? 0) + (statsData?.itemsRecovered ?? 0)

  const stats = [
    { label: 'Total Lost Items', value: lostCount, icon: <Package className="w-5 h-5 text-red-400" />, pct: '+8%' },
    { label: 'Total Found Items', value: foundCount, icon: <CheckCircle2 className="w-5 h-5 text-green-400" />, pct: '+12%' },
    { label: 'Total Matches Identified', value: statsData?.totalMatches ?? 0, icon: <AlertCircle className="w-5 h-5 text-yellow-400" />, pct: '+15%' },
    { label: 'Successful Recoveries', value: statsData?.itemsRecovered ?? 0, icon: <TrendingUp className="w-5 h-5 text-purple-400" />, pct: '+20%' },
  ]

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title="Admin Panel"
      requiredRole="admin"
    >
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Reports & Analytics</h1>
          <p className="text-foreground/60">Analyze system activity and recovery metrics</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <span className="text-sm text-foreground/40 font-medium">Aggregating database statistics...</span>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <GlassCard className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground/60 font-semibold">{stat.label}</span>
                      <div className="p-2 rounded-lg bg-white/5">{stat.icon}</div>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                      <span className="text-xs text-green-400 font-medium flex items-center">
                        {stat.pct} <ArrowUpRight className="w-3 h-3 ml-0.5" />
                      </span>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {/* Chart Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard className="p-6 space-y-6">
                <h2 className="text-xl font-bold text-white">Recovery Performance</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-foreground/60">Lost vs Found Ratio</span>
                      <span className="font-semibold text-white">
                        {lostCount} lost / {foundCount} found
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
                      <div className="h-full bg-red-500" style={{ width: `${lostPercent}%` }} />
                      <div className="h-full bg-green-500" style={{ width: `${foundPercent}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-foreground/60">Match Resolution Success</span>
                      <span className="font-semibold text-white">
                        {statsData?.successRate ?? 0}% ({statsData?.itemsRecovered ?? 0} / {totalMatchesCount} matches)
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${statsData?.successRate ?? 0}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-foreground/60">Registered System Accounts</span>
                      <span className="font-semibold text-white">
                        {statsData?.activeUsers ?? 0} active users
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Activity Log */}
              <GlassCard className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-white">Recent System Logs</h2>
                <div className="space-y-4">
                  {(statsData?.recentLogs ?? []).length === 0 ? (
                    <p className="text-sm text-foreground/40 font-medium py-6 text-center">
                      No system activity recorded yet.
                    </p>
                  ) : (
                    (statsData.recentLogs).map((log: any) => (
                      <div key={log.id} className="flex items-start justify-between gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors border border-purple-500/5">
                        <div className="flex items-start gap-3">
                          <div className="mt-1.5">
                            <Clock className="w-4 h-4 text-foreground/40" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-white">{log.action}</h4>
                            <p className="text-xs text-foreground/60">{log.details}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-foreground/40 whitespace-nowrap">
                          {formatRelativeTime(log.time)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>
            </div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
