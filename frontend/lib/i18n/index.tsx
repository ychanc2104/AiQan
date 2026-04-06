'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import zhTW from './messages/zh-TW.json'
import en   from './messages/en.json'
import th   from './messages/th.json'
import id   from './messages/id.json'
import vi   from './messages/vi.json'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Locale = 'zh-TW' | 'en' | 'th' | 'id' | 'vi'

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'en',    label: 'English' },
  { code: 'th',    label: 'ภาษาไทย' },
  { code: 'id',    label: 'Bahasa' },
  { code: 'vi',    label: 'Tiếng Việt' },
]

type Messages = typeof zhTW

const MESSAGES: Record<Locale, Messages> = { 'zh-TW': zhTW, en, th: th as Messages, id: id as Messages, vi: vi as Messages }

// ─── Context ──────────────────────────────────────────────────────────────────

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'zh-TW',
  setLocale: () => {},
  t: (key) => key,
})

// ─── Provider ─────────────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh-TW')

  // Read persisted locale on mount
  useEffect(() => {
    const saved = localStorage.getItem('lang') as Locale | null
    if (saved && saved in MESSAGES) setLocaleState(saved)
  }, [])

  function setLocale(next: Locale) {
    setLocaleState(next)
    localStorage.setItem('lang', next)
  }

  // Dot-notation lookup: t('feed.empty.liked') → '還沒有喜愛的內容'
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const keys = key.split('.')
      let node: unknown = MESSAGES[locale]
      for (const k of keys) {
        if (typeof node !== 'object' || node === null) return key
        node = (node as Record<string, unknown>)[k]
      }
      if (typeof node !== 'string') return key
      if (!vars) return node
      // Simple variable substitution: {varName}
      return node.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`))
    },
    [locale],
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useT() {
  return useContext(I18nContext).t
}

export function useLocale() {
  const { locale, setLocale } = useContext(I18nContext)
  return { locale, setLocale }
}
