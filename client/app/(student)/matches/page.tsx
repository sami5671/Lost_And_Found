'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { GlassCard } from '@/components/glass-card'
import { Heart, Bell, CheckCircle2, Plus, BarChart3, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { handleGetMatches } from '@/actions/admin/match-actions'
import { useAuth } from '@/lib/auth-context'

export default function StudentMatchesPage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'My Items', href: '/my-items', icon: <Heart className="w-5 h-5" /> },
    { label: 'Notifications', href: '/notifications', icon: <Bell className="w-5 h-5" /> },
    { label: 'Matches', href: '/matches', icon: <CheckCircle2 className="w-5 h-5" /> },
    { label: 'Claims', href: '/claims', icon: <Plus className="w-5 h-5" /> },
    { label: 'Profile', href: '/profile', icon: <Heart className="w-5 h-5" /> },
  ]

  useEffect(() => {
    async function loadMatches() {
      try {
        const res = await handleGetMatches()
        if (res.status && res.data?.matches) {
          setMatches(res.data.matches)
        }
      } catch (err) {
        console.error('Failed to load student matches:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user) {
      loadMatches()
    }
  }, [user])

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
          <h1 className="text-4xl font-bold text-white mb-2">My AI Matches</h1>
          <p className="text-foreground/60">Review automated matches between your reports and other reported items</p>
        </div>

        {/* Matches Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <span className="text-sm text-foreground/40 font-medium">Checking AI database matches...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {matches.map((match, idx) => {
              const lostItem = match.lostItemId
              const foundItem = match.foundItemId
              const matchId = match._id || match.id

              if (!lostItem || !foundItem) return null

              // Determine which item is mine
              const isLostMine = lostItem.reportedBy === user?.id
              const myItem = isLostMine ? lostItem : foundItem
              const matchedItem = isLostMine ? foundItem : lostItem
              const myType = isLostMine ? 'lost' : 'found'

              return (
                <motion.div
                  key={matchId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                >
                  <GlassCard className="p-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                      {/* My Item side */}
                      <div className="flex-1 w-full p-4 rounded-lg bg-purple-500/5 border border-purple-500/10">
                        <div className="flex items-center gap-4">
                          {myItem.images?.[0] ? (
                            <img
                              src={myItem.images[0]}
                              alt={myItem.title}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center text-xl flex-shrink-0">📦</div>
                          )}
                          <div>
                            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">My Reported {myType === 'lost' ? 'Lost' : 'Found'} Item</span>
                            <h3 className="font-bold text-white mt-0.5">{myItem.title}</h3>
                            <p className="text-xs text-foreground/60 line-clamp-1">{myItem.description}</p>
                            <p className="text-xs text-foreground/40 mt-1">📍 {myItem.locationLost}</p>
                          </div>
                        </div>
                      </div>

                      {/* Middle Score Indicator */}
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <span className="text-xs text-foreground/40 font-semibold mb-1">AI Match Score</span>
                        <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-500/30 font-bold text-purple-300">
                          {Math.round(match.similarityScore * 100)}%
                        </div>
                        <ArrowRight className="w-5 h-5 text-foreground/40 mt-2 hidden lg:block" />
                      </div>

                      {/* Matched Item side */}
                      <div className="flex-1 w-full p-4 rounded-lg bg-pink-500/5 border border-pink-500/10">
                        <div className="flex items-center gap-4">
                          {matchedItem.images?.[0] ? (
                            <img
                              src={matchedItem.images[0]}
                              alt={matchedItem.title}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center text-xl flex-shrink-0">🔍</div>
                          )}
                          <div>
                            <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider">Matched {myType === 'lost' ? 'Found' : 'Lost'} Item</span>
                            <h3 className="font-bold text-white mt-0.5">{matchedItem.title}</h3>
                            <p className="text-xs text-foreground/60 line-clamp-1">{matchedItem.description}</p>
                            <p className="text-xs text-foreground/40 mt-1">📍 {matchedItem.locationLost}</p>
                          </div>
                        </div>
                      </div>

                      {/* Status Check */}
                      <div className="w-full lg:w-40 flex flex-col items-center lg:items-end justify-center">
                        <span className={`text-xs font-semibold capitalize px-3 py-1 rounded-full ${
                          match.status === 'verified'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : match.status === 'dismissed'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        }`}>
                          {match.status === 'verified' ? 'Verified Match' : match.status === 'pending' ? 'Under Review' : 'Dismissed'}
                        </span>
                        
                        {match.status === 'verified' && (
                          <p className="text-[10px] text-green-400 text-center lg:text-right mt-1.5 font-medium leading-tight">
                            Claim verified! Please visit the office to complete handover.
                          </p>
                        )}
                        {match.status === 'pending' && (
                          <p className="text-[10px] text-foreground/40 text-center lg:text-right mt-1.5 font-medium leading-tight">
                            Awaiting admin verification check.
                          </p>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )
            })}
            
            {matches.length === 0 && (
              <GlassCard className="p-12 text-center text-foreground/40">
                No matching suggestions detected for your items at this time.
              </GlassCard>
            )}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
