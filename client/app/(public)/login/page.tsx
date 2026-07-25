'use client'

import { FormInput } from '@/components/form-input'
import { GlassCard } from '@/components/glass-card'
import { GradientButton } from '@/components/gradient-button'
import { Navbar } from '@/components/navbar'
import { useAuth } from '@/lib/auth-context'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const user = await login(email, password)
      if (user.role === 'admin' || user.role === 'moderator') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Login failed. Please try again.'
      )
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 px-4 bg-background flex items-center justify-center">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl opacity-10"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-green-600/10 rounded-full blur-3xl opacity-10"></div>
        </div>

        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-foreground/60">
                Sign in to your Lost & Found account
              </p>
            </div>

            {/* Demo Credentials Info */}
            <div className="mb-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-sm">
              <p className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Demo Logins (Click to Autofill):</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@demo.com')
                    setPassword('123456')
                  }}
                  className="cursor-pointer flex flex-col items-start p-2 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/30 transition-all text-left"
                >
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">🔑 Admin Demo</span>
                  <span className="text-[10px] text-slate-500 dark:text-foreground/60 mt-0.5 truncate max-w-full">admin@demo.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('goodv9197@gmail.com')
                    setPassword('123456')
                  }}
                  className="cursor-pointer flex flex-col items-start p-2 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-green-500/10 border border-transparent hover:border-green-500/30 transition-all text-left"
                >
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">🎓 Student Demo</span>
                  <span className="text-[10px] text-slate-500 dark:text-foreground/60 mt-0.5 truncate max-w-full">goodv9197@gmail.com</span>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-foreground/50 transition-all focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-background accent-primary cursor-pointer"
                />
                <label htmlFor="remember" className="text-sm text-foreground/70 cursor-pointer">
                  Remember me
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <GradientButton
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </GradientButton>
            </form>

             {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-xs text-foreground/50">or</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            {/* Alternative Login */}
            <GradientButton variant="secondary" className="w-full opacity-50 cursor-not-allowed">
              Continue with Google
            </GradientButton>

            {/* Footer */}
            <div className="mt-6 text-center space-y-2">
              <Link
                href="/forgot-password"
                className="block text-sm text-[#004b87] dark:text-blue-400 hover:underline transition-colors"
              >
                Forgot your password?
              </Link>
              <p className="text-sm text-foreground/60">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="text-[#004b87] dark:text-blue-400 hover:underline transition-colors font-semibold"
                >
                  Create one
                </Link>
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </main>
    </>
  )
}
