'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { StatCard } from '../stat-card'
import { handleGetGlobalStats } from '@/actions/admin/item-actions'
import {
  Package,
  CheckCircle,
  Zap,
  TrendingUp,
  Users,
} from 'lucide-react'

interface StatisticsSectionProps {
  initialStats?: {
    totalLostItems: number
    totalFoundItems: number
    totalMatches: number
    itemsRecovered: number
    registeredUsers: number
  }
}

export function StatisticsSection({ initialStats }: StatisticsSectionProps) {
  const [data, setData] = useState(initialStats || {
    totalLostItems: 0,
    totalFoundItems: 0,
    totalMatches: 0,
    itemsRecovered: 0,
    registeredUsers: 0,
  })

  useEffect(() => {
    // If initialStats changes or is empty, pull latest live stats on client mount
    async function fetchStats() {
      const res = await handleGetGlobalStats()
      if (res.status && res.data) {
        setData(res.data)
      }
    }
    if (!initialStats) {
      fetchStats()
    }
  }, [initialStats])

  const stats = [
    {
      icon: Package,
      label: 'Lost Items',
      value: data.totalLostItems,
    },
    {
      icon: CheckCircle,
      label: 'Found Items',
      value: data.totalFoundItems,
    },
    {
      icon: Zap,
      label: 'Matches Found',
      value: data.totalMatches,
    },
    {
      icon: TrendingUp,
      label: 'Items Recovered',
      value: data.itemsRecovered,
    },
    {
      icon: Users,
      label: 'Registered Users',
      value: data.registeredUsers,
    },
  ]


  return (
    <section className="py-20 px-4">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              By The Numbers
            </span>
          </h2>
          <p className="text-foreground/60 text-lg">
            Real-time statistics from our community
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <StatCard
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                delay={index * 100}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
