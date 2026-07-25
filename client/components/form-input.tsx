import React from 'react'

interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function FormInput({
  label,
  error,
  className = '',
  ...props
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        className={`w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-foreground/50 transition-all focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 ${
          error ? 'border-red-500/50' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
