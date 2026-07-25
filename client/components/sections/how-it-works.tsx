'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { mockHowItWorks } from '@/lib/mock-data'
import { GlassCard } from '../glass-card'

export function HowItWorksSection() {
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
              How It Works
            </span>
          </h2>
          <p className="text-foreground/60 text-lg">
            Simple steps to recover your lost items
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute hidden md:block left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500/50 to-green-500/50 top-20"></div>

          {/* Steps */}
          <div className="space-y-12">
            {mockHowItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`flex items-center gap-8 md:gap-0 ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Content */}
                <div className="flex-1 md:px-8">
                  <GlassCard className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-green-500/20">
                        <span className="text-lg font-bold text-primary">
                          {item.step}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-foreground/70">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </div>

                {/* Timeline Dot */}
                <div className="hidden md:flex flex-1 justify-center">
                  <motion.div
                    className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-green-500 shadow-lg shadow-blue-500/30"
                    whileInView={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  />
                </div>

                {/* Hidden on mobile */}
                <div className="hidden md:flex-1"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
