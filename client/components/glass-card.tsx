import React from 'react'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function GlassCard({ children, className = '', hover = true, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-card text-card-foreground border border-border rounded-2xl shadow-sm ${
        hover ? 'transition-all duration-300 hover:shadow-md hover:border-primary/20' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
