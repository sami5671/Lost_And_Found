import React from 'react'
import { GlassCard } from './glass-card'
import * as Icons from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  title: string
  description: string
  icon: string
}

const iconMap: Record<string, LucideIcon> = {
  Zap: Icons.Zap,
  Bell: Icons.Bell,
  Search: Icons.Search,
  Shield: Icons.Shield,
  CheckCircle: Icons.CheckCircle,
  BarChart: Icons.BarChart,
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  const IconComponent = iconMap[icon] || Icons.Zap

  return (
    <GlassCard className="p-6 flex flex-col gap-3 h-full">
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
        <IconComponent className="w-6 h-6 text-purple-300" />
      </div>
      <div>
        <h3 className="font-bold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-foreground/70">{description}</p>
      </div>
    </GlassCard>
  )
}
