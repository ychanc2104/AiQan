'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

declare global {
  interface Window { tiktokEmbed?: { reload: () => void } }
}

export default function TikTokEmbed({ videoId, originalUrl }: { videoId: string; originalUrl: string }) {
  const { resolvedTheme } = useTheme()
  // Avoid hydration mismatch — resolvedTheme is undefined on first server render
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const theme = mounted ? (resolvedTheme === 'dark' ? 'dark' : 'light') : 'light'

  useEffect(() => {
    if (!mounted) return
    // Guard: ensure reload exists and is actually a function before calling
    const embed = window.tiktokEmbed
    if (embed && typeof embed.reload === 'function') {
      embed.reload()
    }
  }, [theme, mounted])

  return (
    <div className="w-full flex justify-center bg-[#121212] min-h-[500px]">
      {/*
        key={theme} forces React to fully unmount + remount the blockquote whenever
        the theme changes, so embed.js re-processes it with the correct data-theme.
        bg-[#121212] matches TikTok dark theme background so there's no white flash.
      */}
      <blockquote
        key={theme}
        className="tiktok-embed"
        cite={originalUrl}
        data-video-id={videoId}
        data-theme={theme}
        style={{ maxWidth: '100%', minWidth: '325px', margin: 0, border: 'none', background: theme === 'dark' ? '#121212' : '#ffffff' }}
      >
        <section>
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full h-[500px] text-white/40 text-sm"
          >
            載入 TikTok 影片中…
          </a>
        </section>
      </blockquote>
    </div>
  )
}
