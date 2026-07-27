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
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">AI Match Review</h1>
          <p className="text-slate-600 dark:text-slate-400">Verify automated matches detected by the AI model</p>
        </div>

        {/* Matches Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Analyzing database matches...</span>
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
                      <div className="flex-1 w-full p-4.5 rounded-xl bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-500/20 shadow-sm">
                        <div className="flex items-center gap-4">
                          {lostItem.images?.[0] && (
                            <img
                              src={lostItem.images[0]}
                              alt={lostItem.title}
                              className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-slate-200 dark:border-white/10"
                            />
                          )}
                          <div>
                            <span className="text-xs font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider">Lost Item</span>
                            <h3 className="font-bold text-slate-900 dark:text-white mt-0.5">{lostItem.title}</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">{lostItem.description}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">📍 {lostItem.locationLost}</p>
                          </div>
                        </div>
                      </div>

                      {/* Middle Score Indicator */}
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-bold mb-1.5 uppercase tracking-wider">AI Similarity</span>
                        <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold text-sm shadow-md shadow-emerald-500/20">
                          {Math.round(match.similarityScore * 100)}%
                        </div>
                        <ArrowRight className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mt-2 hidden lg:block" />
                      </div>

                      {/* Found Item side */}
                      <div className="flex-1 w-full p-4.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
                        <div className="flex items-center gap-4">
                          {foundItem.images?.[0] && (
                            <img
                              src={foundItem.images[0]}
                              alt={foundItem.title}
                              className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-slate-200 dark:border-white/10"
                            />
                          )}
                          <div>
                            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Found Item</span>
                            <h3 className="font-bold text-slate-900 dark:text-white mt-0.5">{foundItem.title}</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">{foundItem.description}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">📍 {foundItem.locationLost}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row lg:flex-col gap-2.5 w-full lg:w-auto justify-end">
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
                            <button 
                              className="flex-1 lg:w-32 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                              onClick={() => handleDismiss(matchId)}
                            >
                              <XCircle className="w-4 h-4 mr-1.5 text-slate-500" />
                              Dismiss
                            </button>
                          </>
                        ) : (
                          <div className="text-center w-full lg:w-32 py-2">
                            <span className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border ${
                              match.status === 'approved' || match.status === 'verified'
                                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                : 'bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
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
              <GlassCard className="p-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                No matching suggestions at this time.
              </GlassCard>
            )}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
