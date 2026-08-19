'use client'

import { handleGetMatches } from '@/actions/admin/match-actions'
import { handleDeleteUser, handleGetAllUsers, handlePurgeUserData } from '@/actions/admin/user-actions'
import { DashboardLayout } from '@/components/dashboard-layout'
import { GlassCard } from '@/components/glass-card'
import { GradientButton } from '@/components/gradient-button'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Filter,
  Package,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  TrendingUp,
  User,
  UserCheck,
  Users,
  UserX,
  X
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function FraudUserReductionPage() {
  const sidebarItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { label: 'Lost Items', href: '/admin/lost-items', icon: <Package className="w-5 h-5" /> },
    { label: 'Found Items', href: '/admin/found-items', icon: <CheckCircle2 className="w-5 h-5" /> },
    { label: 'Matches', href: '/admin/matches', icon: <AlertCircle className="w-5 h-5" /> },
    { label: 'Fraud User Reduction', href: '/admin/fraud-reduction', icon: <ShieldAlert className="w-5 h-5" /> },
    { label: 'Reports', href: '/admin/reports', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Profile', href: '/admin/profile', icon: <User className="w-5 h-5" /> },
  ]

  const [users, setUsers] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low' | 'inactive'>('all')
  const [purgingUserId, setPurgingUserId] = useState<string | null>(null)

  // Custom Alert / Confirmation Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    type: 'confirm' | 'alert'
    variant: 'danger' | 'warning' | 'success' | 'info'
    title: string
    subtitle?: string
    itemsList?: string[]
    confirmText?: string
    cancelText?: string
    onConfirm?: () => void
  }>({
    isOpen: false,
    type: 'alert',
    variant: 'info',
    title: '',
  })

  const showAlert = (
    variant: 'danger' | 'warning' | 'success' | 'info',
    title: string,
    subtitle?: string
  ) => {
    setModalState({
      isOpen: true,
      type: 'alert',
      variant,
      title,
      subtitle,
      confirmText: 'Got It',
    })
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [uRes, mRes] = await Promise.all([
        handleGetAllUsers(),
        handleGetMatches()
      ])

      if (uRes.status && uRes.data?.users) {
        setUsers(uRes.data.users)
      }
      if (mRes.status && mRes.data?.matches) {
        setMatches(mRes.data.matches)
      }
    } catch (err) {
      console.error('Failed to load fraud reduction data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const executePurge = async (userId: string) => {
    setPurgingUserId(userId)
    try {
      const res = await handlePurgeUserData(userId)
      if (res.status) {
        setUsers(prev => prev.map(u => (u.id === userId || u._id === userId) ? { ...u, items: 0 } : u))
        await loadData()
        showAlert('success', 'User Item Data Cleared', res.message || 'All items, matches, and uploaded item images for this user have been cleared. User account remains registered in the system.')
      } else {
        showAlert('danger', 'Purge Failed', res.error || 'Failed to purge user item data.')
      }
    } catch (err) {
      console.error('Failed to purge user data:', err)
      showAlert('danger', 'Error Occurred', 'An unexpected error occurred while purging user item data.')
    } finally {
      setPurgingUserId(null)
    }
  }

  const handlePurgeUser = (userId: string, userName: string) => {
    setModalState({
      isOpen: true,
      type: 'confirm',
      variant: 'danger',
      title: `Purge Item Data for "${userName}"?`,
      subtitle: 'This will delete all reported items and match records while keeping the user account registered:',
      itemsList: [
        'All reported lost and found items in MongoDB (DELETED)',
        'All associated match records in MongoDB (DELETED)',
        'All uploaded item images in Cloudinary (DELETED)',
        'User account registration data (PRESERVED IN SYSTEM)'
      ],
      confirmText: 'Yes, Clear Item Data',
      cancelText: 'Cancel',
      onConfirm: () => executePurge(userId),
    })
  }

  const executeToggleStatus = async (userId: string, currentStatus: string) => {
    try {
      const res = await handleDeleteUser(userId)
      if (res.status) {
        const newStatus = currentStatus === 'Inactive' ? 'Active' : 'Inactive'
        setUsers(prev => prev.map(u => (u.id === userId || u._id === userId) ? { ...u, status: newStatus } : u))
        showAlert(
          newStatus === 'Inactive' ? 'warning' : 'success',
          `Account ${newStatus === 'Inactive' ? 'Deactivated' : 'Reactivated'}`,
          res.message || `User account status updated to ${newStatus}.`
        )
      } else {
        showAlert('danger', 'Action Failed', res.error || 'Failed to update user status.')
      }
    } catch (err) {
      console.error('Failed to toggle status:', err)
      showAlert('danger', 'Error Occurred', 'Failed to update user account status.')
    }
  }

  const handleToggleUserStatus = (userId: string, currentStatus: string, userName: string) => {
    const isInactive = currentStatus === 'Inactive'
    setModalState({
      isOpen: true,
      type: 'confirm',
      variant: isInactive ? 'success' : 'warning',
      title: isInactive ? `Reactivate Account for "${userName}"?` : `Deactivate Account for "${userName}"?`,
      subtitle: isInactive
        ? 'Restores user login capability and enables claiming items in the portal.'
        : 'Suspends user login capability and blocks future item claims.',
      confirmText: isInactive ? 'Reactivate Account' : 'Deactivate Account',
      cancelText: 'Cancel',
      onConfirm: () => executeToggleStatus(userId, currentStatus),
    })
  }

  const calculateFraudScore = (user: any) => {
    const monthlyCount = user.monthlyItems !== undefined ? user.monthlyItems : (user.items || 0)

    // Fraud Risk Rules based on monthly reported items:
    // > 3 items reported in a month -> 90% Fraud Risk Score
    // > 2 items reported in a month -> 60% Fraud Risk Score
    if (monthlyCount > 3) {
      return 90
    }
    if (monthlyCount > 2) {
      return 65
    }

    let score = 5
    if (monthlyCount === 2) score = 35
    else if (monthlyCount === 1) score = 15

    const userDismissedMatches = matches.filter((m: any) => {
      const isDismissed = m.status === 'dismissed'
      const lostOwner = m.lostItemId?.reportedBy?._id || m.lostItemId?.reportedBy
      const foundOwner = m.foundItemId?.reportedBy?._id || m.foundItemId?.reportedBy
      const userIdStr = user.id || user._id
      return isDismissed && (String(lostOwner) === String(userIdStr) || String(foundOwner) === String(userIdStr))
    }).length

    score += userDismissedMatches * 15
    if (!user.studentId) score += 5
    if (user.status === 'Inactive') score += 20

    return Math.min(Math.max(score, 5), 98)
  }

  const processedUsers = users.map(user => {
    const riskScore = calculateFraudScore(user)
    let riskLevel: 'High' | 'Medium' | 'Low' = 'Low'
    if (riskScore >= 60) riskLevel = 'High'
    else if (riskScore >= 30) riskLevel = 'Medium'

    return {
      ...user,
      riskScore,
      riskLevel
    }
  })

  const filteredUsers = processedUsers.filter(user => {
    const matchesSearch = 
      (user.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.studentId || '').toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (riskFilter === 'high') return user.riskLevel === 'High'
    if (riskFilter === 'medium') return user.riskLevel === 'Medium'
    if (riskFilter === 'low') return user.riskLevel === 'Low'
    if (riskFilter === 'inactive') return user.status === 'Inactive'

    return true
  })

  const highRiskCount = processedUsers.filter(u => u.riskLevel === 'High').length
  const inactiveCount = processedUsers.filter(u => u.status === 'Inactive').length
  const dismissedMatchesCount = matches.filter(m => m.status === 'dismissed').length

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title="Admin Panel"
      requiredRole="admin"
    >
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
                  Fraud User Reduction
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">
                  Detect, analyze, and mitigate fraudulent user behavior, fake claims, and suspicious accounts
                </p>
              </div>
            </div>
          </div>

          <GradientButton
            variant="primary"
            onClick={loadData}
            className="flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Audit Data
          </GradientButton>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <GlassCard className="p-5 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">High Risk Users</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{highRiskCount}</h3>
              <p className="text-[11px] text-red-500 font-medium mt-0.5">Flagged for inspection</p>
            </div>
          </GlassCard>

          <GlassCard className="p-5 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Deactivated Users</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{inactiveCount}</h3>
              <p className="text-[11px] text-amber-500 font-medium mt-0.5">Blocked from claiming</p>
            </div>
          </GlassCard>

          <GlassCard className="p-5 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fraud Shield Mode</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">Active</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">AI Confidence &ge; 65%</p>
            </div>
          </GlassCard>

          <GlassCard className="p-5 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dismissed Matches</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{dismissedMatchesCount}</h3>
              <p className="text-[11px] text-blue-500 font-medium mt-0.5">Rejected false claims</p>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">User Risk Audit & Deactivation</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monitor risk indicators and manage account status for suspicious users</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, email, student ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={riskFilter}
                  onChange={e => setRiskFilter(e.target.value as any)}
                  className="bg-transparent text-slate-800 dark:text-slate-200 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="high">High Risk (&ge; 60%)</option>
                  <option value="medium">Medium Risk (30-59%)</option>
                  <option value="low">Low Risk (&lt; 30%)</option>
                  <option value="inactive">Deactivated Accounts</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Calculating user fraud risk scores...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Items Reported</th>
                    <th className="py-3 px-4">Fraud Risk Score</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredUsers.map(user => {
                    const userId = user.id || user._id
                    const isInactive = user.status === 'Inactive'
                    const userName = user.fullName || user.name || user.email

                    return (
                      <tr key={userId} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <img src={user.avatar} alt={userName} className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-white/10" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400">
                                {(userName || 'U')[0]}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{userName}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {user.items || 0} total items
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              {user.monthlyItems !== undefined ? `${user.monthlyItems} reported this month` : ''}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  user.riskScore >= 60
                                    ? 'bg-red-500'
                                    : user.riskScore >= 30
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${user.riskScore}%` }}
                              />
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              user.riskScore >= 60
                                ? 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30'
                                : user.riskScore >= 30
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {user.riskScore}% ({user.riskLevel})
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                            isInactive
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          }`}>
                            {user.status || 'Active'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleUserStatus(userId, user.status, userName)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                                isInactive
                                  ? 'bg-gradient-to-r from-[#004b87] to-[#16a34a] text-white hover:shadow-lg hover:shadow-emerald-500/20'
                                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 border border-amber-500/30'
                              }`}
                            >
                              {isInactive ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  Reactivate
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  Deactivate
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handlePurgeUser(userId, userName)}
                              disabled={purgingUserId === userId}
                              className="px-3 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-red-500/25 disabled:opacity-50"
                              title="Permanently delete user, all reported items, matches, and Cloudinary images"
                            >
                              {purgingUserId === userId ? (
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              Remove Data
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                        No users matching the specified risk filter or search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        {/* Custom Website Color Gradient Modal / Alert */}
        <AnimatePresence>
          {modalState.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Animated Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
              />

              {/* Animated Glass Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
                className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl"
              >
                {/* Top Theme Accent Line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${
                    modalState.variant === 'danger'
                      ? 'from-red-600 via-rose-500 to-amber-500'
                      : modalState.variant === 'warning'
                      ? 'from-amber-500 via-orange-500 to-yellow-400'
                      : 'from-[#004b87] via-emerald-500 to-[#16a34a]'
                  }`}
                />

                {/* Close Button */}
                <button
                  onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center space-y-4 pt-2">
                  {/* Glowing Icon Badge with Website Gradient */}
                  <div
                    className={`p-4 rounded-2xl shadow-xl ${
                      modalState.variant === 'danger'
                        ? 'bg-gradient-to-tr from-red-600 via-rose-600 to-amber-600 text-white shadow-red-500/30'
                        : modalState.variant === 'warning'
                        ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-500 text-white shadow-amber-500/30'
                        : 'bg-gradient-to-tr from-[#004b87] via-emerald-600 to-[#16a34a] text-white shadow-emerald-500/30'
                    }`}
                  >
                    {modalState.variant === 'danger' && <Trash2 className="w-8 h-8" />}
                    {modalState.variant === 'warning' && <UserX className="w-8 h-8" />}
                    {modalState.variant === 'success' && <CheckCircle2 className="w-8 h-8" />}
                    {modalState.variant === 'info' && <AlertCircle className="w-8 h-8" />}
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      {modalState.title}
                    </h3>
                    {modalState.subtitle && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-medium px-2">
                        {modalState.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Impacted Items List */}
                  {modalState.itemsList && modalState.itemsList.length > 0 && (
                    <div className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-left space-y-2 text-xs">
                      <span className="font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px]">
                        Included Data Cleanup:
                      </span>
                      <ul className="space-y-1.5 text-slate-700 dark:text-slate-200 font-semibold">
                        {modalState.itemsList.map((item, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Modal Action Buttons */}
                  <div className="flex items-center justify-center gap-3 w-full pt-3">
                    {modalState.type === 'confirm' && (
                      <button
                        onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                        className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 transition-all cursor-pointer"
                      >
                        {modalState.cancelText || 'Cancel'}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        const cb = modalState.onConfirm
                        setModalState(prev => ({ ...prev, isOpen: false }))
                        if (cb) cb()
                      }}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold text-white shadow-lg transition-all hover:scale-105 cursor-pointer ${
                        modalState.variant === 'danger'
                          ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:shadow-red-500/30'
                          : modalState.variant === 'warning'
                          ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:shadow-amber-500/30'
                          : 'bg-gradient-to-r from-[#004b87] to-[#16a34a] hover:shadow-emerald-500/30'
                      }`}
                    >
                      {modalState.confirmText || 'OK'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  )
}
