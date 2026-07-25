export type ItemStatus = 'lost' | 'found' | 'claimed' | 'returned'
export type ItemCategory = 'electronics' | 'documents' | 'accessories' | 'clothing' | 'bags' | 'books' | 'other'
export type MatchStatus = 'pending' | 'matched' | 'dismissed'

export interface Item {
  id: string
  title: string
  description: string
  category: ItemCategory
  status: ItemStatus
  imageUrl: string
  reportedDate: string
  location: string
  foundDate?: string
  userId: string
  contactEmail: string
  matchScore?: number
}

export interface LostItem extends Item {
  type: 'lost'
}

export interface FoundItem extends Item {
  type: 'found'
}

export interface Match {
  id: string
  lostItemId: string
  foundItemId: string
  similarityScore: number
  status: MatchStatus
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'match' | 'update' | 'claim' | 'system'
  read: boolean
  createdAt: string
  relatedItemId?: string
}

export interface Statistics {
  totalLostItems: number
  totalFoundItems: number
  totalMatches: number
  itemsRecovered: number
  registeredUsers: number
}
