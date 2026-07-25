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
            category: (item.category?.toLowerCase() || 'other') as ItemCategory,
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
          <h1 className="text-4xl font-bold text-white mb-2">Found Items Management</h1>
          <p className="text-foreground/60">Manage all items found on campus</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
          <input
            type="text"
            placeholder="Search by title, description or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg glass-dark border border-purple-500/20 focus:border-purple-500/50 focus:outline-none transition-colors"
          />
        </div>

        {/* Found Items Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/60">Item</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/60">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/60">Location Found</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/60">Date Found</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/60">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/60">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {foundItems.map((item, idx) => (
                    <motion.tr
                      key={item.id}
                      className="border-b border-purple-500/10 hover:bg-white/5 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-white">{item.title}</span>
                          <span className="text-xs text-foreground/40 line-clamp-1">{item.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground/60 capitalize">{item.category}</td>
                      <td className="px-6 py-4 text-sm text-foreground/60">{item.location}</td>
                      <td className="px-6 py-4 text-sm text-foreground/60">{item.reportedDate}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                          (item.status as string) === 'resolved' 
                            ? 'bg-purple-500/20 text-purple-300' 
                            : 'bg-green-500/20 text-green-300'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {item.status === 'found' ? (
                          <button
                            disabled={verifyingItemId !== null}
                            onClick={() => handleVerifyOwnerClick(item.id)}
                            className="text-purple-400 hover:text-purple-300 disabled:text-foreground/20 disabled:cursor-not-allowed transition-colors text-xs font-medium cursor-pointer"
                          >
                            {verifyingItemId === item.id ? 'Checking Match...' : 'Verify Owner'}
                          </button>
                        ) : (
                          <span className="text-foreground/30 text-xs font-medium uppercase">Resolved</span>
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
              className="relative w-full max-w-lg glass-dark border border-purple-500/30 overflow-hidden shadow-2xl flex flex-col max-h-[90vh] z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-purple-950/20">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-purple-400" />
                    AI Owner Verification Preview
                  </h3>
                  <p className="text-xs text-foreground/60 mt-1">Verify AI similarity before confirming owner notifications.</p>
                </div>
                <button
                  onClick={() => setShowMatchModal(false)}
                  className="text-foreground/40 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Confidence Bar */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 relative overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1">AI Match Score</span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-extrabold tracking-tight ${
                      matchData.score >= 0.8 
                        ? 'text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.35)]' 
                        : 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.35)]'
                    }`}>
                      {(matchData.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <span className={`text-xs mt-2 px-3 py-1 rounded-full border font-medium ${
                    matchData.score >= 0.8
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                  }`}>
                    {matchData.score >= 0.8 ? 'High Confidence (Auto-Match Approved)' : 'Low/Moderate Confidence (Manual Check Recommended)'}
                  </span>
                </div>

                {/* Owner Information */}
                <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-950/10 space-y-3">
                  <h5 className="text-sm font-bold text-white flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-purple-400" />
                    Claimant / Owner Information
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="flex items-center gap-2.5 p-3 rounded-lg bg-black/20 border border-white/5">
                      <UserIcon className="w-4 h-4 text-foreground/40" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-foreground/40 uppercase">Full Name</span>
                        <span className="text-sm font-semibold text-white">{matchData.matchedItem.owner.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-3 rounded-lg bg-black/20 border border-white/5">
                      <Mail className="w-4 h-4 text-foreground/40" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-foreground/40 uppercase">Email Address</span>
                        <span className="text-sm font-semibold text-white">{matchData.matchedItem.owner.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-purple-500/20 bg-purple-950/20">
                <button
                  onClick={() => setShowMatchModal(false)}
                  className="px-5 py-2 text-sm font-semibold text-foreground/60 hover:text-white border border-white/10 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmVerification}
                  disabled={confirmingVerify}
                  className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-lg hover:shadow-purple-500/30 rounded-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5"
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
