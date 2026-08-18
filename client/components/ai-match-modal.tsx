'use client'

import { handleClaimMatch, handleGetMatches } from '@/actions/admin/match-actions'
import { useAuth } from '@/lib/auth-context'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Clock, Sparkles, X } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const TWO_MINUTES_MS = 2 * 60 * 1000
const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000

export function AiMatchModal() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [matches, setMatches] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [claiming, setClaiming] = useState(false)

  // 1-second ticker for real-time 48-hour countdown timer
  useEffect(() => {
    if (!isOpen) return
    const timer = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [isOpen])

  useEffect(() => {
    // Disable modal for non-authenticated users, admins, and moderators
    if (!isAuthenticated || !user || user.role === 'admin' || user.role === 'moderator') {
      setIsOpen(false)
      setMatches([])
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('ai_match_modal_user')
        sessionStorage.removeItem('ai_match_modal_last_shown')
      }
      return
    }

    // On fresh user login, reset last_shown so the modal appears immediately on 1st login
    let isFreshLogin = false
    if (typeof window !== 'undefined') {
      const activeUserInSession = sessionStorage.getItem('ai_match_modal_user')
      if (activeUserInSession !== user.id) {
        sessionStorage.setItem('ai_match_modal_user', user.id)
        sessionStorage.removeItem('ai_match_modal_last_shown')
        isFreshLogin = true
      }
    }

    async function checkUserMatches(bypassCooldown: boolean = false) {
      // Don't show pop-up modal if user is on matches page or admin routes
      if (pathname === '/matches' || pathname.startsWith('/admin')) {
        return
      }

      // Check if 2-minute cooldown period has passed since last modal appearance (unless fresh login)
      const lastShown = typeof window !== 'undefined' ? sessionStorage.getItem('ai_match_modal_last_shown') : null
      if (lastShown && !bypassCooldown) {
        const timePassed = Date.now() - parseInt(lastShown, 10)
        if (timePassed < TWO_MINUTES_MS) {
          return // Suppress modal if less than 2 minutes have passed
        }
      }

      try {
        const res = await handleGetMatches()
        if (res.status && res.data?.matches && Array.isArray(res.data.matches)) {
          // Include pending, claimed, and verified matches
          const activeMatches = res.data.matches.filter(
            (m: any) => m.status === 'pending' || m.status === 'claimed' || m.status === 'verified'
          )

          if (activeMatches.length > 0) {
            setMatches(activeMatches)
            setIsOpen(true)
            sessionStorage.setItem('ai_match_modal_last_shown', Date.now().toString())
          } else {
            setIsOpen(false)
          }
        }
      } catch (err) {
        console.error('Error checking AI matches for modal:', err)
      }
    }

    // Check immediately on mount / user change (bypassing cooldown if fresh 1st login)
    checkUserMatches(isFreshLogin)

    // 2-minute recurring interval timer check
    const intervalId = setInterval(() => {
      checkUserMatches(false)
    }, TWO_MINUTES_MS)

    return () => clearInterval(intervalId)
  }, [user, isAuthenticated, pathname])

  // Guard clause to suppress modal for admins/moderators, admin routes, or matches page
  if (
    !isOpen ||
    matches.length === 0 ||
    pathname === '/matches' ||
    pathname.startsWith('/admin') ||
    user?.role === 'admin' ||
    user?.role === 'moderator'
  ) {
    return null
  }

  const primaryMatch = matches[0]
  const lostItem = primaryMatch.lostItemId
  const foundItem = primaryMatch.foundItemId
  const matchId = primaryMatch._id || primaryMatch.id

  // Determine which item belongs to the user
  const isLostMine = lostItem && (lostItem.reportedBy?._id === user?.id || lostItem?.reportedBy === user?.id)
  const myItem = isLostMine ? lostItem : foundItem
  const matchedItem = isLostMine ? foundItem : lostItem
  const matchScore = primaryMatch.similarityScore ? Math.round(primaryMatch.similarityScore * 100) : 85
  const isClaimed = primaryMatch.status === 'claimed'

  // Calculate real-time 48-hour countdown remaining time
  const get48HrRemaining = () => {
    const claimedTime = primaryMatch.claimedAt
      ? new Date(primaryMatch.claimedAt).getTime()
      : primaryMatch.updatedAt
      ? new Date(primaryMatch.updatedAt).getTime()
      : primaryMatch.createdAt
      ? new Date(primaryMatch.createdAt).getTime()
      : Date.now()

    const deadline = claimedTime + FORTY_EIGHT_HOURS_MS
    const diff = deadline - now

    if (diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, expired: true }
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return { hours, minutes, seconds, expired: false }
  }

  const countdown = get48HrRemaining()

  const handleClaimItem = async () => {
    setClaiming(true)
    try {
      const res = await handleClaimMatch(matchId)
      if (res.status) {
        setMatches(prev => prev.map(m => (m._id === matchId || m.id === matchId) ? {
          ...m,
          status: 'claimed',
          claimedAt: new Date().toISOString()
        } : m))
      } else {
        alert(res.error || 'Failed to submit claim.')
      }
    } catch (err) {
      console.error('Error claiming match in modal:', err)
    } finally {
      setClaiming(false)
    }
  }

  const handleClaimRedirect = () => {
    setIsOpen(false)
    sessionStorage.setItem('ai_match_modal_last_shown', Date.now().toString())
    router.push('/matches')
  }

  const handleDismiss = () => {
    setIsOpen(false)
    sessionStorage.setItem('ai_match_modal_last_shown', Date.now().toString())
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
        {/* Backdrop overlay animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={handleDismiss}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-2xl backdrop-blur-xl dark:bg-slate-900/95 dark:border-blue-500/30 z-10 transition-colors"
        >
          {/* Top glowing gradient border highlight using brand colors */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#004b87] via-[#0284c7] to-[#16a34a] dark:from-blue-500 dark:via-sky-400 dark:to-emerald-500" />

          {/* Background Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#004b87]/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#16a34a]/10 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Badge & Title */}
          <div className="space-y-3 mb-6">
            {!isClaimed ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-[#004b87]/10 dark:bg-blue-500/20 text-[#004b87] dark:text-blue-300 border border-[#004b87]/20 dark:border-blue-500/30">
                <Sparkles className="w-3.5 h-3.5 text-[#004b87] dark:text-blue-400 animate-pulse" />
                <span>AI Match Detected</span>
                {matches.length > 1 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#004b87]/20 dark:bg-blue-500/40 text-[10px]">
                    +{matches.length - 1} more
                  </span>
                )}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/15 dark:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Claimed - Pending Admin Verification</span>
              </div>
            )}

            <h2 className="text-2xl font-bold text-foreground dark:text-white tracking-tight">
              {!isClaimed ? 'We Found a Match for Your Item!' : 'Item Claim Submitted!'}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {!isClaimed
                ? 'Our AI matching algorithm has identified a potential match between your reported item and an item in our database.'
                : 'You have claimed this item match. Campus administration has up to 48 hours to verify and process handover.'}
            </p>
          </div>

          {/* Real-time 48-Hour Countdown Display for Claimed Items */}
          {isClaimed && (
            <div className="p-4 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 space-y-3 mb-6 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
                <span>⏱️ Admin Confirmation Countdown</span>
                <span className="text-[10px] uppercase bg-amber-500/20 px-2 py-0.5 rounded-full font-bold">48 Hours Window</span>
              </div>

              {/* Big Digital Countdown Clock Display */}
              <div className="grid grid-cols-3 gap-2 text-center my-2">
                <div className="p-2.5 rounded-lg bg-card dark:bg-slate-950/80 border border-amber-500/20 shadow-sm">
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight font-mono">
                    {String(countdown.hours).padStart(2, '0')}
                  </span>
                  <span className="block text-[10px] text-muted-foreground uppercase font-bold mt-0.5">Hours</span>
                </div>
                <div className="p-2.5 rounded-lg bg-card dark:bg-slate-950/80 border border-amber-500/20 shadow-sm">
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight font-mono">
                    {String(countdown.minutes).padStart(2, '0')}
                  </span>
                  <span className="block text-[10px] text-muted-foreground uppercase font-bold mt-0.5">Minutes</span>
                </div>
                <div className="p-2.5 rounded-lg bg-card dark:bg-slate-950/80 border border-amber-500/20 shadow-sm">
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight font-mono animate-pulse">
                    {String(countdown.seconds).padStart(2, '0')}
                  </span>
                  <span className="block text-[10px] text-muted-foreground uppercase font-bold mt-0.5">Seconds</span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-snug text-center font-medium">
                {countdown.expired
                  ? 'The 48-hour admin review window has elapsed. Please check with office administration.'
                  : 'Administration will verify ownership and confirm claim handover before timer expires.'}
              </p>
            </div>
          )}

          {/* Match Preview Box */}
          {myItem && matchedItem && (
            <div className="p-4 rounded-xl bg-muted/60 dark:bg-white/5 border border-border space-y-4 mb-6 relative overflow-hidden">
              {/* Match Percentage Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Match Confidence</span>
                <span className="px-2.5 py-1 text-xs font-extrabold rounded-full bg-gradient-to-r from-[#004b87]/15 to-[#16a34a]/15 dark:from-blue-500/25 dark:to-emerald-500/25 border border-[#004b87]/20 dark:border-blue-500/40 text-[#004b87] dark:text-blue-300">
                  ⚡ {matchScore}% Match
                </span>
              </div>

              {/* Items Comparison */}
              <div className="grid grid-cols-2 gap-3 items-center">
                {/* My Item */}
                <div className="p-3 rounded-lg bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20">
                  <div className="text-[10px] uppercase font-bold text-[#004b87] dark:text-blue-400 mb-1">Your Item</div>
                  <div className="flex items-center gap-2">
                    {myItem.images?.[0] ? (
                      <img
                        src={myItem.images[0]}
                        alt={myItem.title}
                        className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-blue-500/20 dark:bg-blue-900/40 flex items-center justify-center text-lg flex-shrink-0">
                        📦
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground dark:text-white truncate">{myItem.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{myItem.category || 'Item'}</p>
                    </div>
                  </div>
                </div>

                {/* Matched Found Item */}
                <div className="p-3 rounded-lg bg-green-500/10 dark:bg-emerald-500/15 border border-green-500/20 dark:border-emerald-500/20">
                  <div className="text-[10px] uppercase font-bold text-[#16a34a] dark:text-emerald-400 mb-1">Matched Item</div>
                  <div className="flex items-center gap-2">
                    {matchedItem.images?.[0] ? (
                      <img
                        src={matchedItem.images[0]}
                        alt={matchedItem.title}
                        className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-green-500/20 dark:bg-emerald-900/40 flex items-center justify-center text-lg flex-shrink-0">
                        🔍
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground dark:text-white truncate">{matchedItem.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{matchedItem.locationLost || 'Campus'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5">
            {!isClaimed ? (
              <button
                disabled={claiming}
                onClick={handleClaimItem}
                className="w-full py-3 px-5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#004b87] via-[#0060ad] to-[#16a34a] hover:from-[#003c6c] hover:to-[#15803d] dark:from-blue-600 dark:via-sky-600 dark:to-emerald-600 dark:hover:from-blue-500 dark:hover:to-emerald-500 shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{claiming ? 'Claiming Item...' : 'Claim Item'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleClaimRedirect}
                className="w-full py-3 px-5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#004b87] via-[#0060ad] to-[#16a34a] hover:from-[#003c6c] hover:to-[#15803d] dark:from-blue-600 dark:via-sky-600 dark:to-emerald-600 dark:hover:from-blue-500 dark:hover:to-emerald-500 shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>View Matches Status</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleDismiss}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            >
              Remind Me Later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
