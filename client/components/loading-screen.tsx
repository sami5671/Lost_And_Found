'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLoader } from '@/lib/loading-context'

const loadingMessages = [
  'Initializing portal...',
  'Securing session access...',
  'Loading workspace panels...',
  'Retrieving database records...',
  'Syncing dashboard content...',
]

export function LoadingScreen() {
  const { isLoading } = useLoader()
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      setMessageIndex(0)
      return
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 1000)

    return () => clearInterval(interval)
  }, [isLoading])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0c1a30]/80 backdrop-blur-md"
        >
          <div className="relative flex flex-col items-center p-8 rounded-2xl bg-[#0c1a30] border border-white/10 max-w-sm w-full mx-4 shadow-2xl shadow-blue-500/10">
            {/* Spinning Glowing Outer Ring */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Pulsing Backlight Glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#004b87] to-[#16a34a] blur-xl opacity-20 animate-pulse" />
              
              {/* Spinner Outer Ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#004b87] border-r-[#16a34a]"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              />

              {/* Inner Pulsing Core */}
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#004b87] to-[#16a34a] flex items-center justify-center shadow-lg p-1.5"
                animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                <img src="/logo.png" alt="Loading Logo" className="w-full h-full object-contain" />
              </motion.div>
            </div>

            {/* Glowing Spinner Accents */}
            <div className="mt-6 flex items-center gap-1.5 justify-center">
              <span className="w-2 h-2 rounded-full bg-[#004b87] animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
            </div>

            {/* Cycling Loading Messages */}
            <div className="mt-4 h-6 relative overflow-hidden w-full text-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIndex}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-green-200 tracking-wide"
                >
                  {loadingMessages[messageIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
            
            <p className="mt-1 text-xs text-slate-400 font-medium">Please wait a moment</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
