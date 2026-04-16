'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import VideoEmbed from '@/components/content/VideoEmbed'
import { getCreatorProfile, getCreatorPosts } from '@/lib/api'
import type { CreatorProfile, CreatorPost } from '@/lib/types'
import { timeAgo, countryFlag, formatCount } from '@/lib/utils'

// ─── Subscription Plan Panel ──────────────────────────────────────────────────

function PlanPanel({ creator }: { creator: CreatorProfile }) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <aside className="hidden md:flex flex-col w-64 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 pt-4 pb-6 px-3 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto transition-colors">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-3">
        個人化版面
      </p>
      <div className="flex flex-col gap-2 px-1">
        {creator.plans.map(plan => (
          <button
            key={plan.id}
            onClick={() => setSelected(plan.id)}
            className={`text-left rounded-xl px-3 py-3 transition-all border text-sm ${
              selected === plan.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
            }`}
          >
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              {plan.name}
              {plan.price === 0 && (
                <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                  免費
                </span>
              )}
            </p>
            {plan.price > 0 && (
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                NT${plan.price} / 月
              </p>
            )}
            <ul className="mt-1.5 space-y-0.5">
              {plan.perks.map(perk => (
                <li key={perk} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span className="text-green-500">✓</span> {perk}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {selected && (
        <button className="mt-4 mx-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
          立即訂閱
        </button>
      )}

      <div className="border-t border-gray-100 dark:border-gray-800 my-4 mx-3" />

      <button className="mx-1 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium py-2.5 rounded-xl hover:border-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
        💰 單篇解鎖
      </button>
    </aside>
  )
}

// ─── Creator Post Card ────────────────────────────────────────────────────────

const audienceLabel: Record<string, { label: string; color: string }> = {
  public:      { label: '公開', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' },
  subscribers: { label: '訂閱限定', color: 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' },
  premium:     { label: '付費限定', color: 'bg-yellow-50 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400' },
  private:     { label: '私人', color: 'bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400' },
}

function PostCard({ post }: { post: CreatorPost }) {
  const aud = audienceLabel[post.audience]
  const isLocked = post.audience !== 'public'

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-4 shadow-sm transition-colors">
      {/* Video embed */}
      {post.platform !== 'native' && post.videoId && !isLocked && (
        <VideoEmbed
          platform={post.platform as 'tiktok' | 'youtube' | 'instagram'}
          videoId={post.videoId}
          originalUrl={post.originalUrl ?? '#'}
        />
      )}

      {/* Locked overlay for non-public posts */}
      {isLocked && (
        <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-1">🔒</div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">訂閱後解鎖</p>
          </div>
        </div>
      )}

      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            {post.title && (
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{post.title}</h3>
            )}
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">{post.body}</p>
          </div>
          <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${aud.color}`}>
            {aud.label}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
          <span>{timeAgo(post.publishedAt)}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {post.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {formatCount(post.likes)}
            </span>
            <span className="flex items-center gap-1 text-yellow-500">
              🎁 {formatCount(post.tips)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

type PostTab = 'all' | 'general' | 'paid'

export default function CreatorPage({ id }: { id: string }) {
  const [creator, setCreator] = useState<CreatorProfile | null>(null)
  const [posts, setPosts] = useState<CreatorPost[]>([])
  const [bioExpanded, setBioExpanded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [postTab, setPostTab] = useState<PostTab>('all')

  useEffect(() => {
    Promise.all([getCreatorProfile(id), getCreatorPosts(id)]).then(([c, p]) => {
      setCreator(c)
      setPosts(p)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <>
        <Header />
        <div className="pt-14 min-h-screen">
          <div className="flex max-w-screen-xl mx-auto">
            <div className="hidden md:block w-64 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-[calc(100vh-56px)]" />
            <main className="flex-1 px-4 py-4 max-w-2xl mx-auto">
              <div className="animate-pulse space-y-4">
                <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
              </div>
            </main>
          </div>
        </div>
        <BottomNav />
      </>
    )
  }

  if (!creator) {
    return (
      <>
        <Header />
        <div className="pt-14 min-h-screen flex items-center justify-center">
          <p className="text-gray-500">找不到創作者</p>
        </div>
        <BottomNav />
      </>
    )
  }

  const flag = countryFlag[creator.country] ?? ''

  return (
    <>
      <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
      <Header />

      <div className="pt-14 min-h-screen">
        <div className="flex max-w-screen-xl mx-auto">
          {/* Left: subscription plans */}
          <PlanPanel creator={creator} />

          {/* Right: creator content */}
          <main className="flex-1 min-w-0 pb-20 md:pb-6">
            <div className="px-4 py-4 max-w-2xl mx-auto">

              {/* Creator profile card */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-4 shadow-sm">
                {/* Banner */}
                <div className={`h-32 bg-gradient-to-r ${creator.bannerColor}`} />

                {/* Profile info */}
                <div className="px-4 pb-4">
                  <div className="flex items-end justify-between -mt-8 mb-3">
                    <div className={`w-16 h-16 rounded-full ${creator.avatarColor} border-4 border-white dark:border-gray-900 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}>
                      {creator.name.charAt(0)}
                    </div>
                    <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-2">
                      ⋯
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h1 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                        {creator.name}
                      </h1>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{creator.handle}</p>
                    </div>
                    <span className="text-xl" suppressHydrationWarning>{flag}</span>
                  </div>

                  <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <span><strong className="text-gray-900 dark:text-white">{formatCount(creator.postCount)}</strong> 貼文</span>
                    <span><strong className="text-gray-900 dark:text-white">{formatCount(creator.subscriberCount)}</strong> 訂閱者</span>
                    <span><strong className="text-gray-900 dark:text-white">{formatCount(creator.likeCount)}</strong> 愛心</span>
                  </div>

                  {creator.bio && (
                    <div className="mt-2">
                      <p className={`text-sm text-gray-600 dark:text-gray-400 ${bioExpanded ? '' : 'line-clamp-2'}`}>
                        {creator.bio}
                      </p>
                      <button
                        onClick={() => setBioExpanded(v => !v)}
                        className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 hover:underline"
                      >
                        {bioExpanded ? '收起' : '顯示更多'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Post tabs */}
              <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800 mb-4">
                {([
                  { key: 'general', label: '一般貼文' },
                  { key: 'paid',    label: '單篇付費' },
                  { key: 'all',     label: '全部' },
                ] as { key: PostTab; label: string }[]).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setPostTab(tab.key)}
                    className={`pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                      postTab === tab.key
                        ? 'border-red-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Posts */}
              {(() => {
                const filtered = posts.filter(p =>
                  postTab === 'general' ? p.audience === 'public' :
                  postTab === 'paid'    ? p.audience !== 'public' :
                  true
                )
                return filtered.length === 0
                  ? <p className="text-center text-sm text-gray-400 py-12">尚無貼文</p>
                  : filtered.map(post => <PostCard key={post.id} post={post} />)
              })()}
            </div>
          </main>
        </div>
      </div>

      <BottomNav />
    </>
  )
}
