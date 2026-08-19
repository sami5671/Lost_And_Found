'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { GlassCard } from '@/components/glass-card'
import { GradientButton } from '@/components/gradient-button'
import { 
  Users, 
  Package, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  BarChart3, 
  ArrowRight, 
  XCircle, 
  CheckCircle, 
  User, 
  Mail, 
  Phone,
  Sparkles,
  ShieldAlert
} from 'lucide-react'
import { motion } from 'framer-motion'
import { handleGetMatches, handleApproveMatch, handleDismissMatch } from '@/actions/admin/match-actions'

export default function AdminMatchesPage() {
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
        setMatches(prev => prev.map(m => (m._id === matchId || m.id === matchId) ? { ...m, status: 'verified' } : m))
        alert('Match verified successfully! The item is now marked as a Verified Match, and automated handover notification email has been sent.')
      } else {
        alert(res.error || 'Failed to verify match.')
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
          <p className="text-slate-600 dark:text-slate-400">Review automated matches (&ge;65% similarity score) and owner claim details</p>
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

              const owner = lostItem.reportedBy || {}
              const finder = foundItem.reportedBy || {}
              const scorePercent = Math.round((match.similarityScore || 0) * 100)

              return (
                <motion.div
                  key={matchId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                >
                  <GlassCard className="p-6 space-y-6">
                    {/* Top Match Banner */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-emerald-500/20">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          Found Item <span className="text-emerald-600 dark:text-emerald-400">&quot;{foundItem.title}&quot;</span> matched with Lost Item <span className="text-red-600 dark:text-red-400">&quot;{lostItem.title}&quot;</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Score:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                          scorePercent >= 65
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-yellow-400'
                        }`}>
                          {scorePercent}% Match
                        </span>
                      </div>
                    </div>

                    {/* Side by side items */}
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                      {/* Lost Item Side */}
                      <div className="flex-1 w-full p-4.5 rounded-xl bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-500/20 shadow-sm space-y-3">
                        <div className="flex items-center gap-4">
                          {lostItem.images?.[0] ? (
                            <img
                              src={lostItem.images[0]}
                              alt={lostItem.title}
                              className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-slate-200 dark:border-white/10"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-400 shrink-0">No Image</div>
                          )}
                          <div>
                            <span className="text-xs font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider">Lost Item</span>
                            <h3 className="font-bold text-slate-900 dark:text-white mt-0.5">{lostItem.title}</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">{lostItem.description}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">📍 {lostItem.locationLost}</p>
                          </div>
                        </div>

                        {/* Owner Info Box */}
                        <div className="p-3 rounded-lg bg-white/80 dark:bg-black/40 border border-red-200 dark:border-red-500/20 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-red-700 dark:text-red-300 uppercase tracking-wider text-[10px]">Item Owner</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-semibold">
                            <User className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            <span>{owner.fullName || owner.name || 'Unknown Owner'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            <span className="truncate">{owner.email || lostItem.contactInfo || 'N/A'}</span>
                          </div>
                          {(owner.phone || owner.contactInfo || lostItem.contactInfo) && (
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                              <Phone className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              <span>{owner.phone || owner.contactInfo || lostItem.contactInfo}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Middle Connector */}
                      <div className="flex flex-col items-center justify-center text-center p-2">
                        <ArrowRight className="w-6 h-6 text-emerald-500 dark:text-emerald-400 hidden lg:block" />
                      </div>

                      {/* Found Item Side */}
                      <div className="flex-1 w-full p-4.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 shadow-sm space-y-3">
                        <div className="flex items-center gap-4">
                          {foundItem.images?.[0] ? (
                            <img
                              src={foundItem.images[0]}
                              alt={foundItem.title}
                              className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-slate-200 dark:border-white/10"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-400 shrink-0">No Image</div>
                          )}
                          <div>
                            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Found Item</span>
                            <h3 className="font-bold text-slate-900 dark:text-white mt-0.5">{foundItem.title}</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">{foundItem.description}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">📍 {foundItem.locationLost}</p>
                          </div>
                        </div>

                        {/* Finder Info Box */}
                        <div className="p-3 rounded-lg bg-white/80 dark:bg-black/40 border border-emerald-200 dark:border-emerald-500/20 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider text-[10px]">Item Finder / Reporter</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-semibold">
                            <User className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{finder.fullName || finder.name || 'Unknown Finder'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">{finder.email || foundItem.contactInfo || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2.5 w-full lg:w-auto items-end justify-center">
                        {match.status === 'claimed' && (
                          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-yellow-300 text-xs font-extrabold flex flex-col items-end gap-1 shadow-sm">
                            <span className="uppercase tracking-wider text-[10px] text-amber-600 dark:text-yellow-400">Claim Status</span>
                            <span>claimed by {owner.fullName || owner.name || 'Claimed User'}{owner.email ? ` (${owner.email})` : ''}</span>
                          </div>
                        )}

                        {match.status === 'pending' || match.status === 'claimed' ? (
                          <div className="flex flex-row lg:flex-col gap-2.5 w-full lg:w-36">
                            <GradientButton 
                              variant="primary" 
                              className="flex-1 py-2 text-sm cursor-pointer"
                              onClick={() => handleApprove(matchId)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1.5" />
                              Verify Match
                            </GradientButton>
                            <button 
                              className="flex-1 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                              onClick={() => handleDismiss(matchId)}
                            >
                              <XCircle className="w-4 h-4 mr-1.5 text-slate-500" />
                              Dismiss
                            </button>
                          </div>
                        ) : (
                          <div className="text-center w-full lg:w-36 py-2">
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
