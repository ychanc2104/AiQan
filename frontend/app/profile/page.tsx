'use client'

import { useEffect, useRef, useState } from 'react'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import { getUserProfile, updateUserProfile } from '@/lib/api'
import type { UserProfile } from '@/lib/types'
import { countryFlag } from '@/lib/utils'

const NATIONALITIES = [
  { code: '', label: '未設定' },
  { code: 'TW', label: '🇹🇼 台灣' },
  { code: 'TH', label: '🇹🇭 泰國' },
  { code: 'VN', label: '🇻🇳 越南' },
  { code: 'ID', label: '🇮🇩 印尼' },
  { code: 'PH', label: '🇵🇭 菲律賓' },
  { code: 'MY', label: '🇲🇾 馬來西亞' },
  { code: 'SG', label: '🇸🇬 新加坡' },
]

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 mb-4 shadow-sm transition-colors">
      <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{subtitle}</p>}
      {!subtitle && <div className="mb-3" />}
      {children}
    </div>
  )
}

function LockedCard({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 mb-4 opacity-70 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{title}</h2>
          {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">此功能需成為創作者後，才能啟用</p>
        </div>
        <span className="text-lg">🔒</span>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [form, setForm] = useState<Partial<UserProfile>>({})
  const [saved, setSaved] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getUserProfile().then(p => {
      setProfile(p)
      setForm(p)
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    const updated = await updateUserProfile(form)
    setProfile(updated)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!profile) {
    return (
      <>
        <Header />
        <div className="pt-14 min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-gray-400">載入中...</div>
        </div>
        <BottomNav />
      </>
    )
  }

  return (
    <>
      <Header />

      <div className="pt-14 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-32">

          {/* Tab heading */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white inline-block pb-1 border-b-2 border-red-500">
              個人設定
            </h1>
          </div>

          {/* 暱稱 */}
          <Card title="暱稱設定" subtitle="您在平台的專屬暱稱">
            <input
              value={form.nickname ?? ''}
              onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))}
              placeholder="輸入暱稱"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </Card>

          {/* 國籍 */}
          <Card title="國籍">
            <select
              value={form.nationality ?? ''}
              onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {NATIONALITIES.map(n => (
                <option key={n.code} value={n.code}>{n.label}</option>
              ))}
            </select>
          </Card>

          {/* 頭像 */}
          <Card title="上傳頭像">
            <div className="flex items-center gap-4">
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-3xl hover:opacity-80 transition-opacity flex-shrink-0"
                aria-label="上傳頭像"
              >
                {form.avatarUrl ? (
                  <img src={form.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 text-2xl">📷</span>
                )}
              </button>
              <div>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  更換頭像
                </button>
                <p className="text-xs text-gray-400 mt-1">支援 JPG、PNG，建議 400×400px</p>
              </div>
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" />
          </Card>

          {/* 封面 */}
          <Card title="上傳封面">
            <button
              onClick={() => bannerInputRef.current?.click()}
              className="w-full h-28 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:opacity-80 transition-opacity border-2 border-dashed border-gray-300 dark:border-gray-700"
              aria-label="上傳封面"
            >
              <span className="text-gray-400 dark:text-gray-500 text-3xl">📷</span>
            </button>
            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" />
            <div className="mt-3 text-xs text-gray-400 dark:text-gray-500 space-y-0.5">
              <p className="font-medium text-gray-500 dark:text-gray-400">提示</p>
              <p>個人頁面目前有兩種模式：</p>
              <p>1. 沒有封面，會自動呈現乾淨模式，類似 IG</p>
              <p>2. 有封面的話，會呈現封面模式，類似 FB</p>
            </div>
          </Card>

          {/* 自我介紹 */}
          <Card title="自我介紹">
            <textarea
              value={form.bio ?? ''}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="請輸入自我介紹，或其他可以讓使用者更了解你的資訊"
              rows={4}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
            />
          </Card>

          {/* Creator-locked sections */}
          {profile.isCreator ? (
            <>
              <Card title="訂閱與購買頻道設定" subtitle="設定價錢，讓你的支持者訂閱或購買您的頻道">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                  支援 ATM 轉帳繳款、超商代收繳費、信用卡付款、中國銀聯卡
                </p>
                <button className="text-sm border border-blue-400 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors">
                  管理訂閱方案
                </button>
              </Card>
              <Card title="留言設定">
                <button className="text-sm border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  管理留言設定
                </button>
              </Card>
              <Card title="版權保護設定">
                <button className="text-sm border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  設定版權規則
                </button>
              </Card>
            </>
          ) : (
            <>
              <LockedCard title="訂閱與購買頻道設定" desc="設定價錢，讓你的支持者訂閱或購買您的頻道" />
              <LockedCard title="留言設定" />
              <LockedCard title="版權保護設定" />
            </>
          )}

          {/* 出金方式 */}
          <Card title="出金方式設定" subtitle="我們會匯款到您所填寫的銀行帳號">
            <button className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              開始設定
            </button>
          </Card>

          {/* 刪除帳號 */}
          <Card title="刪除帳號">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              帳號刪除後將無法恢復，請謹慎操作。
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              刪除帳號前，請先自行將頻道內的貼文刪除。我們無法協助您刪除貼文。
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              刪除帳號
            </button>
          </Card>

          {/* 儲存按鈕 */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60"
          >
            {saving ? '儲存中...' : '儲存設定'}
          </button>
        </div>
      </div>

      {/* Success toast */}
      {saved && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg">
          ✅ 設定已儲存
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">確認刪除帳號？</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              此操作無法復原。請確認已刪除所有頻道貼文。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl text-sm font-medium"
              >
                取消
              </button>
              <button className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium">
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </>
  )
}
