'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { GlassCard } from '@/components/glass-card'
import { Heart, Bell, CheckCircle2, Plus, BarChart3, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { handleGetMatches } from '@/actions/admin/match-actions'
import { useAuth } from '@/lib/auth-context'

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Report Now', href: '/report', icon: <Plus className="w-5 h-5" /> },
    { label: 'My Items', href: '/my-items', icon: <Heart className="w-5 h-5" /> },
    { label: 'Notifications', href: '/notifications', icon: <Bell className="w-5 h-5" /> },
    { label: 'Matches', href: '/matches', icon: <CheckCircle2 className="w-5 h-5" /> },
    { label: 'Profile', href: '/profile', icon: <Heart className="w-5 h-5" /> },
  ]

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await handleGetMatches()
        if (res.status && res.data?.matches) {
          const matches = res.data.matches
          const list: any[] = []
          
          matches.forEach((match: any) => {
            const lostItem = match.lostItemId
            const foundItem = match.foundItemId
            const matchId = match._id || match.id
            
            if (!lostItem || !foundItem) return
            
            const isLostMine = lostItem.reportedBy === user?.id
            const myItem = isLostMine ? lostItem : foundItem
            const matchedItem = isLostMine ? foundItem : lostItem
            
            if (match.status === 'pending') {
              list.push({
                id: `pending-${matchId}`,
                type: 'match',
                title: 'Potential AI Match Identified',
                message: `Our AI system identified a high similarity match (${Math.round(match.similarityScore * 100)}%) between your reported item "${myItem.title}" and a candidate item "${matchedItem.title}".`,
                timestamp: new Date(match.createdAt || Date.now()).toLocaleString(),
              })
            } else if (match.status === 'verified') {
              list.push({
                id: `verified-${matchId}`,
                type: 'verified',
                title: 'Match Verified by Admin!',
                message: `An administrator verified that your item "${myItem.title}" matches the reported item "${matchedItem.title}". Please visit the Lost & Found office or check claiming details to claim it.`,
                timestamp: new Date(match.updatedAt || Date.now()).toLocaleString(),
              })
            }
          })
          
          setNotifications(list)
        }
      } catch (err) {
        console.error('Failed to load notifications from matches:', err)
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      loadNotifications()
    }
  }, [user])

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'match':
        return 'from-blue-500/10 to-transparent border-blue-500/30'
      case 'verified':
        return 'from-green-500/10 to-transparent border-green-500/30'
      default:
        return 'from-slate-500/10 to-transparent border-slate-500/30'
    }
  }

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'match':
        return 'border-blue-500'
      case 'verified':
        return 'border-green-500'
      default:
        return 'border-slate-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'match':
        return '🎯'
      case 'verified':
        return '✅'
      default:
        return '📢'
    }
  }

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title="Lost & Found"
      requiredRole="student"
    >
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Notifications</h1>
          <p className="text-slate-500 dark:text-slate-400">Stay updated on your lost and found items</p>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notif, idx) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <GlassCard>
                  <div className={`p-6 flex items-start justify-between border-l-4 ${getBorderColor(notif.type)} bg-gradient-to-r ${getNotificationColor(notif.type)}`}>
                    <div className="flex gap-4 flex-1">
                      <div className="text-3xl flex-shrink-0">
                        {getTypeIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg mb-1 text-slate-900 dark:text-white">{notif.title}</h3>
                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{notif.message}</p>
                        <p className="text-foreground/40 text-xs mt-3">{notif.timestamp}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="ml-4 flex-shrink-0 p-2 rounded-lg hover:bg-white/10 transition-colors text-foreground/60 hover:text-foreground cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard>
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">No notifications</h3>
              <p className="text-slate-500 dark:text-slate-400">You&apos;re all caught up!</p>
            </div>
          </GlassCard>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
