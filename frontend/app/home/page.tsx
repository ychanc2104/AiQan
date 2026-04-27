'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import MobileActionBar from '@/components/layout/MobileActionBar'
import ContentFeed from '@/components/content/ContentFeed'
import type { FeedFilter } from '@/lib/types'

export default function HomePage() {
  const [filter, setFilter] = useState<FeedFilter>('all')

  return (
    <>
      <Header />
      <MobileActionBar activeFilter={filter} onFilterChange={setFilter} />

      {/* Mobile: header (56px) + action bar (44px) = 100px top offset */}
      <div className="md:hidden pt-[100px]">
        <ContentFeed filter={filter} />
      </div>

      {/* Desktop: sidebar + feed */}
      <div className="hidden md:flex pt-14 max-w-screen-xl mx-auto min-h-screen">
        <div className="sticky top-14 h-[calc(100vh-56px)] overflow-y-auto flex-shrink-0">
          <Sidebar activeFilter={filter} onFilterChange={setFilter} />
        </div>
        <main className="flex-1 min-w-0 pb-6">
          <ContentFeed filter={filter} />
        </main>
      </div>
    </>
  )
}
