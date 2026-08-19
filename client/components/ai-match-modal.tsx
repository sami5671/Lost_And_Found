'use client'

import { handleGetMyItems } from '@/actions/admin/item-actions'
import { handleClaimMatch, handleGetMatches } from '@/actions/admin/match-actions'
import { useAuth } from '@/lib/auth-context'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Clock, ShieldCheck, Sparkles, X, Building2, MapPin, FileText } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const TWO_MINUTES_MS = 2 * 60 * 1000
const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000

export function AiMatchModal() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [matches, setMatches] = useState<any[]>([])
  const [unmatchedItems, setUnmatchedItems] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [claimingId, setClaimingId] = useState<string | null>(null)

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
      setUnmatchedItems([])
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('ai_match_modal_user')
        sessionStorage.removeItem('ai_match_modal_last_shown')
        sessionStorage.removeItem('just_reported_item')
        sessionStorage.removeItem('ai_match_modal_force')
      }
      return
    }

    // On fresh user login, reset last_shown and clear stale items from prior session
    let isFreshLogin = false
    if (typeof window !== 'undefined') {
      const activeUserInSession = sessionStorage.getItem('ai_match_modal_user')
      const currentUserId = user.id || user._id
      if (activeUserInSession !== currentUserId) {
        sessionStorage.setItem('ai_match_modal_user', currentUserId)
        sessionStorage.removeItem('ai_match_modal_last_shown')
        sessionStorage.removeItem('just_reported_item')
        sessionStorage.removeItem('ai_match_modal_force')
        isFreshLogin = true
      }
    }

    async function checkUserMatches(bypassCooldown: boolean = false) {
      // Don't show pop-up modal if user is on admin routes
      if (pathname.startsWith('/admin')) {
        return
      }

      const currentUserId = user.id || user._id
      const forceOpen = typeof window !== 'undefined' && sessionStorage.getItem('ai_match_modal_force') === 'true'

      // Check if 2-minute cooldown period has passed since last modal appearance (unless fresh login or forced after report)
      const lastShown = typeof window !== 'undefined' ? sessionStorage.getItem('ai_match_modal_last_shown') : null
      if (lastShown && !bypassCooldown && !forceOpen) {
        const timePassed = Date.now() - parseInt(lastShown, 10)
        if (timePassed < TWO_MINUTES_MS) {
          return // Suppress modal if less than 2 minutes have passed
        }
      }

      try {
        // 1. Check for AI matches from backend belonging strictly to current logged in user
        const resMatches = await handleGetMatches()
        let userMatches: any[] = []
        if (resMatches.status && resMatches.data?.matches && Array.isArray(resMatches.data.matches)) {
          userMatches = resMatches.data.matches.filter((m: any) => {
            const isPendingOrClaimed = m.status === 'pending' || m.status === 'claimed'
            const lostOwner = typeof m.lostItemId?.reportedBy === 'object' ? (m.lostItemId?.reportedBy?._id || m.lostItemId?.reportedBy?.id) : m.lostItemId?.reportedBy
            const foundOwner = typeof m.foundItemId?.reportedBy === 'object' ? (m.foundItemId?.reportedBy?._id || m.foundItemId?.reportedBy?.id) : m.foundItemId?.reportedBy
            const isUserMatch = String(lostOwner) === String(currentUserId) || String(foundOwner) === String(currentUserId)
            return isPendingOrClaimed && isUserMatch
          })
        }

        // Collect lost item IDs that already have an active match
        const matchedLostItemIds = new Set<string>()
        userMatches.forEach((m: any) => {
          if (m.lostItemId) {
            const lId = typeof m.lostItemId === 'object' ? (m.lostItemId._id || m.lostItemId.id) : m.lostItemId
            if (lId) matchedLostItemIds.add(String(lId))
          }
        })

        // 2. Check for active reported item in sessionStorage belonging strictly to current user
        const justReportedStr = typeof window !== 'undefined' ? sessionStorage.getItem('just_reported_item') : null
        let justReported: any = null
        if (justReportedStr) {
          try {
            const parsed = JSON.parse(justReportedStr)
            const ownerId = typeof parsed.reportedBy === 'object' ? (parsed.reportedBy?._id || parsed.reportedBy?.id) : parsed.reportedBy
            if (!ownerId || String(ownerId) === String(currentUserId)) {
              justReported = parsed
            } else {
              sessionStorage.removeItem('just_reported_item')
            }
          } catch (e) {}
        }

        // 3. Fallback server sync: Fetch user items directly from MongoDB via handleGetMyItems()
        let userUnmatchedItems: any[] = []
        try {
          const resItems = await handleGetMyItems()
          if (resItems.status && Array.isArray(resItems.data)) {
            userUnmatchedItems = resItems.data.filter((it: any) => {
              const ownerId = typeof it.reportedBy === 'object' ? (it.reportedBy?._id || it.reportedBy?.id) : it.reportedBy
              const isMine = !ownerId || String(ownerId) === String(currentUserId)
              const isLost = (it.type === 'lost' || !it.type)
              const isReported = (it.status === 'reported' || it.status === 'lost')
              const itemId = it._id || it.id
              const isNotMatched = !matchedLostItemIds.has(String(itemId))
              const itemTime = new Date(it.createdAt || it.dateLost || Date.now()).getTime()
              const within48hrs = (Date.now() - itemTime) < FORTY_EIGHT_HOURS_MS
              return isMine && isLost && isReported && isNotMatched && within48hrs
            })
          }
        } catch (err) {
          console.error('Error fetching user items for 48hr countdown:', err)
        }

        // Include justReported if it's not already in userMatches or userUnmatchedItems
        if (justReported) {
          const jId = justReported._id || justReported.id
          const alreadyMatched = jId && matchedLostItemIds.has(String(jId))
          const alreadyUnmatched = userUnmatchedItems.some((u: any) => String(u._id || u.id) === String(jId))
          if (!alreadyMatched && !alreadyUnmatched) {
            userUnmatchedItems.unshift(justReported)
          }
        }

        // 4. Show modal if there are matches OR unmatched 48hr items OR forceOpen
        if (userMatches.length > 0 || userUnmatchedItems.length > 0 || forceOpen) {
          setMatches(userMatches)
          setUnmatchedItems(userUnmatchedItems)
          setIsOpen(true)
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('ai_match_modal_last_shown', Date.now().toString())
            sessionStorage.removeItem('ai_match_modal_force')
          }
        } else {
          setMatches([])
          setUnmatchedItems([])
          setIsOpen(false)
        }
      } catch (err) {
        console.error('Error checking AI matches for modal:', err)
      }
    }

    // Check immediately on mount / user change
    checkUserMatches(isFreshLogin)

    // Listen for custom trigger after reporting lost item
    const handleCustomCheck = () => {
      checkUserMatches(true)
    }
    window.addEventListener('check_ai_matches', handleCustomCheck)

    // 2-minute recurring interval timer check
    const intervalId = setInterval(() => {
      checkUserMatches(false)
    }, TWO_MINUTES_MS)

    return () => {
      window.removeEventListener('check_ai_matches', handleCustomCheck)
      clearInterval(intervalId)
    }
  }, [user, isAuthenticated, pathname])

  // Guard clause to suppress modal for admins/moderators or admin routes
  if (
    !isOpen ||
    (matches.length === 0 && unmatchedItems.length === 0) ||
    pathname.startsWith('/admin') ||
    user?.role === 'admin' ||
    user?.role === 'moderator'
  ) {
    return null
  }

  const currentUserId = user?.id || user?._id

  // Calculate real-time 48-hour countdown remaining time for any given time
  const getItemCountdown = (itemTimeOrClaimedTime: string | number) => {
    const startTime = itemTimeOrClaimedTime
      ? new Date(itemTimeOrClaimedTime).getTime()
      : Date.now()
    const deadline = startTime + FORTY_EIGHT_HOURS_MS
    const diff = deadline - now

    if (diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, expired: true }
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return { hours, minutes, seconds, expired: false }
  }

  const handleClaimMatchItem = async (matchId: string) => {
    if (!matchId) return
    setClaimingId(matchId)
    try {
      const res = await handleClaimMatch(matchId)
      if (res.status) {
        setMatches((prev) =>
          prev.map((m) =>
            m._id === matchId || m.id === matchId
              ? { ...m, status: 'claimed', claimedAt: new Date().toISOString() }
              : m
          )
        )
      } else {
        alert(res.error || 'Failed to submit claim.')
      }
    } catch (err) {
      console.error('Error claiming match:', err)
    } finally {
      setClaimingId(null)
    }
  }

  const handleClaimRedirect = () => {
    setIsOpen(false)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ai_match_modal_last_shown', Date.now().toString())
    }
    router.push('/matches')
  }

  const handleGoToDashboard = () => {
    setIsOpen(false)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ai_match_modal_last_shown', Date.now().toString())
    }
    router.push('/dashboard')
  }

  const handleDismiss = () => {
    setIsOpen(false)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ai_match_modal_last_shown', Date.now().toString())
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md overflow-hidden">
        {/* Backdrop overlay animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={handleDismiss}
        />

        {/* Modal Window Container with strict max-h and flex-col for perfect scrolling */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-xl max-h-[85vh] flex flex-col rounded-3xl border border-slate-200 dark:border-blue-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 shadow-2xl backdrop-blur-2xl z-10 overflow-hidden"
        >
          {/* Top glowing gradient border highlight using brand colors */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#004b87] via-[#0284c7] to-[#16a34a] dark:from-blue-500 dark:via-sky-400 dark:to-emerald-500 rounded-t-3xl pointer-events-none" />

          {/* Background Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#004b87]/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#16a34a]/10 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-all cursor-pointer z-20"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Fixed Header Title */}
          <div className="space-y-2 mb-4 shrink-0 pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-[#004b87]/15 via-[#0284c7]/15 to-[#16a34a]/15 text-[#004b87] dark:text-sky-300 border border-[#004b87]/20 dark:border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5 text-[#004b87] dark:text-blue-400 animate-pulse" />
              <span>AI Verification & Match Center</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Your Reported Items & Verification Status
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Review AI matches and 48-hour active verification countdowns for all your reported items.
            </p>
          </div>

          {/* SCROLLABLE CONTENT BODY (MIN-H-0 FLEX-1 ENABLES SMOOTH SCROLLING) */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-4 pr-2 my-2 [scrollbar-width:thin] [scrollbar-color:rgba(156,163,175,0.4)_transparent]">
            
            {/* SECTION 1: AI MATCHED ITEMS */}
            {matches.map((matchItem: any, idx: number) => {
              const matchId = matchItem._id || matchItem.id
              const lostItem = matchItem.lostItemId
              const foundItem = matchItem.foundItemId
              const lostOwnerId = typeof lostItem?.reportedBy === 'object' ? (lostItem?.reportedBy?._id || lostItem?.reportedBy?.id) : lostItem?.reportedBy
              const isLostMine = String(lostOwnerId) === String(currentUserId)
              const myItem = isLostMine ? lostItem : foundItem
              const matchedItem = isLostMine ? foundItem : lostItem
              const matchScore = matchItem.similarityScore ? Math.round(matchItem.similarityScore * 100) : 85
              const isClaimed = matchItem.status === 'claimed'
              const countdown = getItemCountdown(matchItem.claimedAt || matchItem.updatedAt || matchItem.createdAt)

              return (
                <div
                  key={matchId || idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-[#004b87]/20 dark:border-blue-500/30 shadow-md space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    {!isClaimed ? (
                      <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-[#004b87]/15 dark:bg-blue-500/25 text-[#004b87] dark:text-blue-300 border border-[#004b87]/20 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#004b87] dark:text-blue-400 animate-pulse" />
                        AI Match Found (⚡ {matchScore}%)
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-amber-500/15 dark:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin" />
                        Claimed - Pending Admin Verification & Office Visit
                      </span>
                    )}

                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Match #{idx + 1}
                    </span>
                  </div>

                  {/* ADMIN VERIFICATION & OFFICE VISIT INSTRUCTION BOX (WHEN CLAIMED) */}
                  {isClaimed && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 space-y-3 relative overflow-hidden">
                      {/* Timer Row */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                          Admin Verification Window
                        </span>
                        <span className="font-black text-amber-600 dark:text-amber-400 font-mono tracking-wider text-sm bg-amber-500/20 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                          {String(countdown.hours).padStart(2, '0')}h : {String(countdown.minutes).padStart(2, '0')}m : {String(countdown.seconds).padStart(2, '0')}s
                        </span>
                      </div>

                      {/* Office Visit Instructions */}
                      <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-500/20 space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-sm">
                          <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span>Visit Lost & Found Office for Item Collection</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed font-medium">
                          Your item claim is under review by campus administration. Please visit the physical office to verify ownership and collect your item before the timer expires.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-amber-500/20 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>Desk B, Student Services Center</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>Bring Student / Campus ID</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Side-by-side comparison */}
                  {myItem && matchedItem && (
                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div className="p-3 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20">
                        <span className="text-[9px] uppercase font-extrabold text-[#004b87] dark:text-blue-400 block mb-1">Your Item</span>
                        <div className="flex items-center gap-2.5">
                          {myItem.images?.[0] ? (
                            <img src={myItem.images[0]} alt={myItem.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow-sm" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-base flex-shrink-0">📦</div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{myItem.title}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{myItem.category || 'Item'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20">
                        <span className="text-[9px] uppercase font-extrabold text-[#16a34a] dark:text-emerald-400 block mb-1">Matched Found Item</span>
                        <div className="flex items-center gap-2.5">
                          {matchedItem.images?.[0] ? (
                            <img src={matchedItem.images[0]} alt={matchedItem.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow-sm" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-base flex-shrink-0">🔍</div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{matchedItem.title}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{matchedItem.locationLost || 'Campus'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Claim Button for unclaimed matches */}
                  {!isClaimed && (
                    <button
                      disabled={claimingId === matchId}
                      onClick={() => handleClaimMatchItem(matchId)}
                      className="w-full py-2.5 px-4 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-[#004b87] via-[#0060ad] to-[#16a34a] hover:from-[#003c6c] hover:to-[#15803d] dark:from-blue-600 dark:to-emerald-600 shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{claimingId === matchId ? 'Claiming Item...' : 'Claim This Match'}</span>
                    </button>
                  )}
                </div>
              )
            })}

            {/* SECTION 2: 48-HOUR ACTIVE VERIFICATION ITEMS (UNMATCHED) */}
            {unmatchedItems.map((item: any, idx: number) => {
              const itemId = item._id || item.id
              const countdown = getItemCountdown(item.createdAt || item.dateLost)

              return (
                <div
                  key={itemId || idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-[#004b87]/20 dark:border-blue-500/30 shadow-md space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-[#004b87]/15 dark:bg-blue-500/25 text-[#004b87] dark:text-blue-300 border border-[#004b87]/20 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#004b87] dark:text-blue-400 animate-pulse" />
                      48-Hour AI Verification Active
                    </span>
                    <span className="text-[10px] uppercase bg-[#004b87]/20 dark:bg-blue-500/30 px-2 py-0.5 rounded-full font-extrabold text-[#004b87] dark:text-sky-300">
                      Scanning DB
                    </span>
                  </div>

                  {/* 48-Hour Digital Countdown Display */}
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#004b87]/10 via-[#0284c7]/10 to-[#16a34a]/10 dark:from-blue-500/15 dark:to-emerald-500/15 border border-[#004b87]/20 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-[#004b87] dark:text-sky-300 block">
                        Live Countdown Timer
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Continuous 48-hour AI matching search
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center min-w-[130px]">
                      <span className="text-base font-black text-[#004b87] dark:text-sky-400 font-mono tracking-tight animate-pulse">
                        {String(countdown.hours).padStart(2, '0')}h : {String(countdown.minutes).padStart(2, '0')}m : {String(countdown.seconds).padStart(2, '0')}s
                      </span>
                    </div>
                  </div>

                  {/* Reported Item Thumbnail Details */}
                  <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-3">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#004b87]/15 flex items-center justify-center text-base flex-shrink-0 text-[#004b87] dark:text-blue-300 font-bold">📦</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] uppercase font-extrabold text-[#004b87] dark:text-sky-400 block">Reported Lost Item</span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{item.locationLost || item.category || 'Campus'}</p>
                    </div>
                  </div>
                </div>
              )
            })}

          </div>

          {/* Fixed Footer Action Buttons */}
          <div className="flex flex-col gap-2 pt-3 shrink-0 border-t border-slate-200 dark:border-slate-800">
            {matches.length > 0 ? (
              <button
                onClick={handleClaimRedirect}
                className="w-full py-2.5 px-4 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-[#004b87] via-[#0060ad] to-[#16a34a] hover:from-[#003c6c] hover:to-[#15803d] dark:from-blue-600 dark:via-sky-600 dark:to-emerald-600 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>View Full Matches Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleGoToDashboard}
                className="w-full py-2.5 px-4 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-[#004b87] via-[#0060ad] to-[#16a34a] hover:from-[#003c6c] hover:to-[#15803d] dark:from-blue-600 dark:via-sky-600 dark:to-emerald-600 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleDismiss}
              className="w-full py-2 px-4 rounded-xl font-bold text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              Remind Me Later (2 Min)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
