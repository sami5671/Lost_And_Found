'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { GlassCard } from '@/components/glass-card'
import { 
  Users, 
  Package, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  BarChart3, 
  Search, 
  X, 
  Check, 
  Calendar, 
  MapPin, 
  Mail, 
  User as UserIcon, 
  ArrowRight 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { handleGetAllItems, handleVerifyOwner, handleCheckOwnerMatch } from '@/actions/admin/item-actions'
import { Item as FrontendItem, ItemCategory, ItemStatus } from '@/types'

export default function AdminFoundItemsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [items, setItems] = useState<FrontendItem[]>([])
  const [loading, setLoading] = useState(true)
  const [verifyingItemId, setVerifyingItemId] = useState<string | null>(null)

  // Modal and verification state
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [matchData, setMatchData] = useState<any | null>(null)
  const [confirmingVerify, setConfirmingVerify] = useState(false)

  const handleVerifyOwnerClick = async (itemId: string) => {
    setVerifyingItemId(itemId)
    try {
      const res = await handleCheckOwnerMatch(itemId)
      if (res.status && res.data) {
        setMatchData(res.data)
        setShowMatchModal(true)
      } else {
        alert(res.error || "AI could not identify a matching candidate lost item.")
      }
    } catch (err) {
      alert("An unexpected error occurred during match pre-check.")
      console.error(err)
    } finally {
      setVerifyingItemId(null)
    }
  }

  const handleConfirmVerification = async () => {
    if (!matchData) return
    setConfirmingVerify(true)
    try {
      const foundItemId = matchData.foundItem.id
      const lostItemId = matchData.matchedItem.id
      const score = matchData.score

      const res = await handleVerifyOwner(foundItemId, lostItemId, score)
      if (res.status && res.data) {
        setItems(prev => prev.map(item => item.id === foundItemId ? { ...item, status: 'resolved' as any } : item))
        setShowMatchModal(false)
        setMatchData(null)
        alert(
          `Success!\nAI matched with lost item: "${res.data.matchedItemTitle}"\nOwner: ${res.data.owner.name} (${res.data.owner.email})\nStatus: Match verified, items resolved, and notification email sent!`
        )
      } else {
        alert(`Verification failed: ${res.error || "Could not verify owner."}`)
      }
    } catch (err) {
      alert("An unexpected error occurred during verification.")
      console.error(err)
    } finally {
      setConfirmingVerify(false)
    }
  }

  const sidebarItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { label: 'Lost Items', href: '/admin/lost-items', icon: <Package className="w-5 h-5" /> },
    { label: 'Found Items', href: '/admin/found-items', icon: <CheckCircle2 className="w-5 h-5" /> },
    { label: 'Matches', href: '/admin/matches', icon: <AlertCircle className="w-5 h-5" /> },
    { label: 'Reports', href: '/admin/reports', icon: <TrendingUp className="w-5 h-5" /> },
  ]

  useEffect(() => {
    async function loadItems() {
      try {
        const res = await handleGetAllItems()
        if (res.status && res.data) {
          const mapped: FrontendItem[] = res.data.map((item: any) => ({
            id: item._id,
            title: item.title,
            description: item.description,
            category: (item.category || 'Others') as ItemCategory,
            status: (item.status === 'reported' ? (item.type === 'lost' ? 'lost' : 'found') : item.status) as ItemStatus,
            imageUrl: item.images?.[0] || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=800&auto=format&fit=crop&q=60',
            reportedDate: item.dateLost ? new Date(item.dateLost).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString(),
            location: item.locationLost || 'Unknown',
            userId: item.reportedBy || '',
            contactEmail: item.contactInfo || '',
          }))
          setItems(mapped)
        }
      } catch (err) {
        console.error('Error fetching admin found items:', err)
      } finally {
        setLoading(false)
      }
    }
    loadItems()
  }, [])

  // Filter only found items
  const foundItems = items.filter(item => {
    const isFound = item.status === 'found'
    const matchesSearch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.location || '').toLowerCase().includes(searchQuery.toLowerCase())
    return isFound && matchesSearch
  })

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
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">Found Items Management</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage all items found on campus</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-foreground/40" />
          <input
            type="text"
            placeholder="Search by title, description or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-[#0c1a30] border border-emerald-500/30 dark:border-emerald-500/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
          />
        </div>

        {/* Found Items Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-emerald-500/20">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Item</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Location Found</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Date Found</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {foundItems.map((item, idx) => (
                    <motion.tr
                      key={item.id}
                      className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">{item.title}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{item.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 capitalize">{item.category}</td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{item.location}</td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{item.reportedDate}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          (item.status as string) === 'resolved' 
                            ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800' 
                            : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {item.status === 'found' ? (
                          <button
                            disabled={verifyingItemId !== null}
                            onClick={() => handleVerifyOwnerClick(item.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-semibold cursor-pointer"
                          >
                            {verifyingItemId === item.id ? 'Checking Match...' : 'Verify Owner'}
                          </button>
                        ) : (
                          <span className="text-slate-400 dark:text-foreground/30 text-xs font-semibold uppercase">Resolved</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                  {foundItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-foreground/40 text-sm">
                        No found items listed.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </motion.div>

      {/* Glassmorphic Verification Preview Modal */}
      <AnimatePresence>
        {showMatchModal && matchData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMatchModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0c1a30] border border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-emerald-500/20 bg-slate-50 dark:bg-emerald-950/30">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    AI Owner Verification Preview
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Verify AI similarity before confirming owner notifications.</p>
                </div>
                <button
                  onClick={() => setShowMatchModal(false)}
                  className="text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Confidence Bar */}
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-500/30 dark:border-emerald-500/20 relative overflow-hidden shadow-sm">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">AI Match Score</span>
                  <div className="flex items-baseline gap-1 my-1">
                    <span className={`text-5xl font-extrabold tracking-tight ${
                      matchData.score >= 0.78 
                        ? 'text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.35)]' 
                        : 'text-amber-600 dark:text-yellow-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                    }`}>
                      {(matchData.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <span className={`text-xs mt-2 px-3.5 py-1.5 rounded-full border font-bold uppercase tracking-wide ${
                    matchData.score >= 0.78
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-yellow-400'
                  }`}>
                    {matchData.score >= 0.78 ? 'High Confidence (Match Verified)' : 'Moderate Confidence (Review Suggested)'}
                  </span>
                </div>

                {/* Owner Information */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-emerald-500/20 bg-slate-50/70 dark:bg-emerald-950/20 space-y-4">
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-emerald-500" />
                    Claimant / Owner Information
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 shadow-sm">
                      <UserIcon className="w-4 h-4 text-emerald-500" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{matchData.matchedItem.owner.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 shadow-sm">
                      <Mail className="w-4 h-4 text-emerald-500" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{matchData.matchedItem.owner.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-emerald-500/20 bg-slate-50 dark:bg-emerald-950/30">
                <button
                  onClick={() => setShowMatchModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmVerification}
                  disabled={confirmingVerify}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/30 rounded-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2"
                >
                  {confirmingVerify ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Confirm Owner Verification
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
