'use client'

import { useEffect, useRef, useState } from 'react'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import { getUserProfile, updateUserProfile } from '@/lib/api'
import type { UserProfile } from '@/lib/types'

const NATIONALITIES = [
  { code: '', label: '未設定' },
  { code: 'TW', label: '🇹🇼 台灣' },
  { code: 'TH', label: '🇹🇭 泰國' },
  { code: 'VN', label: '🇻🇳 越南' },
  { code: 'ID', label: '🇮🇩 印尼' },
  { code: 'PH', label: '🇵🇭 菲律賓' },
  { code: 'MY', label: '🇲🇾 馬來西亞' },
  { code: 'MM', label: '🇲🇲 緬甸' },
  { code: 'KH', label: '🇰🇭 柬埔寨' },
  { code: 'SG', label: '🇸🇬 新加坡' },
]

const CREATOR_CATEGORIES = [
  '生活風格', '科技/3C', '戀愛/兩性', '美妝保養/時尚穿搭',
  '親子', '寵物', '圖文插畫與漫畫', '美食/旅遊', '運動/健身',
  '星座/命理', '正妹/寫真', '成人內容(文章/照片/影片)(男女)',
  '成人內容(文章/照片/影片)(男男)',
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

// ─── 個人設定 Tab ─────────────────────────────────────────────────────────────

function PersonalTab({ profile, form, setForm, onSave, saving, saved }: {
  profile: UserProfile
  form: Partial<UserProfile>
  setForm: React.Dispatch<React.SetStateAction<Partial<UserProfile>>>
  onSave: () => void
  saving: boolean
  saved: boolean
}) {
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <>
      {/* 暱稱 */}
      <Card title="暱稱設定" subtitle="您在FansOne的專屬暱稱">
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
            className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center hover:opacity-80 transition-opacity flex-shrink-0"
            aria-label="上傳頭像"
          >
            {form.avatarUrl ? (
              <img src={form.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-gray-400 text-xl">📷</span>
            )}
          </button>
          <button
            onClick={() => avatarInputRef.current?.click()}
            className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            更換頭像
          </button>
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
          <span className="text-gray-400 text-3xl">📷</span>
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
            <p className="text-xs text-gray-400 mb-3">支援 ATM 轉帳繳款、超商代收繳費、信用卡付款、中國銀聯卡</p>
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
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 mb-4 transition-colors">
            <h2 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-0.5">訂閱與購買頻道設定</h2>
            <p className="text-xs text-gray-400 mb-1">設定價錢，讓你的支持者訂閱或購買您的頻道</p>
            <p className="text-xs text-gray-400">支援ATM轉帳繳款、超商代收繳費、信用卡付款、中國銀聯卡</p>
            <p className="text-xs text-gray-400 mt-2">此功能需成為創作者後，才能啟用</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 mb-4 transition-colors">
            <h2 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-0.5">留言設定</h2>
            <p className="text-xs text-gray-400 mt-1">此功能需成為創作者後，才能啟用</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 mb-4 transition-colors">
            <h2 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-0.5">版權保護設定</h2>
            <p className="text-xs text-gray-400 mt-1">此功能需成為創作者後，才能啟用</p>
          </div>
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
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">帳號刪除後將無法恢復，請謹慎操作。</p>
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

      {/* 儲存 */}
      <button
        onClick={onSave}
        disabled={saving}
        className="w-full bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60"
      >
        {saving ? '儲存中...' : '儲存設定'}
      </button>

      {saved && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg">
          ✅ 設定已儲存
        </div>
      )}

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
    </>
  )
}

// ─── 成為創作者 Tab ───────────────────────────────────────────────────────────

