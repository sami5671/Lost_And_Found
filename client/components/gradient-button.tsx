import React from 'react'

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'accent'
  size?: 'sm' | 'md' | 'lg'
}

export function GradientButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: GradientButtonProps) {
  const baseClasses =
    'font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  }

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-[#004b87] to-[#16a34a] text-white hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105',
    secondary:
      'bg-[#004b87] text-white hover:bg-[#003c6c] hover:shadow-lg hover:shadow-blue-500/10',
    outline:
      'border-2 border-[#004b87] text-[#004b87] hover:bg-[#004b87]/5',
    accent:
      'bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white hover:shadow-lg hover:shadow-green-500/20',
  }

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
