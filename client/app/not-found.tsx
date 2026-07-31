'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Home } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { GradientButton } from '@/components/gradient-button'

export default function NotFound() {
  const router = useRouter()

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4 bg-[#fdfbf7] dark:bg-[#0d111a] text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500">
        
        {/* Ambient Glows */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-amber-400/20 dark:bg-amber-600/10 rounded-full blur-[120px]"
          />
        </div>

        <div className="max-w-2xl w-full text-center z-10 flex flex-col items-center">
          
          {/* Desert 404 Vector Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full max-w-lg mb-8 relative select-none"
          >
            <svg
              className="w-full h-auto drop-shadow-md"
              viewBox="0 0 500 320"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Sun Gradient */}
                <linearGradient id="sunGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff9f1c" />
                  <stop offset="100%" stopColor="#ffbf69" />
                </linearGradient>

                {/* Sand Dune Hills Gradient */}
                <linearGradient id="duneBackGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fca311" />
                  <stop offset="100%" stopColor="#e76f51" />
                </linearGradient>

                {/* Floating Island Gradient */}
                <linearGradient id="islandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffb703" />
                  <stop offset="50%" stopColor="#fb8500" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>

                {/* Cactus Base Gradient */}
                <linearGradient id="cactusGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#e76f51" />
                  <stop offset="50%" stopColor="#f4a261" />
                  <stop offset="100%" stopColor="#e76f51" />
                </linearGradient>
              </defs>

              {/* Glowing Sun */}
              <circle cx="250" cy="130" r="95" fill="url(#sunGrad)" />

              {/* Floating Clouds over Sun */}
              <motion.g
                animate={{ x: [-15, 15, -15] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Upper Cloud */}
                <rect x="230" y="60" width="75" height="4" rx="2" fill="#fff" opacity="0.8" />
                <rect x="220" y="68" width="95" height="4" rx="2" fill="#fff" opacity="0.8" />
                {/* Lower Cloud */}
                <path
                  d="M160 135 C170 120, 195 120, 205 135 C215 125, 235 130, 240 142 L150 142 Z"
                  fill="#fff"
                  opacity="0.9"
                />
              </motion.g>

              {/* Background Sand Dunes Behind Numbers */}
              <path
                d="M 40 200 Q 150 160 250 185 T 460 200 L 460 230 L 40 230 Z"
                fill="url(#duneBackGrad)"
                opacity="0.85"
              />

              {/* Wavy Floating Island Bottom Base */}
              <path
                d="M 40 210 C 120 220, 180 255, 270 255 C 360 255, 420 225, 460 210 C 430 250, 370 290, 270 290 C 170 290, 80 250, 40 210 Z"
                fill="url(#islandGrad)"
              />
              <path
                d="M 55 212 C 140 222, 190 248, 270 248 C 350 248, 400 222, 445 212 C 400 240, 340 275, 270 275 C 190 275, 100 240, 55 212 Z"
                fill="#d97706"
                opacity="0.4"
              />

              {/* LEFT CACTUS */}
              <motion.g
                animate={{ rotate: [-1.5, 1.5, -1.5] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '90px 210px' }}
              >
                {/* Main Stem */}
                <rect x="80" y="125" width="22" height="90" rx="11" fill="url(#cactusGrad)" />
                {/* Left Arm */}
                <path d="M 80 165 H 65 C 60 165 56 161 56 156 V 140 H 66 V 155 H 80 Z" fill="#e76f51" />
                {/* Right Arm */}
                <path d="M 102 180 H 115 C 120 180 124 176 124 171 V 155 H 114 V 170 H 102 Z" fill="#e76f51" />
                {/* Flower on Top */}
                <path d="M 86 118 L 91 125 L 96 118 L 93 125 L 89 125 Z" fill="#3a0ca3" />
                <path d="M 88 120 L 91 116 L 94 120 Z" fill="#7209b7" />
                {/* Prickle Dots */}
                <circle cx="86" cy="140" r="1.5" fill="#ffb703" />
                <circle cx="95" cy="155" r="1.5" fill="#ffb703" />
                <circle cx="88" cy="175" r="1.5" fill="#ffb703" />
                <circle cx="94" cy="190" r="1.5" fill="#ffb703" />
                <circle cx="62" cy="148" r="1.2" fill="#ffb703" />
                <circle cx="118" cy="162" r="1.2" fill="#ffb703" />
              </motion.g>

              {/* RIGHT CACTUS */}
              <motion.g
                animate={{ rotate: [1.5, -1.5, 1.5] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                style={{ transformOrigin: '410px 210px' }}
              >
                {/* Main Stem */}
                <rect x="400" y="145" width="18" height="70" rx="9" fill="url(#cactusGrad)" />
                {/* Right Arm */}
                <path d="M 418 175 H 428 C 432 175 435 172 435 168 V 156 H 427 V 167 H 418 Z" fill="#e76f51" />
                {/* Flower on Top */}
                <path d="M 405 139 L 409 145 L 413 139 L 411 145 L 407 145 Z" fill="#3a0ca3" />
                <path d="M 407 141 L 409 137 L 411 141 Z" fill="#7209b7" />
                {/* Prickle Dots */}
                <circle cx="406" cy="160" r="1.3" fill="#ffb703" />
                <circle cx="412" cy="178" r="1.3" fill="#ffb703" />
                <circle cx="407" cy="195" r="1.3" fill="#ffb703" />
                <circle cx="430" cy="162" r="1.1" fill="#ffb703" />
              </motion.g>

              {/* 3D FACETED POLYGONAL 404 NUMBERS */}
              <g className="drop-shadow-lg">
                {/* FIRST '4' */}
                {/* Main Body */}
                <polygon points="120,135 165,135 165,175 195,175 195,198 165,198 165,225 138,225 138,198 110,198 110,175" fill="#3d0c0c" />
                {/* Facet Highlights */}
                <polygon points="120,135 165,135 155,175 138,175" fill="#5a1818" />
                <polygon points="110,175 165,175 165,198 110,198" fill="#421212" />
                <polygon points="138,175 165,175 165,135" fill="#2d0808" />
                <polygon points="165,175 195,175 195,198 165,198" fill="#5a1818" />
                <polygon points="138,198 165,198 165,225 138,225" fill="#421212" />

                {/* CENTER '0' */}
                <polygon points="215,130 270,130 285,170 270,225 215,225 200,170" fill="#3d0c0c" />
                {/* Inner Cutout */}
                <polygon points="232,152 253,152 260,170 253,203 232,203 225,170" fill="#fca311" opacity="0.9" />
                {/* Facet Highlights */}
                <polygon points="215,130 270,130 253,152 232,152" fill="#5a1818" />
                <polygon points="270,130 285,170 260,170 253,152" fill="#2d0808" />
                <polygon points="285,170 270,225 253,203 260,170" fill="#421212" />
                <polygon points="270,225 215,225 232,203 253,203" fill="#5a1818" />
                <polygon points="215,225 200,170 225,170 232,203" fill="#421212" />
                <polygon points="200,170 215,130 232,152 225,170" fill="#2d0808" />

                {/* SECOND '4' */}
                <polygon points="300,135 345,135 345,175 375,175 375,198 345,198 345,225 318,225 318,198 290,198 290,175" fill="#3d0c0c" />
                {/* Facet Highlights */}
                <polygon points="300,135 345,135 335,175 318,175" fill="#5a1818" />
                <polygon points="290,175 345,175 345,198 290,198" fill="#421212" />
                <polygon points="318,175 345,175 345,135" fill="#2d0808" />
                <polygon points="345,175 375,175 375,198 345,198" fill="#5a1818" />
                <polygon points="318,198 345,198 345,225 318,225" fill="#421212" />
              </g>
            </svg>
          </motion.div>

          {/* Heading & Text matching the image */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-2 mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#3d0c0c] dark:text-amber-200 tracking-tight">
              Oops!
            </h1>
            <p className="text-lg sm:text-xl font-medium text-[#6b2727] dark:text-amber-100/80">
              Seems like something went wrong...
            </p>
          </motion.div>

          {/* Action Buttons (Back & Back to home page) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
          >
            {/* Go Back Button */}
            <button
              onClick={() => router.back()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-amber-900/20 dark:border-amber-500/30 text-slate-700 dark:text-amber-200 hover:bg-amber-500/10 transition-all flex items-center justify-center gap-2 font-medium cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>

            {/* Back to Home Page Button with Theme Gradient & Underline */}
            <Link href="/" className="w-full sm:w-auto">
              <GradientButton
                variant="primary"
                size="md"
                className="w-full flex items-center justify-center gap-2 group cursor-pointer shadow-md"
              >
                <Home className="w-4 h-4" />
                <span className="underline underline-offset-4 decoration-white/60 group-hover:decoration-white">
                  Back to home page
                </span>
              </GradientButton>
            </Link>
          </motion.div>

        </div>
      </main>
    </>
  )
}
