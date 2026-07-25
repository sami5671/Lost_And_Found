'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { GlassCard } from '@/components/glass-card'
import { Users, Package, AlertCircle, CheckCircle2, TrendingUp, BarChart3, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { handleGetAllItems } from '@/actions/admin/item-actions'
import { Item as FrontendItem, ItemCategory, ItemStatus } from '@/types'

export default function AdminLostItemsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [items, setItems] = useState<FrontendItem[]>([])
  const [loading, setLoading] = useState(true)

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
        console.error('Error fetching admin lost items:', err)
      } finally {
        setLoading(false)
      }
    }
    loadItems()
  }, [])

  // Filter only lost items
  const lostItems = items.filter(item => {
    const isLost = item.status === 'lost'
    const matchesSearch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.location || '').toLowerCase().includes(searchQuery.toLowerCase())
    return isLost && matchesSearch
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
          <h1 className="text-4xl font-bold text-white mb-2">Lost Items Management</h1>
          <p className="text-foreground/60">Monitor and resolve reported lost items</p>
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

        {/* Lost Items Table */}
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/60">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/60">Date Reported</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/60">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/60">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lostItems.map((item, idx) => (
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
                        <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-300 uppercase">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-purple-400 hover:text-purple-300 transition-colors text-xs font-medium cursor-pointer">
                          Resolve
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                  {lostItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-foreground/40 text-sm">
                        No lost items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
