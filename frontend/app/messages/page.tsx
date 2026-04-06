'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import { getConversations, sendMessage } from '@/lib/api'
import type { Conversation, Message } from '@/lib/types'
import { timeAgo } from '@/lib/utils'

type TabFilter = 'all' | 'priority' | 'unread'

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [tipAmount, setTipAmount] = useState('')
  const [showTip, setShowTip] = useState(false)
  const [tab, setTab] = useState<TabFilter>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getConversations().then(setConversations)
  }, [])

  const activeConv = conversations.find(c => c.id === activeId)

  useEffect(() => {
    if (activeConv) setMessages(activeConv.messages)
  }, [activeId, activeConv])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const filtered = conversations.filter(c => {
    if (tab === 'priority') return c.isPriority
    if (tab === 'unread') return c.unread > 0
    return true
  })

  const priorityCount = conversations.filter(c => c.isPriority).length
  const unreadCount = conversations.filter(c => c.unread > 0).length

  async function handleSend() {
    if (!activeId) return
    const text = input.trim()
    const tip = tipAmount ? Number(tipAmount) : undefined
    if (!text && !tip) return

    const msg = await sendMessage(activeId, text || `打賞 NT$${tip}`, tip)
    setMessages(prev => [...prev, msg])
    setInput('')
    setTipAmount('')
    setShowTip(false)
  }

  const tabs: { key: TabFilter; label: string; count?: number }[] = [
    { key: 'all', label: '全部' },
    { key: 'priority', label: '優先級', count: priorityCount },
    { key: 'unread', label: '未讀', count: unreadCount },
  ]

  return (
    <>
      <Header />

      <div className="pt-14 h-screen flex flex-col">
        <div className="flex flex-1 min-h-0 max-w-screen-xl mx-auto w-full">

          {/* ── Left: conversation list ── */}
          <div className="w-72 flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors">
            {/* Back + tabs */}
            <div className="px-4 pt-4 pb-2">
              <Link
                href="/"
                className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                回上一步
              </Link>

              <div className="flex gap-1">
                {tabs.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                      tab === t.key
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {t.label}
                    {t.count ? (
                      <span className="bg-blue-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                        {t.count}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-8">無對話</p>
              ) : (
                filtered.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveId(conv.id)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors ${
                      activeId === conv.id
                        ? 'bg-blue-50 dark:bg-blue-950/50'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full ${conv.avatarColor} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                      {conv.participantName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {conv.participantName}
                        </p>
                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
                          {timeAgo(conv.lastAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <span className="flex-shrink-0 bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Right: chat window ── */}
          <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-950">
            {!activeConv ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-400 dark:text-gray-600">
                  <div className="text-4xl mb-2">💬</div>
                  <p className="text-sm">選擇一個對話開始聊天</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => setActiveId(null)}
                    className="md:hidden text-gray-500 dark:text-gray-400 mr-1"
                    aria-label="關閉"
                  >
                    ✕
                  </button>
                  <div className={`w-8 h-8 rounded-full ${activeConv.avatarColor} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {activeConv.participantName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{activeConv.participantName}</p>
                    <p className="text-xs text-gray-400">{activeConv.participantHandle}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                      {msg.tip ? (
                        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-2xl px-4 py-2 text-sm text-yellow-700 dark:text-yellow-400 font-medium">
                          {msg.body}
                        </div>
                      ) : (
                        <div
                          className={`max-w-xs rounded-2xl px-3 py-2 text-sm ${
                            msg.senderId === 'me'
                              ? 'bg-blue-600 text-white rounded-br-sm'
                              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-sm'
                          }`}
                        >
                          {msg.body}
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3">
                  {showTip && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-500">打賞金額 NT$</span>
                      <input
                        type="number"
                        min="10"
                        step="10"
                        value={tipAmount}
                        onChange={e => setTipAmount(e.target.value)}
                        placeholder="50"
                        className="w-20 text-xs border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder="輸入訊息..."
                      className="flex-1 text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => setShowTip(v => !v)}
                      className={`text-xs px-3 py-2 rounded-xl border font-medium transition-colors ${
                        showTip
                          ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                          : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-yellow-300 hover:text-yellow-600'
                      }`}
                    >
                      🎁 打賞
                    </button>
                    <button
                      onClick={handleSend}
                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      傳送
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </>
  )
}
