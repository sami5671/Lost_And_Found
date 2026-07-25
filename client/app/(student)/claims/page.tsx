'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { GlassCard } from '@/components/glass-card'
import { Heart, Bell, CheckCircle2, Plus, BarChart3, Clock, Check, HelpCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { handleGetMatches } from '@/actions/admin/match-actions'
import { useAuth } from '@/lib/auth-context'

export default function ClaimsPage() {
  const { user } = useAuth()
  const [claims, setClaims] = useState<any[]>([])
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
    async function loadClaims() {
      try {
        const res = await handleGetMatches()
        if (res.status && res.data?.matches) {
          const matches = res.data.matches
          
          // A claim in our database is a verified match or resolved item that the student owns
          const studentClaims = matches.filter((m: any) => {
            const isOwner = m.lostItemId?.reportedBy === user?.id
            // We want to track matches that are verified or have been resolved
            const isVerifiedOrResolved = m.status === 'verified' || m.lostItemId?.status === 'resolved'
            return isOwner && isVerifiedOrResolved
          })
          
          setClaims(studentClaims)
        }
      } catch (err) {
        console.error('Failed to load student claims:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadClaims()
    }
  }, [user])

  const getStepStatus = (match: any, step: number) => {
    const isResolved = match.lostItemId?.status === 'resolved' || match.foundItemId?.status === 'resolved'
    const isVerified = match.status === 'verified' || isResolved
    
    if (step === 1) return 'completed' // Reported
    if (step === 2) return 'completed' // AI Matched
    if (step === 3) return isVerified ? 'completed' : 'pending' // Admin Verified
    if (step === 4) return isResolved ? 'completed' : 'pending' // Handover Completed
    return 'pending'
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
          <h1 className="text-4xl font-bold text-white mb-2">Claim Progress Tracker</h1>
          <p className="text-foreground/60">Track verifications and handover steps for your verified lost items</p>
        </div>

        {/* Claims List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <span className="text-sm text-foreground/40 font-medium">Loading claim statuses...</span>
          </div>
        ) : claims.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {claims.map((claim, idx) => {
              const lostItem = claim.lostItemId
              const foundItem = claim.foundItemId
              const isResolved = lostItem?.status === 'resolved'

              if (!lostItem || !foundItem) return null

              const steps = [
                { id: 1, label: 'Reported', desc: 'Item reported lost' },
                { id: 2, label: 'AI Matched', desc: `${Math.round(claim.similarityScore * 100)}% match found` },
                { id: 3, label: 'Admin Verified', desc: 'Owner verification complete' },
                { id: 4, label: 'Handover Completed', desc: 'Item successfully claimed' },
              ]

              return (
                <motion.div
                  key={claim._id || claim.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                >
                  <GlassCard className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-purple-500/10 pb-4 mb-6 gap-4">
                      <div>
                        <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Claim Reference ID: {claim._id || claim.id}</span>
                        <h3 className="text-xl font-bold text-white mt-1">{lostItem.title}</h3>
                        <p className="text-xs text-foreground/60">Matching Found Item: "{foundItem.title}"</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${
                          isResolved
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : 'bg-green-500/20 text-green-300 border-green-500/30'
                        }`}>
                          {isResolved ? 'Handover Completed' : 'Ready to Claim'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Timeline */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                      {steps.map((step, sIdx) => {
                        const status = getStepStatus(claim, step.id)
                        
                        return (
                          <div key={step.id} className="flex flex-col items-center text-center relative">
                            {/* Step connector line */}
                            {sIdx < 3 && (
                              <div className="hidden md:block absolute top-5 left-[60%] right-[-40%] h-[2px] bg-purple-500/20 z-0">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                  style={{ width: getStepStatus(claim, step.id + 1) === 'completed' ? '100%' : '0%' }}
                                />
                              </div>
                            )}

                            {/* Circle Indicator */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold z-10 border transition-all duration-300 ${
                              status === 'completed'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                                : 'bg-white/5 text-foreground/30 border-purple-500/20'
                            }`}>
                              {status === 'completed' ? <Check className="w-5 h-5" /> : step.id}
                            </div>

                            {/* Labels */}
                            <p className="font-bold text-sm text-white mt-3">{step.label}</p>
                            <p className="text-xs text-foreground/50 mt-1 max-w-[150px]">{step.desc}</p>
                          </div>
                        )
                      })}
                    </div>

                    {/* Timeline Instruction Notice */}
                    {!isResolved && (
                      <div className="mt-8 p-4 rounded-lg bg-purple-500/5 border border-purple-500/10 flex items-start gap-3">
                        <Clock className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-white">Next Step: Claim Your Item</p>
                          <p className="text-xs text-foreground/60 mt-0.5">
                            Please proceed to the campus Lost & Found center. Bring your Student ID Card as proof of ownership. Provide the admin with the reference ID above to finalize the handover.
                          </p>
                        </div>
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <GlassCard className="p-12 text-center text-foreground/40">
            No active claim verifications found. You will see claim trackers once the administrator approves a match for your items.
          </GlassCard>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
