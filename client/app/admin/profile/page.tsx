'use client'

import { updateProfileAction } from '@/actions/admin/auth-actions'
import { handleGetAdminStats, handleGetGlobalStats } from '@/actions/admin/item-actions'
import { DashboardLayout } from '@/components/dashboard-layout'
import { GlassCard } from '@/components/glass-card'
import { GradientButton } from '@/components/gradient-button'
import { useAuth } from '@/lib/auth-context'
import {
  AlertCircle,
  Award,
  BarChart3,
  Bell,
  Camera,
  Check,
  CheckCircle2,
  CreditCard,
  Edit3,
  MapPin,
  Package,
  RefreshCw,
  Save,
  Shield,
  TrendingUp,
  Upload,
  User as UserIcon,
  Users,
  X,
  ShieldAlert
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

export default function AdminProfilePage() {
  const { user, updateUser } = useAuth()
  const [stats, setStats] = useState({
    totalItems: 0,
    pendingMatches: 0,
    verifiedItems: 0,
    activeUsers: 0,
    successRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Avatar Upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ID Card Upload states
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null)
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null)
  const idFrontInputRef = useRef<HTMLInputElement>(null)

  const [idBackFile, setIdBackFile] = useState<File | null>(null)
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null)
  const idBackInputRef = useRef<HTMLInputElement>(null)

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || '',
    occupation: user?.occupation || 'System Administrator',
    studentId: user?.studentId || '',
    email: user?.email || '',
    primaryNumber: user?.primaryNumber || '',
    DOB: user?.DOB ? new Date(user.DOB).toISOString().split('T')[0] : '',
    creditsCompleted: user?.creditsCompleted || '',
    bloodGroup: user?.bloodGroup || '',
    gender: user?.gender || '',
    address: user?.address || '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.name || '',
        occupation: user.occupation || 'System Administrator',
        studentId: user.studentId || '',
        email: user.email || '',
        primaryNumber: user.primaryNumber || '',
        DOB: user.DOB ? new Date(user.DOB).toISOString().split('T')[0] : '',
        creditsCompleted: user.creditsCompleted || '',
        bloodGroup: user.bloodGroup || '',
        gender: user.gender || '',
        address: user.address || '',
      })
    }
  }, [user])

  const sidebarItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { label: 'Lost Items', href: '/admin/lost-items', icon: <Package className="w-5 h-5" /> },
    { label: 'Found Items', href: '/admin/found-items', icon: <CheckCircle2 className="w-5 h-5" /> },
    { label: 'Matches', href: '/admin/matches', icon: <AlertCircle className="w-5 h-5" /> },
    { label: 'Fraud User Reduction', href: '/admin/fraud-reduction', icon: <ShieldAlert className="w-5 h-5" /> },
    { label: 'Reports', href: '/admin/reports', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Profile', href: '/admin/profile', icon: <UserIcon className="w-5 h-5" /> },
  ]

  const loadStats = async () => {
    try {
      let res = await handleGetAdminStats()
      if (!res.status || !res.data) {
        const globalRes = await handleGetGlobalStats()
        if (globalRes.status && globalRes.data) {
          res = globalRes
        }
      }

      if (res?.data) {
        const d = res.data
        setStats({
          totalItems: d.totalItems ?? ((d.totalLostItems || 0) + (d.totalFoundItems || 0)),
          pendingMatches: d.pendingMatches ?? d.totalMatches ?? 0,
          verifiedItems: d.verifiedItems ?? d.itemsRecovered ?? 0,
          activeUsers: d.activeUsers ?? d.registeredUsers ?? 0,
          successRate: d.successRate ?? 0,
        })
      }
    } catch (err) {
      console.error('Failed to load admin stats for profile:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
    const interval = setInterval(() => {
      loadStats()
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleIdFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIdFrontFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setIdFrontPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleIdBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIdBackFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setIdBackPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const data = new FormData()
      data.append('fullName', formData.fullName)
      data.append('occupation', formData.occupation)
      data.append('studentId', formData.studentId)
      data.append('primaryNumber', formData.primaryNumber)
      data.append('DOB', formData.DOB)
      data.append('creditsCompleted', String(formData.creditsCompleted))
      data.append('bloodGroup', formData.bloodGroup)
      data.append('gender', formData.gender)
      data.append('address', formData.address)

      if (avatarFile) {
        data.append('avatar', avatarFile)
      }
      if (idFrontFile) {
        data.append('idCardFront', idFrontFile)
      }
      if (idBackFile) {
        data.append('idCardBack', idBackFile)
      }

      const res = await updateProfileAction(data)
      if (res.status && res.user) {
        updateUser(res.user)
        setMessage({ type: 'success', text: 'Admin profile details & credentials updated successfully!' })
        setIsEditing(false)
        setAvatarFile(null)
        setAvatarPreview(null)
        setIdFrontFile(null)
        setIdFrontPreview(null)
        setIdBackFile(null)
        setIdBackPreview(null)
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to update profile.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred while saving profile.' })
    } finally {
      setSaving(false)
    }
  }

  const formatDOB = (dobStr?: string) => {
    if (!dobStr) return ''
    try {
      const date = new Date(dobStr)
      if (isNaN(date.getTime())) return dobStr
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch (e) {
      return dobStr
    }
  }

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title="Admin Panel"
      requiredRole="admin"
    >
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Profile</h1>
            <p className="text-slate-500 dark:text-slate-400">View and update your administrator credentials, photo & badge info</p>
          </div>
          <GradientButton
            onClick={() => {
              setMessage(null)
              setIsEditing(!isEditing)
            }}
            variant={isEditing ? 'outline' : 'primary'}
            className="flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4" /> Cancel Editing
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" /> Edit Profile Details
              </>
            )}
          </GradientButton>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 border ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-5 h-5 shrink-0" />
            ) : (
              <X className="w-5 h-5 shrink-0" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* Main Profile Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Digital Admin ID / Badge Card */}
          <div className="lg:col-span-1 space-y-6">
            <GlassCard className="p-6 relative overflow-hidden bg-gradient-to-b from-card via-card to-blue-900/10 border-border shadow-lg">
              <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl select-none">
                🛡️
              </div>
              <div className="text-center">
                {/* 1. Profile Picture (Avatar) */}
                <div className="relative w-28 h-28 mx-auto mb-3 group">
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#004b87] to-blue-500 p-[3px] shadow-lg overflow-hidden">
                    {user?.avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={user.avatar}
                        alt={user.fullName || user.name || 'Admin Avatar'}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-3xl font-bold text-primary">
                        {user?.fullName?.charAt(0) || user?.name?.charAt(0) || '🛡️'}
                      </div>
                    )}
                  </div>

                  {/* Quick Edit Camera Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(true)
                      setTimeout(() => fileInputRef.current?.click(), 100)
                    }}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-[#004b87] text-white shadow-lg hover:bg-blue-700 transition-all cursor-pointer"
                    title="Change Profile Picture"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* 2. Full Name & 3. Department / Designation */}
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-0.5">
                  {user?.fullName || user?.name || ''}
                </h2>
                <p className="text-sm font-semibold text-[#004b87] dark:text-blue-400 mb-3 flex items-center justify-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  {user?.occupation || 'System Administrator'}
                </p>

                {/* 4. COMPACT ADMIN ID BADGE BOX */}
                <div className="my-3 p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/80 dark:from-white/5 dark:to-white/[0.02] border border-border/80 text-center shadow-inner">
                  {user?.studentId ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#004b87]/10 dark:bg-blue-500/10 border border-[#004b87]/20 dark:border-blue-500/20 mb-2">
                      <span className="text-xs">🪪</span>
                      <span className="text-xs font-bold text-[#004b87] dark:text-blue-400">
                        Admin ID: {user.studentId}
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#004b87]/10 dark:bg-blue-500/10 border border-[#004b87]/20 dark:border-blue-500/20 mb-2">
                      <Shield className="w-3 h-3 text-[#004b87] dark:text-blue-400" />
                      <span className="text-xs font-bold text-[#004b87] dark:text-blue-400">
                        Role: {user?.role ? user.role.toUpperCase() : 'ADMIN'}
                      </span>
                    </div>
                  )}

                  {/* ID Card / Badge Image Thumbnails */}
                  {(user?.idCardFront || user?.idCardBack) ? (
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {user?.idCardFront && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Badge Front</span>
                          <div className="relative rounded-lg overflow-hidden border border-border aspect-[1.58/1] h-20 w-full bg-slate-200 dark:bg-slate-900">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={user.idCardFront} alt="ID Front" className="object-cover w-full h-full" />
                          </div>
                        </div>
                      )}
                      {user?.idCardBack && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Badge Back</span>
                          <div className="relative rounded-lg overflow-hidden border border-border aspect-[1.58/1] h-20 w-full bg-slate-200 dark:bg-slate-900">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={user.idCardBack} alt="ID Back" className="object-cover w-full h-full" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(true)
                          setTimeout(() => idFrontInputRef.current?.click(), 100)
                        }}
                        className="text-[11px] font-bold text-[#004b87] dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        + Upload Admin Badge / ID
                      </button>
                    </div>
                  )}
                </div>

                <div className="w-full h-[1px] bg-border my-4" />

                {/* Email & Phone Contact Details */}
                <div className="space-y-2 text-left">
                  {user?.email && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50">
                      <span className="text-xl">✉️</span>
                      <div className="overflow-hidden">
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Official Email</p>
                        <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  )}

                  {user?.primaryNumber && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50">
                      <span className="text-xl">📞</span>
                      <div>
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Official Phone</p>
                        <p className="text-sm font-semibold text-foreground">{user.primaryNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Detailed View / Edit Form */}
          <div className="lg:col-span-2 space-y-6">
            {!isEditing ? (
              /* VIEW MODE: Information Grid */
              <GlassCard className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#004b87] dark:text-blue-400" />
                    Administrator Profile Information
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    System Administrator
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Field: Full Name */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                      <UserIcon className="w-4 h-4 text-blue-500" />
                      Full Name
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {user?.fullName || user?.name || ''}
                    </p>
                  </div>

                  {/* Field: Designation / Department */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                      <Award className="w-4 h-4 text-emerald-500" />
                      Designation / Department
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {user?.occupation || 'System Administrator'}
                    </p>
                  </div>

                  {/* Field: Admin / Employee ID */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                      <span className="text-base">🪪</span>
                      Admin / Employee ID
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {user?.studentId || 'N/A'}
                    </p>
                  </div>

                  {/* Field: Email */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                      <span className="text-base">✉️</span>
                      Official Email
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                      {user?.email || ''}
                    </p>
                  </div>

                  {/* Field: Date of Birth */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                      <span className="text-base">📅</span>
                      Date of Birth
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {user?.DOB ? formatDOB(user.DOB) : 'N/A'}
                    </p>
                  </div>

                  {/* Field: Role / Access Level */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                      <Shield className="w-4 h-4 text-purple-500" />
                      Role & Access Level
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100 capitalize">
                      {user?.role || 'Admin'} (Super User)
                    </p>
                  </div>

                  {/* Field: Phone Number */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                      <span className="text-base">📞</span>
                      Contact Phone
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {user?.primaryNumber || 'N/A'}
                    </p>
                  </div>

                  {/* Field: Blood Group & Gender */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                      <span className="text-base">🩸</span>
                      Blood Group & Gender
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {user?.bloodGroup ? `${user.bloodGroup} ${user?.gender ? `(${user.gender})` : ''}` : (user?.gender || 'N/A')}
                    </p>
                  </div>
                </div>

                {/* Residential / Office Address */}
                {user?.address && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                      <MapPin className="w-4 h-4 text-red-500" />
                      Office / Residential Address
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {user.address}
                    </p>
                  </div>
                )}
              </GlassCard>
            ) : (
              /* EDIT MODE: Complete Form with Profile Pic & Badge Uploaders */
              <GlassCard className="p-6 md:p-8 border-primary/40 shadow-xl">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-primary" />
                    Update Administrator Details
                  </h3>
                  <p className="text-xs text-slate-400">All fields are editable</p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  
                  {/* Profile Picture Uploader */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary/50 shrink-0">
                      {avatarPreview ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : user?.avatar ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={user.avatar} alt="Current Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                          {user?.fullName?.charAt(0) || '🛡️'}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-center sm:text-left flex-1">
                      <p className="text-sm font-bold text-foreground">Profile Picture</p>
                      <p className="text-xs text-slate-400">
                        Uploading a new image will automatically update your avatar across the admin dashboard.
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 px-3.5 py-1.5 rounded-lg bg-[#004b87]/10 dark:bg-blue-500/10 hover:bg-[#004b87]/20 text-[#004b87] dark:text-blue-400 text-xs font-semibold border border-[#004b87]/30 dark:border-blue-500/30 transition-all cursor-pointer flex items-center gap-1.5 mx-auto sm:mx-0"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Choose New Profile Picture</span>
                      </button>
                    </div>
                  </div>

                  {/* Admin Badge / ID Card Front & Back Image Uploaders */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border space-y-4">
                    <div>
                      <p className="text-sm font-bold text-foreground flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-primary" />
                        Update Admin Badge / ID Card Verification Pictures
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Uploading a new front or back picture will update your verification credentials on file.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* ID Card Front Upload */}
                      <div className="p-3 rounded-xl border border-border/80 bg-background flex flex-col items-center justify-center text-center space-y-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Badge Front</p>
                        <div className="w-full aspect-[1.58/1] max-h-36 rounded-lg overflow-hidden border border-border bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative">
                          {idFrontPreview ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={idFrontPreview} alt="ID Front Preview" className="w-full h-full object-cover" />
                          ) : user?.idCardFront ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={user.idCardFront} alt="Current ID Front" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-slate-400">No Front Image</span>
                          )}
                        </div>
                        <input
                          type="file"
                          ref={idFrontInputRef}
                          onChange={handleIdFrontChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => idFrontInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold border border-primary/30 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{user?.idCardFront ? 'Change Front Picture' : 'Upload Front Picture'}</span>
                        </button>
                      </div>

                      {/* ID Card Back Upload */}
                      <div className="p-3 rounded-xl border border-border/80 bg-background flex flex-col items-center justify-center text-center space-y-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Badge Back</p>
                        <div className="w-full aspect-[1.58/1] max-h-36 rounded-lg overflow-hidden border border-border bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative">
                          {idBackPreview ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={idBackPreview} alt="ID Back Preview" className="w-full h-full object-cover" />
                          ) : user?.idCardBack ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={user.idCardBack} alt="Current ID Back" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-slate-400">No Back Image</span>
                          )}
                        </div>
                        <input
                          type="file"
                          ref={idBackInputRef}
                          onChange={handleIdBackChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => idBackInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold border border-primary/30 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{user?.idCardBack ? 'Change Back Picture' : 'Upload Back Picture'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Input: Full Name */}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">
                        👤 Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="e.g. Admin User"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        required
                      />
                    </div>

                    {/* Input: Designation / Department */}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">
                        💼 Designation / Department
                      </label>
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        placeholder="e.g. System Administrator"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    {/* Input: Admin / Employee ID */}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">
                        🪪 Admin / Employee ID
                      </label>
                      <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleInputChange}
                        placeholder="e.g. ADM-2026-001"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    {/* Input: Phone Number */}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">
                        📞 Phone Number
                      </label>
                      <input
                        type="text"
                        name="primaryNumber"
                        value={formData.primaryNumber}
                        onChange={handleInputChange}
                        placeholder="e.g. 01700000000"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    {/* Input: Date of Birth */}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">
                        📅 Date of Birth
                      </label>
                      <input
                        type="date"
                        name="DOB"
                        value={formData.DOB}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    {/* Input: Role Info */}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">
                        👥 Role / Section
                      </label>
                      <input
                        type="text"
                        name="creditsCompleted"
                        value={formData.creditsCompleted}
                        onChange={handleInputChange}
                        placeholder="e.g. Senior Admin"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    {/* Input: Blood Group */}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">
                        🩸 Blood Group
                      </label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>

                    {/* Input: Gender */}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">
                        👤 Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                  </div>

                  {/* Input: Address */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">
                      📍 Office / Residential Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="e.g. Administration Building, Main Campus"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-2.5 rounded-xl border border-border text-foreground hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-sm font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <GradientButton
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving Profile & Images...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </GradientButton>
                  </div>
                </form>
              </GlassCard>
            )}
          </div>

        </div>

        {/* Secondary Row: System Activity Overview & Admin Notification Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                System Activity Overview
              </h3>
              <button
                type="button"
                onClick={() => {
                  setLoading(true)
                  loadStats()
                }}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all cursor-pointer disabled:opacity-50"
                title="Sync Live Data from Server"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Syncing...' : 'Sync Data'}</span>
              </button>
            </div>
            {loading && stats.totalItems === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50">
                  <p className="text-xs text-slate-400 mb-1 font-medium">Total Items</p>
                  <p className="text-xl font-extrabold text-[#004b87] dark:text-blue-400">{stats.totalItems}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50">
                  <p className="text-xs text-slate-400 mb-1 font-medium">Pending</p>
                  <p className="text-xl font-extrabold text-amber-500">{stats.pendingMatches}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50">
                  <p className="text-xs text-slate-400 mb-1 font-medium">Verified</p>
                  <p className="text-xl font-extrabold text-emerald-500">{stats.verifiedItems}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50">
                  <p className="text-xs text-slate-400 mb-1 font-medium">Users</p>
                  <p className="text-xl font-extrabold text-purple-500">{stats.activeUsers}</p>
                </div>
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Admin Notification Settings
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
                <span className="text-sm font-medium">Email Security & System Alerts</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-primary cursor-pointer" />
              </label>
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
                <span className="text-sm font-medium">New Match & Claim Approvals</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-primary cursor-pointer" />
              </label>
            </div>
          </GlassCard>
        </div>

      </div>
    </DashboardLayout>
  )
}
