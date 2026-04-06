'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

export default function YouTubeEmbed({ videoId }: { videoId: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.5 }
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const isDark = resolvedTheme === 'dark'

  // theme=dark → YouTube player uses dark UI
  // autoplay=1 + mute=1 → muted autoplay (no user-gesture required)
  // loop=1 + playlist=videoId → single-video loop
  // rel=0 → no related videos
  const src =
    `https://www.youtube.com/embed/${videoId}` +
    `?autoplay=${isInView ? 1 : 0}` +
    `&mute=1&loop=1&playlist=${videoId}` +
    `&rel=0&playsinline=1&modestbranding=1` +
    `&theme=${isDark ? 'dark' : 'light'}`

  return (
    <div
      ref={containerRef}
      className="w-full bg-black"
      style={{ minHeight: '500px', aspectRatio: '9/16', maxHeight: '600px' }}
    >
      <iframe
        key={`${isInView}-${isDark}`}   // reload when viewport or theme changes
        src={src}
        className="w-full h-full"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        title="YouTube video"
        loading="lazy"
      />
    </div>
  )
}
