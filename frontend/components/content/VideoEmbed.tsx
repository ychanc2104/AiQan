import type { Platform } from '@/data/mockContent'
import TikTokEmbed from './embeds/TikTokEmbed'
import YouTubeEmbed from './embeds/YouTubeEmbed'
import InstagramEmbed from './embeds/InstagramEmbed'

interface VideoEmbedProps {
  platform: Platform
  videoId: string
  originalUrl: string
}

export default function VideoEmbed({ platform, videoId, originalUrl }: VideoEmbedProps) {
  switch (platform) {
    case 'youtube':
      return <YouTubeEmbed videoId={videoId} />
    case 'instagram':
      return <InstagramEmbed reelId={videoId} />
    case 'tiktok':
    default:
      return <TikTokEmbed videoId={videoId} originalUrl={originalUrl} />
  }
}
