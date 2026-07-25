'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLoader } from '@/lib/loading-context'
import { DashboardLayout } from '@/components/dashboard-layout'
import { GlassCard } from '@/components/glass-card'
import { GradientButton } from '@/components/gradient-button'
import { FormInput } from '@/components/form-input'
import { BarChart3, Users, Package, AlertCircle, CheckCircle2, TrendingUp, X, Upload } from 'lucide-react'
import { handleReportFoundItem } from '@/actions/admin/item-actions'

export default function AdminAddFoundItemPage() {
  const router = useRouter()
  const { setIsLoading } = useLoader()
  const sidebarItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { label: 'Lost Items', href: '/admin/lost-items', icon: <Package className="w-5 h-5" /> },
    { label: 'Found Items', href: '/admin/found-items', icon: <CheckCircle2 className="w-5 h-5" /> },
    { label: 'Matches', href: '/admin/matches', icon: <AlertCircle className="w-5 h-5" /> },
    { label: 'Reports', href: '/admin/reports', icon: <TrendingUp className="w-5 h-5" /> },
  ]

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    locationFound: '',
    dateFound: '',
    contactInfo: '',
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index])
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const fd = new FormData()
      fd.append('title', formData.title)
      fd.append('category', formData.category)
      fd.append('description', formData.description)
      fd.append('locationFound', formData.locationFound)
      fd.append('dateFound', formData.dateFound)
      fd.append('contactInfo', formData.contactInfo)

      imageFiles.forEach((file) => {
        fd.append('images', file)
      })

      const res = await handleReportFoundItem(fd)
      if (res.status) {
        setSuccess(true)
        setTimeout(() => {
          setIsLoading(true)
          router.push('/admin/found-items')
        }, 2000)
      } else {
        setError(res.error || 'Failed to submit found item report. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title="Admin Panel"
      requiredRole="admin"
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
            Add Found Item
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Register an item found on campus. Registered lost items will be checked automatically by the AI matches process.
          </p>
        </div>

        {success ? (
          <GlassCard className="p-8 text-center border-green-500/30 bg-green-500/5">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-300 mb-2">Item Registered Successfully!</h2>
            <p className="text-foreground/80 mb-4">
              The found item has been logged. Redirecting back to Found Items view...
            </p>
          </GlassCard>
        ) : (
          <GlassCard className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Section */}
                <div className="space-y-4">
                  <FormInput
                    label="Item Title / Name"
                    type="text"
                    name="title"
                    placeholder="e.g. Blue Backpack, Scientific Calculator"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground transition-all focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="" className="bg-background text-foreground">Select Category</option>
                      <option value="Electronics" className="bg-background text-foreground">Electronics</option>
                      <option value="Documents" className="bg-background text-foreground">Documents & Cards</option>
                      <option value="Books" className="bg-background text-foreground">Books & Stationery</option>
                      <option value="Bags" className="bg-background text-foreground">Bags & Wallets</option>
                      <option value="Clothing" className="bg-background text-foreground">Clothing & Accessories</option>
                      <option value="Others" className="bg-background text-foreground">Others</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={4}
                      placeholder="Include item brand, unique tags, colors, content inside, or details..."
                      value={formData.description}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-foreground/50 transition-all focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Right Section */}
                <div className="space-y-4">
                  <FormInput
                    label="Location Found"
                    type="text"
                    name="locationFound"
                    placeholder="e.g. Auditorium, Class Room 302, Library Cafe"
                    value={formData.locationFound}
                    onChange={handleChange}
                    required
                  />

                  <FormInput
                    label="Date Found"
                    type="date"
                    name="dateFound"
                    value={formData.dateFound}
                    onChange={handleChange}
                    required
                  />

                  <FormInput
                    label="Finder / Contact Details (Optional)"
                    type="text"
                    name="contactInfo"
                    placeholder="Finder name, phone, or handover location"
                    value={formData.contactInfo}
                    onChange={handleChange}
                  />

                  {/* Photo Upload Box */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground">
                      Item Photos (Max 8MB per image)
                    </label>

                    {/* Horizontal Previews Row */}
                    {imagePreviews.length > 0 && (
                      <div className="flex flex-row gap-3 overflow-x-auto py-3 px-3 bg-white/5 rounded-xl border border-border min-h-[112px] items-center scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                        {imagePreviews.map((preview, index) => (
                          <div key={preview} className="relative rounded-lg overflow-hidden border border-border flex-shrink-0 w-20 h-20 bg-slate-100 dark:bg-slate-900 group transition-transform hover:scale-105">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-red-500 text-white transition-colors cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Slot */}
                    <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-blue-500/5 hover:bg-blue-500/10 hover:border-primary transition-all text-center h-16 cursor-pointer relative group">
                      <Upload className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-semibold text-foreground/80">Add Image Files</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || [])
                          const validFiles: File[] = []
                          const previews: string[] = []
                          let sizeExceeded = false

                          files.forEach(file => {
                            if (file.size > 8 * 1024 * 1024) {
                              sizeExceeded = true
                            } else {
                              validFiles.push(file)
                              previews.push(URL.createObjectURL(file))
                            }
                          })

                          if (sizeExceeded) {
                            alert('One or more selected images exceed the 8MB limit!')
                          }

                          setImageFiles(prev => [...prev, ...validFiles])
                          setImagePreviews(prev => [...prev, ...previews])
                          e.target.value = ''
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-8 border-t border-border">
                <GradientButton
                  type="submit"
                  className="flex-1 py-3 cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registering...' : 'Register Found Item'}
                </GradientButton>
                <Link href="/admin/dashboard">
                  <GradientButton
                    type="button"
                    variant="secondary"
                    className="py-3 px-6 cursor-pointer"
                  >
                    Cancel
                  </GradientButton>
                </Link>
              </div>
            </form>
          </GlassCard>
        )}
      </div>
    </DashboardLayout>
  )
}
