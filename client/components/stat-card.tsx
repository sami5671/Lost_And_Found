'use client'

import React, { useEffect, useState } from 'react'
import { GlassCard } from './glass-card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number
  suffix?: string
  delay?: number
}

export function StatCard({
  icon: Icon,
  label,
  value,
  suffix = '',
  delay = 0,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      let current = 0
      const increment = value / 30
      const interval = setInterval(() => {
        current += increment
        if (current >= value) {
          setDisplayValue(value)
          clearInterval(interval)
        } else {
          setDisplayValue(Math.floor(current))
        }
      }, 30)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timeout)
  }, [value, delay])

  return (
    <GlassCard className="flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 p-3 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30">
        <Icon className="w-6 h-6 text-purple-300" />
      </div>
      <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
        {displayValue}
        {suffix}
      </div>
      <p className="text-sm text-foreground/70">{label}</p>
    </GlassCard>
  )
}
