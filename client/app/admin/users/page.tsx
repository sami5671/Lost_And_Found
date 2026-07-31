'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { GlassCard } from '@/components/glass-card'
import {
  Users,
  Package,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Search,
  Edit2,
  Trash2,
  UserX,
  X,
  Check,
  UserCheck,
  AlertTriangle,
  Mail,
  User as UserIcon,
  Phone,
  Briefcase,
  MapPin,
  IdCard,
  GraduationCap,
  Heart
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { handleGetAllUsers, handleUpdateUser, handleDeleteUser } from '@/actions/admin/user-actions'

export default function AdminUsersPage() {
  const sidebarItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { label: 'Lost Items', href: '/admin/lost-items', icon: <Package className="w-5 h-5" /> },
    { label: 'Found Items', href: '/admin/found-items', icon: <CheckCircle2 className="w-5 h-5" /> },
    { label: 'Matches', href: '/admin/matches', icon: <AlertCircle className="w-5 h-5" /> },
    { label: 'Reports', href: '/admin/reports', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Profile', href: '/admin/profile', icon: <UserIcon className="w-5 h-5" /> },
  ]

  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Edit Modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    role: 'student',
    primaryNumber: '',
    occupation: '',
    gender: 'male',
    address: '',
    studentId: '',
    creditsCompleted: '',
    bloodGroup: '',
  })
  const [savingEdit, setSavingEdit] = useState(false)

  // Deactivate/Activate Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingUser, setDeletingUser] = useState<any | null>(null)
  const [deletingProcess, setDeletingProcess] = useState(false)

  // Toast / Alert Notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showNotification = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      const res = await handleGetAllUsers()
      if (res.status && res.data?.users) {
        setUsers(res.data.users)
      }
    } catch (err) {
      console.error('Failed to load users:', err)
      showNotification('error', 'Failed to load users list.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Open Edit Modal
  const handleOpenEdit = (user: any) => {
    setEditingUser(user)
    setEditFormData({
      fullName: user.fullName || user.name || '',
      email: user.email || '',
      role: user.role || 'student',
      primaryNumber: user.primaryNumber || '',
      occupation: user.occupation || '',
      gender: user.gender || 'male',
      address: user.address || '',
      studentId: user.studentId || '',
      creditsCompleted: user.creditsCompleted || '',
      bloodGroup: user.bloodGroup || '',
    })
    setShowEditModal(true)
  }

  // Save Edit Handler
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    const userId = editingUser.id || editingUser._id
    setSavingEdit(true)

    try {
      const res = await handleUpdateUser(userId, editFormData)
      if (res.status) {
        // Sync local client state with server response
        const updated = res.data
        setUsers((prev) =>
          prev.map((u) => {
            const currentId = u.id || u._id
            if (currentId === userId) {
              return {
                ...u,
                ...updated,
                id: currentId,
              }
            }
            return u
          })
        )
        setShowEditModal(false)
        setEditingUser(null)
        showNotification('success', res.message || 'User profile updated successfully!')
      } else {
        showNotification('error', res.error || 'Failed to update user profile.')
      }
    } catch (err) {
      console.error('Error updating user:', err)
      showNotification('error', 'An unexpected error occurred while updating user.')
    } finally {
      setSavingEdit(false)
    }
  }

  // Open Deactivate/Activate Modal
  const handleOpenDelete = (user: any) => {
    setDeletingUser(user)
    setShowDeleteModal(true)
  }

  // Confirm Deactivate/Activate Handler (Soft delete toggle)
  const handleConfirmDelete = async () => {
    if (!deletingUser) return

    const userId = deletingUser.id || deletingUser._id
    setDeletingProcess(true)

    try {
      const res = await handleDeleteUser(userId)
      if (res.status) {
        const newStatus = res.data?.status || (deletingUser.status === 'Inactive' ? 'Active' : 'Inactive')
        // Sync client state by updating account status
        setUsers((prev) =>
          prev.map((u) => {
            const currentId = u.id || u._id
            if (currentId === userId) {
              return { ...u, status: newStatus }
            }
            return u
          })
        )
        setShowDeleteModal(false)
        setDeletingUser(null)
        showNotification('success', res.message || `User account ${newStatus.toLowerCase()} successfully!`)
      } else {
        showNotification('error', res.error || 'Failed to update user account status.')
      }
    } catch (err) {
      console.error('Error toggling user status:', err)
      showNotification('error', 'An unexpected error occurred while toggling status.')
    } finally {
      setDeletingProcess(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase()
    const name = (user.fullName || user.name || '').toLowerCase()
    const email = (user.email || '').toLowerCase()
    return name.includes(query) || email.includes(query)
  })

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
        {/* Toast Notification Banner */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-xl border flex items-center justify-between shadow-lg backdrop-blur-md ${
                toast.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
              }`}
            >
              <div className="flex items-center gap-3 font-semibold text-sm">
                {toast.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                )}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => setToast(null)}
                className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">User Management</h1>
            <p className="text-slate-600 dark:text-slate-400">Monitor and manage system users</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              {users.length} Total Users
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-foreground/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-[#0c1a30] border border-emerald-500/30 dark:border-emerald-500/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
          />
        </div>

        {/* Users Table */}
        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-emerald-500/20">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Items</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Retrieving user directory...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-500 dark:text-slate-400 font-medium">
                      No users found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => {
                    const displayRole = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'
                    const isAdmin = user.role?.toLowerCase() === 'admin'
                    const isModerator = user.role?.toLowerCase() === 'moderator'
                    const isDeactivated = user.status === 'Inactive'
                    
                    return (
                      <motion.tr
                        key={user.id || user._id || idx}
                        className={`border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${
                          isDeactivated ? 'opacity-70 bg-slate-50/50 dark:bg-black/20' : ''
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${
                            isDeactivated
                              ? 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {(user.fullName || user.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className={isDeactivated ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                            {user.fullName || user.name || 'Anonymous'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{user.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            isAdmin
                              ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                              : isModerator
                              ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                          }`}>
                            {displayRole}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">{user.items ?? 0}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            !isDeactivated
                              ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                          }`}>
                            {user.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                              title="Edit User"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            {isDeactivated ? (
                              <button
                                onClick={() => handleOpenDelete(user)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                                title="Reactivate User"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                Activate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenDelete(user)}
                                className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                                title="Deactivate User"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                Deactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0c1a30] border border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-emerald-500/20 bg-slate-50 dark:bg-emerald-950/30">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <UserCheck className="w-6 h-6 text-emerald-500" />
                    Update User Information
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Editing account for <span className="font-semibold text-emerald-600 dark:text-emerald-400">{editingUser.email}</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-emerald-500" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.fullName}
                      onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-emerald-500" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                      System Role
                    </label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1a30] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                    >
                      <option value="student">Student</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Primary Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editFormData.primaryNumber}
                      onChange={(e) => setEditFormData({ ...editFormData, primaryNumber: e.target.value })}
                      placeholder="e.g. +880 1700-000000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Student ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <IdCard className="w-3.5 h-3.5 text-emerald-500" />
                      Student ID
                    </label>
                    <input
                      type="text"
                      value={editFormData.studentId}
                      onChange={(e) => setEditFormData({ ...editFormData, studentId: e.target.value })}
                      placeholder="e.g. 2023-1-60-001"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Occupation */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                      Occupation
                    </label>
                    <input
                      type="text"
                      value={editFormData.occupation}
                      onChange={(e) => setEditFormData({ ...editFormData, occupation: e.target.value })}
                      placeholder="e.g. Student / Teacher"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-emerald-500" />
                      Gender
                    </label>
                    <select
                      value={editFormData.gender}
                      onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0c1a30] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-emerald-500" />
                      Blood Group
                    </label>
                    <input
                      type="text"
                      value={editFormData.bloodGroup}
                      onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}
                      placeholder="e.g. O+"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    Address
                  </label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    placeholder="Campus address / Residential address"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  />
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-emerald-500/20">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/30 rounded-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2"
                  >
                    {savingEdit ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deactivate / Reactivate Modal */}
      <AnimatePresence>
        {showDeleteModal && deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-md bg-white dark:bg-[#0c1a30] border rounded-2xl overflow-hidden shadow-2xl flex flex-col z-10 ${
                deletingUser.status === 'Inactive'
                  ? 'border-emerald-500/30 dark:border-emerald-500/20'
                  : 'border-rose-500/30 dark:border-rose-500/20'
              }`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between px-6 py-5 border-b ${
                deletingUser.status === 'Inactive'
                  ? 'border-slate-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-slate-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${
                    deletingUser.status === 'Inactive'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  }`}>
                    {deletingUser.status === 'Inactive' ? (
                      <UserCheck className="w-6 h-6" />
                    ) : (
                      <UserX className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {deletingUser.status === 'Inactive' ? 'Reactivate User Account' : 'Deactivate User Account'}
                    </h3>
                    <p className={`text-xs font-medium ${
                      deletingUser.status === 'Inactive' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      Soft Delete / Status Change
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {deletingUser.status === 'Inactive' ? (
                    <>
                      Are you sure you want to reactivate the account for{' '}
                      <span className="font-bold text-slate-900 dark:text-white">
                        {deletingUser.fullName || deletingUser.name || deletingUser.email}
                      </span>
                      ? The user will regain login access to the system.
                    </>
                  ) : (
                    <>
                      Are you sure you want to deactivate the account for{' '}
                      <span className="font-bold text-slate-900 dark:text-white">
                        {deletingUser.fullName || deletingUser.name || deletingUser.email}
                      </span>
                      ? The user will be barred from logging into the system, but their data will remain saved.
                    </>
                  )}
                </p>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div><span className="font-semibold text-slate-900 dark:text-slate-200">Email:</span> {deletingUser.email}</div>
                  <div><span className="font-semibold text-slate-900 dark:text-slate-200">Role:</span> {deletingUser.role || 'student'}</div>
                  <div><span className="font-semibold text-slate-900 dark:text-slate-200">Current Status:</span> {deletingUser.status || 'Active'}</div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                {deletingUser.status === 'Inactive' ? (
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deletingProcess}
                    className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/30 rounded-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2"
                  >
                    {deletingProcess ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                        Reactivating...
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        Reactivate Account
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deletingProcess}
                    className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-red-500 hover:shadow-lg hover:shadow-rose-500/30 rounded-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2"
                  >
                    {deletingProcess ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                        Deactivating...
                      </>
                    ) : (
                      <>
                        <UserX className="w-4 h-4" />
                        Deactivate Account
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

