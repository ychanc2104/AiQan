import type { Platform } from '@/data/mockContent'
import TikTokEmbed from './embeds/TikTokEmbed'
import YouTubeEmbed from './embeds/YouTubeEmbed'
import InstagramEmbed from './embeds/InstagramEmbed'

interface VideoEmbedProps {
  platform: Platform
  videoId?: string
  originalUrl?: string
  description?: string
}

export default function VideoEmbed({ platform, videoId, originalUrl, description }: VideoEmbedProps) {
  switch (platform) {
    case 'youtube':
      return videoId ? <YouTubeEmbed videoId={videoId} /> : null
    case 'instagram':
      return videoId ? <InstagramEmbed reelId={videoId} /> : null
    case 'post':
      return (
        <div className="h-full w-full bg-gradient-to-br from-slate-900 to-slate-700 text-white p-5 flex items-center">
          <p className="text-base md:text-lg leading-relaxed">{description}</p>
        </div>
      )
    case 'tiktok':
    default:
      return videoId && originalUrl ? <TikTokEmbed videoId={videoId} originalUrl={originalUrl} /> : null
  }
}
