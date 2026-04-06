'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { FeedFilter } from '@/lib/types'
import { useT } from '@/lib/i18n'

interface SidebarProps {
  activeFilter?: FeedFilter
  onFilterChange?: (f: FeedFilter) => void
}

// Slugs must match CREATOR_IDS in lib/api.ts and generateStaticParams in app/creator/[id]/page.tsx
const RECOMMENDED_CREATORS = [
  { name: 'มายด์ ทิตา', flag: '🇹🇭', handle: '@mindtita', slug: 'mindtita' },
  { name: 'Nguyễn Linh', flag: '🇻🇳', handle: '@linchi.vn', slug: 'linchi' },
  { name: 'Rizki Pratama', flag: '🇮🇩', handle: '@rizkipratama.id', slug: 'rizkipratama' },
]

export default function Sidebar({ activeFilter = 'all', onFilterChange }: SidebarProps) {
  const t = useT()
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  function handleFilter(f: FeedFilter) {
    onFilterChange?.(activeFilter === f ? 'all' : f)
  }

  const menuItems = [
    {
      labelKey: 'sidebar.search',
      icon: '🔍',
      action: () => setSearchOpen(v => !v),
      isActive: searchOpen,
    },
    {
      labelKey: 'sidebar.post',
      icon: '✏️',
      action: () => router.push('/post/new'),
      isActive: false,
    },
    {
      labelKey: 'sidebar.liked',
      icon: '❤️',
      action: () => handleFilter('liked'),
      isActive: activeFilter === 'liked',
    },
    {
      labelKey: 'sidebar.saved',
      icon: '🔖',
      action: () => handleFilter('saved'),
      isActive: activeFilter === 'saved',
    },
    {
      labelKey: 'sidebar.subscribed',
      icon: '⭐',
      action: () => handleFilter('subscribed'),
      isActive: activeFilter === 'subscribed',
    },
  ]

  return (
    <aside className="hidden md:flex flex-col w-64 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 pt-4 pb-6 px-3 transition-colors">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-3">
        {t('sidebar.personalize')}
      </p>

      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => (
          <button
            key={item.labelKey}
            onClick={item.action}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all text-left ${
              item.isActive
                ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-700 dark:text-gray-300 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <span>{item.icon}</span>
            <span>{t(item.labelKey)}</span>
          </button>
        ))}
      </nav>

      {/* Inline search panel */}
      {searchOpen && (
        <div className="mx-1 mt-2">
          <input
            autoFocus
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
            placeholder={t('sidebar.searchPlaceholder')}
            className="w-full text-sm border border-blue-300 dark:border-blue-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
          {searchQuery && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 px-1">
              {t('sidebar.searchHint', { query: searchQuery })}
            </p>
          )}
        </div>
      )}

      <div className="border-t border-gray-100 dark:border-gray-800 my-4 mx-3" />

      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-3">
        {t('sidebar.recommended')}
      </p>
      <div className="flex flex-col gap-2 px-1">
        {RECOMMENDED_CREATORS.map((c) => (
          <Link
            key={c.slug}
            href={`/creator/${c.slug}`}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm flex-shrink-0">
              <span suppressHydrationWarning>{c.flag}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{c.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{c.handle}</p>
            </div>
            <button
              onClick={e => e.preventDefault()}
              className="ml-auto text-xs text-blue-600 dark:text-blue-400 font-medium flex-shrink-0 hover:underline"
            >
              {t('sidebar.sidebarSubscribe')}
            </button>
          </Link>
        ))}
      </div>
    </aside>
  )
}
