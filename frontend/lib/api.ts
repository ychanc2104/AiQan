// Mock implementations of all API calls.
//
// To connect the real backend:
//   1. Set NEXT_PUBLIC_API_URL in .env.local
//   2. Replace each function body with a fetch() call to the listed endpoint.
//
// All functions are async → zero-friction swap: `return MOCK_DATA` → `return fetch(...).then(r => r.json())`

import type {
  CreatorProfile,
  CreatorPost,
  Conversation,
  Message,
  UserProfile,
  AppNotification,
  FeedFilter,
  ViewerAudience,
  CopyrightSetting,
} from './types'
import { mockContents, type Content } from '@/data/mockContent'

// ─── Creator ID constants (must match generateStaticParams in app/creator/[id]/page.tsx) ─
export const CREATOR_IDS = ['mindtita', 'linchi', 'rizkipratama'] as const

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CREATORS: Record<string, CreatorProfile> = {
  mindtita: {
    id: 'mindtita', name: 'มายด์ ทิตา', handle: '@mindtita', country: 'TH',
    bio: 'ไลฟ์สไตล์ในไต้หวัน 🇹🇭🇹🇼 | ทำงาน ใช้ชีวิต แชร์ประสบการณ์ | DM สอบถามได้เลยนะคะ',
    avatarColor: 'bg-orange-400', bannerColor: 'from-orange-300 to-pink-400',
    avatarUrl: null, bannerUrl: null,
    subscriberCount: 4200, postCount: 142, likeCount: 8300,
    plans: [
      { id: 'mt-free', name: '免費訂閱', price: 0, currency: 'TWD', perks: ['看公開內容'] },
      { id: 'mt-basic', name: '基本方案', price: 99, currency: 'TWD', perks: ['所有貼文', '每月獨家日記'] },
      { id: 'mt-support', name: '支持方案', price: 299, currency: 'TWD', perks: ['所有貼文', '優先私訊回覆', '每月直播'] },
      { id: 'mt-vip', name: 'VIP 方案', price: 599, currency: 'TWD', perks: ['所有福利', '一對一視訊', '生日賀卡'] },
    ],
  },
  linchi: {
    id: 'linchi', name: 'Nguyễn Linh', handle: '@linchi.vn', country: 'VN',
    bio: 'Chia sẻ cuộc sống ở Đài Loan 🇻🇳🇹🇼 | Ẩm thực, du lịch, tips sinh viên | Inbox nếu cần hỗ trợ nhé!',
    avatarColor: 'bg-red-400', bannerColor: 'from-red-300 to-yellow-400',
    avatarUrl: null, bannerUrl: null,
    subscriberCount: 2800, postCount: 89, likeCount: 5200,
    plans: [
      { id: 'lc-free', name: '免費訂閱', price: 0, currency: 'TWD', perks: ['看公開內容'] },
      { id: 'lc-basic', name: '基本方案', price: 149, currency: 'TWD', perks: ['所有貼文', '食譜下載'] },
      { id: 'lc-premium', name: '進階方案', price: 399, currency: 'TWD', perks: ['所有貼文', '優先私訊', '每月問答直播'] },
    ],
  },
  rizkipratama: {
    id: 'rizkipratama', name: 'Rizki Pratama', handle: '@rizkipratama.id', country: 'ID',
    bio: 'Kehidupan TKI di Taiwan 🇮🇩🇹🇼 | Berbagi info kerja, hidup, dan kultur | Follow untuk konten harian!',
    avatarColor: 'bg-green-500', bannerColor: 'from-green-400 to-teal-500',
    avatarUrl: null, bannerUrl: null,
    subscriberCount: 8900, postCount: 231, likeCount: 15800,
    plans: [
      { id: 'rp-free', name: '免費訂閱', price: 0, currency: 'TWD', perks: ['看公開內容'] },
      { id: 'rp-basic', name: '一般方案', price: 99, currency: 'TWD', perks: ['所有貼文'] },
      { id: 'rp-premium', name: '進階方案', price: 249, currency: 'TWD', perks: ['所有貼文', '獨家內容', '每週問答'] },
      { id: 'rp-super', name: '超級粉絲', price: 499, currency: 'TWD', perks: ['所有福利', '優先私訊', '每月直播', '周邊禮品'] },
    ],
  },
}

