'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useT, useLocale, LOCALES } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

// ─── Language Picker ──────────────────────────────────────────────────────────

function LanguagePicker() {
  const t = useT()
  const { locale, setLocale } = useLocale()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const current = LOCALES.find(l => l.code === locale)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        {current?.label ?? t('nav.language')}
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-50 w-40 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1">
          {LOCALES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLocale(l.code as Locale); setOpen(false) }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                l.code === locale ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
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

// ─── Header ───────────────────────────────────────────────────────────────────

function LandingHeader() {
  const t = useT()
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">AiQan</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/home"
            className="px-4 py-1.5 rounded-full text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
          >
            {t('nav.login')}
          </Link>
          <LanguagePicker />
        </div>
      </div>
    </header>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const t = useT()
  return (
    <footer className="bg-gray-900 text-gray-400 mt-0">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16">
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-white text-lg tracking-tight">AiQan</span>
            </div>
          </div>
          <div className="flex flex-1 gap-8 md:gap-16 flex-wrap">
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm">{t('landing.footerExplore')}</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-white transition-colors">{t('landing.footerWelcome')}</Link></li>
                <li><Link href="/home" className="hover:text-white transition-colors">{t('landing.footerHome')}</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">{t('landing.footerFaq')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm">{t('landing.footerLinks')}</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">{t('landing.footerPrivacy')}</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">{t('landing.footerTerms')}</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">{t('landing.footerRefund')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm">{t('landing.footerContacts')}</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">{t('landing.footerReport')}</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-600">
          {t('landing.footerCopyright')}
        </div>
      </div>
    </footer>
  )
}

// ─── Accordion Item ───────────────────────────────────────────────────────────

interface AccordionItemProps {
  question: string
  answer: string
}

function AccordionItem({ question, answer }: AccordionItemProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="text-gray-900 dark:text-white font-medium text-sm md:text-base">
          {question}
        </span>
        <svg
          className={`w-5 h-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="pb-4 pr-8 text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────

interface FaqSectionProps {
  title: string
  items: { q: string; a: string }[]
}

function FaqSection({ title, items }: FaqSectionProps) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2 pb-2 border-b-2 border-blue-600 dark:border-blue-400 inline-block">
        {title}
      </h2>
      <div className="mt-2">
        {items.map((item, i) => (
          <AccordionItem key={i} question={item.q} answer={item.a} />
        ))}
      </div>
    </section>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function FaqPage() {
  const t = useT()

  const sections = [
    {
      title: t('faq.sectionSubscription'),
      items: [
        { q: t('faq.q1'), a: t('faq.a1') },
        { q: t('faq.q2'), a: t('faq.a2') },
        { q: t('faq.q3'), a: t('faq.a3') },
        { q: t('faq.q4'), a: t('faq.a4') },
      ],
    },
    {
      title: t('faq.sectionUser'),
      items: [
        { q: t('faq.q5'), a: t('faq.a5') },
        { q: t('faq.q6'), a: t('faq.a6') },
        { q: t('faq.q7'), a: t('faq.a7') },
      ],
    },
    {
      title: t('faq.sectionCreator'),
      items: [
        { q: t('faq.q8'),  a: t('faq.a8') },
        { q: t('faq.q9'),  a: t('faq.a9') },
        { q: t('faq.q10'), a: t('faq.a10') },
        { q: t('faq.q11'), a: t('faq.a11') },
        { q: t('faq.q12'), a: t('faq.a12') },
        { q: t('faq.q13'), a: t('faq.a13') },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <LandingHeader />

      <main className="pt-14">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-10">
            {t('faq.heading')}
          </h1>
          {sections.map((section, i) => (
            <FaqSection key={i} title={section.title} items={section.items} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
