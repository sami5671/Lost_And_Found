'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ChevronRight, Menu, X } from 'lucide-react'
import { motion } from 'framer-motion'

interface SidebarItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface SidebarProps {
  items: SidebarItem[]
  title: string
}

export function Sidebar({ items, title }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const { logout } = useAuth()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    // Set initial value
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 left-4 z-50 md:hidden p-2 rounded-lg glass-dark"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isMobile ? (isOpen ? 0 : -320) : 0,
        }}
        transition={{ duration: 0.3 }}
        className={`fixed md:relative left-0 top-16 md:top-auto h-[calc(100vh-64px)] md:h-screen w-80 bg-[#0c1a30] border-r border-white/10 z-40 md:z-auto overflow-y-auto`}
      >
        <div className="p-6 space-y-8">
          {/* Logo/Title */}
          <div className="flex items-center gap-3 py-2 border-b border-white/10 mb-6">
            <img src="/logo.png" alt="Lost & Found Logo" className="w-10 h-10 object-contain select-none" />
            <div className="flex flex-col select-none">
              <span className="text-[17px] font-bold tracking-wide text-white leading-tight">Lost & Found</span>
              <span className="text-[10px] text-slate-300 font-medium tracking-wider uppercase leading-none">Management</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2">
            {items.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.includes(item.href.split('/').pop() || '')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all group ${
                    isActive
                      ? 'bg-white/10 text-white border-l-4 border-[#22c55e]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`transition-colors ${isActive ? 'text-[#22c55e]' : 'text-slate-400 group-hover:text-white'}`}>
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-slate-400" />}
                </Link>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="border-t border-white/10 pt-6">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 rounded-lg bg-red-600/10 text-red-300 border border-red-500/20 hover:bg-red-600/20 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}
    </>
  )
}
