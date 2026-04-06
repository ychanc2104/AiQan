'use client'

// Instagram embed via the /embed/ iframe endpoint.
// ⚠️  Limitations:
//   - Requires HTTPS (use `npm run dev:https`)
//   - Logged-out users may see an Instagram login prompt
//   - Private accounts will show "content unavailable"
//   - No autoplay support (Instagram policy)

export default function InstagramEmbed({ reelId }: { reelId: string }) {
  return (
    <div className="w-full flex justify-center bg-gray-100 dark:bg-gray-950 min-h-[500px] p-2">
      <iframe
        src={`https://www.instagram.com/reel/${reelId}/embed/`}
        className="w-full max-w-sm border-0"
        style={{ minHeight: '500px' }}
        allowFullScreen
        scrolling="no"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        title="Instagram Reel"
        loading="lazy"
      />
    </div>
  )
}
