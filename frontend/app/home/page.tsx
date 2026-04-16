'use client'

import { useState } from 'react'
import Script from 'next/script'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import ContentFeed from '@/components/content/ContentFeed'
import type { FeedFilter } from '@/lib/types'

export default function HomePage() {
  const [filter, setFilter] = useState<FeedFilter>('all')

  return (
    <>
      <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
      <Header />

      <div className="pt-14">
        <div className="md:hidden">
          <ContentFeed filter={filter} />
        </div>

        <div className="hidden md:flex max-w-screen-xl mx-auto min-h-screen">
          <div className="sticky top-14 h-[calc(100vh-56px)] overflow-y-auto flex-shrink-0">
            <Sidebar activeFilter={filter} onFilterChange={setFilter} />
          </div>
          <main className="flex-1 min-w-0 pb-6">
            <ContentFeed filter={filter} />
          </main>
        </div>
      </div>

      <BottomNav />
    </>
  )
}
