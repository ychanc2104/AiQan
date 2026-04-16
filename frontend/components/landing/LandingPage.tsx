'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useT, useLocale, LOCALES } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

// ─── SVG Illustrations ────────────────────────────────────────────────────────

function MonetizeSVG() {
  return (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="20" y="120" width="32" height="60" rx="5" fill="#93C5FD"/>
      <rect x="68" y="95" width="32" height="85" rx="5" fill="#60A5FA"/>
      <rect x="116" y="60" width="32" height="120" rx="5" fill="#3B82F6"/>
      <rect x="164" y="30" width="32" height="150" rx="5" fill="#2563EB"/>
      <polyline points="36,118 84,93 132,58 180,28" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="36" cy="118" r="5" fill="#1D4ED8"/>
      <circle cx="84" cy="93" r="5" fill="#1D4ED8"/>
      <circle cx="132" cy="58" r="5" fill="#1D4ED8"/>
      <circle cx="180" cy="28" r="5" fill="#1D4ED8"/>
      <circle cx="210" cy="40" r="24" fill="#FCD34D"/>
      <text x="210" y="47" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#92400E">$</text>
    </svg>
  )
}

function SecuritySVG() {
  return (
    <svg viewBox="0 0 240 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M120 18 L200 55 L200 120 C200 168 165 195 120 208 C75 195 40 168 40 120 L40 55 Z" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="3.5"/>
      <path d="M40 55 L120 18 L200 55" fill="#BFDBFE" opacity="0.5"/>
      <path d="M82 112 L106 136 L158 84" stroke="#2563EB" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="120" cy="75" r="18" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="2"/>
      <rect x="112" y="70" width="16" height="20" rx="3" fill="#3B82F6"/>
      <path d="M112 74 Q120 64 128 74" stroke="#3B82F6" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function PaymentSVG() {
  return (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="10" y="40" width="155" height="100" rx="12" fill="#1E40AF"/>
      <rect x="10" y="72" width="155" height="24" fill="#1D4ED8"/>
      <circle cx="145" cy="60" r="15" fill="#FCD34D" opacity="0.9"/>
      <circle cx="162" cy="60" r="15" fill="#F97316" opacity="0.85"/>
      <rect x="28" y="108" width="50" height="10" rx="5" fill="#93C5FD"/>
      <rect x="88" y="108" width="35" height="10" rx="5" fill="#BFDBFE"/>
      <rect x="180" y="30" width="48" height="85" rx="8" fill="#1E3A8A"/>
      <rect x="188" y="40" width="32" height="52" rx="4" fill="#60A5FA"/>
      <rect x="196" y="97" width="16" height="6" rx="3" fill="#93C5FD"/>
      <circle cx="204" cy="130" r="18" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2"/>
      <path d="M197 130 L204 123 L211 130" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M204 123 L204 137" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round"/>
      <text x="204" y="155" textAnchor="middle" fontSize="10" fill="#6B7280">NFC</text>
    </svg>
  )
}

function CreatorSVG() {
  return (
    <svg viewBox="0 0 240 210" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="120" cy="108" r="80" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="2"/>
      <ellipse cx="120" cy="108" rx="80" ry="35" stroke="#93C5FD" strokeWidth="1.5" fill="none"/>
      <ellipse cx="120" cy="108" rx="55" ry="80" stroke="#93C5FD" strokeWidth="1.5" fill="none"/>
      <line x1="40" y1="108" x2="200" y2="108" stroke="#93C5FD" strokeWidth="1.5"/>
      <line x1="120" y1="28" x2="120" y2="188" stroke="#93C5FD" strokeWidth="1.5"/>
      <circle cx="80" cy="82" r="14" fill="#2563EB"/>
      <text x="80" y="87" textAnchor="middle" fontSize="14" fill="white">人</text>
      <circle cx="160" cy="90" r="14" fill="#3B82F6"/>
      <text x="160" y="95" textAnchor="middle" fontSize="14" fill="white">人</text>
      <circle cx="105" cy="148" r="14" fill="#60A5FA"/>
      <text x="105" y="153" textAnchor="middle" fontSize="14" fill="white">人</text>
      <circle cx="80" cy="82" r="28" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="4 3" fill="none"/>
      <circle cx="160" cy="90" r="28" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 3" fill="none"/>
    </svg>
  )
}

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

// ─── Landing Header ───────────────────────────────────────────────────────────

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

// ─── Feature Section ──────────────────────────────────────────────────────────

interface FeatureProps {
  title: string
  desc: string
  illustration: React.ReactNode
  reverse?: boolean
}

function FeatureSection({ title, desc, illustration, reverse }: FeatureProps) {
  return (
    <section className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10 md:gap-16 py-16 md:py-20`}>
      <div className="flex-1 flex items-center justify-center w-full max-w-xs md:max-w-none">
        <div className="w-full max-w-[280px] md:max-w-[320px]">
          {illustration}
        </div>
      </div>
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-snug mb-4">
          {title}
        </h2>
        <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
          {desc}
        </p>
      </div>
    </section>
  )
}

// ─── CTA Section ─────────────────────────────────────────────────────────────

function CTASection() {
  const t = useT()
  return (
    <section className="bg-blue-600 dark:bg-blue-700 rounded-2xl mx-0 md:mx-4 py-16 md:py-20 px-6 text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 max-w-2xl mx-auto leading-snug">
        {t('landing.ctaHeadline')}
      </h2>
      <Link
        href="/home"
        className="inline-block bg-white text-blue-600 font-semibold text-base px-8 py-3.5 rounded-full hover:bg-blue-50 transition-colors shadow"
      >
        {t('landing.ctaButton')}
      </Link>
    </section>
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
                <li><Link href="#" className="hover:text-white transition-colors">{t('landing.footerFaq')}</Link></li>
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

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function LandingPage() {
  const t = useT()

  const features = [
    {
      title: t('landing.feature1Title'),
      desc: t('landing.feature1Desc'),
      illustration: <MonetizeSVG />,
      reverse: false,
    },
    {
      title: t('landing.feature2Title'),
      desc: t('landing.feature2Desc'),
      illustration: <SecuritySVG />,
      reverse: true,
    },
    {
      title: t('landing.feature3Title'),
      desc: t('landing.feature3Desc'),
      illustration: <PaymentSVG />,
      reverse: false,
    },
    {
      title: t('landing.feature4Title'),
      desc: t('landing.feature4Desc'),
      illustration: <CreatorSVG />,
      reverse: true,
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <LandingHeader />

      <main className="pt-14">
        <div className="max-w-6xl mx-auto px-6">
          {features.map((f, i) => (
            <FeatureSection key={i} {...f} />
          ))}
        </div>

        <div className="max-w-6xl mx-auto px-2 md:px-6 pb-0">
          <CTASection />
        </div>
      </main>

      <Footer />
    </div>
  )
}
