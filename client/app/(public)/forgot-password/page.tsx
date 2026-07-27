'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { GlassCard } from '@/components/glass-card'
import { FormInput } from '@/components/form-input'
import { GradientButton } from '@/components/gradient-button'
import { KeyRound, Mail, ArrowLeft, CheckCircle2, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { handleForgotPassword, handleResetPassword } from '@/actions/admin/item-actions'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfoMessage('')
    setIsLoading(true)

    try {
      const res = await handleForgotPassword(email)
      if (res.status) {
        setStep(2)
        setInfoMessage(res.message || 'OTP verification code sent to your email address!')
      } else {
        setError(res.error || 'Failed to request password reset code.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfoMessage('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match! Please check and try again.')
      return
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.')
      return
    }

    setIsLoading(true)

    try {
      const res = await handleResetPassword(email, otp, newPassword)
      if (res.status) {
        setIsSuccess(true)
      } else {
        setError(res.error || 'Failed to reset password. Please check your OTP code.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 px-4 bg-background flex items-center justify-center">
        {/* Background Ambient Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl opacity-10"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl opacity-10"></div>
        </div>

        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-8">
            {/* Success View */}
            {isSuccess ? (
              <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Password Reset Successful!</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Your password has been successfully updated. You can now log into your account using your new credentials.
                  </p>
                </div>
                <Link href="/login">
                  <GradientButton className="w-full py-3">
                    Proceed to Sign In
                  </GradientButton>
                </Link>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-500/20">
                    {step === 1 ? <Mail className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    {step === 1 ? 'Forgot Password?' : 'Reset Your Password'}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    {step === 1
                      ? 'Enter your registered email address to receive a 6-digit OTP code'
                      : `Enter the 6-digit OTP code sent to ${email}`}
                  </p>
                </div>

                {/* Info message */}
                {infoMessage && (
                  <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-400">
                    {infoMessage}
                  </div>
                )}



                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-xs text-red-300">
                    {error}
                  </div>
                )}

                {/* STEP 1: Request OTP */}
                {step === 1 ? (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <FormInput
                      label="Registered Email Address"
                      type="email"
                      placeholder="e.g. goodv9197@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />

                    <GradientButton
                      type="submit"
                      className="w-full py-3"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sending OTP Code...' : 'Send OTP Verification Code'}
                    </GradientButton>
                  </form>
                ) : (
                  /* STEP 2: Enter OTP & New Password */
                  <form onSubmit={handleReset} className="space-y-4">
                    <FormInput
                      label="6-Digit OTP Verification Code"
                      type="text"
                      placeholder="e.g. 123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="At least 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-foreground/50 transition-all focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <FormInput
                      label="Confirm New Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />

                    <GradientButton
                      type="submit"
                      className="w-full py-3"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Resetting Password...' : 'Reset Password'}
                    </GradientButton>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full text-xs text-slate-500 dark:text-slate-400 hover:underline pt-2"
                    >
                      ← Change Email Address
                    </button>
                  </form>
                )}

                {/* Footer back to login */}
                <div className="mt-6 pt-4 border-t border-border text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-foreground transition-colors font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </>
            )}
          </GlassCard>
        </motion.div>
      </main>
    </>
  )
}
