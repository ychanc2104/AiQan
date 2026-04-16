import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'AiQan',
  description: 'AiQan',
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
