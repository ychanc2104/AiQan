'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import { getNotifications, markAllNotificationsRead } from '@/lib/api'
import type { AppNotification } from '@/lib/types'
import { timeAgo } from '@/lib/utils'

const notifIcon: Record<string, string> = {
  like: '❤️', comment: '💬', subscribe: '👤', tip: '🎁', payment: '✅', new_post: '📝',
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNotifications().then(data => {
      setNotifs(data)
      setLoading(false)
      markAllNotificationsRead()
    })
  }, [])

  return (
    <>
      <Header />
      <div className="pt-14 min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 md:pb-6">
        <div className="max-w-xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/"
              className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              回上一步
            </Link>
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">通知</h1>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifs.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-600">
              <div className="text-4xl mb-3">🔔</div>
              <p className="text-sm">目前沒有通知</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              {notifs.map((n, i) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                    i < notifs.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''
                  } ${!n.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">{notifIcon[n.type] ?? '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{n.actorName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.body}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </>
  )
}
