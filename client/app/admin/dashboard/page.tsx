'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { GlassCard } from '@/components/glass-card'
import { GradientButton } from '@/components/gradient-button'
import { ItemCard } from '@/components/item-card'
import { Users, Package, AlertCircle, CheckCircle2, TrendingUp, Plus, BarChart3, Settings, User, ShieldAlert } from 'lucide-react'
import { motion } from 'framer-motion'
import { handleGetAdminStats, handleGetAllItems } from '@/actions/admin/item-actions'
import { Item as FrontendItem, ItemCategory, ItemStatus } from '@/types'

export default function AdminDashboard() {
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

  const [stats, setStats] = useState({
    totalItems: 0,
    pendingMatches: 0,
    verifiedItems: 0,
    activeUsers: 0,
    successRate: 0,
  })
  const [pendingMatchesList, setPendingMatchesList] = useState<FrontendItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [statsRes, itemsRes] = await Promise.all([
          handleGetAdminStats(),
          handleGetAllItems(),
        ])

        if (statsRes.status && statsRes.data) {
          const d = statsRes.data
          setStats({
            totalItems: d.totalItems ?? ((d.totalLostItems || 0) + (d.totalFoundItems || 0)),
            pendingMatches: d.pendingMatches ?? d.totalMatches ?? 0,
            verifiedItems: d.verifiedItems ?? d.itemsRecovered ?? 0,
            activeUsers: d.activeUsers ?? 0,
            successRate: d.successRate ?? 0,
          })
        }

        if (itemsRes.status && itemsRes.data) {
          const mapped: FrontendItem[] = itemsRes.data.map((item: any) => ({
            id: item._id,
            title: item.title,
            description: item.description,
            category: (item.category || 'Others') as ItemCategory,
            status: (item.status === 'reported' ? (item.type === 'lost' ? 'lost' : 'found') : item.status) as ItemStatus,
            imageUrl: item.images?.[0] || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=800&auto=format&fit=crop&q=60',
            reportedDate: item.dateLost ? new Date(item.dateLost).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString(),
            location: item.locationLost || 'Unknown',
            userId: item.reportedBy || '',
            contactEmail: item.contactInfo || '',
          }))
          const pending = mapped.filter((item) => item.status === 'matched').slice(0, 3)
          setPendingMatchesList(pending)
        }
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAdminData()
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
      title="Admin Panel"
      requiredRole="admin"
    >
      <motion.div
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage items, users, and system operations</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-5 gap-4"
              variants={itemVariants}
            >
              <GlassCard>
                <div className="p-6 space-y-2">
                  <h3 className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Total Items</h3>
                  <p className="text-3xl font-bold">{stats.totalItems}</p>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    Active items log
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="p-6 space-y-2">
                  <h3 className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Pending Matches</h3>
                  <p className="text-3xl font-bold">{stats.pendingMatches}</p>
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    Awaiting review
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="p-6 space-y-2">
                  <h3 className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Verified Items</h3>
                  <p className="text-3xl font-bold">{stats.verifiedItems}</p>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    Completed
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="p-6 space-y-2">
                  <h3 className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Active Users</h3>
                  <p className="text-3xl font-bold">{stats.activeUsers}</p>
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs">
                    <Users className="w-3 h-3" />
                    Total registered
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="p-6 space-y-2">
                  <h3 className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Success Rate</h3>
                  <p className="text-3xl font-bold">{stats.successRate}%</p>
                  <div className="flex items-center gap-2 text-primary dark:text-primary-foreground text-xs">
                    <TrendingUp className="w-3 h-3" />
                    Items recovered
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Quick Actions */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <h2 className="text-2xl font-bold">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/found-items/add" className="w-full">
                  <GradientButton variant="primary" className="py-4 w-full cursor-pointer">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Found Item
                  </GradientButton>
                </Link>
                <Link href="/admin/matches" className="w-full">
                  <GradientButton variant="secondary" className="py-4 w-full cursor-pointer">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Review Matches
                  </GradientButton>
                </Link>
                <GradientButton variant="accent" className="py-4 cursor-pointer">
                  <Settings className="w-5 h-5 mr-2" />
                  System Settings
                </GradientButton>
              </div>
            </motion.div>

            {/* Pending Matches Section */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Pending Matches for Review</h2>
                <Link href="/admin/matches" className="text-[#004b87] dark:text-[#38bdf8] hover:underline transition-colors text-sm font-semibold">
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingMatchesList.length > 0 ? (
                  pendingMatchesList.map((item, idx) => (
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
                    No matches awaiting review.
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Activities */}
            <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={itemVariants}>
              {/* System Activity */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">System Activity</h2>
                <GlassCard>
                  <div className="space-y-3">
                    {[
                      { action: 'Item Uploaded', time: '5 min ago', user: 'Admin User' },
                      { action: 'Match Verified', time: '12 min ago', user: 'Admin System' },
                      { action: 'Item Claimed', time: '1 hour ago', user: 'Student' },
                      { action: 'New Item Added', time: '2 hours ago', user: 'Admin User' },
                    ].map((activity, idx) => (
                      <motion.div
                        key={idx}
                        className="p-4 border-b border-border last:border-b-0 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div>
                          <p className="font-medium text-sm">{activity.action}</p>
                          <p className="text-xs text-slate-400 mt-1">{activity.user}</p>
                        </div>
                        <span className="text-xs text-slate-500">{activity.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* System Status */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">System Status</h2>
                <GlassCard>
                  <div className="space-y-4 p-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">AI Engine</p>
                        <span className="text-xs bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-2 py-1 rounded font-semibold">Operational</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full w-4/5 bg-green-500 rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Database</p>
                        <span className="text-xs bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-2 py-1 rounded font-semibold">Healthy</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-green-500 rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Storage</p>
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded font-semibold">Warning</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-yellow-500 rounded-full" />
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
