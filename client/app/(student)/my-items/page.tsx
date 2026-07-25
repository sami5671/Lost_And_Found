'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { GlassCard } from '@/components/glass-card'
import { GradientButton } from '@/components/gradient-button'
import { ItemCard } from '@/components/item-card'
import { Heart, Search, Filter, BarChart3, Bell, CheckCircle2, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { handleGetMyItems } from '@/actions/admin/item-actions'
import { Item as FrontendItem, ItemCategory, ItemStatus } from '@/types'

export default function MyItemsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [items, setItems] = useState<FrontendItem[]>([])
  const [loading, setLoading] = useState(true)

  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'My Items', href: '/my-items', icon: <Heart className="w-5 h-5" /> },
    { label: 'Notifications', href: '/notifications', icon: <Bell className="w-5 h-5" /> },
    { label: 'Matches', href: '/matches', icon: <CheckCircle2 className="w-5 h-5" /> },
    { label: 'Claims', href: '/claims', icon: <Plus className="w-5 h-5" /> },
    { label: 'Profile', href: '/profile', icon: <Heart className="w-5 h-5" /> },
  ]

  const statuses = [
    { id: 'all', label: 'All Items' },
    { id: 'lost', label: 'Lost' },
    { id: 'found', label: 'Found' },
    { id: 'matched', label: 'Matched' },
    { id: 'recovered', label: 'Recovered' },
  ]

  useEffect(() => {
    async function loadItems() {
      try {
        const res = await handleGetMyItems()
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
        console.error('Error fetching student items:', err)
      } finally {
        setLoading(false)
      }
    }
    loadItems()
  }, [])

  const filteredItems = items.filter(item => {
    const matchesSearch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
    return matchesSearch && matchesStatus
  })

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
          <h1 className="text-4xl font-bold text-white mb-2">My Items</h1>
          <p className="text-foreground/60">Manage all your lost and found items</p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg glass-dark border border-purple-500/20 focus:border-purple-500/50 focus:outline-none transition-colors"
              />
            </div>
            <button className="px-4 py-3 rounded-lg glass-dark border border-purple-500/20 hover:border-purple-500/50 transition-colors flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter
            </button>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2">
            {statuses.map(status => (
              <button
                key={status.id}
                onClick={() => setSelectedStatus(status.id)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedStatus === status.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'glass-dark border border-purple-500/20 text-foreground/60 hover:text-foreground'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredItems.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <ItemCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <GlassCard>
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">📭</div>
              <h3 className="text-xl font-semibold mb-2">No items found</h3>
              <p className="text-foreground/60 mb-6">Try adjusting your search or filters</p>
              <Link href="/report">
                <GradientButton variant="primary">
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Item
                </GradientButton>
              </Link>
            </div>
          </GlassCard>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
