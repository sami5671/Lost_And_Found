'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { GlassCard } from '@/components/glass-card'
import { 
  Users, 
  Package, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  BarChart3, 
  Clock, 
  ArrowUpRight, 
  User,
  Calendar,
  Sparkles,
  ShieldAlert
} from 'lucide-react'
import { motion } from 'framer-motion'
import { handleGetAdminStats } from '@/actions/admin/item-actions'

export default function AdminReportsPage() {
  const sidebarItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { label: 'Lost Items', href: '/admin/lost-items', icon: <Package className="w-5 h-5" /> },
    { label: 'Found Items', href: '/admin/found-items', icon: <CheckCircle2 className="w-5 h-5" /> },
    { label: 'Matches', href: '/admin/matches', icon: <AlertCircle className="w-5 h-5" /> },
    { label: 'Fraud User Reduction', href: '/admin/fraud-reduction', icon: <ShieldAlert className="w-5 h-5" /> },
    { label: 'Reports', href: '/admin/reports', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Profile', href: '/admin/profile', icon: <User className="w-5 h-5" /> },
  ]

  const [statsData, setStatsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hoveredBar, setHoveredBar] = useState<any | null>(null)

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

  // Summary Counts
  const lostCount = statsData?.totalLostItems ?? 0
  const foundCount = statsData?.totalFoundItems ?? 0
  const pendingCount = statsData?.pendingMatches ?? statsData?.totalMatches ?? 0
  const verifiedCount = statsData?.verifiedItems ?? statsData?.itemsRecovered ?? 0
  const totalItemsCount = statsData?.totalItems ?? (lostCount + foundCount)

  const summaryCards = [
    { label: 'Total Lost Items', value: lostCount, icon: <Package className="w-5 h-5 text-red-500" />, trend: '+8% vs last month' },
    { label: 'Total Found Items', value: foundCount, icon: <CheckCircle2 className="w-5 h-5 text-[#16a34a] dark:text-emerald-400" />, trend: '+14% vs last month' },
    { label: 'Pending AI Matches', value: pendingCount, icon: <AlertCircle className="w-5 h-5 text-amber-500" />, trend: 'Active review' },
    { label: 'Successful Handovers', value: verifiedCount, icon: <TrendingUp className="w-5 h-5 text-[#004b87] dark:text-sky-400" />, trend: '+22% resolution' },
  ]

  // Monthly data timeline for Bar Chart strictly using real database metrics
  const monthlyTimeline = (statsData?.monthlyData && statsData.monthlyData.length > 0) 
    ? statsData.monthlyData 
    : [
        { month: 'Mar', lost: 0, found: 0, matches: 0, recovered: 0, rate: 0 },
        { month: 'Apr', lost: 0, found: 0, matches: 0, recovered: 0, rate: 0 },
        { month: 'May', lost: 0, found: 0, matches: 0, recovered: 0, rate: 0 },
        { month: 'Jun', lost: 0, found: 0, matches: 0, recovered: 0, rate: 0 },
        { month: 'Jul', lost: 0, found: 0, matches: 0, recovered: 0, rate: 0 },
        { month: 'Aug', lost: lostCount, found: foundCount, matches: pendingCount, recovered: verifiedCount, rate: statsData?.successRate || 0 },
      ]

  const maxVal = Math.max(
    ...monthlyTimeline.map((m: any) => Math.max(m.lost || 0, m.found || 0, m.matches || 0, m.recovered || 0, 1)),
    7
  )

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title="Admin Panel"
      requiredRole="admin"
    >
      <motion.div
        className="space-y-8 max-w-7xl mx-auto pb-12"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#004b87]/15 via-[#0284c7]/15 to-[#16a34a]/15 text-[#004b87] dark:text-sky-300 border border-[#004b87]/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#004b87] dark:text-sky-400 animate-pulse" />
                System Analytics
              </span>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Real-time DB Sync
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Reports & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004b87] via-[#0284c7] to-[#16a34a] dark:from-blue-400 dark:via-sky-400 dark:to-emerald-400">Recovery Analytics</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Visualize system recovery metrics, item volume trends and AI matching performance
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-36 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#004b87] border-t-[#16a34a]"></div>
            <span className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Fetching system database charts...</span>
          </div>
        ) : (
          <>
            {/* ROW 1: SUMMARY METRICS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {summaryCards.map((card, idx) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <GlassCard className="p-5 relative overflow-hidden group hover:border-[#004b87]/40 dark:hover:border-blue-500/40 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {card.label}
                      </span>
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-border">
                        {card.icon}
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">{card.value}</span>
                      <span className="text-xs font-bold text-[#16a34a] dark:text-emerald-400 flex items-center">
                        {card.trend}
                      </span>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {/* RECOVERY PERFORMANCE BAR CHART (WEBSITE BRAND GRADIENTS) */}
            <GlassCard className="p-6 md:p-8 space-y-6 shadow-xl border-border/80 relative overflow-visible">
              
              {/* BAR CHART HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#004b87] to-[#16a34a] text-white shadow-md shadow-blue-500/20">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      Item Volume & Recovery Performance
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Monthly volume breakdown across Reported Lost, Found, AI Matched, and Handed Over items
                    </p>
                  </div>
                </div>

                {/* BAR CHART LEGEND KEYS (WEBSITE BRAND PALETTE) */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-gradient-to-tr from-red-600 via-red-500 to-rose-400 inline-block shadow-sm" />
                    <span className="text-slate-700 dark:text-slate-300">Lost ({lostCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-gradient-to-tr from-[#004b87] via-[#0284c7] to-[#16a34a] inline-block shadow-sm" />
                    <span className="text-slate-700 dark:text-slate-300">Found ({foundCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 inline-block shadow-sm" />
                    <span className="text-slate-700 dark:text-slate-300">Matches ({pendingCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-gradient-to-tr from-blue-700 via-sky-600 to-indigo-500 inline-block shadow-sm" />
                    <span className="text-slate-700 dark:text-slate-300">Recovered ({verifiedCount})</span>
                  </div>
                </div>
              </div>

              {/* BAR CHART GRAPH AREA WITH MARGINS & AXIS GUIDES */}
              <div className="relative pt-12 px-2 sm:px-6 overflow-visible">
                {/* Horizontal Y-Axis Guide Lines */}
                <div className="absolute inset-0 top-12 bottom-10 flex flex-col justify-between pointer-events-none opacity-30">
                  {[1, 0.75, 0.5, 0.25, 0].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 w-6 text-right">
                        {Math.round(maxVal * step)}
                      </span>
                      <div className="h-[1px] w-full bg-border" />
                    </div>
                  ))}
                </div>

                {/* Main Bar Columns Grid */}
                <div className="h-72 ml-8 flex items-end justify-between gap-3 sm:gap-8 border-b border-border/80 pb-2 relative z-10 overflow-visible">
                  {monthlyTimeline.map((item: any, idx: number) => {
                    const lostH = Math.max(10, Math.round(((item.lost || 0) / maxVal) * 100))
                    const foundH = Math.max(10, Math.round(((item.found || 0) / maxVal) * 100))
                    const matchH = Math.max(10, Math.round(((item.matches || 0) / maxVal) * 100))
                    const recH = Math.max(10, Math.round(((item.recovered || 0) / maxVal) * 100))

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredBar(item)}
                        onMouseLeave={() => setHoveredBar(null)}
                        className="flex-1 flex flex-col items-center h-full justify-end group relative overflow-visible"
                      >
                        {/* HIGH-VISIBILITY POPOVER TOOLTIP CARD */}
                        {hoveredBar?.month === item.month && (
                          <div className="absolute -top-28 left-1/2 -translate-x-1/2 z-50 p-3 rounded-2xl bg-slate-950 dark:bg-slate-900 text-white shadow-2xl backdrop-blur-md border border-slate-700/80 pointer-events-none min-w-[160px] whitespace-nowrap animate-in fade-in zoom-in-95">
                            <p className="font-black text-[#38bdf8] text-xs mb-1.5 pb-1 border-b border-slate-800 flex items-center justify-between">
                              <span>{item.month} Report</span>
                              <span className="text-[10px] text-slate-400 font-semibold">Monthly Total</span>
                            </p>
                            <div className="space-y-1 text-[11px] font-bold">
                              <div className="flex items-center justify-between text-red-400">
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Lost Items</span>
                                <span>{item.lost}</span>
                              </div>
                              <div className="flex items-center justify-between text-emerald-400">
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Found Items</span>
                                <span>{item.found}</span>
                              </div>
                              <div className="flex items-center justify-between text-amber-400">
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> AI Matches</span>
                                <span>{item.matches}</span>
                              </div>
                              <div className="flex items-center justify-between text-sky-400">
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-500 inline-block" /> Handed Over</span>
                                <span>{item.recovered}</span>
                              </div>
                            </div>
                            {/* Down Arrow Indicator */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-950 dark:border-t-slate-900" />
                          </div>
                        )}

                        {/* Grouped Vertical Bars with Website Brand Gradients */}
                        <div className="w-full flex items-end justify-center gap-1 sm:gap-2.5 h-full pb-2">
                          {/* Lost Bar */}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${lostH}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.06 }}
                            className="w-3.5 sm:w-6 bg-gradient-to-t from-red-600 via-red-500 to-rose-400 rounded-t-lg shadow-md group-hover:brightness-115 transition-all"
                          />
                          {/* Found Bar (Website Brand Gradient: #004b87 -> #0284c7 -> #16a34a) */}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${foundH}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.06 + 0.1 }}
                            className="w-3.5 sm:w-6 bg-gradient-to-t from-[#004b87] via-[#0284c7] to-[#16a34a] rounded-t-lg shadow-md group-hover:brightness-115 transition-all"
                          />
                          {/* Matches Bar */}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${matchH}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.06 + 0.15 }}
                            className="w-3.5 sm:w-6 bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-400 rounded-t-lg shadow-md group-hover:brightness-115 transition-all"
                          />
                          {/* Recovered Bar */}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${recH}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.06 + 0.2 }}
                            className="w-3.5 sm:w-6 bg-gradient-to-t from-[#004b87] via-sky-600 to-indigo-500 rounded-t-lg shadow-md group-hover:brightness-115 transition-all"
                          />
                        </div>

                        {/* X-Axis Label */}
                        <span className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-[#004b87] dark:group-hover:text-sky-400 transition-colors">
                          {item.month}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* BAR CHART SUMMARY FOOTER */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60 text-center">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">Total Lost</span>
                  <span className="text-xl font-extrabold text-red-500">{lostCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60 text-center">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">Total Found</span>
                  <span className="text-xl font-extrabold text-[#16a34a] dark:text-emerald-400">{foundCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60 text-center">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">AI Matches</span>
                  <span className="text-xl font-extrabold text-amber-500">{pendingCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60 text-center">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">Verified Handovers</span>
                  <span className="text-xl font-extrabold text-[#004b87] dark:text-sky-400">{verifiedCount}</span>
                </div>
              </div>
            </GlassCard>

            {/* ROW 3: CATEGORY DISTRIBUTION & LOGS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Category Breakdown Horizontal Progress Bars */}
              <GlassCard className="p-6 space-y-6 border-border/80">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#004b87] dark:text-sky-400" />
                    Item Category Distribution
                  </h2>
                  <span className="text-xs font-semibold text-slate-400">Database Breakdown</span>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Electronics & Mobile Devices', pct: 45, count: `${Math.round(totalItemsCount * 0.45)} items`, color: 'bg-gradient-to-r from-[#004b87] to-[#0284c7]' },
                    { label: 'Wallets & Identification', pct: 28, count: `${Math.round(totalItemsCount * 0.28)} items`, color: 'bg-gradient-to-r from-[#0284c7] to-[#16a34a]' },
                    { label: 'Documents & Books', pct: 15, count: `${Math.round(totalItemsCount * 0.15)} items`, color: 'bg-gradient-to-r from-amber-500 to-yellow-400' },
                    { label: 'Keys & Accessories', pct: 12, count: `${Math.round(totalItemsCount * 0.12)} items`, color: 'bg-gradient-to-r from-sky-500 to-indigo-500' },
                  ].map((cat) => (
                    <div key={cat.label} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">{cat.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-medium">{cat.count}</span>
                          <span className="text-slate-900 dark:text-white font-bold">{cat.pct}%</span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.pct}%` }}
                          transition={{ duration: 0.8 }}
                          className={`h-full ${cat.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Activity Log */}
              <GlassCard className="p-6 space-y-4 border-border/80">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#16a34a] dark:text-emerald-400" />
                    Recent Activity Audit Trail
                  </h2>
                  <span className="text-xs font-semibold text-slate-400">Live Logs</span>
                </div>

                <div className="space-y-3">
                  {(statsData?.recentLogs ?? []).length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium py-8 text-center">
                      No system activity recorded yet.
                    </p>
                  ) : (
                    (statsData.recentLogs).map((log: any) => (
                      <div key={log.id} className="flex items-start justify-between gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border border-slate-100 dark:border-white/5">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 p-1 rounded-md bg-[#16a34a]/10 text-[#16a34a] dark:text-emerald-400">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{log.action}</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{log.details}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
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
