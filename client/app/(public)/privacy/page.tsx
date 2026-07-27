'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { GlassCard } from '@/components/glass-card'
import { ShieldCheck, Lock, Eye, Database, Bell, UserCheck, ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-4 bg-background">
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Data Protection & Safety</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Privacy Policy
            </h1>
            <p className="text-foreground/60 text-sm max-w-2xl mx-auto">
              How the Lost & Found Portal collects, secures, and handles user information, identification photos, and item records.
            </p>
            <p className="text-xs text-foreground/40 font-mono">Last Updated: July 2026</p>
          </motion.div>

          {/* Main Content Glass Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <GlassCard className="p-6 sm:p-10 space-y-8">
              {/* Section 1 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-lg font-bold text-foreground">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-primary border border-blue-500/20">
                    <Database className="w-5 h-5" />
                  </div>
                  <h2>1. Information We Collect</h2>
                </div>
                <p className="text-sm text-foreground/75 leading-relaxed">
                  To provide accurate item matching and secure claim verification, we collect minimal necessary information when you register or report an item:
                </p>
                <ul className="space-y-2 text-sm text-foreground/70 list-disc pl-5">
                  <li><strong>Account Credentials:</strong> Full name, institutional email address, primary phone number, and occupation/role.</li>
                  <li><strong>Verification Records:</strong> Student/Employee ID Card photos uploaded during registration for identity confirmation.</li>
                  <li><strong>Item Reports:</strong> Descriptions, categories, lost/found dates, locations, and uploaded item photographs.</li>
                </ul>
              </div>

              <hr className="border-border/60" />

              {/* Section 2 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-lg font-bold text-foreground">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h2>2. How We Use Your Data</h2>
                </div>
                <p className="text-sm text-foreground/75 leading-relaxed">
                  Your personal data is strictly utilized for core service functionality:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-background/50 border border-border space-y-1">
                    <h3 className="font-semibold text-xs text-primary">🤖 AI Matching Engine</h3>
                    <p className="text-xs text-foreground/70">Item descriptions and visual attributes are compared to detect potential matches automatically.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-background/50 border border-border space-y-1">
                    <h3 className="font-semibold text-xs text-green-400">🛡️ Ownership Verification</h3>
                    <p className="text-xs text-foreground/70">ID card photos ensure only authorized item owners can initiate or confirm claim requests.</p>
                  </div>
                </div>
              </div>

              <hr className="border-border/60" />

              {/* Section 3 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-lg font-bold text-foreground">
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h2>3. ID Card & Photo Protection</h2>
                </div>
                <p className="text-sm text-foreground/75 leading-relaxed">
                  Identification images (ID Card Front & Back) are treated with high-security access controls.
                </p>
                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 text-xs text-foreground/80 space-y-2">
                  <p className="font-semibold text-green-400">Security Commitments:</p>
                  <p>• ID images are never publicly visible to other platform users.</p>
                  <p>• Access is restricted solely to authorized Lost & Found moderators for identity verification.</p>
                  <p>• All media uploads are stored securely on Cloudinary with encrypted connections.</p>
                </div>
              </div>

              <hr className="border-border/60" />

              {/* Section 4 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-lg font-bold text-foreground">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Eye className="w-5 h-5" />
                  </div>
                  <h2>4. Data Sharing & Third Parties</h2>
                </div>
                <p className="text-sm text-foreground/75 leading-relaxed">
                  We <strong>do not sell, rent, or trade</strong> your personal data or contact details to third-party advertisers. Information is shared only with internal campus administrative staff when necessary to facilitate physical item retrieval.
                </p>
              </div>

              <hr className="border-border/60" />

              {/* Section 5 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-lg font-bold text-foreground">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Bell className="w-5 h-5" />
                  </div>
                  <h2>5. Automated Notifications</h2>
                </div>
                <p className="text-sm text-foreground/75 leading-relaxed">
                  We send transaction and security notifications (such as AI match alerts and password reset OTP codes) to your registered email address. You can manage notification preferences in your student profile settings.
                </p>
              </div>

              {/* Footer navigation */}
              <div className="pt-6 border-t border-border flex items-center justify-between">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Home</span>
                </Link>

                <Link
                  href="/terms"
                  className="text-sm text-primary hover:underline font-semibold"
                >
                  View Terms of Service →
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}
