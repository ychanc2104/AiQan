import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'SubSpark — 在台東南亞影音平台',
  description: '為在台灣的東南亞朋友打造的訂閱制影音聚合平台',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="frame-src 'self' https://www.tiktok.com https://*.tiktok.com https://www.youtube.com https://*.youtube.com https://www.instagram.com https://*.instagram.com;"
        />
      </head>
      <body className="bg-gray-100 dark:bg-gray-950 min-h-screen antialiased transition-colors">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
