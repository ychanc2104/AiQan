// TypeScript interfaces mirroring backend API response shapes (see design.md §5)
// When NEXT_PUBLIC_API_URL is set, these types should match the OpenAPI spec.

// ─── Feed ─────────────────────────────────────────────────────────────────────
export type FeedFilter = 'all' | 'liked' | 'saved' | 'subscribed'

// ─── Post Visibility (matches 4-option radio in /post/new) ────────────────────
export type ViewerAudience = 'public' | 'subscribers' | 'premium' | 'private'

// ─── Copyright ────────────────────────────────────────────────────────────────
export type CopyrightSetting = 'original' | 'cc-by' | 'cc-by-nc' | 'all-rights-reserved'

// ─── Creator ──────────────────────────────────────────────────────────────────
export interface SubscriptionPlan {
  id: string
  name: string
  /** Monthly price in TWD; 0 = free */
  price: number
  currency: 'TWD'
  perks: string[]
}

export interface CreatorProfile {
  /** URL slug: /creator/[id] */
  id: string
  name: string
  handle: string
  /** ISO 2-letter country code */
  country: string
  bio: string
  /** Tailwind bg-* class, used when avatarUrl is null */
  avatarColor: string
  /** Tailwind gradient classes for banner background */
  bannerColor: string
  avatarUrl: string | null
  bannerUrl: string | null
  subscriberCount: number
  postCount: number
  likeCount: number
  plans: SubscriptionPlan[]
}

// ─── Creator Posts ────────────────────────────────────────────────────────────
// Distinct from Content (curated social embeds in data/mockContent.ts)
export interface CreatorPost {
  id: string
  creatorId: string
  platform: 'tiktok' | 'youtube' | 'instagram' | 'native'
  videoId?: string
  originalUrl?: string
  title?: string
  body: string
  audience: ViewerAudience
  likes: number
  saves: number
  tips: number
  viewCount: string
  publishedAt: string
}

// ─── Messaging ────────────────────────────────────────────────────────────────
export interface Message {
  id: string
  conversationId: string
  senderId: string
  body: string
  sentAt: string
  /** NT$ tip amount, present when this is a tip message */
  tip?: number
}

export interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantHandle: string
  avatarColor: string
  lastMessage: string
  lastAt: string
  unread: number
  isPriority: boolean
  messages: Message[]
}

// ─── User Profile ─────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string
  nickname: string
  handle: string
  /** ISO 2-letter, '' if not set */
  nationality: string
  avatarUrl: string | null
  bannerUrl: string | null
  bio: string
  isCreator: boolean
}

// ─── Notifications ────────────────────────────────────────────────────────────
export type NotificationType = 'like' | 'comment' | 'subscribe' | 'tip' | 'payment' | 'new_post'

export interface AppNotification {
  id: string
  type: NotificationType
  actorName: string
  body: string
  read: boolean
  createdAt: string
  linkTo?: string
}
