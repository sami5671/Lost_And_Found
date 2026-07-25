import React from 'react'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({ children, className = '', hover = true }: GlassCardProps) {
  return (
    <div
      className={`bg-card text-card-foreground border border-border rounded-2xl shadow-sm ${
        hover ? 'transition-all duration-300 hover:shadow-md hover:border-primary/20' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
