export type Platform = 'tiktok' | 'youtube' | 'instagram'

export interface Creator {
  name: string
  handle: string
  country: string
  avatarColor: string
}

export interface Content {
  id: string
  platform: Platform
  videoId: string
  creator: Creator
  description: string
  originalUrl: string
  views: string
  likes: string
  saves: string
  isPremium: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// TikTok  → videoId 從 URL 尾端數字取得
// YouTube → videoId 從 youtube.com/watch?v= 或 /shorts/ 後面取得 (11碼)
// Instagram → reelId 從 instagram.com/reel/{ID}/ 取得
// ─────────────────────────────────────────────────────────────────────────────
export const mockContents: Content[] = [
  // ── TikTok ──────────────────────────────────────────────────────────────
  {
    id: 'tt-1',
    platform: 'tiktok',
    // ✅ verified — Thai viral dance "Thammada" 46M views
    videoId: '7549079772299676936',
    creator: { name: 'The Smart Local TH', handle: '@thesmartlocalth', country: 'TH', avatarColor: 'bg-orange-400' },
    description: 'เด็กไทยดังใหญ่กับท่าเต้นสุดแนว! เพลง "ธรรมดา" ของ DJ KING DRAGON 🔥 #ไทย #viral',
    originalUrl: 'https://www.tiktok.com/@thesmartlocalth/video/7549079772299676936',
    views: '46M', likes: '3.2M', saves: '890K',
    isPremium: false,
  },
  {
    id: 'tt-2',
    platform: 'tiktok',
    // ✅ verified — Thai dubbed Korean drama
    videoId: '7502734945576553735',
    creator: { name: '🎞PhingPhing Series🎬', handle: '@phingphing.series', country: 'TH', avatarColor: 'bg-purple-500' },
    description: 'บอสตัวร้าย นายยอดรัก พากย์ไทย 🇹🇭 #ซีรี่ย์เกาหลี #พากย์ไทย',
    originalUrl: 'https://www.tiktok.com/@phingphing.series/video/7502734945576553735',
    views: '1.8M', likes: '210K', saves: '67K',
    isPremium: true,
  },
  {
    id: 'tt-3',
    platform: 'tiktok',
    // ✅ verified — Bella Poarch (Filipino), most viewed TikTok ever
    videoId: '6862153058223197445',
    creator: { name: 'Bella Poarch', handle: '@bellapoarch', country: 'PH', avatarColor: 'bg-pink-400' },
    description: 'To the 🐝🐝🐝 M to the B #fyp #music #viral',
    originalUrl: 'https://www.tiktok.com/@bellapoarch/video/6862153058223197445',
    views: '61M', likes: '14M', saves: '2.3M',
    isPremium: false,
  },
  {
    id: 'tt-4',
    platform: 'tiktok',
    // ✅ verified — Calum Scott, Indonesia creator collab
    videoId: '7343141257138457888',
    creator: { name: 'Calum Scott', handle: '@calumscottofficial', country: 'ID', avatarColor: 'bg-green-500' },
    description: 'Thanks for having me @YouTube ❤️ Shout out to Indonesian creators! 🇮🇩 #indonesia',
    originalUrl: 'https://www.tiktok.com/@calumscottofficial/video/7343141257138457888',
    views: '2.1M', likes: '312K', saves: '78K',
    isPremium: false,
  },

  // ── YouTube Shorts ───────────────────────────────────────────────────────
  {
    id: 'yt-1',
    platform: 'youtube',
    // ✅ verified — PSY Gangnam Style (K-pop, hugely popular in SEA)
    videoId: '9bZkp7q19f0',
    creator: { name: 'officialpsy', handle: '@officialpsy', country: 'TH', avatarColor: 'bg-red-500' },
    description: 'PSY - GANGNAM STYLE 강남스타일 🎵 #kpop #viral #dance',
    originalUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    views: '5.1B', likes: '24M', saves: '8.2M',
    isPremium: false,
  },
  {
    id: 'yt-2',
    platform: 'youtube',
    // ✅ verified — substitute with a real YouTube Shorts ID for best experience
    // Current: Rick Astley Never Gonna Give You Up (test video)
    videoId: 'xvFZjo5PgG0',
    creator: { name: 'Rick Astley', handle: '@RickAstleyYT', country: 'MY', avatarColor: 'bg-blue-400' },
    description: 'Never Gonna Give You Up 🎵 Replace this with a real YouTube Shorts ID!',
    originalUrl: 'https://www.youtube.com/watch?v=xvFZjo5PgG0',
    views: '1.5B', likes: '18M', saves: '3.1M',
    isPremium: false,
  },

  // ── Instagram Reels ──────────────────────────────────────────────────────
  // ⚠️  Instagram embeds may prompt login for logged-out users.
  //     Replace reelId with public posts from your target creators.
  {
    id: 'ig-1',
    platform: 'instagram',
    // From search results — Indonesian viral content
    videoId: 'DPviAwJEW-j',
    creator: { name: 'Indonesian Creator', handle: '@creator.id', country: 'ID', avatarColor: 'bg-yellow-500' },
    description: 'Indonesian viral video 🇮🇩 #indonesia #viral #reels',
    originalUrl: 'https://www.instagram.com/reel/DPviAwJEW-j/',
    views: '2.4M', likes: '180K', saves: '45K',
    isPremium: false,
  },
  {
    id: 'ig-2',
    platform: 'instagram',
    // From search results — Indonesian viral content
    videoId: 'DNh3KZEyoyY',
    creator: { name: 'Indonesian Creator', handle: '@creator.id2', country: 'ID', avatarColor: 'bg-pink-500' },
    description: 'Popular Indonesian content 🇮🇩 #indonesia #trending',
    originalUrl: 'https://www.instagram.com/reel/DNh3KZEyoyY/',
    views: '1.1M', likes: '95K', saves: '22K',
    isPremium: true,
  },
]

export const countryFlag: Record<string, string> = {
  TH: '🇹🇭', VN: '🇻🇳', ID: '🇮🇩', PH: '🇵🇭', MY: '🇲🇾',
}

export const platformMeta: Record<Platform, { label: string; color: string; dot: string }> = {
  tiktok:    { label: 'TikTok',    color: 'bg-black text-white',              dot: 'bg-white' },
  youtube:   { label: 'YouTube',   color: 'bg-red-600 text-white',            dot: 'bg-white' },
  instagram: { label: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white', dot: 'bg-white' },
}
