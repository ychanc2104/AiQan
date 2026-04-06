'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import { createPost } from '@/lib/api'
import type { ViewerAudience, CopyrightSetting } from '@/lib/types'

const audienceOptions: { value: ViewerAudience; label: string; desc: string }[] = [
  { value: 'public',      label: '公開',         desc: '大家都看得到' },
  { value: 'subscribers', label: '訂閱者',       desc: '付費解鎖，或訂閱都能看到' },
  { value: 'premium',     label: '僅付費解鎖',   desc: '僅限付費解鎖貼文才能看到' },
  { value: 'private',     label: '僅訂閱用戶',   desc: '僅限訂閱用戶看到' },
]

const copyrightOptions: { value: CopyrightSetting; label: string }[] = [
  { value: 'original',           label: '原創內容（保留所有權利）' },
  { value: 'cc-by',              label: 'CC BY — 允許轉載需署名' },
  { value: 'cc-by-nc',           label: 'CC BY-NC — 非商業署名' },
  { value: 'all-rights-reserved', label: '版權保護（禁止轉載）' },
]

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState<ViewerAudience>('public')
  const [copyright, setCopyright] = useState<CopyrightSetting>('original')
  const [schedule, setSchedule] = useState<'now' | 'later'>('now')
  const [scheduledAt, setScheduledAt] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!body.trim()) return
    setSubmitting(true)
    await createPost({
      title: title.trim() || undefined,
      body: body.trim(),
      audience,
      copyright,
      scheduledAt: schedule === 'later' ? scheduledAt : null,
    })
    router.push('/')
  }

  return (
    <>
      <Header />

      <div className="pt-14 min-h-screen">
        <div className="flex max-w-screen-xl mx-auto">

          {/* ── Left: post settings ── */}
          <aside className="hidden md:flex flex-col w-72 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 pt-4 pb-6 px-4 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto transition-colors">
            <Link
              href="/"
              className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              回上一步
            </Link>

            {/* 排程 */}
            <section className="mb-5">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">排程</p>
              <div className="flex flex-col gap-1.5">
                {(['now', 'later'] as const).map(s => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="schedule"
                      value={s}
                      checked={schedule === s}
                      onChange={() => setSchedule(s)}
                      className="accent-blue-600"
                    />
                    {s === 'now' ? '立即發布' : '排程時間'}
                  </label>
                ))}
              </div>
              {schedule === 'later' && (
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  className="mt-2 w-full text-xs border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              )}
            </section>

            {/* 觀看對象 */}
            <section className="mb-5">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">觀看對象</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2">誰可以看到貼文</p>
              <div className="flex flex-col gap-2">
                {audienceOptions.map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-2 cursor-pointer rounded-lg p-2 border transition-colors ${
                      audience === opt.value
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/40'
                        : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="audience"
                      value={opt.value}
                      checked={audience === opt.value}
                      onChange={() => setAudience(opt.value)}
                      className="accent-blue-600 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{opt.label}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* 版權設定 */}
            <section className="mb-6">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">版權設定</p>
              <div className="flex flex-col gap-1.5">
                {copyrightOptions.map(opt => (
                  <label key={opt.value} className="flex items-start gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="copyright"
                      value={opt.value}
                      checked={copyright === opt.value}
                      onChange={() => setCopyright(opt.value)}
                      className="accent-blue-600 mt-0.5 flex-shrink-0"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </section>

            <button
              onClick={handleSubmit}
              disabled={submitting || !body.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              {submitting ? '發布中...' : '發文'}
            </button>
          </aside>

          {/* ── Right: editor ── */}
          <main className="flex-1 min-w-0 pb-20 md:pb-6">
            <div className="px-4 py-6 max-w-2xl mx-auto">
              {/* Title */}
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="輸入標題（選填）"
                className="w-full text-xl font-bold text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700 bg-transparent border-b border-gray-200 dark:border-gray-800 pb-3 mb-4 focus:outline-none focus:border-blue-400 transition-colors"
              />

              {/* Toolbar — decorative; replace with Tiptap/Slate when rich text is needed */}
              {/* TODO: integrate rich text editor (Tiptap recommended) */}
              <div
                className="flex items-center gap-1 mb-2 pb-2 border-b border-gray-200 dark:border-gray-800 flex-wrap"
                role="toolbar"
                aria-label="文字格式工具列"
              >
                <select className="text-xs text-gray-600 dark:text-gray-400 bg-transparent border border-gray-200 dark:border-gray-700 rounded px-1.5 py-1 mr-1">
                  <option>文章內容</option>
                  <option>標題 1</option>
                  <option>標題 2</option>
                  <option>引用</option>
                </select>
                {[
                  { label: 'B', title: '粗體', className: 'font-bold' },
                  { label: 'I', title: '斜體', className: 'italic' },
                  { label: 'U', title: '底線', className: 'underline' },
                  { label: 'S', title: '刪除線', className: 'line-through' },
                ].map(btn => (
                  <button
                    key={btn.label}
                    title={btn.title}
                    data-testid={`toolbar-${btn.label.toLowerCase()}`}
                    className={`w-7 h-7 rounded text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${btn.className}`}
                  >
                    {btn.label}
                  </button>
                ))}
                <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
                <button
                  title="插入連結"
                  data-testid="toolbar-link"
                  className="w-7 h-7 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </button>
                <button
                  title="插入圖片"
                  data-testid="toolbar-image"
                  className="w-7 h-7 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              {/* Content textarea */}
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="開始輸入內容..."
                className="w-full min-h-64 resize-none text-sm text-gray-800 dark:text-gray-200 bg-transparent placeholder-gray-300 dark:placeholder-gray-700 focus:outline-none leading-relaxed"
              />

              {/* Mobile submit */}
              <div className="md:hidden mt-4">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !body.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {submitting ? '發布中...' : '發文'}
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      <BottomNav />
    </>
  )
}
