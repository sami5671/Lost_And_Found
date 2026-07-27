'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { GlassCard } from '@/components/glass-card'
import { ShieldAlert, FileText, CheckCircle2, AlertTriangle, ArrowLeft, Scale, Clock, Lock } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-4 bg-background">
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-semibold">
              <Scale className="w-4 h-4" />
              <span>Legal & Service Rules</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Terms of Service
            </h1>
            <p className="text-foreground/60 text-sm max-w-2xl mx-auto">
              Please review the guidelines and responsibilities for using the Lost & Found Portal to report, match, and claim campus items.
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
                    <FileText className="w-5 h-5" />
                  </div>
                  <h2>1. Acceptance of Terms</h2>
                </div>
                <p className="text-sm text-foreground/75 leading-relaxed">
                  By accessing or using the Lost & Found Portal, you agree to be bound by these Terms of Service. This platform is designed for students, faculty, and administrative staff to facilitate the honest recovery and reporting of lost or found belongings within campus premises.
                </p>
              </div>

              <hr className="border-border/60" />

              {/* Section 2 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-lg font-bold text-foreground">
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h2>2. Reporting Lost & Found Items</h2>
                </div>
                <p className="text-sm text-foreground/75 leading-relaxed">
                  When reporting a lost or found item, users must provide truthful, accurate, and detailed information.
                </p>
                <ul className="space-y-2 text-sm text-foreground/70 list-disc pl-5">
                  <li><strong>Accurate Details:</strong> Provide exact category tags, description markers, estimated date, and location.</li>
                  <li><strong>Image Verification:</strong> Upload clear photos of found items. Photos must not contain offensive or misleading material.</li>
                  <li><strong>Good Faith Requirement:</strong> Submitting fake reports or intentional misrepresentations is strictly prohibited.</li>
                </ul>
              </div>

              <hr className="border-border/60" />

              {/* Section 3 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-lg font-bold text-foreground">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h2>3. Item Verification & Claiming Process</h2>
                </div>
                <p className="text-sm text-foreground/75 leading-relaxed">
                  To prevent unauthorized retrieval of property, all item claims undergo administrative and verification checks.
                </p>
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs text-foreground/80 space-y-2">
                  <p className="font-semibold text-purple-400">Proof of Ownership Requirements:</p>
                  <p>• Claimants must present valid Student/Employee Identification upon claiming items at the Lost & Found Office.</p>
                  <p>• For high-value electronics (e.g. Laptops, Mobile Devices), claimants may be asked to unlock the device or provide serial numbers.</p>
                </div>
              </div>

              <hr className="border-border/60" />

              {/* Section 4 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-lg font-bold text-foreground">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h2>4. Holding Period & Unclaimed Items</h2>
                </div>
                <p className="text-sm text-foreground/75 leading-relaxed">
                  Found items submitted to the Lost & Found office are held for a maximum standard period of <strong>90 calendar days</strong>. If an item remains unclaimed after this window, campus administration reserves the right to donate, recycle, or dispose of the item in accordance with institutional guidelines.
                </p>
              </div>

              <hr className="border-border/60" />

              {/* Section 5 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-lg font-bold text-foreground">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h2>5. Fraudulent Claims & System Misuse</h2>
                </div>
                <p className="text-sm text-foreground/75 leading-relaxed">
                  Any attempt to fraudulently claim items belonging to others, submit false reports, or tamper with system verification algorithms will result in immediate account suspension and escalation to campus disciplinary authorities.
                </p>
              </div>

              <hr className="border-border/60" />

              {/* Section 6 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-lg font-bold text-foreground">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h2>6. Contact & Support</h2>
                </div>
                <p className="text-sm text-foreground/75 leading-relaxed">
                  If you have questions regarding item policies or need assistance with a claim, please reach out to the Lost & Found office at <a href="mailto:lost-found@lostandfound.com" className="text-primary underline">lost-found@lostandfound.com</a>.
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
                  href="/privacy"
                  className="text-sm text-primary hover:underline font-semibold"
                >
                  View Privacy Policy →
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
