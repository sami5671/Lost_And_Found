'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { GlassCard } from '@/components/glass-card'
import { GradientButton } from '@/components/gradient-button'
import { ItemCard } from '@/components/item-card'
import { Search, Plus, Bell, Heart, TrendingUp, CheckCircle2, ArrowRight, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { handleGetMyStats, handleGetMyItems } from '@/actions/admin/item-actions'
import { Item as FrontendItem, ItemCategory, ItemStatus } from '@/types'
import { useAuth } from '@/lib/auth-context'

export default function StudentDashboard() {
  const { user } = useAuth()
  const email = user?.email || ''
  const idMatch = email.match(/\d+-\d+/)
  const studentId = user?.providerId || (idMatch ? `222-${idMatch[0]}` : '222-16-656')
  const router = useRouter()
  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'My Items', href: '/my-items', icon: <Heart className="w-5 h-5" /> },
    { label: 'Notifications', href: '/notifications', icon: <Bell className="w-5 h-5" /> },
    { label: 'Matches', href: '/matches', icon: <CheckCircle2 className="w-5 h-5" /> },
    { label: 'Claims', href: '/claims', icon: <Plus className="w-5 h-5" /> },
    { label: 'Profile', href: '/profile', icon: <Heart className="w-5 h-5" /> },
  ]

  const [stats, setStats] = useState({
    lostCount: 0,
    matchCount: 0,
    notificationsCount: 0,
    resolvedCount: 0,
    successRate: 0,
  })
  const [recentMatches, setRecentMatches] = useState<FrontendItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsRes, itemsRes] = await Promise.all([
          handleGetMyStats(),
          handleGetMyItems()
        ])

        if (statsRes.status && statsRes.data) {
          setStats(statsRes.data)
        }

        if (itemsRes.status && itemsRes.data) {
          // Map mongoose Item structure to frontend Item structure
          const mapped: FrontendItem[] = itemsRes.data.map((item: any) => ({
            id: item._id,
            title: item.title,
            description: item.description,
            category: (item.category?.toLowerCase() || 'other') as ItemCategory,
            status: (item.status === 'reported' ? 'lost' : item.status) as ItemStatus,
            imageUrl: item.images?.[0] || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=800&auto=format&fit=crop&q=60',
            reportedDate: item.dateLost ? new Date(item.dateLost).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString(),
            location: item.locationLost || 'Unknown',
            userId: item.reportedBy || '',
            contactEmail: item.contactInfo || '',
          }))

          // Filter matching/active matches
          const matched = mapped.filter(item => item.status === 'lost' || item.status === 'claimed').slice(0, 3)
          setRecentMatches(matched)
        }
      } catch (err) {
        console.error('Error loading student dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title="Lost & Found"
      requiredRole="student"
    >
      <motion.div
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Track your lost items and AI-matched findings</p>
        </motion.div>

        {/* DIU Student Profile Card */}
        <motion.div variants={itemVariants} className="w-full">
          <div className="bg-gradient-to-r from-blue-100 to-indigo-50 dark:from-[#1e293b] dark:to-[#0f172a] rounded-2xl border border-blue-200/50 dark:border-slate-800 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
            {/* Left Section: Avatar and Status */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-28 h-28 rounded-full border-4 border-blue-500 overflow-hidden bg-slate-200 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user?.avatar || '/placeholder-user.jpg'}
                  alt="Profile Picture"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-[#84cc16] text-white shadow-sm">
                ✓ Active
              </span>
            </div>

            {/* Right Section: Details */}
            <div className="flex-1 w-full text-center md:text-left space-y-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  {user?.fullName || user?.name || 'Md. Sami Alam'}
                </h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                  {user?.occupation || 'B.Sc. in Computing & Information System'}
                </p>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-6 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <span className="w-5 h-5 flex items-center justify-center rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">🪪</span>
                  <span className="font-semibold">{studentId}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <span className="w-5 h-5 flex items-center justify-center rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">✉️</span>
                  <span className="truncate">{user?.email || 'alam16-656@s.portal.com'}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <span className="w-5 h-5 flex items-center justify-center rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">📅</span>
                  <span>Oct 17, 2003</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <span className="w-5 h-5 flex items-center justify-center rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">👥</span>
                  <span>43 Credits</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <span className="w-5 h-5 flex items-center justify-center rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">📞</span>
                  <span>{user?.primaryNumber || '01648925559'}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <span className="w-5 h-5 flex items-center justify-center rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">🩸</span>
                  <span className="font-semibold text-red-500 dark:text-red-400">B+ (Male)</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
              variants={itemVariants}
            >
              <GlassCard>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-slate-500 dark:text-slate-400">Lost Items</h3>
                    <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                      <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold">{stats.lostCount}</p>
                  <p className="text-xs text-slate-400">{stats.lostCount} reported items</p>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-slate-500 dark:text-slate-400">AI Matches</h3>
                    <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold">{stats.matchCount}</p>
                  <p className="text-xs text-slate-400">Awaiting match verification</p>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-slate-500 dark:text-slate-400">Notifications</h3>
                    <div className="p-2 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20">
                      <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold">{stats.notificationsCount}</p>
                  <p className="text-xs text-slate-400">{stats.notificationsCount} unread updates</p>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-slate-500 dark:text-slate-400">Items Recovered</h3>
                    <div className="p-2 rounded-lg bg-green-500/10 dark:bg-green-500/20">
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold">{stats.resolvedCount}</p>
                  <p className="text-xs text-slate-400">Success rate: {stats.successRate}%</p>
                </div>
              </GlassCard>
            </motion.div>

            {/* Quick Actions */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <h2 className="text-2xl font-bold">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/report" className="w-full">
                  <GradientButton variant="primary" className="py-4 text-lg w-full cursor-pointer">
                    <Plus className="w-5 h-5 mr-2" />
                    Report Lost Item
                  </GradientButton>
                </Link>
                <GradientButton variant="secondary" className="py-4 text-lg">
                  <Search className="w-5 h-5 mr-2" />
                  Browse Found Items
                </GradientButton>
              </div>
            </motion.div>

            {/* Recent Matches */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Recent AI Matches</h2>
                <button className="flex items-center gap-2 text-[#004b87] dark:text-[#38bdf8] hover:underline transition-all">
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentMatches.length > 0 ? (
                  recentMatches.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <ItemCard item={item} />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-border shadow-sm">
                    No recent matches found yet.
                  </div>
                )}
              </div>
            </motion.div>

            {/* Notifications & Activity */}
            <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={itemVariants}>
              {/* Recent Notifications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Notifications</h2>
                  <button className="text-[#004b87] dark:text-[#38bdf8] hover:underline transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <GlassCard>
                  <div className="p-8 text-center text-slate-400">
                    No new notifications.
                  </div>
                </GlassCard>
              </div>

              {/* Activity Summary */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Activity Summary</h2>
                <GlassCard>
                  <div className="space-y-4 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">This Week</p>
                        <p className="text-2xl font-bold">{stats.matchCount} active matches</p>
                      </div>
                      <div className="text-3xl">📊</div>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#004b87] to-[#16a34a] rounded-full"
                        style={{ width: `${stats.successRate || 0}%` }}
                      />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Reported Lost: {stats.lostCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">AI Matches: {stats.matchCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Recovered: {stats.resolvedCount}</span>
                        <span className="font-medium">{stats.successRate}% rate</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
