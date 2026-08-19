'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { GlassCard } from '@/components/glass-card'
import { Heart, Bell, CheckCircle2, Plus, BarChart3, ArrowRight, Check, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { handleGetMatches, handleClaimMatch } from '@/actions/admin/match-actions'
import { useAuth } from '@/lib/auth-context'

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000

export default function StudentMatchesPage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())

  // 1-second ticker for real-time 48-hour countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Report Now', href: '/report', icon: <Plus className="w-5 h-5" /> },
    { label: 'My Items', href: '/my-items', icon: <Heart className="w-5 h-5" /> },
    { label: 'Notifications', href: '/notifications', icon: <Bell className="w-5 h-5" /> },
    { label: 'Matches', href: '/matches', icon: <CheckCircle2 className="w-5 h-5" /> },
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

  const handleClaim = async (matchId: string) => {
    setClaimingId(matchId)
    try {
      const res = await handleClaimMatch(matchId)
      if (res.status) {
        setMatches(prev => prev.map(m => (m._id === matchId || m.id === matchId) ? {
          ...m,
          status: 'claimed',
          claimedAt: new Date().toISOString()
        } : m))
        alert('Success! Your item claim has been submitted. Administration will review your claim within 48 hours.')
      } else {
        alert(res.error || 'Failed to submit claim.')
      }
    } catch (err) {
      console.error('Error claiming match:', err)
    } finally {
      setClaimingId(null)
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
          <h1 className="text-4xl font-bold text-foreground mb-2">My AI Matches</h1>
          <p className="text-muted-foreground">Review automated matches between your reports and other reported items</p>
        </div>

        {/* Matches Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004b87] dark:border-sky-400"></div>
            <span className="text-sm text-muted-foreground font-medium">Checking AI database matches...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {matches.map((match, idx) => {
              const lostItem = match.lostItemId
              const foundItem = match.foundItemId
              const matchId = match._id || match.id

              if (!lostItem || !foundItem) return null

              // Determine which item is mine
              const isLostMine = lostItem.reportedBy === user?.id || lostItem.reportedBy?._id === user?.id
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
                      <div className="flex-1 w-full p-4 rounded-lg bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20">
                        <div className="flex items-center gap-4">
                          {myItem.images?.[0] ? (
                            <img
                              src={myItem.images[0]}
                              alt={myItem.title}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-blue-500/20 dark:bg-blue-900/40 flex items-center justify-center text-xl flex-shrink-0">📦</div>
                          )}
                          <div>
                            <span className="text-xs font-bold text-[#004b87] dark:text-blue-400 uppercase tracking-wider">My Reported {myType === 'lost' ? 'Lost' : 'Found'} Item</span>
                            <h3 className="font-bold text-foreground mt-0.5">{myItem.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1">{myItem.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">📍 {myItem.locationLost || myItem.locationFound || 'Campus'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Middle Score Indicator */}
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <span className="text-xs text-muted-foreground font-semibold mb-1">AI Match Score</span>
                        <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#004b87]/15 to-[#16a34a]/15 dark:from-blue-500/25 dark:to-emerald-500/25 border border-[#004b87]/20 dark:border-blue-500/30 font-extrabold text-[#004b87] dark:text-blue-300">
                          ⚡ {Math.round(match.similarityScore * 100)}%
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground mt-2 hidden lg:block" />
                      </div>

                      {/* Matched Item side */}
                      <div className="flex-1 w-full p-4 rounded-lg bg-green-500/10 dark:bg-emerald-500/15 border border-green-500/20 dark:border-emerald-500/20">
                        <div className="flex items-center gap-4">
                          {matchedItem.images?.[0] ? (
                            <img
                              src={matchedItem.images[0]}
                              alt={matchedItem.title}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-green-500/20 dark:bg-emerald-900/40 flex items-center justify-center text-xl flex-shrink-0">🔍</div>
                          )}
                          <div>
                            <span className="text-xs font-bold text-[#16a34a] dark:text-emerald-400 uppercase tracking-wider">Matched {myType === 'lost' ? 'Found' : 'Lost'} Item</span>
                            <h3 className="font-bold text-foreground mt-0.5">{matchedItem.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1">{matchedItem.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">📍 {matchedItem.locationLost || matchedItem.locationFound || 'Campus'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Status Check & Action */}
                      <div className="w-full lg:w-48 flex flex-col items-center lg:items-end justify-center gap-2">
                        <span className={`text-xs font-semibold capitalize px-3 py-1 rounded-full text-center ${
                          match.status === 'verified'
                            ? 'bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30'
                            : match.status === 'claimed'
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                            : match.status === 'dismissed'
                            ? 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30'
                        }`}>
                          {match.status === 'verified'
                            ? 'Handover Complete (Verified)'
                            : match.status === 'claimed'
                            ? 'Claimed (Under Review)'
                            : match.status === 'pending'
                            ? 'Pending Claim'
                            : 'Dismissed'}
                        </span>

                        {match.status === 'pending' && (
                          <button
                            disabled={claimingId === matchId}
                            onClick={() => handleClaim(matchId)}
                            className="w-full px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#004b87] via-[#0060ad] to-[#16a34a] hover:from-[#003c6c] hover:to-[#15803d] dark:from-blue-600 dark:via-sky-600 dark:to-emerald-600 dark:hover:from-blue-500 dark:hover:to-emerald-500 rounded-lg shadow-md hover:scale-[1.02] disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {claimingId === matchId ? 'Claiming...' : 'Claim This Item'}
                          </button>
                        )}
                        
                        {match.status === 'claimed' && (() => {
                          const claimedTime = match.claimedAt
                            ? new Date(match.claimedAt).getTime()
                            : match.updatedAt
                            ? new Date(match.updatedAt).getTime()
                            : match.createdAt
                            ? new Date(match.createdAt).getTime()
                            : Date.now()

                          const deadline = claimedTime + FORTY_EIGHT_HOURS_MS
                          const diff = deadline - now

                          if (diff <= 0) {
                            return (
                              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center w-full">
                                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">48h Review Expired</p>
                                <p className="text-[9px] text-muted-foreground">Visit office for status</p>
                              </div>
                            )
                          }

                          const hours = Math.floor(diff / (1000 * 60 * 60))
                          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                          const seconds = Math.floor((diff % (1000 * 60)) / 1000)

                          return (
                            <div className="p-2.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-center w-full shadow-sm">
                              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-0.5">
                                <Clock className="w-3 h-3 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
                                <span>Admin Confirmation</span>
                              </div>
                              <div className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
                                {String(hours).padStart(2, '0')}h {String(minutes).padStart(2, '0')}m <span className="animate-pulse">{String(seconds).padStart(2, '0')}s</span>
                              </div>
                              <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">48h timer remaining</p>
                            </div>
                          )
                        })()}

                        {match.status === 'verified' && (
                          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-sky-500/10 to-blue-500/15 border border-emerald-500/30 space-y-1.5 text-center lg:text-right w-full shadow-sm">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-extrabold text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Handover Successful!</span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-200 font-bold leading-tight">
                              🎉 Item handover verified & completed by administration.
                            </p>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
                              📧 Confirmation email sent to your registered address
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )
            })}
            
            {matches.length === 0 && (
              <GlassCard className="p-12 text-center text-muted-foreground">
                No matching suggestions detected for your items at this time.
              </GlassCard>
            )}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
