'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { GlassCard } from '@/components/glass-card'
import { useAuth } from '@/lib/auth-context'
import { Heart, Bell, CheckCircle2, Plus, BarChart3, Mail, Phone, MapPin } from 'lucide-react'
import { handleGetMyStats } from '@/actions/admin/item-actions'

export default function ProfilePage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    lostCount: 0,
    matchCount: 0,
    resolvedCount: 0,
  })
  const [loading, setLoading] = useState(true)

  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Report Now', href: '/report', icon: <Plus className="w-5 h-5" /> },
    { label: 'My Items', href: '/my-items', icon: <Heart className="w-5 h-5" /> },
    { label: 'Notifications', href: '/notifications', icon: <Bell className="w-5 h-5" /> },
    { label: 'Matches', href: '/matches', icon: <CheckCircle2 className="w-5 h-5" /> },
    { label: 'Claims', href: '/claims', icon: <Plus className="w-5 h-5" /> },
    { label: 'Profile', href: '/profile', icon: <Heart className="w-5 h-5" /> },
  ]

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await handleGetMyStats()
        if (res.status && res.data) {
          setStats(res.data)
        }
      } catch (err) {
        console.error('Failed to load user stats for profile:', err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title="Lost & Found"
      requiredRole="student"
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Profile</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <GlassCard>
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#004b87] to-[#16a34a] flex items-center justify-center text-2xl">
                👤
              </div>
              <h2 className="text-xl font-bold mb-1">{user?.fullName || user?.name || 'User'}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{user?.email}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-foreground/60">
                  <Phone className="w-4 h-4" />
                  {user?.primaryNumber || 'No Phone Number'}
                </div>
                <div className="flex items-center gap-2 text-foreground/60">
                  <MapPin className="w-4 h-4" />
                  {user?.address || 'Dhaka, Bangladesh'}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Stats */}
          <GlassCard>
            <div className="p-6">
              <h3 className="font-bold mb-4">Activity Stats</h3>
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Items Reported</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.lostCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Matches Found</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.matchCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Items Recovered</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.resolvedCount}</p>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Preferences */}
          <GlassCard>
            <div className="p-6">
              <h3 className="font-bold mb-4">Notification Preferences</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span className="text-sm">Email Notifications</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span className="text-sm">Match Alerts</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span className="text-sm">Claim Updates</span>
                </label>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Verification Documents Section */}
        {(user?.idCardFront || user?.idCardBack) && (
          <GlassCard>
            <div className="p-6">
              <h3 className="font-bold text-lg mb-4 text-primary">Verification ID Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user?.idCardFront && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">ID Card Front Side</p>
                    <div className="relative rounded-xl overflow-hidden border border-border aspect-[1.58/1] bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={user.idCardFront}
                        alt="ID Card Front"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                )}
                {user?.idCardBack && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">ID Card Back Side</p>
                    <div className="relative rounded-xl overflow-hidden border border-border aspect-[1.58/1] bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={user.idCardBack}
                        alt="ID Card Back"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </DashboardLayout>
  )
}
