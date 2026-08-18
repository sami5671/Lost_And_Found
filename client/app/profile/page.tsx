'use client'

import React, { useState, useEffect, useRef } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { GlassCard } from '@/components/glass-card'
import { GradientButton } from '@/components/gradient-button'
import { useAuth } from '@/lib/auth-context'
import { 
  Heart, 
  Bell, 
  CheckCircle2, 
  Plus, 
  BarChart3, 
  Edit3, 
  GraduationCap, 
  CreditCard,
  X,
  Save,
  User as UserIcon,
  Check,
  Camera,
  MapPin,
  Upload
} from 'lucide-react'
import { handleGetMyStats } from '@/actions/admin/item-actions'
import { updateProfileAction } from '@/actions/admin/auth-actions'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [stats, setStats] = useState({
    lostCount: 0,
    matchCount: 0,
    resolvedCount: 0,
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
    occupation: user?.occupation || '',
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
        occupation: user.occupation || '',
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
    { label: 'Dashboard', href: '/dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Report Now', href: '/report', icon: <Plus className="w-5 h-5" /> },
    { label: 'My Items', href: '/my-items', icon: <Heart className="w-5 h-5" /> },
    { label: 'Notifications', href: '/notifications', icon: <Bell className="w-5 h-5" /> },
    { label: 'Matches', href: '/matches', icon: <CheckCircle2 className="w-5 h-5" /> },
    { label: 'Profile', href: '/profile', icon: <Heart className="w-5 h-5" /> },
  ]

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await handleGetMyStats()
        if (res.status && res.data) {
          setStats(res.data)
        }
      } catch (err) {
        console.error('Failed to load user stats for profile:', err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
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
        setMessage({ type: 'success', text: 'Profile details & ID cards updated successfully!' })
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
      title="Lost & Found"
      requiredRole="student"
    >
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Student Profile</h1>
            <p className="text-slate-500 dark:text-slate-400">View and update your profile details, picture & ID cards</p>
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
          
          {/* Left Column: Digital Student ID Card */}
          <div className="lg:col-span-1 space-y-6">
            <GlassCard className="p-6 relative overflow-hidden bg-gradient-to-b from-card via-card to-[#004b87]/5 border-border shadow-lg">
              <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl select-none">
                🎓
              </div>
              <div className="text-center">
                {/* 1. Profile Picture (Avatar) */}
                <div className="relative w-28 h-28 mx-auto mb-3 group">
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#004b87] to-[#16a34a] p-[3px] shadow-lg overflow-hidden">
                    {user?.avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={user.avatar}
                        alt={user.fullName || user.name || 'User Avatar'}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-3xl font-bold text-primary">
                        {user?.fullName?.charAt(0) || user?.name?.charAt(0) || '🎓'}
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

                {/* 2. Full Name & 3. Department Name */}
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-0.5">
                  {user?.fullName || user?.name || ''}
                </h2>
                {user?.occupation && (
                  <p className="text-sm font-semibold text-[#004b87] dark:text-emerald-400 mb-3">
                    {user.occupation}
                  </p>
                )}

                {/* 4. SMALL COMPACT ID CARD BOX DIRECTLY UNDER PROFILE PICTURE AND DEPARTMENT NAME */}
                <div className="my-3 p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/80 dark:from-white/5 dark:to-white/[0.02] border border-border/80 text-center shadow-inner">
                  {user?.studentId && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#004b87]/10 dark:bg-emerald-500/10 border border-[#004b87]/20 dark:border-emerald-500/20 mb-2">
                      <span className="text-xs">🪪</span>
                      <span className="text-xs font-bold text-[#004b87] dark:text-emerald-400">
                        ID: {user.studentId}
                      </span>
                    </div>
                  )}

                  {/* Small ID Card Image Thumbnails */}
                  {(user?.idCardFront || user?.idCardBack) ? (
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {user?.idCardFront && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">ID Front</span>
                          <div className="relative rounded-lg overflow-hidden border border-border aspect-[1.58/1] h-20 w-full bg-slate-200 dark:bg-slate-900">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={user.idCardFront} alt="ID Front" className="object-cover w-full h-full" />
                          </div>
                        </div>
                      )}
                      {user?.idCardBack && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">ID Back</span>
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
                        className="text-[11px] font-bold text-[#004b87] dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        + Upload Small ID Card
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
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Email Address</p>
                        <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  )}

                  {user?.primaryNumber && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50">
                      <span className="text-xl">📞</span>
                      <div>
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Phone Number</p>
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
                    <UserIcon className="w-5 h-5 text-[#004b87] dark:text-emerald-400" />
                    University Account Information
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Verified Student
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

                  {/* Field: Department */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                      <GraduationCap className="w-4 h-4 text-emerald-500" />
                      Department / Major
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {user?.occupation || ''}
                    </p>
                  </div>

                  {/* Field: Student ID */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                      <span className="text-base">🪪</span>
                      Student ID
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {user?.studentId || ''}
                    </p>
                  </div>

                  {/* Field: Email */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                      <span className="text-base">✉️</span>
                      Email Address
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
                      {user?.DOB ? formatDOB(user.DOB) : ''}
                    </p>
                  </div>

                  {/* Field: Completed Credits */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                      <span className="text-base">👥</span>
                      Completed Credits
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {user?.creditsCompleted ? (
                        user.creditsCompleted.toString().includes('Credits') ? user.creditsCompleted : `${user.creditsCompleted} Credits`
                      ) : (
                        ''
                      )}
                    </p>
                  </div>

                  {/* Field: Phone Number */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                      <span className="text-base">📞</span>
                      Contact Phone
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {user?.primaryNumber || ''}
                    </p>
                  </div>

                  {/* Field: Blood Group & Gender */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                      <span className="text-base">🩸</span>
                      Blood Group & Gender
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {user?.bloodGroup ? `${user.bloodGroup} ${user?.gender ? `(${user.gender})` : ''}` : (user?.gender || '')}
                    </p>
                  </div>
                </div>

                {/* Residential Address */}
                {user?.address && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/60">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                      <MapPin className="w-4 h-4 text-red-500" />
                      Residential Address
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {user.address}
                    </p>
                  </div>
                )}
              </GlassCard>
            ) : (
              /* EDIT MODE: Complete Form with Profile Pic & ID Card Uploaders */
              <GlassCard className="p-6 md:p-8 border-primary/40 shadow-xl">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-primary" />
                    Update Profile Information
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
                          {user?.fullName?.charAt(0) || '🎓'}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-center sm:text-left flex-1">
                      <p className="text-sm font-bold text-foreground">Profile Picture</p>
                      <p className="text-xs text-slate-400">
                        Uploading a new image will automatically delete your previous picture from Cloudinary.
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
                        className="mt-2 px-3.5 py-1.5 rounded-lg bg-[#004b87]/10 dark:bg-emerald-500/10 hover:bg-[#004b87]/20 text-[#004b87] dark:text-emerald-400 text-xs font-semibold border border-[#004b87]/30 dark:border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1.5 mx-auto sm:mx-0"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Choose New Profile Picture</span>
                      </button>
                    </div>
                  </div>

                  {/* ID Card Front & Back Image Uploaders */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border space-y-4">
                    <div>
                      <p className="text-sm font-bold text-foreground flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-primary" />
                        Update ID Card Verification Pictures
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Uploading a new front or back ID card picture will automatically delete the previous picture from Cloudinary.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* ID Card Front Upload */}
                      <div className="p-3 rounded-xl border border-border/80 bg-background flex flex-col items-center justify-center text-center space-y-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ID Card Front</p>
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
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ID Card Back</p>
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
                        placeholder="e.g. Prieom"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        required
                      />
                    </div>

                    {/* Input: Department / Major */}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">
                        🎓 Department / Major
                      </label>
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        placeholder="e.g. Computer Science & Engineering"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    {/* Input: Student ID */}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">
                        🪪 Student ID
                      </label>
                      <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleInputChange}
                        placeholder="e.g. 222-16-656"
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
                        placeholder="e.g. 01743935671"
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

                    {/* Input: Completed Credits */}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">
                        👥 Completed Credits
                      </label>
                      <input
                        type="text"
                        name="creditsCompleted"
                        value={formData.creditsCompleted}
                        onChange={handleInputChange}
                        placeholder="e.g. 43 Credits"
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
                      📍 Residential Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="e.g. Dhaka, Bangladesh"
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

        {/* Secondary Row: Activity Stats & Notification Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Activity Overview
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50">
                  <p className="text-xs text-slate-400 mb-1 font-medium">Reported</p>
                  <p className="text-2xl font-extrabold text-[#004b87] dark:text-blue-400">{stats.lostCount}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50">
                  <p className="text-xs text-slate-400 mb-1 font-medium">Matches</p>
                  <p className="text-2xl font-extrabold text-amber-500">{stats.matchCount}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50">
                  <p className="text-xs text-slate-400 mb-1 font-medium">Recovered</p>
                  <p className="text-2xl font-extrabold text-emerald-500">{stats.resolvedCount}</p>
                </div>
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notification Settings
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
                <span className="text-sm font-medium">Email Match Notifications</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-primary cursor-pointer" />
              </label>
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
                <span className="text-sm font-medium">Claim Updates & Alerts</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-primary cursor-pointer" />
              </label>
            </div>
          </GlassCard>
        </div>

      </div>
    </DashboardLayout>
  )
}
