'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n'
import type { FeedFilter } from '@/lib/types'

interface MobileActionBarProps {
  activeFilter: FeedFilter
  onFilterChange: (f: FeedFilter) => void
}

export default function MobileActionBar({ activeFilter, onFilterChange }: MobileActionBarProps) {
  const t = useT()
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  function toggle(f: FeedFilter) {
    onFilterChange(activeFilter === f ? 'all' : f)
  }

  const items = [
    {
      key: 'search',
      label: t('sidebar.search'),
      isActive: searchOpen,
      onClick: () => setSearchOpen(v => !v),
    },
    {
      key: 'post',
      label: t('sidebar.post'),
      isActive: false,
      onClick: () => router.push('/post/new'),
    },
    {
      key: 'liked',
      label: t('sidebar.liked'),
      isActive: activeFilter === 'liked',
      onClick: () => toggle('liked'),
    },
    {
      key: 'saved',
      label: t('sidebar.saved'),
      isActive: activeFilter === 'saved',
      onClick: () => toggle('saved'),
    },
    {
      key: 'subscribed',
      label: t('sidebar.subscribed'),
      isActive: activeFilter === 'subscribed',
      onClick: () => toggle('subscribed'),
    },
  ]

  return (
    <div className="md:hidden fixed top-14 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
      {/* Action tabs */}
      <div className="flex items-center h-11 overflow-x-auto scrollbar-none px-3 gap-1">
        {items.map(item => (
          <button
            key={item.key}
            onClick={item.onClick}
            className={`flex-shrink-0 px-3 py-1 rounded text-xs font-medium border transition-all ${
              item.isActive
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Inline search (when search is active) */}
      {searchOpen && (
        <div className="px-3 pb-2">
          <input
            autoFocus
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
            placeholder={t('sidebar.searchPlaceholder')}
            className="w-full text-sm border border-blue-300 dark:border-blue-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
          {searchQuery && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-1">
              {t('sidebar.searchHint', { query: searchQuery })}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
