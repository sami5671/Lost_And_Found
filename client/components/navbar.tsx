'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/auth-context'
import { Moon, Sun, LogOut, User, Menu, X } from 'lucide-react'
import { GradientButton } from './gradient-button'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { user, logout, isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dashboardHref = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'

  return (
    <nav className="fixed top-0 w-full z-50">
      <div className="bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#004b87] to-[#16a34a]">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#004b87] to-[#16a34a] flex items-center justify-center text-white font-bold">
              ✦
            </div>
            <span className="hidden sm:inline text-foreground">Lost & Found</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/"
              className="text-foreground/70 hover:text-foreground transition-colors px-3 py-2"
            >
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href={dashboardHref}
                  className="text-foreground/70 hover:text-foreground transition-colors px-3 py-2"
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="text-sm text-foreground/70 hidden sm:block">
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-xs capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-red-400 hover:text-red-300"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex gap-2">
                <Link href="/login">
                  <GradientButton variant="outline" size="sm">
                    Login
                  </GradientButton>
                </Link>
                <Link href="/register">
                  <GradientButton size="sm">Register</GradientButton>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border p-4 space-y-3">
            <Link
              href="/"
              className="block text-foreground/70 hover:text-foreground transition-colors"
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link
                href={dashboardHref}
                className="block text-foreground/70 hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            )}
            {!isAuthenticated && (
              <div className="space-y-2 pt-2">
                <Link href="/login" className="block w-full">
                  <GradientButton variant="outline" className="w-full" size="sm">
                    Login
                  </GradientButton>
                </Link>
                <Link href="/register" className="block w-full">
                  <GradientButton className="w-full" size="sm">
                    Register
                  </GradientButton>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
