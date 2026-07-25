'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ItemCard } from '../item-card'
import { mockItems } from '@/lib/mock-data'
import { GradientButton } from '../gradient-button'
import Link from 'next/link'

export function LatestItemsSection() {
  const recentItems = mockItems.slice(0, 6)

  return (
    <section className="py-20 px-4">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                Latest Found Items
              </span>
            </h2>
            <p className="text-foreground/60 text-lg">
              Recently added to our system
            </p>
          </div>
          <Link href="/browse">
            <GradientButton variant="outline" className="mt-4 md:mt-0">
              View All Items
            </GradientButton>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <ItemCard item={item} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
