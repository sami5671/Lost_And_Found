'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { GlassCard } from '@/components/glass-card'
import { GradientButton } from '@/components/gradient-button'
import { Users, Package, AlertCircle, CheckCircle2, TrendingUp, BarChart3, ArrowRight, XCircle, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { handleGetMatches, handleApproveMatch, handleDismissMatch } from '@/actions/admin/match-actions'

export default function AdminMatchesPage() {
  const sidebarItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { label: 'Lost Items', href: '/admin/lost-items', icon: <Package className="w-5 h-5" /> },
    { label: 'Found Items', href: '/admin/found-items', icon: <CheckCircle2 className="w-5 h-5" /> },
    { label: 'Matches', href: '/admin/matches', icon: <AlertCircle className="w-5 h-5" /> },
    { label: 'Reports', href: '/admin/reports', icon: <TrendingUp className="w-5 h-5" /> },
  ]

  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMatches() {
      try {
        const res = await handleGetMatches()
        if (res.status && res.data?.matches) {
          setMatches(res.data.matches)
        }
      } catch (err) {
        console.error('Failed to load matches:', err)
      } finally {
        setLoading(false)
      }
    }
    loadMatches()
  }, [])

  const handleApprove = async (matchId: string) => {
    try {
      const res = await handleApproveMatch(matchId)
      if (res.status) {
        setMatches(prev => prev.map(m => m._id === matchId ? { ...m, status: 'verified' } : m))
      }
    } catch (err) {
      console.error('Failed to verify match:', err)
    }
  }

  const handleDismiss = async (matchId: string) => {
    try {
      const res = await handleDismissMatch(matchId)
      if (res.status) {
        setMatches(prev => prev.map(m => m._id === matchId ? { ...m, status: 'dismissed' } : m))
      }
    } catch (err) {
      console.error('Failed to dismiss match:', err)
    }
  }

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
          <h1 className="text-4xl font-bold text-white mb-2">AI Match Review</h1>
          <p className="text-foreground/60">Verify automated matches detected by the AI model</p>
        </div>

        {/* Matches Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <span className="text-sm text-foreground/40 font-medium">Analyzing database matches...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {matches.map((match, idx) => {
              const lostItem = match.lostItemId
              const foundItem = match.foundItemId
              const matchId = match._id || match.id

              if (!lostItem || !foundItem) return null

              return (
                <motion.div
                  key={matchId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                >
                  <GlassCard className="p-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                      {/* Lost Item side */}
                      <div className="flex-1 w-full p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                        <div className="flex items-center gap-4">
                          {lostItem.images?.[0] && (
                            <img
                              src={lostItem.images[0]}
                              alt={lostItem.title}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div>
                            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Lost Item</span>
                            <h3 className="font-bold text-white mt-0.5">{lostItem.title}</h3>
                            <p className="text-xs text-foreground/60 line-clamp-1">{lostItem.description}</p>
                            <p className="text-xs text-foreground/40 mt-1">📍 {lostItem.locationLost}</p>
                          </div>
                        </div>
                      </div>

                      {/* Middle Score Indicator */}
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <span className="text-xs text-foreground/40 font-semibold mb-1">AI Similarity</span>
                        <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-500/30 font-bold text-purple-300">
                          {Math.round(match.similarityScore * 100)}%
                        </div>
                        <ArrowRight className="w-5 h-5 text-foreground/40 mt-2 hidden lg:block" />
                      </div>

                      {/* Found Item side */}
                      <div className="flex-1 w-full p-4 rounded-lg bg-green-500/5 border border-green-500/10">
                        <div className="flex items-center gap-4">
                          {foundItem.images?.[0] && (
                            <img
                              src={foundItem.images[0]}
                              alt={foundItem.title}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div>
                            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Found Item</span>
                            <h3 className="font-bold text-white mt-0.5">{foundItem.title}</h3>
                            <p className="text-xs text-foreground/60 line-clamp-1">{foundItem.description}</p>
                            <p className="text-xs text-foreground/40 mt-1">📍 {foundItem.locationLost}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto justify-end">
                        {match.status === 'pending' ? (
                          <>
                            <GradientButton 
                              variant="primary" 
                              className="flex-1 lg:w-32 py-2 text-sm cursor-pointer"
                              onClick={() => handleApprove(matchId)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1.5" />
                              Verify
                            </GradientButton>
                            <GradientButton 
                              variant="secondary" 
                              className="flex-1 lg:w-32 py-2 text-sm cursor-pointer"
                              onClick={() => handleDismiss(matchId)}
                            >
                              <XCircle className="w-4 h-4 mr-1.5" />
                              Dismiss
                            </GradientButton>
                          </>
                        ) : (
                          <div className="text-center w-full lg:w-32 py-2">
                            <span className={`text-sm font-semibold capitalize px-3 py-1 rounded-full ${
                              match.status === 'approved' || match.status === 'verified'
                                ? 'bg-green-500/20 text-green-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}>
                              {match.status === 'verified' ? 'Verified' : match.status}
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
              <GlassCard className="p-12 text-center text-foreground/40">
                No matching suggestions at this time.
              </GlassCard>
            )}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