function CreatorApplyTab() {
  const [category, setCategory] = useState('')
  const [socialUrl, setSocialUrl] = useState('')
  const [referralCode, setReferralCode] = useState('')

  const tasks = [
    { label: '設定自我介紹，需超過50字（必須）', done: false, required: true },
    { label: '發表三篇與創作類型相同的公開貼文（可略過）', done: false, required: false },
    { label: '免費訂閱人數50人以上（可略過）', done: false, required: false },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-6">申請成為創作者</h2>

      {/* 超低手續費 card */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 mb-6">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-3">超低手續費</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          現階段<strong>早鳥優惠</strong>，現在只要您通過創作者申請，您的作品在 FansOne 販售，FansOne 每筆交易手續費只收
          8% ～ 11%，隨著您的等級越高，手續費就越低！錯過這次機會，下次早鳥不知道什麼時候才會再開放！還不趕快來申請～
        </p>
        <button className="mt-4 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          瞭解更多
        </button>
      </div>

      {/* 創作類型 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">創作類型</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <option value="">請選擇創作類型</option>
          {CREATOR_CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-2">
          成人內容分類，限制只能用於發布18禁之內容。如果您選擇，任何不是成人內容的分類，您的創作內容都不受限於此選項，僅嚴格禁止發布成人內容，此選項僅供我們參考了解您的創作方向，並於有相關曝光活動時，優先聯絡您。
        </p>
      </div>

      {/* 社群網址 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
        <input
          value={socialUrl}
          onChange={e => setSocialUrl(e.target.value)}
          placeholder="目前經營的社群是？(請附上網址)"
          className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        <p className="text-xs text-gray-400 mt-2">目前審核僅能使用Twitter推特/IG/FB粉絲團</p>
      </div>

      {/* 推薦碼 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          推薦碼<span className="text-pink-500 text-xs ml-1">(說明，請參考幫助中心第19條)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔗</span>
          <input
            value={referralCode}
            onChange={e => setReferralCode(e.target.value)}
            placeholder="推薦碼（可不填）"
            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg pl-8 pr-3 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* 任務 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">任務（不是必須，但完成任務會提高審核通過的機率）</p>
        <div className="space-y-2">
          {tasks.map((task, i) => (
            <div key={i} className="flex items-center justify-between gap-3 border border-gray-100 dark:border-gray-800 rounded-lg px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
              <span className="text-sm text-gray-700 dark:text-gray-300">{task.label}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-base">{task.done ? '✅' : task.required ? '❌' : '⬜'}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 送出 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
        <button className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold py-3.5 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-base">
          送出
        </button>
        <div className="mt-4 text-xs text-gray-400 space-y-1">
          <p>審核成功我們會透過Email通知您（通常會在3天內）</p>
          <p>如果您沒有收到消息，表示您沒有通過審核，不另外通知</p>
          <p>如果您覺得應該通過審核卻沒有通過，請來信 support@fansone.co</p>
        </div>
      </div>
    </div>
  )
}

// ─── 儲值打賞金 Tab ───────────────────────────────────────────────────────────

function WalletTab() {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
        <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-1 pb-2 border-b-2 border-red-500 inline-block">
          FO幸運幣管理
        </h2>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">目前持有</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">👑</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">0</span>
            </div>
          </div>
          <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-center justify-center">
            <button className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors whitespace-nowrap">
              儲值 FO 幸運幣
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          幸運幣明細<span className="text-xs text-gray-400 ml-1">（僅保留最近三個月）</span>
        </p>
        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
          <span className="text-2xl mb-2">🗂</span>
          <p className="text-sm">這裏目前沒有任何資料</p>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ProfileTab = 'personal' | 'creator' | 'wallet'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [form, setForm] = useState<Partial<UserProfile>>({})
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

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

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: 'personal', label: '個人設定' },
    { key: 'creator', label: '成為創作者' },
    { key: 'wallet', label: '儲值打賞金' },
  ]

  return (
    <>
      <Header />

      <div className="pt-14 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-32">

          {/* Tab bar */}
          <div className="flex gap-6 mb-6 border-b border-gray-200 dark:border-gray-800">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'border-red-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'personal' && (
            <PersonalTab
              profile={profile}
              form={form}
              setForm={setForm}
              onSave={handleSave}
              saving={saving}
              saved={saved}
            />
          )}
          {activeTab === 'creator' && <CreatorApplyTab />}
          {activeTab === 'wallet' && <WalletTab />}
        </div>
      </div>

      <BottomNav />
    </>
  )
}
