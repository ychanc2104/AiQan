'use client'

import { useEffect, useState } from 'react'
import { getFeed } from '@/lib/api'
import type { FeedFilter } from '@/lib/types'
import type { Content } from '@/data/mockContent'
import ContentCard from './ContentCard'
import { useT } from '@/lib/i18n'

interface ContentFeedProps {
  filter?: FeedFilter
}

export default function ContentFeed({ filter = 'all' }: ContentFeedProps) {
  const t = useT()
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getFeed(filter).then(data => {
      setContents(data)
      setLoading(false)
    })
  }, [filter])

  // ── Mobile: TikTok-style full-screen vertical snap scroll ─────────────────
  // Each card = calc(100dvh - header 56px - bottom-nav 56px)
  // Container = calc(100dvh - header 56px), scrolls within that window
  return (
    <>
      {/* ── Mobile feed: snap scroll ─────────────────────────────────────── */}
      {/* Mobile: snap scroll — full screen minus header(56) + action bar(44) = 100px */}
      <div className="md:hidden overflow-y-scroll snap-y snap-mandatory h-[calc(100dvh-100px)] scrollbar-none bg-black">
        {loading ? (
          <div className="snap-start flex flex-col h-[calc(100dvh-100px)] bg-black animate-pulse">
            <div className="flex-1 bg-gray-800" />
            <div className="h-10 bg-gray-900 px-4 py-2" />
            <div className="h-8 bg-gray-900 px-4 pb-3" />
          </div>
        ) : contents.length === 0 ? (
          <div className="snap-start flex items-center justify-center h-[calc(100dvh-100px)] text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-3">
                {filter === 'liked' ? '❤️' : filter === 'saved' ? '🔖' : filter === 'subscribed' ? '⭐' : '📭'}
              </div>
              <p className="text-sm">{t(`feed.empty.${filter}`)}</p>
            </div>
          </div>
        ) : (
          contents.map(content => (
            <ContentCard key={content.id} content={content} />
          ))
        )}
      </div>

      {/* ── Desktop feed: normal scrolling card list ─────────────────────── */}
      <div className="hidden md:block px-4 py-4 max-w-2xl mx-auto w-full">
        {/* Feed header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {t(`feed.${filter}`)}
            {filter !== 'all' && (
              <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">
                {t('feed.count', { n: contents.length })}
              </span>
            )}
          </h2>
          <div className="flex gap-2 flex-wrap">
            <button className="text-xs bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-full font-medium">
              {t('feed.all')}
            </button>
            {(['TH', 'VN', 'ID'] as const).map((code) => (
              <button
                key={code}
                className="text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full hover:border-blue-200 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {t(`feed.countries.${code}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse">
                <div className="h-52 bg-gray-200 dark:bg-gray-800" />
                <div className="px-4 py-3 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && contents.length === 0 && (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <div className="text-4xl mb-3">
              {filter === 'liked' ? '❤️' : filter === 'saved' ? '🔖' : filter === 'subscribed' ? '⭐' : '📭'}
            </div>
            <p className="text-sm font-medium">{t(`feed.empty.${filter}`)}</p>
          </div>
        )}

        {/* Cards */}
        {!loading && contents.map(content => (
          <ContentCard key={content.id} content={content} />
        ))}

        {/* Load more */}
        {!loading && contents.length > 0 && (
          <button className="mt-2 w-full py-3 text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {t('feed.loadMore')}
          </button>
        )}
      </div>
    </>
  )
}
