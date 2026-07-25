import React from 'react'
import Link from 'next/link'
import {
  Heart,
  Share2,
  Send,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-black/5 dark:bg-black/20 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center text-white font-bold">
                ✦
              </div>
              <span className="text-foreground">Lost & Found</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              AI-powered recovery system for the campus community
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/browse"
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  Browse Items
                </Link>
              </li>
              <li>
                <Link
                  href="/report"
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  Report Item
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-foreground/60">
                <Mail className="w-4 h-4" />
                <span>lost-found@lostandfound.com</span>
              </li>
              <li className="flex items-center gap-2 text-foreground/60">
                <Phone className="w-4 h-4" />
                <span>+880 2 9146 1111</span>
              </li>
              <li className="flex items-start gap-2 text-foreground/60">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex gap-4">
            <a
              href="#"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-foreground/60 hover:text-foreground"
            >
              <Heart className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-foreground/60 hover:text-foreground"
            >
              <Share2 className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-foreground/60 hover:text-foreground"
            >
              <Send className="w-5 h-5" />
            </a>
          </div>
          <p className="text-sm text-foreground/60">
            © 2024 Lost & Found. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
