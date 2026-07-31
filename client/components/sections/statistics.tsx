'use client'

import { handleGetGlobalStats } from '@/actions/admin/item-actions'
import { motion } from 'framer-motion'
import {
  Backpack,
  Box,
  CheckCircle2,
  FileText,
  Key,
  Laptop,
  Layers,
  Package,
  ShieldCheck,
  Shirt,
  Wallet,
  Zap
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface CategoryCounts {
  Electronics?: number
  Wallets?: number
  Documents?: number
  Accessories?: number
  Clothing?: number
  Keys?: number
  Others?: number
  [key: string]: number | undefined
}

interface StatisticsSectionProps {
  initialStats?: {
    totalLostItems: number
    totalFoundItems: number
    totalMatches: number
    itemsRecovered: number
    registeredUsers: number
    lostByCategory?: CategoryCounts
    foundByCategory?: CategoryCounts
    matchesByCategory?: CategoryCounts
    recoveredByCategory?: CategoryCounts
  }
}

const mapCategoryToGroup = (cat?: string): string => {
  if (!cat) return 'Others'
  const c = cat.toString().trim().toLowerCase()
  if (c === 'laptop' || c === 'mobile' || c === 'watch' || c === 'headphones' || c === 'electronics') {
    return 'Electronics'
  }
  if (c === 'wallets' || c === 'wallet' || c === 'cash') {
    return 'Wallets'
  }
  if (c === 'bags' || c === 'bag' || c === 'accessories' || c === 'backpack') {
    return 'Accessories'
  }
  if (c === 'id card' || c === 'documents' || c === 'document' || c === 'id' || c === 'books' || c === 'book') {
    return 'Documents'
  }
  if (c === 'keys' || c === 'key' || c === 'keychain') {
    return 'Keys'
  }
  if (c === 'clothings' || c === 'clothing' || c === 'clothes' || c === 'wearable') {
    return 'Clothing'
  }
  return 'Others'
}

const getCategoryCount = (categoryMap: CategoryCounts | undefined, targetKey: string): number => {
  if (!categoryMap) return 0
  let sum = 0
  Object.keys(categoryMap).forEach((key) => {
    if (key === targetKey || mapCategoryToGroup(key) === targetKey) {
      sum += categoryMap[key] || 0
    }
  })
  return sum
}

// Helper component for animated counting numbers
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value || 0
    if (start === end) {
      setDisplayValue(end)
      return
    }

    const duration = 1000
    const frameTime = 1000 / 60
    const totalFrames = Math.round(duration / frameTime)
    let frame = 0

    const timer = setInterval(() => {
      frame++
      const progress = frame / totalFrames
      const current = Math.round(end * Math.min(progress, 1))
      setDisplayValue(current)

      if (frame >= totalFrames) {
        clearInterval(timer)
      }
    }, frameTime)

    return () => clearInterval(timer)
  }, [value])

  return (
    <span>
      {displayValue}
      {suffix}
    </span>
  )
}

