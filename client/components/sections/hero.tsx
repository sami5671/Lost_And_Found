'use client'

import { useAuth } from '@/lib/auth-context'
import { motion } from 'framer-motion'
import { LucideLayoutDashboard, Plus, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { GradientButton } from '../gradient-button'

export function HeroSection() {
  const { user, isAuthenticated } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator'

  const primaryHref = isAdmin
    ? '/admin/found-items/add'
    : isAuthenticated
    ? '/report'
    : '/login'

  const secondaryHref = isAdmin
    ? '/admin/dashboard'
    : isAuthenticated
    ? '/dashboard'
    : '/login'

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  }

  return (
    <section className="relative mt-44 pb-20 px-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 right-1/3 w-96 h-96 bg-[#004b87]/15 rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#16a34a]/15 rounded-full blur-3xl opacity-10"></div>
      </div>

      <motion.div
        className="max-w-4xl mx-auto text-center"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* Main Title */}
        <motion.div variants={item} className="mb-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4">
            <span className="text-foreground">Find What </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004b87] via-[#0284c7] to-[#16a34a]">
              Matters
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-light">
            AI-powered Lost & Found Management System
          </p>
        </motion.div>

        {/* Description */}
        <motion.p
          variants={item}
          className="text-lg text-foreground/60 mb-8 max-w-2xl mx-auto"
        >
          Advanced AI analyzes and matches lost and found items, helping students
          recover their belongings instantly with secure verification and fast handover.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href={primaryHref}>
            <GradientButton size="lg" className="gap-2 flex items-center">
              <Plus className="w-5 h-5" />
              {isAdmin ? 'Add Found Item' : 'Report Lost Item'}
            </GradientButton>
          </Link>
          <Link href={secondaryHref}>
            <GradientButton variant="secondary" size="lg" className="gap-2 flex items-center">
              {isAdmin ? <ShieldAlert className="w-5 h-5" /> : <LucideLayoutDashboard className="w-5 h-5" />}
              {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
            </GradientButton>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
