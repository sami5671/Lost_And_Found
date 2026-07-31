export type ItemStatus = 'lost' | 'found' | 'claimed' | 'returned' | 'matched' | 'resolved' | 'reported' | (string & {})
export type ItemCategory =
  | 'laptop'
  | 'mobile'
  | 'watch'
  | 'bags'
  | 'id card'
  | 'documents'
  | 'wallets'
  | 'books'
  | 'clothings'
  | 'clothing'
  | 'headphones'
  | 'water bottle'
  | 'others'
  | 'other'
  | 'electronics'
  | 'accessories'
  | (string & {})

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
  type?: 'lost' | 'found'
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