export function StatisticsSection({ initialStats }: StatisticsSectionProps) {
  const [data, setData] = useState(initialStats || {
    totalLostItems: 0,
    totalFoundItems: 0,
    totalMatches: 0,
    itemsRecovered: 0,
    registeredUsers: 0,
    lostByCategory: {},
    foundByCategory: {},
    matchesByCategory: {},
    recoveredByCategory: {},
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await handleGetGlobalStats()
        if (res.status && res.data) {
          setData(res.data)
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      }
    }
    if (!initialStats || !initialStats.lostByCategory) {
      fetchStats()
    }
  }, [initialStats])

  const categoryList = [
    { key: 'Electronics', label: 'Electronics & Laptops', icon: Laptop, color: 'emerald' },
    { key: 'Wallets', label: 'Wallets & Cash', icon: Wallet, color: 'sky' },
    { key: 'Accessories', label: 'Bags & Accessories', icon: Backpack, color: 'purple' },
    { key: 'Documents', label: 'IDs & Documents', icon: FileText, color: 'amber' },
    { key: 'Keys', label: 'Keys & Keychains', icon: Key, color: 'rose' },
    { key: 'Clothing', label: 'Clothing & Wearables', icon: Shirt, color: 'indigo' },
    { key: 'Others', label: 'Other Items', icon: Box, color: 'slate' },
  ]

  const mainCards = [
    {
      id: 'lost-items',
      title: 'Lost Items',
      badgeText: 'Active Reports',
      badgeStyle: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      total: data.totalLostItems || 0,
      icon: Package,
      categoryMap: data.lostByCategory || {},
      accentColor: 'from-emerald-500 to-teal-500',
      borderColor: 'border-emerald-500/20 hover:shadow-emerald-500/15',
    },
    {
      id: 'found-items',
      title: 'Found Items',
      badgeText: 'Secure Inventory',
      badgeStyle: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
      total: data.totalFoundItems || 0,
      icon: CheckCircle2,
      categoryMap: data.foundByCategory || {},
      accentColor: 'from-sky-500 to-blue-500',
      borderColor: 'border-sky-500/20 hover:shadow-sky-500/15',
    },
    {
      id: 'matches-found',
      title: 'Matches Found',
      badgeText: 'AI Matched',
      badgeStyle: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
      total: data.totalMatches || 0,
      icon: Zap,
      categoryMap: data.matchesByCategory || {},
      accentColor: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-500/20 hover:shadow-purple-500/15',
    },
    {
      id: 'items-recovered',
      title: 'Items Recovered',
      badgeText: 'Returned to Owner',
      badgeStyle: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      total: data.itemsRecovered || 0,
      icon: ShieldCheck,
      categoryMap: data.recoveredByCategory || {},
      accentColor: 'from-amber-500 to-yellow-500',
      borderColor: 'border-amber-500/20 hover:shadow-amber-500/15',
    },
  ]

  return (
    <section className="py-20 px-4 relative overflow-hidden bg-slate-50/50 dark:bg-[#070f1e]/60">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        className="max-w-6xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {/* Section Header */}
        <div className="text-center mb-14 space-y-3">
         
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600">
              By The Numbers
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg max-w-xl mx-auto font-medium">
            Live real-time statistics categorized across all items in our community
          </p>
        </div>

        {/* 4 Cards in 2 Grids (2 columns x 2 rows) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {mainCards.map((card, idx) => {
            const MainIcon = card.icon

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className={`relative rounded-3xl bg-white dark:bg-[#0c1a30] border ${card.borderColor} p-6 md:p-7 shadow-xl backdrop-blur-xl transition-all duration-300 flex flex-col justify-between`}
              >
                {/* Header Row */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${card.accentColor} text-white shadow-md`}>
                        <MainIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{card.title}</h3>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Category Statistics
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${card.badgeStyle}`}>
                        {card.badgeText}
                      </span>
                    </div>
                  </div>

                  {/* Big Total Counter Row */}
                  <div className="flex items-baseline justify-between my-5 p-4 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-200/60 dark:border-white/5">
                    <div>
                      <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">
                        Total {card.title}
                      </span>
                      <span className="text-4xl font-black text-slate-900 dark:text-white">
                        <AnimatedCounter value={card.total} />
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      <span>Live Sync</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  </div>

                  {/* Category Breakdown Rows */}
                  <div className="space-y-3.5 mt-6">
                    <div className="flex items-center justify-between text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-white/5">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-500" />
                        Category Name
                      </span>
                      <span>Item Count</span>
                    </div>

                    {categoryList.map((cat) => {
                      const CategoryIcon = cat.icon
                      const count = getCategoryCount(card.categoryMap, cat.key)
                      const percentage = card.total > 0 ? Math.min(Math.round((count / card.total) * 100), 100) : 0

                      return (
                        <div key={cat.key} className="space-y-1.5 group">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 group-hover:text-emerald-500 transition-colors">
                                <CategoryIcon className="w-3.5 h-3.5" />
                              </div>
                              <span className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {cat.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-slate-400">
                                <AnimatedCounter value={percentage} suffix="%" />
                              </span>
                              <span className={`px-2 py-0.5 rounded-md text-xs font-extrabold ${
                                count > 0
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                  : 'bg-slate-100 dark:bg-white/5 text-slate-400 border border-slate-200 dark:border-white/5'
                              }`}>
                                <AnimatedCounter value={count} />
                              </span>
                            </div>
                          </div>

                          {/* Progress Meter */}
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-black/40 overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full bg-gradient-to-r ${card.accentColor}`}
                              initial={{ width: '0%' }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </section>
  )
}


