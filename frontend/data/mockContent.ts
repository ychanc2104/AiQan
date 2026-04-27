export type Platform = 'tiktok' | 'youtube' | 'instagram' | 'post'

export interface Creator {
  name: string
  handle: string
  country: string
  avatarColor: string
}

export interface Content {
  id: string
  platform: Platform
  videoId?: string
  creator: Creator
  description: string
  originalUrl?: string
  views: string
  likes: string
  saves: string
  isPremium: boolean
}

export const mockContents: Content[] = [
  {
    id: 'post-1',
    platform: 'post',
    creator: { name: '王小婷', handle: '@ting_life', country: 'TW', avatarColor: 'bg-orange-400' },
    description: '今天下班後在台北車站附近找到一間超好吃的越南河粉，湯頭很清爽，推薦給大家。',
    views: '1.2K', likes: '186', saves: '42',
    isPremium: false,
  },
  {
    id: 'post-2',
    platform: 'post',
    creator: { name: 'Nguyen Minh', handle: '@minh.study', country: 'VN', avatarColor: 'bg-purple-500' },
    description: '這週整理了 5 個在台灣找工作面試會用到的中文句型，需要的人我可以再分享完整筆記。',
    views: '980', likes: '143', saves: '57',
    isPremium: true,
  },
  {
    id: 'post-3',
    platform: 'post',
    creator: { name: 'Siti Rahma', handle: '@siti_cook', country: 'ID', avatarColor: 'bg-pink-400' },
    description: '晚餐做了印尼炒飯加半熟蛋，10 分鐘就完成，想看食譜我明天貼圖文版。',
    views: '2.4K', likes: '321', saves: '88',
    isPremium: false,
  },
  {
    id: 'post-4',
    platform: 'post',
    creator: { name: 'Maria Santos', handle: '@maria_notes', country: 'PH', avatarColor: 'bg-green-500' },
    description: '今天第一次去台中歌劇院，建築真的很美，週末很適合帶朋友來散步拍照。',
    views: '760', likes: '91', saves: '19',
    isPremium: false,
  },
  {
    id: 'post-5',
    platform: 'post',
    creator: { name: 'Arif Hidayat', handle: '@arif.travel', country: 'MY', avatarColor: 'bg-red-500' },
    description: '分享一個超省錢的兩天一夜台南行程，交通、住宿和美食總花費不到 2500。',
    views: '3.1K', likes: '402', saves: '173',
    isPremium: false,
  },
  {
    id: 'post-6',
    platform: 'post',
    creator: { name: '林志宇', handle: '@zuyu.tech', country: 'TW', avatarColor: 'bg-blue-400' },
    description: '剛把履歷改成「作品導向」版本，面試邀約明顯變多，有需要範本可以私訊我。',
    views: '1.5K', likes: '267', saves: '110',
    isPremium: false,
  },
  {
    id: 'post-7',
    platform: 'post',
    creator: { name: 'Mai Phan', handle: '@mai.voice', country: 'VN', avatarColor: 'bg-yellow-500' },
    description: '今晚 9 點會開語音房陪讀 1 小時，主題是英文口說暖身，歡迎一起來。',
    views: '640', likes: '74', saves: '28',
    isPremium: false,
  },
  {
    id: 'post-8',
    platform: 'post',
    creator: { name: 'Nong Fah', handle: '@nongfah', country: 'TH', avatarColor: 'bg-pink-500' },
    description: '這個月會分享 3 篇「新住民在台生活」系列，第一篇先聊租屋避雷重點。',
    views: '1.1K', likes: '158', saves: '49',
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
  post:      { label: 'Post',      color: 'bg-blue-600 text-white',           dot: 'bg-white' },
}
