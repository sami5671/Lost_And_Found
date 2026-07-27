import React from 'react'
import Image from 'next/image'
import { Item, ItemCategory } from '@/types'
import { GlassCard } from './glass-card'
import { Calendar, MapPin, Tag } from 'lucide-react'

interface ItemCardProps {
  item: Item
  onClick?: () => void
}

const categoryColors: Record<ItemCategory, { bg: string; text: string }> = {
  electronics: { bg: 'bg-purple-100 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300' },
  documents: { bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300' },
  accessories: { bg: 'bg-pink-100 dark:bg-pink-950/40', text: 'text-pink-700 dark:text-pink-300' },
  clothing: { bg: 'bg-indigo-100 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300' },
  bags: { bg: 'bg-orange-100 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300' },
  books: { bg: 'bg-cyan-100 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-300' },
  other: { bg: 'bg-slate-100 dark:bg-slate-950/40', text: 'text-slate-700 dark:text-slate-300' },
}

const statusColors: Record<string, { bg: string; text: string }> = {
  lost: { bg: 'bg-red-100 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-300' },
  found: { bg: 'bg-green-100 dark:bg-green-950/40', text: 'text-green-700 dark:text-green-300' },
  claimed: { bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300' },
  returned: { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300' },
  matched: { bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300' },
  resolved: { bg: 'bg-purple-100 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300' },
  other: { bg: 'bg-slate-100 dark:bg-slate-950/40', text: 'text-slate-700 dark:text-slate-300' },
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const categoryColor = categoryColors[item.category] || categoryColors.other
  const statusColor = statusColors[item.status] || statusColors.other

  return (
    <GlassCard
      className="cursor-pointer overflow-hidden h-full flex flex-col"
      hover
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative w-full h-40 bg-gradient-to-br from-[#004b87]/10 to-[#16a34a]/10 overflow-hidden">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-1.5">
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${categoryColor.bg} ${categoryColor.text} capitalize`}
          >
            {item.category}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor.bg} ${statusColor.text} capitalize`}
          >
            {item.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2">{item.title}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
            {item.description}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>{item.reportedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span className="line-clamp-1">{item.location}</span>
          </div>
        </div>

        {item.matchScore && (
          <div className="mt-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground/70">Match Score</span>
              <span className="text-sm font-bold text-green-400">
                {Math.round(item.matchScore * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
