'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { getNotifications, markAllNotificationsRead } from '@/lib/api'
import type { AppNotification } from '@/lib/types'
import { timeAgo } from '@/lib/utils'
import { useT, useLocale, LOCALES } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

// ─── Theme Toggle ────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-8 h-8" />
  const isDark = theme === 'dark'
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="切換深色模式"
    >
      {isDark ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  )
}

// ─── Language Switcher ───────────────────────────────────────────────────────

function LangSwitcher() {
  const t = useT()
  const { locale, setLocale } = useLocale()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function selectLang(code: Locale) {
    setLocale(code)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="text-xs text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {t('nav.language')}
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 py-1"
          onClick={e => e.stopPropagation()}
        >
          {LOCALES.map(l => (
            <button
              key={l.code}
              onClick={() => selectLang(l.code)}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                locale === l.code
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Notification icon per type ──────────────────────────────────────────────

const notifIcon: Record<string, string> = {
  like: '❤️', comment: '💬', subscribe: '👤', tip: '🎁', payment: '✅', new_post: '📝',
}

// ─── Notification Dropdown ───────────────────────────────────────────────────

function NotifDropdown() {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<AppNotification[]>([])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getNotifications().then(setNotifs)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unreadCount = notifs.filter(n => !n.read).length

  function handleOpen() {
    setOpen(v => !v)
    if (!open && unreadCount > 0) {
      markAllNotificationsRead()
      setNotifs(n => n.map(x => ({ ...x, read: true })))
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium px-1 py-1"
        aria-label={t('nav.notifications')}
      >
        {t('nav.notifications')}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('notifications.title')}</p>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {notifs.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">{t('notifications.empty')}</p>
          ) : (
            notifs.map(n => (
              <div
                key={n.id}
                className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  !n.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                }`}
              >
                <span className="text-lg flex-shrink-0 mt-0.5">{notifIcon[n.type] ?? '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">{n.actorName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Header ─────────────────────────────────────────────────────────────

export default function Header() {
  const t = useT()

  const navItems = [
    { label: t('nav.subscribe'), href: '/profile' },
    { label: t('nav.home'),      href: '/home' },
    { label: t('nav.messages'),  href: '/messages' },
    { label: t('nav.profile'),   href: '/profile' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-14 transition-colors">
      <div className="flex items-center px-4 h-full max-w-screen-xl mx-auto gap-3">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">AiQan</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
          {navItems.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
          <NotifDropdown />
        </nav>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <ThemeToggle />
          <LangSwitcher />
        </div>

        {/* Mobile: scrollable nav */}
        <nav className="md:hidden flex items-center flex-1 overflow-x-auto scrollbar-none gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="flex-shrink-0 text-xs text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
          <NotifDropdown />
        </nav>

        {/* Mobile right: theme + lang */}
        <div className="md:hidden flex items-center gap-1 flex-shrink-0">
          <ThemeToggle />
          <LangSwitcher />
        </div>
      </div>
    </header>
  )
}
