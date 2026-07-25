'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { GlassCard } from '@/components/glass-card'
import { GradientButton } from '@/components/gradient-button'
import { FormInput } from '@/components/form-input'
import { Navbar } from '@/components/navbar'
import { Eye, EyeOff, Camera, RefreshCw, Trash2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    department: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null)
  const [idBackFile, setIdBackFile] = useState<File | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 400, facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.error("Error playing video:", e))
        }
      }
      setIsCameraActive(true)
    } catch (err) {
      setError('Could not access camera. Please allow camera permissions.')
      console.error('Camera access error:', err)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsCameraActive(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        const size = Math.min(video.videoWidth, video.videoHeight) || 400
        canvas.width = size
        canvas.height = size
        
        const sx = (video.videoWidth - size) / 2
        const sy = (video.videoHeight - size) / 2
        
        context.drawImage(video, sx, sy, size, size, 0, 0, size, size)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
              setAvatarFile(file)
              setAvatarPreview(URL.createObjectURL(blob))
              stopCamera()
            }
          },
          'image/jpeg',
          0.9
        )
      }
    }
  }

  const departments = [
    'Computer Science & Engineering',
    'Software Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Business Administration',
    'English',
    'Other',
  ]

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in all required fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!idFrontFile || !idBackFile) {
      setError('Please upload both the front and back side of your ID card')
      return
    }

    if (!avatarFile) {
      setError('Please capture your profile photo to proceed')
      return
    }

    if (!agreeTerms) {
      setError('Please agree to the terms and conditions')
      return
    }

    try {
      const fd = new FormData()
      fd.append('fullName', formData.fullName)
      fd.append('email', formData.email)
      fd.append('phone', formData.phone)
      fd.append('password', formData.password)
      fd.append('department', formData.department)
      fd.append('studentId', formData.studentId)
      fd.append('idFront', idFrontFile)
      fd.append('idBack', idBackFile)
      fd.append('avatar', avatarFile, 'avatar.jpg')

      await register(fd)
      router.push('/dashboard')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.'
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
          className="w-full max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-8">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-[#004b87] to-[#16a34a] bg-clip-text text-transparent">
                Create Your Account
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-base">
                Join our Lost & Found community to track items and view AI matches.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Section 1: Personal Details */}
                <div className="space-y-4">
                  <div className="border-b border-border pb-2 mb-4">
                    <h3 className="text-lg font-semibold text-primary">Personal Details</h3>
                  </div>

                  <FormInput
                    label="Full Name"
                    type="text"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="Email Address"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />

                    <FormInput
                      label="Phone Number"
                      type="tel"
                      name="phone"
                      placeholder="+880 1XXXXXXXXX"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground transition-all focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="" className="bg-background text-foreground">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept} className="bg-background text-foreground">
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <FormInput
                    label="Student ID / ID Card Number"
                    type="text"
                    name="studentId"
                    placeholder="STU20240001"
                    value={formData.studentId}
                    onChange={handleChange}
                  />

                  {/* ID Card Photo Upload Boxes (Placed directly under the ID Card number) */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-sm font-medium text-foreground">
                      ID Card Photos (Max 8MB) <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Front Side Upload */}
                      <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-border bg-blue-500/5 hover:bg-blue-500/10 hover:border-primary transition-all text-center h-28 cursor-pointer relative group">
                        <div className="text-2xl mb-1 text-primary group-hover:scale-110 transition-transform">
                          {idFrontFile ? '✅' : '🪪'}
                        </div>
                        <span className="text-xs font-semibold text-foreground/80">ID Card (Front)</span>
                        <span className="text-[10px] text-slate-400 mt-1 max-w-[130px] truncate">
                          {idFrontFile ? idFrontFile.name : 'Choose Image (Max 8MB)'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          required
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file && file.size > 8 * 1024 * 1024) {
                              setError('Front ID image exceeds 8MB limit!');
                              setIdFrontFile(null);
                              e.target.value = '';
                            } else {
                              setError('');
                              setIdFrontFile(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>

                      {/* Back Side Upload */}
                      <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-border bg-blue-500/5 hover:bg-blue-500/10 hover:border-primary transition-all text-center h-28 cursor-pointer relative group">
                        <div className="text-2xl mb-1 text-primary group-hover:scale-110 transition-transform">
                          {idBackFile ? '✅' : '🪪'}
                        </div>
                        <span className="text-xs font-semibold text-foreground/80">ID Card (Back)</span>
                        <span className="text-[10px] text-slate-400 mt-1 max-w-[130px] truncate">
                          {idBackFile ? idBackFile.name : 'Choose Image (Max 8MB)'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          required
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file && file.size > 8 * 1024 * 1024) {
                              setError('Back ID image exceeds 8MB limit!');
                              setIdBackFile(null);
                              e.target.value = '';
                            } else {
                              setError('');
                              setIdBackFile(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 2: Account Security & Submit */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="border-b border-border pb-2 mb-4">
                      <h3 className="text-lg font-semibold text-primary">Account Security</h3>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
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

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-foreground/50 transition-all focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Profile Photo Real-time Capture (Moved under password section) */}
                    <div className="space-y-2 pt-2">
                      <label className="block text-sm font-medium text-foreground">
                        Profile Photo (Real-time Capture) <span className="text-red-500">*</span>
                      </label>
                      
                      <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-border bg-slate-50 dark:bg-slate-900/50 text-center gap-4">
                        
                        {/* Viewport container with animated outer boundary */}
                        <div className="relative flex items-center justify-center">
                          {isCameraActive && (
                            <>
                              {/* Pulsating colorful glow outer circle */}
                              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-primary via-green-500 to-primary opacity-60 blur-md animate-pulse pointer-events-none" />
                              {/* Rotating gradient line boundary */}
                              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#004b87] via-[#16a34a] to-[#004b87] animate-spin pointer-events-none" style={{ animationDuration: '3s' }} />
                            </>
                          )}
                          <div className="relative w-40 h-40 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 border-4 border-card shadow-inner flex items-center justify-center z-10">
                            <video
                              ref={videoRef}
                              className={`w-full h-full object-cover scale-x-[-1] ${isCameraActive ? 'block' : 'hidden'}`}
                              playsInline
                              muted
                            />

                            {!isCameraActive && (
                              avatarPreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={avatarPreview}
                                  alt="Profile Avatar Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-5xl text-slate-400">👤</span>
                              )
                            )}

                            {/* Camera Scanning overlays */}
                            {isCameraActive && (
                              <div className="absolute inset-0 pointer-events-none rounded-full overflow-hidden">
                                {/* Thin scanline moving down the circle */}
                                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan" />
                                {/* Soft radar overlay circle */}
                                <div className="absolute inset-2 border border-green-500/20 rounded-full animate-ping" style={{ animationDuration: '2.5s' }} />
                                {/* Capture indicator dot */}
                                <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                          {isCameraActive ? (
                            <>
                              <GradientButton
                                type="button"
                                onClick={capturePhoto}
                                className="px-4 py-1.5 text-xs flex items-center gap-1.5"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                Snap Photo
                              </GradientButton>
                              <button
                                type="button"
                                onClick={stopCamera}
                                className="px-3 py-1.5 text-xs border border-border rounded-lg bg-background text-foreground hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <GradientButton
                                type="button"
                                onClick={startCamera}
                                className="px-4 py-1.5 text-xs flex items-center gap-1.5"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                {avatarPreview ? 'Retake Photo' : 'Take Live Photo'}
                              </GradientButton>
                              
                              {avatarPreview && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAvatarFile(null)
                                    setAvatarPreview(null)
                                  }}
                                  className="p-2 border border-red-500/30 rounded-lg bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                                  title="Delete Photo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                        
                        {/* Hidden canvas for taking snapshot */}
                        <canvas ref={canvasRef} className="hidden" />
                      </div>
                    </div>
                  </div>

                  {/* Submission and Terms */}
                  <div className="space-y-4 pt-6 md:pt-0">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 mt-1 rounded border-border bg-background accent-primary cursor-pointer"
                      />
                      <label htmlFor="terms" className="text-xs text-foreground/70 cursor-pointer">
                        I agree to the{' '}
                        <Link
                          href="/terms"
                          className="text-[#004b87] dark:text-blue-400 hover:underline transition-colors font-semibold"
                        >
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link
                          href="/privacy"
                          className="text-[#004b87] dark:text-blue-400 hover:underline transition-colors font-semibold"
                        >
                          Privacy Policy
                        </Link>
                      </label>
                    </div>

                    {error && (
                      <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                        <p className="text-sm text-red-300">{error}</p>
                      </div>
                    )}

                    <GradientButton
                      type="submit"
                      className="w-full py-3"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </GradientButton>
                  </div>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center border-t border-border pt-6">
              <p className="text-sm text-foreground/60">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-[#004b87] dark:text-blue-400 hover:underline transition-colors font-semibold"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </main>
    </>
  )
}
