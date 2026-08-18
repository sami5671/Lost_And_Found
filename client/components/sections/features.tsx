'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FeatureCard } from '../feature-card'
import { mockFeatures } from '@/lib/mock-data'

export function FeaturesSection() {
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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004b87] via-[#0060ad] to-[#16a34a] dark:from-blue-400 dark:via-sky-400 dark:to-emerald-400">
              Powerful Features
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to recover your lost items
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <FeatureCard
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
