'use client'

import React from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Sidebar } from './sidebar'
import { Home, Sun, Moon, LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'

interface DashboardLayoutProps {
  children: React.ReactNode
  sidebarItems: Array<{
    label: string
    href: string
    icon: React.ReactNode
  }>
  title: string
  requiredRole?: 'student' | 'admin'
}

export function DashboardLayout({
  children,
  sidebarItems,
  title,
  requiredRole,
}: DashboardLayoutProps) {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (requiredRole && user?.role !== requiredRole) {
      router.push('/')
    }
  }, [isAuthenticated, user, requiredRole, router])

  if (!isAuthenticated) {
    return null
  }

  const enhancedItems = [
    { label: 'Home', href: '/', icon: <Home className="w-5 h-5" /> },
    ...sidebarItems,
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <div className="md:fixed md:left-0 md:top-0 md:h-screen md:w-80 md:z-40">
        <Sidebar items={enhancedItems} title={title} />
      </div>
      <div className="flex-1 flex flex-col w-full md:ml-80">
        
        {/* Sticky Dashboard Header */}
        <header className="h-16 border-b border-border bg-card/30 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="md:hidden font-bold text-lg text-primary">{title}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-500 dark:text-slate-400 cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>

            {/* Separator */}
            <div className="h-5 w-[1px] bg-border hidden sm:block" />

            {/* Profile Info */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{user?.fullName || user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-red-500/5 dark:hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-colors cursor-pointer"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