const CREATOR_POSTS: Record<string, CreatorPost[]> = {
  mindtita: [
    {
      id: 'mt-p1', creatorId: 'mindtita', platform: 'tiktok',
      videoId: '7549079772299676936', originalUrl: 'https://www.tiktok.com/@thesmartlocalth/video/7549079772299676936',
      body: 'เที่ยวตลาดนัดในไต้หวัน ของกินเยอะมาก 😍 #ไต้หวัน #ตลาดนัด',
      audience: 'public', likes: 5200, saves: 340, tips: 12, viewCount: '12.1K',
      publishedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    },
    {
      id: 'mt-p2', creatorId: 'mindtita', platform: 'native',
      title: '【訂閱限定】台灣打工申請完整教學 2026',
      body: '從簽證申請到找工作的每個步驟，詳細說明。包含最新 2026 年規定、常見問題解答、以及我的親身經驗分享...',
      audience: 'subscribers', likes: 240, saves: 180, tips: 35, viewCount: '890',
      publishedAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
    },
    {
      id: 'mt-p3', creatorId: 'mindtita', platform: 'youtube',
      videoId: '9bZkp7q19f0', originalUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      body: 'ทำอาหารไทยในไต้หวัน หาวัตถุดิบที่ไหน? 🍜 #อาหารไทย #ไต้หวัน',
      audience: 'public', likes: 820, saves: 95, tips: 5, viewCount: '3.4K',
      publishedAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
    },
  ],
  linchi: [
    {
      id: 'lc-p1', creatorId: 'linchi', platform: 'tiktok',
      videoId: '7502734945576553735', originalUrl: 'https://www.tiktok.com/@phingphing.series/video/7502734945576553735',
      body: 'Ăn gì ở Đài Bắc với 100 NTD? 🍱 Rẻ mà ngon! #ĐàiLoan #đờisinhviên',
      audience: 'public', likes: 1200, saves: 430, tips: 8, viewCount: '8.7K',
      publishedAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
    },
    {
      id: 'lc-p2', creatorId: 'linchi', platform: 'native',
      title: '【限定】Hướng dẫn xin visa Đài Loan 2026',
      body: 'Tất cả những gì bạn cần biết để xin visa làm việc ở Đài Loan. Bao gồm các loại visa, điều kiện, hồ sơ cần chuẩn bị...',
      audience: 'subscribers', likes: 390, saves: 260, tips: 22, viewCount: '1.5K',
      publishedAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
    },
  ],
  rizkipratama: [
    {
      id: 'rp-p1', creatorId: 'rizkipratama', platform: 'tiktok',
      videoId: '7343141257138457888', originalUrl: 'https://www.tiktok.com/@calumscottofficial/video/7343141257138457888',
      body: 'Tips hemat uang di Taiwan! 💰 Cara saya nabung NT$10.000/bulan sebagai TKI #taiwan #TKI',
      audience: 'public', likes: 3800, saves: 1200, tips: 45, viewCount: '24.5K',
      publishedAt: new Date(Date.now() - 3600_000).toISOString(),
    },
    {
      id: 'rp-p2', creatorId: 'rizkipratama', platform: 'native',
      title: '【Member Only】Panduan kirim uang ke Indonesia',
      body: 'Bank mana yang paling murah untuk transfer ke Indonesia? Saya sudah coba 5 bank dan ini hasilnya...',
      audience: 'subscribers', likes: 580, saves: 420, tips: 67, viewCount: '2.1K',
      publishedAt: new Date(Date.now() - 36 * 3600_000).toISOString(),
    },
    {
      id: 'rp-p3', creatorId: 'rizkipratama', platform: 'instagram',
      videoId: 'DPviAwJEW-j', originalUrl: 'https://www.instagram.com/reel/DPviAwJEW-j/',
      body: 'Suasana kota Taichung 🏙️ Cantik banget! #Taiwan #TKI #Indonesia',
      audience: 'public', likes: 920, saves: 180, tips: 9, viewCount: '6.3K',
      publishedAt: new Date(Date.now() - 4 * 86400_000).toISOString(),
    },
  ],
}

const CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1', participantId: 'mindtita', participantName: 'มายด์ ทิตา',
    participantHandle: '@mindtita', avatarColor: 'bg-orange-400',
    lastMessage: 'ขอบคุณที่ติดตามนะคะ 🙏',
    lastAt: new Date(Date.now() - 10 * 60_000).toISOString(),
    unread: 2, isPriority: true,
    messages: [
      { id: 'm1', conversationId: 'conv-1', senderId: 'mindtita', body: 'สวัสดีค่ะ! ขอบคุณที่ติดตามนะคะ 🙏', sentAt: new Date(Date.now() - 30 * 60_000).toISOString() },
      { id: 'm2', conversationId: 'conv-1', senderId: 'me', body: 'ชอบคอนเทนต์มากเลยครับ! มีแพลนทำวิดีโอเรื่องทำงานในไต้หวันไหมครับ?', sentAt: new Date(Date.now() - 25 * 60_000).toISOString() },
      { id: 'm3', conversationId: 'conv-1', senderId: 'mindtita', body: 'มีค่ะ! กำลังทำอยู่เลยค่ะ รอชมนะคะ 😊', sentAt: new Date(Date.now() - 15 * 60_000).toISOString() },
      { id: 'm4', conversationId: 'conv-1', senderId: 'mindtita', body: 'ขอบคุณที่ติดตามนะคะ 🙏', sentAt: new Date(Date.now() - 10 * 60_000).toISOString() },
    ],
  },
  {
    id: 'conv-2', participantId: 'rizkipratama', participantName: 'Rizki Pratama',
    participantHandle: '@rizkipratama.id', avatarColor: 'bg-green-500',
    lastMessage: 'Makasih sudah subscribe ya!',
    lastAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    unread: 3, isPriority: true,
    messages: [
      { id: 'm5', conversationId: 'conv-2', senderId: 'me', body: 'Halo Rizki! Saya baru subscribe nih 😊', sentAt: new Date(Date.now() - 3 * 3600_000).toISOString() },
      { id: 'm6', conversationId: 'conv-2', senderId: 'rizkipratama', body: 'Halo! Selamat datang ya! Ada yang mau ditanyakan?', sentAt: new Date(Date.now() - 2.5 * 3600_000).toISOString() },
      { id: 'm7', conversationId: 'conv-2', senderId: 'me', body: '打賞 NT$50 🎁', sentAt: new Date(Date.now() - 2.2 * 3600_000).toISOString(), tip: 50 },
      { id: 'm8', conversationId: 'conv-2', senderId: 'rizkipratama', body: 'Makasih sudah subscribe ya!', sentAt: new Date(Date.now() - 2 * 3600_000).toISOString() },
    ],
  },
  {
    id: 'conv-3', participantId: 'linchi', participantName: 'Nguyễn Linh',
    participantHandle: '@linchi.vn', avatarColor: 'bg-red-400',
    lastMessage: 'Cảm ơn bạn đã ủng hộ!',
    lastAt: new Date(Date.now() - 86400_000).toISOString(),
    unread: 0, isPriority: false,
    messages: [
      { id: 'm9', conversationId: 'conv-3', senderId: 'linchi', body: 'Cảm ơn bạn đã ủng hộ! Nếu có câu hỏi gì cứ nhắn nhé 😊', sentAt: new Date(Date.now() - 86400_000).toISOString() },
    ],
  },
]

const NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', type: 'subscribe', actorName: 'Rizki Pratama', body: '訂閱了你的頻道', read: false, createdAt: new Date(Date.now() - 5 * 60_000).toISOString(), linkTo: '/creator/rizkipratama' },
  { id: 'n2', type: 'payment', actorName: '系統通知', body: '你的訂閱方案「基本方案」已成功啟用 ✅', read: false, createdAt: new Date(Date.now() - 30 * 60_000).toISOString() },
  { id: 'n3', type: 'new_post', actorName: 'มายด์ ทิตา', body: '發布了新貼文：台灣打工申請完整教學', read: false, createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(), linkTo: '/creator/mindtita' },
  { id: 'n4', type: 'tip', actorName: '匿名', body: '給你打賞了 NT$50 🎁', read: true, createdAt: new Date(Date.now() - 86400_000).toISOString() },
  { id: 'n5', type: 'like', actorName: 'Nguyễn Linh', body: '按讚了你的貼文', read: true, createdAt: new Date(Date.now() - 2 * 86400_000).toISOString() },
]

const USER_PROFILE: UserProfile = {
  id: 'user-current', nickname: 'CCTin', handle: '@cctin',
  nationality: 'TW', avatarUrl: null, bannerUrl: null, bio: '', isCreator: false,
}

// ─── Feed ─────────────────────────────────────────────────────────────────────

export async function getFeed(filter: FeedFilter = 'all'): Promise<Content[]> {
  // TODO: GET /api/v1/feed?filter={filter}
  if (filter === 'liked') return mockContents.slice(0, 3)
  if (filter === 'saved') return [mockContents[1], mockContents[3], mockContents[5]].filter(Boolean)
  if (filter === 'subscribed') return mockContents.filter(c => c.isPremium)
  return mockContents
}

// ─── Creators ─────────────────────────────────────────────────────────────────

export async function getCreatorProfile(id: string): Promise<CreatorProfile | null> {
  // TODO: GET /api/v1/creators/{id}
  return CREATORS[id] ?? null
}

export async function getCreatorPosts(id: string): Promise<CreatorPost[]> {
  // TODO: GET /api/v1/creators/{id}/posts
  return CREATOR_POSTS[id] ?? []
}

// ─── Conversations ────────────────────────────────────────────────────────────

export async function getConversations(): Promise<Conversation[]> {
  // TODO: GET /api/v1/conversations
  return CONVERSATIONS
}

export async function getConversation(id: string): Promise<Conversation | null> {
  // TODO: GET /api/v1/conversations/{id}
  return CONVERSATIONS.find(c => c.id === id) ?? null
}

export async function sendMessage(
  conversationId: string,
  body: string,
  tip?: number,
): Promise<Message> {
  // TODO: POST /api/v1/conversations/{id}/messages
  return {
    id: `msg-${Date.now()}`,
    conversationId,
    senderId: 'me',
    body: tip ? `打賞 NT$${tip} 🎁` : body,
    sentAt: new Date().toISOString(),
    tip,
  }
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getNotifications(): Promise<AppNotification[]> {
  // TODO: GET /api/v1/notifications
  return NOTIFICATIONS
}

export async function markAllNotificationsRead(): Promise<void> {
  // TODO: POST /api/v1/notifications/read-all
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function getUserProfile(): Promise<UserProfile> {
  // TODO: GET /api/v1/profile/me
  return USER_PROFILE
}

export async function updateUserProfile(patch: Partial<UserProfile>): Promise<UserProfile> {
  // TODO: PATCH /api/v1/profile/me
  return { ...USER_PROFILE, ...patch }
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function createPost(data: {
  title?: string
  body: string
  audience: ViewerAudience
  copyright: CopyrightSetting
  scheduledAt: string | null
}): Promise<void> {
  // TODO: POST /api/v1/posts
  console.log('[mock] createPost', data)
}
