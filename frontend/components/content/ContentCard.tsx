'use client'

import { useEffect, useState } from 'react'
import type { Content } from '@/data/mockContent'
import { countryFlag } from '@/data/mockContent'
import VideoEmbed from './VideoEmbed'
import { useT } from '@/lib/i18n'

export default function ContentCard({ content }: { content: Content }) {
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false)

  // Re-trigger TikTok embed.js scan when card mounts
  useEffect(() => {
    const embed = (window as Window & { tiktokEmbed?: { reload: () => void } }).tiktokEmbed
    if (embed && typeof embed.reload === 'function') embed.reload()
  }, [])

  const t = useT()
  const flag = countryFlag[content.creator.country] ?? ''

  return (
    <div
      data-testid="content-card"
      // Mobile: full-screen snap card. Desktop: normal card with border/radius.
      className="
        snap-start flex-shrink-0 flex flex-col w-full overflow-hidden bg-black
        h-[calc(100dvh-56px-56px)]
        md:h-auto md:rounded-xl md:mb-4 md:shadow-sm md:border md:border-gray-100 md:dark:border-gray-800
      "
    >
      {/* ── Video — fills all remaining space ─────────────────────────────── */}
      <div className="flex-1 relative min-h-0 overflow-hidden">
        <VideoEmbed
          platform={content.platform}
          videoId={content.videoId}
          originalUrl={content.originalUrl}
          description={content.description}
        />
      </div>

      {/* ── Creator row: name + subscribe (left) + source link (right) ───── */}
      <div className="flex-shrink-0 flex items-center justify-between gap-2 px-4 pt-2.5 pb-1.5 bg-black md:bg-white md:dark:bg-gray-900">
        <div className="flex items-center gap-2 min-w-0 max-w-[75%]">
          <span className="border border-blue-400 text-white md:text-gray-800 md:dark:text-gray-200 text-sm px-2.5 py-0.5 rounded-lg font-medium truncate">
            <span suppressHydrationWarning>{flag}</span>{' '}
            {content.creator.name}
          </span>
          <button
            type="button"
            onClick={() => setIsSubscribeOpen(true)}
            className="text-[11px] px-2 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors whitespace-nowrap"
          >
            訂閱
          </button>
        </div>

        {content.originalUrl && (
          <a
            href={content.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-medium text-white/80 md:text-gray-500 md:dark:text-gray-400 hover:text-blue-400 transition-colors flex-shrink-0"
          >
            {t('card.original')}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>

      {isSubscribeOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
          onClick={() => setIsSubscribeOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">訂閱 {content.creator.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">價格：99 NTD / month</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSubscribeOpen(false)}
                className="px-3 py-1.5 rounded-md text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:opacity-90"
              >
                關閉
              </button>
              <button
                type="button"
                onClick={() => setIsSubscribeOpen(false)}
                className="px-3 py-1.5 rounded-md text-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                確認訂閱
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      {/*
        觀看次數來自外站爬取（read-only）
        喜愛 / 收藏 切換站內狀態，數字顯示原平台數字不變
      */}
      <div className="flex-shrink-0 flex items-center gap-5 px-4 pb-3 pt-0.5 bg-black md:bg-white md:dark:bg-gray-900 md:border-t md:border-gray-100 md:dark:border-gray-800 text-xs font-medium">

        {/* 觀看次數 — read-only */}
        <span className="flex items-center gap-1.5 text-white/50 md:text-gray-400 md:dark:text-gray-500">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {content.views}
        </span>

        {/* 喜愛 — interactive */}
        <button
          onClick={() => setIsLiked(v => !v)}
          aria-label={isLiked ? t('card.unlike') : t('card.like')}
          aria-pressed={isLiked}
          className={`flex items-center gap-1.5 transition-colors active:scale-110 ${
            isLiked
              ? 'text-red-400'
              : 'text-white/50 md:text-gray-400 md:dark:text-gray-500 hover:text-red-400'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {content.likes}
        </button>

        {/* 收藏 — interactive */}
        <button
          onClick={() => setIsSaved(v => !v)}
          aria-label={isSaved ? t('card.unsave') : t('card.save')}
          aria-pressed={isSaved}
          className={`flex items-center gap-1.5 transition-colors active:scale-110 ${
            isSaved
              ? 'text-blue-400'
              : 'text-white/50 md:text-gray-400 md:dark:text-gray-500 hover:text-blue-400'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {content.saves}
        </button>

      </div>
    </div>
  )
}
