# AiQan 專案設計規範書

> 版本：v0.2 | 更新日期：2026-04-03
> 定位：針對**在台東南亞人**（移工、新住民、留學生）的訂閱制影音聚合平台（18+）
> 市場策略：台灣首發 → 擴展至東南亞本地市場

---

## 1. 系統架構總覽

採用 **前後端分離 (Decoupled)** 雲原生架構，初期以 **全免費方案** 為目標，流量增長後可無縫遷移至付費基礎設施。

```
┌─────────────────────────────────────────────────────────────────┐
│                        使用者 (Mobile Browser)                   │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS
                    ┌──────────▼──────────┐
                    │  Cloudflare (免費)   │  DNS + CDN + DDoS 防護
                    └──────────┬──────────┘
            ┌──────────────────┴──────────────────┐
            │                                     │
  ┌─────────▼─────────┐               ┌──────────▼──────────┐
  │  Next.js (Vercel) │               │  FastAPI (Koyeb)     │
  │  前端 / SSR / SEO  │◄─────API─────►│  業務邏輯 / 爬蟲     │
  └───────────────────┘               └──────────┬──────────┘
                                                 │
                    ┌────────────────────────────┼────────────────────────────┐
                    │                            │                            │
         ┌──────────▼──────────┐    ┌────────────▼────────┐    ┌─────────────▼──────┐
         │  Supabase (日本)     │    │  Upstash Redis      │    │  LINE Notify / 簡訊通│
         │  PostgreSQL + Auth  │    │  (快取 / 排程鎖)    │    │  (台灣在地通知)     │
         │  + Storage          │    └─────────────────────┘    └────────────────────┘
         └─────────────────────┘
```

---

## 2. 技術選型與免費額度

| 層級 | 服務 | 免費額度 | 說明 |
|:-----|:-----|:---------|:-----|
| **前端** | Vercel | 100GB 頻寬/月，無限部署 | Next.js 最佳部署平台 |
| **後端** | Koyeb Free | 永久免費單實例，512MB RAM | FastAPI 部署，注意 cold start |
| **資料庫** | Supabase Free | 500MB DB，1GB Storage，50MB 傳輸 | 選 **Japan (ap-northeast-1)** 區域，台灣延遲最低 |
| **快取** | Upstash Redis | **10,000 commands/天，永久免費** | 翻譯快取、爬蟲去重、Rate Limit；備選：Redis Cloud 30MB 免費 |
| **CDN/DNS** | Cloudflare Free | 無限頻寬，DDoS 防護 | 套在所有 Domain 前 |
| **排程監控** | UptimeRobot Free | 50 monitors，5 分鐘間隔 | 解決 Koyeb cold start 問題 |
| **錯誤追蹤** | Sentry Free | 5,000 events/月 | 前後端共用 |
| **CI/CD** | GitHub Actions | 2,000 分鐘/月 | 自動化部署 |
| **翻譯** | Google Cloud Translation | 500,000 字元/月 | 超出後 $20/百萬字元，務必快取 |
| **通知** | LINE Notify | 完全免費 | 台灣移工 LINE 使用率極高，取代 SMS |

---

## 3. 核心改進建議

### 3.1 Cold Start 問題（重要）

Koyeb/Render 免費方案在閒置 15 分鐘後會休眠，第一個請求需 5-30 秒。

**解決方案：**
- 使用 **UptimeRobot** 每 5 分鐘 GET `/health` 保持存活
- FastAPI 實作輕量 health check endpoint，確保不觸發 DB 查詢
- 前端顯示 loading skeleton，降低使用者感知

```python
# backend/app/routers/health.py
@router.get("/health")
async def health_check():
    return {"status": "ok"}
```

### 3.2 背景任務（爬蟲排程）

FastAPI 本身不是任務調度框架，建議使用 **APScheduler**（內嵌，零成本）搭配 **Upstash Redis** 做分散鎖。

```
APScheduler (內嵌於 FastAPI)
  └─ 每 6 小時觸發 TikTok 同步任務
       └─ 抓取目標帳號最新影片 metadata
       └─ 檢查 Upstash Redis 去重（已爬過的 video_id skip）
       └─ 呼叫 Translation API（先查 Redis 快取）
       └─ 寫入 Supabase
```

**注意：** Koyeb 單實例重啟後 APScheduler 狀態消失，需在啟動時從 DB 重新初始化排程。

### 3.3 TikTok 爬蟲風險

TikTok 爬蟲違反其 ToS，需要做風險管理：

| 風險 | 緩解策略 |
|:-----|:---------|
| IP 封鎖 | 使用 Scraper API 代理（初期用免費額度） |
| Rate Limit | 爬蟲間隔隨機化（5-15 秒），非同步批次 |
| 版權爭議 | **只儲存 metadata + 原始連結**，不下載影片本體 |
| 帳號封鎖 | 監控目標帳號清單，自動標記失效帳號 |

**建議：** MVP 階段先手動添加 TikTok 連結，待穩定後再實作自動爬蟲。

### 3.4 翻譯快取策略

Google Translate API 免費額度 500K 字元/月，務必快取：

```
請求翻譯流程：
  content.description + target_lang
     → 產生 cache_key (SHA256)
     → 查詢 Upstash Redis
         HIT  → 直接回傳
         MISS → 呼叫 Google API → 寫入 Redis (TTL: 30天) → 回傳
```

### 3.5 手機 OTP 登入成本

Supabase Phone Auth 需要 Twilio，費用約 $0.0079/次 OTP。

**在台目標客群的優化方案：**
- 目標用戶幾乎都持有台灣門號（+886），可使用 **台灣在地 SMS 供應商**
  - 推薦：**簡訊通 (mitake.com.tw)** 或 **EVERY8D**，每則約 NT$0.1-0.2，遠比 Twilio 便宜
- 初期以 **Email OTP** 為主（Supabase 內建免費），降低啟動成本
- LINE Login 作為主要第三方登入（LINE 在台移工族群滲透率接近 100%）
- Phone OTP 升級為付費功能後再開放

### 3.6 通知管道優先序（台灣市場）

```
LINE Notify（免費）          ← 首選，台灣 LINE 使用率 >80%
  ↓ 用戶未綁定 LINE
台灣 SMS（簡訊通，NT$0.2/則）← 次選，便宜且可靠
  ↓ 用戶無台灣門號（極少數）
Email（Supabase 免費）       ← 兜底方案
```

**LINE Notify 整合重點：**
- 用戶訂閱成功後引導綁定 LINE Notify Bot（一次性 OAuth）
- 管理員審核通過後，FastAPI 直接呼叫 LINE Notify API 推播
- 完全免費，且訊息到達率遠高於 SMS

---

## 4. 資料庫 Schema

```sql
-- 啟用 UUID 擴充
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 創作者（合作夥伴）
CREATE TABLE creators (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  handle      TEXT UNIQUE NOT NULL,           -- @username
  display_name TEXT NOT NULL,
  bio         TEXT,
  avatar_url  TEXT,
  tiktok_url  TEXT,
  ig_url      TEXT,
  is_active   BOOLEAN DEFAULT true,
  tier        TEXT DEFAULT 'standard',        -- 'standard', 'premium'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 內容索引（只存 metadata，不存影片）
CREATE TABLE contents (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id      UUID REFERENCES creators(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL,              -- 'tiktok', 'ig', 'manual'
  external_id     TEXT UNIQUE,               -- TikTok video_id
  external_url    TEXT NOT NULL,             -- 原始連結
  thumbnail_url   TEXT,
  original_desc   TEXT,                      -- 原文描述
  translations    JSONB DEFAULT '{}',        -- {"th": "...", "vi": "...", "id": "..."}
  is_premium      BOOLEAN DEFAULT false,     -- 付費牆
  is_visible      BOOLEAN DEFAULT true,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_contents_creator ON contents(creator_id);
CREATE INDEX idx_contents_published ON contents(published_at DESC);

-- 使用者（由 Supabase Auth 管理，此表擴充資料）
CREATE TABLE user_profiles (
  id              UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name    TEXT,
  phone           TEXT,                       -- 台灣門號 +886
  origin_country  TEXT,                       -- 母國：'VN', 'ID', 'TH', 'PH', 'MY'
  preferred_lang  TEXT DEFAULT 'zh-TW',       -- 預設繁中，可切換母語
  line_notify_token TEXT,                     -- LINE Notify 綁定 token（通知用）
  is_verified_age BOOLEAN DEFAULT false,      -- 18+ 確認
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 訂閱方案
CREATE TABLE subscription_plans (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id  UUID REFERENCES creators(id),
  name        TEXT NOT NULL,
  price       NUMERIC NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'TWD',    -- 台灣市場首發用 TWD，後期擴充 VND/IDR/THB
  duration_days INT DEFAULT 30,
  is_active   BOOLEAN DEFAULT true
);

-- 使用者訂閱狀態
CREATE TABLE subscriptions (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id),
  creator_id  UUID REFERENCES creators(id),
  plan_id     UUID REFERENCES subscription_plans(id),
  status      TEXT DEFAULT 'inactive',       -- 'active', 'inactive', 'expired'
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, creator_id)
);
CREATE INDEX idx_subs_user ON subscriptions(user_id);

-- 付款訂單（支援人工截圖 & 永豐虛擬帳號兩種模式）
CREATE TABLE payment_requests (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id),
  plan_id         UUID REFERENCES subscription_plans(id),
  amount          NUMERIC NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'TWD',
  payment_method  TEXT DEFAULT 'manual',     -- 'manual'（截圖）| 'sinopac_va'（虛擬帳號）

  -- 人工截圖模式
  receipt_url     TEXT,                      -- Supabase Storage 路徑

  -- 永豐虛擬帳號模式
  virtual_account TEXT,                      -- 永豐配發的虛擬帳號
  va_expires_at   TIMESTAMPTZ,               -- 虛擬帳號到期時間
  sinopac_txn_id  TEXT,                      -- 永豐回傳的交易序號

  status          TEXT DEFAULT 'pending',    -- 'pending', 'verified', 'rejected', 'expired'
  admin_note      TEXT,
  reviewed_by     UUID REFERENCES auth.users(id),  -- NULL 表示系統自動核銷
  reviewed_at     TIMESTAMPTZ,
  notified        BOOLEAN DEFAULT false,     -- LINE Notify 是否已推播
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_payments_status ON payment_requests(status);
CREATE INDEX idx_payments_user ON payment_requests(user_id);
CREATE INDEX idx_payments_va ON payment_requests(virtual_account) WHERE virtual_account IS NOT NULL;
```

---

## 5. FastAPI 路由設計

```
/health                          GET   存活檢查（無 DB 查詢）

/api/v1/auth
  /verify-token                  POST  驗證 Supabase JWT，回傳使用者資訊

/api/v1/contents
  /                              GET   內容列表（分頁、語系、創作者篩選）
  /{id}                          GET   單一內容詳情（含翻譯）
  /sync                          POST  [Admin] 手動觸發同步指定創作者

/api/v1/creators
  /                              GET   創作者列表
  /{id}                          GET   創作者資訊
  /{id}/contents                 GET   指定創作者的內容

/api/v1/payments
  /                              POST  建立付款申請（截圖模式：回傳 presigned URL；虛擬帳號模式：呼叫永豐 API）
  /{id}                          GET   查詢申請狀態
  /upload-url                    POST  取得 Supabase Storage presigned upload URL（截圖模式）

/api/v1/webhooks
  /sinopac                       POST  永豐銀行入帳 Webhook（驗簽 → 自動核銷 → LINE Notify）

/api/v1/admin                    [需 Admin Role JWT]
  /payments                      GET   待審核列表
  /payments/{id}/verify          POST  審核通過 → LINE Notify 推播（備援 SMS）
  /payments/{id}/reject          POST  拒絕申請
  /contents                      POST  手動新增內容
  /contents/{id}                 PATCH 編輯內容
```

---

## 6. FastAPI 專案結構

```
backend/
├── app/
│   ├── main.py              # FastAPI 入口，掛載 router，初始化 APScheduler
│   ├── config.py            # Pydantic Settings，讀取環境變數
│   ├── dependencies.py      # get_db, get_current_user, require_admin
│   ├── routers/
│   │   ├── health.py
│   │   ├── contents.py
│   │   ├── creators.py
│   │   ├── payments.py
│   │   ├── webhooks.py         # 永豐入帳 Webhook（HMAC 驗簽）
│   │   └── admin.py
│   ├── services/
│   │   ├── tiktok_scraper.py   # Playwright / HTTPX 爬蟲
│   │   ├── translation.py      # Google Translate + Redis 快取
│   │   ├── sinopac.py          # 永豐虛擬帳號 API 封裝
│   │   ├── line_notify.py      # LINE Notify 推播
│   │   ├── sms.py              # 簡訊通備援 SMS
│   │   └── storage.py          # Supabase Storage presigned URL
│   ├── scheduler.py            # APScheduler 設定
│   └── models/                 # Pydantic request/response schemas
├── Dockerfile
├── requirements.txt
└── .env.example
```

---

## 7. 台灣市場特化設計

### 7.1 目標客群分析

| 族群 | 規模（約） | 特點 |
|:-----|:-----------|:-----|
| 移工（印尼/越南/菲律賓/泰國） | 70 萬人 | 台灣銀行帳戶、LINE 高度依賴、收入穩定但信用卡持有率低 |
| 新住民（越南/印尼配偶） | 25 萬人 | 中文能力較好、熟悉台灣消費習慣 |
| 東南亞留學生 | 5 萬人 | 數位原生、有信用卡、習慣線上訂閱 |

### 7.2 台灣支付方案（永豐虛擬帳號為核心）

#### 方案比較

| 方案 | 自動核銷 | 開發難度 | 費用 | 建議階段 |
|:-----|:---------|:---------|:-----|:---------|
| **永豐虛擬帳號 API** | ✅ 全自動 Webhook | 中 | 企業帳戶申請 | **Phase 2** |
| 超商代碼（ibon/FamiPort） | ✅ 自動 | 高（需串接中間商） | 交易手續費 | Phase 3 |
| LINE Pay | ✅ 自動 | 中 | 交易手續費 2.65% | Phase 3 |
| ATM 截圖（人工審核） | ❌ 人工 | 低 | 免費 | **Phase 1 MVP** |

#### 永豐虛擬帳號整合設計

```
用戶訂閱流程（永豐 API 版）：

1. 用戶選擇訂閱方案
   → FastAPI 呼叫永豐 API：建立一次性虛擬帳號（每筆訂單唯一）
   → 回傳虛擬帳號號碼 + 到期時間（建議 24 小時）

2. 用戶 ATM 轉帳至虛擬帳號（正確金額）
   → 永豐銀行收款後，自動觸發 Webhook 至 FastAPI

3. FastAPI Webhook Handler
   → 驗證簽章（防偽造）
   → 比對訂單金額與實際入帳
   → 更新 subscriptions 狀態為 active
   → 觸發 LINE Notify 推播給用戶
   → 整個流程無需人工介入

Webhook 端點：POST /api/v1/webhooks/sinopac
```

#### 永豐 API 申請要求
- 需開設**企業帳戶**（需統編，個人無法申請）
- 申請文件：營業登記 or 商業登記
- 有沙箱測試環境（開發期間免費）
- **建議：** MVP 階段先用 ATM 截圖人工審核，待公司設立後升級永豐 API

#### MVP 過渡方案（無需企業帳戶）

```
Phase 1 簡化流程：
  用戶 → 固定帳號 ATM 轉帳 → 上傳截圖
       → FastAPI 建立 pending 申請單
       → 管理員於 Supabase Studio 審核
       → 點擊核准 → 觸發 LINE Notify
```

### 7.3 多語言策略（台灣版）

```
語系偵測優先順序：
  1. 使用者已設定的偏好語系（DB stored）
  2. Accept-Language Header
  3. 預設：繁體中文（zh-TW）← 台灣市場特化

支援語系：
  zh-TW  繁體中文（導覽介面 + 合約條款）
  vi     越南語（最大移工族群）
  id     印尼語（第二大族群）
  th     泰語
  tl     菲律賓語（Tagalog）
  en     英文（兜底）
```

### 7.4 台灣法規合規

- **主管法律：** 中華民國刑法第 235 條（猥褻物品）、兒童及少年性剝削防制條例
- **Age Gate：** 強制自我聲明 + 紀錄時間戳/IP，首次進入需同意使用條款
- **資料保護：** 個人資料保護法（個資法），用戶資料留存台灣/日本節點
- **建議：** 初期定位為「創作者訂閱內容平台」，敏感內容為次要功能，避免直接標榜 18+

---

## 8. 前端 (Next.js) 重點設計

### 8.1 頁面佈局設計（首頁）

#### Desktop 線框稿

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]           首頁  訊息  通知  個人資料                     │  ← Header (fixed)
└─────────────────────────────────────────────────────────────────┘
┌───────────────┬─────────────────────────────────────────────────┐
│  個人化版面    │                              [原始連結 ↗]       │
│               │                                                 │
│  [搜尋]       │                                                 │
│  [發文]       │              內容區塊                           │
│  [喜愛]       │         （影片 embed / 縮圖）                   │
│  [收藏]       │                                                 │
│  [訂閱貼文]   │  [創作者名字]                                   │
│               │  👁 觀看次數   ❤️ 喜愛次數   🔖 收藏次數        │
└───────────────┴─────────────────────────────────────────────────┘
  25% sidebar              75% content
```

#### Mobile 線框稿（重要：需重新設計 sidebar）

```
┌────────────────────────┐
│  [Logo]         [≡]    │  ← Header (fixed)，漢堡選單取代 nav
├────────────────────────┤
│                        │
│   內容區塊              │  ← 全寬，TikTok 垂直滑動體驗
│  （影片 / 縮圖）        │
│                        │
│ [創作者名字]  [原始↗]  │
│ 👁 觀看  ❤️ 喜愛  🔖 收藏 │
├────────────────────────┤
│  🏠   💬   🔔   👤    │  ← Bottom Navigation Bar（固定底部）
│ 首頁  訊息  通知  我的  │
└────────────────────────┘
```

> **⚠️ 設計提醒：** 專案定位為 Mobile-First，但目前 JSON 意圖是 Desktop 側邊欄佈局。
> 側邊欄的「搜尋/發文/喜愛/收藏/訂閱貼文」在手機上需改為底部導覽列或收進個人資料頁。

#### Next.js 元件對應

```
app/
├── (home)/
│   └── page.tsx              # 首頁（內容 Feed）
├── components/
│   ├── layout/
│   │   ├── Header.tsx        # Logo + Nav menu
│   │   ├── Sidebar.tsx       # 左側個人化版面（hidden on mobile）
│   │   └── BottomNav.tsx     # 手機底部導覽（visible on mobile only）
│   ├── content/
│   │   ├── ContentCard.tsx   # 內容區塊：縮圖 + 創作者 + 統計
│   │   ├── ContentFeed.tsx   # 垂直滾動 Feed，分頁載入
│   │   └── OriginalLink.tsx  # 右上角原始連結（target="_blank"）
│   └── creator/
│       └── CreatorBadge.tsx  # 創作者名字 + 頭像（藍框樣式）
```

#### 元件 ↔ API 資料對應

| UI 元素 | 資料來源 | API 端點 |
|:--------|:---------|:---------|
| 內容區塊（縮圖） | `contents.thumbnail_url` | `GET /api/v1/contents` |
| 原始連結 | `contents.external_url` | 同上（前端直接渲染） |
| 創作者名字 | `creators.display_name` | `GET /api/v1/creators/{id}` |
| 觀看次數 | `contents.view_count`（待定） | 同上或 TikTok embed |
| 喜愛次數 | `user_likes` 表 or TikTok 原始數據 | 待設計 |
| 收藏次數 | `user_saves` 表 | 待設計 |

#### 待釐清項目

- **「發文」按鈕**：目前平台定位為聚合平台，創作者是否能直接在站內發文？若是，需要增加 `posts` 資料表與上傳 API
- **「喜愛/收藏」統計**：顯示 TikTok 原始數據（爬取）還是站內自己的互動數據（需 DB 表）？
- **內容 Feed 排序**：最新優先 / 熱度排序 / 個人化推薦？

---

### 8.2 語系偵測流程

```
使用者進站
  → Next.js Middleware 讀取 Accept-Language Header
  → 對應語系表：zh-TW（預設）/ vi / id / th / tl / en
  → next-i18next 載入對應翻譯 JSON
  → URL prefix: /vi/... /id/... /th/...（有利 SEO，zh-TW 為根路徑）
```

### 8.3 付費牆邏輯

```
Premium Content Card
  → 已登入 + 有效訂閱 → 顯示完整內容連結
  → 已登入 + 無訂閱   → 顯示訂閱 CTA，截圖上傳流程
  → 未登入             → 顯示登入提示
```

### 8.4 截圖上傳流程（前端）

```
使用者選擇圖片
  → 前端呼叫 /api/v1/payments/upload-url 取得 presigned URL
  → 直接 PUT 圖片至 Supabase Storage（不過後端，節省頻寬）
  → 取得 receipt_url 後呼叫 /api/v1/payments 建立申請單
  → 輪詢或等待 SMS 通知
```

### 8.5 各頁面線框稿規格（使用者視角）

> 以下線框稿對應 `frontend-pages.pdf`，描述各頁面的 UI 結構與互動邏輯。

---

#### 8.5.1 首頁（首頁區_使用者視角）

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]        首頁  訊息  通知  個人資料  語言                  │  ← Header (fixed)
└─────────────────────────────────────────────────────────────────┘
┌───────────────┬─────────────────────────────────────────────────┐
│  個人化版面    │                              [原始連結 ↗]       │
│               │                                                 │
│  [搜尋]       │                                                 │
│  [發文]       │              內容區塊                           │
│  [喜愛]       │         （影片 embed / 縮圖）                   │
│  [收藏]       │                                                 │
│  [訂閱貼文]   │  [創作者名字]                                   │
│               │  觀看次數統計   喜愛次數   收藏次數             │
└───────────────┴─────────────────────────────────────────────────┘
```

- **左側邊欄（個人化版面）**：搜尋、發文、喜愛、收藏、訂閱貼文，各為獨立可點擊按鈕
- **內容區塊右上角**：顯示「原始連結」按鈕（`target="_blank"` 跳轉原始平台）
- **內容底部**：創作者名字（可點擊進創作者頁）、觀看次數、喜愛次數、收藏次數

**側邊欄互動行為（Active 狀態）：**
- 點擊「喜愛」→ 高亮顯示喜愛項目，右側內容區改為顯示使用者曾喜愛的內容
- 點擊「收藏」→ 同上，顯示收藏的內容
- 點擊「訂閱貼文」→ 同上，顯示訂閱創作者的最新貼文

**⚠️ 搜尋功能設計說明：** 點擊「搜尋」時，**不跳轉新頁面**，現有首頁版面維持不變（搜尋欄位擴展於側邊欄內）。PDF 第 4 頁已用紅色 X 標記「另開新頁搜尋」的設計為**廢棄方案**。

---

#### 8.5.2 創作者頁（點進創作者名字區）

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]        首頁  訊息  通知  個人資料  語言                  │
└─────────────────────────────────────────────────────────────────┘
┌───────────────┬─────────────────────────────────────────────────┐
│  個人化版面    │  ┌─────────────────────────────────────────┐   │
│               │  │  [封面橫幅圖]                        [⋮] │   │
│  免費訂閱     │  │  [頭像]  創作者名稱                  國籍 │   │
│               │  │         @handle                          │   │
│  訂閱方案1    │  │         XXX 貼文・XXX 愛心               │   │
│  訂閱方案2    │  └─────────────────────────────────────────┘   │
│  訂閱方案3    │                                                 │
│  單篇解鎖     │  創作者簡介...顯示更多                         │
│               │                                                 │
└───────────────┴─────────────────────────────────────────────────┘
```

- **左側欄（訂閱選項）**：免費訂閱、訂閱方案1、訂閱方案2、訂閱方案3、單篇解鎖
- **創作者資訊卡片**：封面橫幅、頭像、顯示名稱、@handle、貼文數、愛心數、國籍標示、右上角 `[⋮]` 選單
- **簡介區**：顯示前幾行，附「顯示更多」展開

**往下滾動（同頁繼續）：**

```
┌───────────────┬─────────────────────────────────────────────────┐
│  （同上）      │  [創作者頭像]  創作者名稱          多久前發文    │
│               │                                                 │
│               │              公開大眾內容區塊                   │
│               │         （無需訂閱即可瀏覽的貼文）               │
│               │                                                 │
│               │  觀看次數 12.1K   喜愛 5k   打賞 累計次數  動作  │
└───────────────┴─────────────────────────────────────────────────┘
```

- **貼文元資料**：頭像、創作者名、發文時間（相對時間：「X 分鐘前」）
- **互動統計**：觀看次數、喜愛次數、打賞累計次數
- **動作**：打賞按鈕（點擊後觸發打賞流程）

---

#### 8.5.3 發文頁（點了「發文」後）

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]        首頁  訊息  通知  個人資料  語言                  │
└─────────────────────────────────────────────────────────────────┘
┌───────────────┬─────────────────────────────────────────────────┐
│  回上一步      │  ┌─────────────────────────────────────────┐   │
│               │  │  文章輸入之標題處                        │   │
│  排程：立即   │  └─────────────────────────────────────────┘   │
│               │  [ 文章內容 ▼ ] [B] [I] [U] [S] [🔗] [🖼]      │
│  觀看對象：   │  ┌─────────────────────────────────────────┐   │
│  ┌──────────┐ │  │                                         │   │
│  │誰可以看  │ │  │  內容輸入                               │   │
│  │◉ 公開   │ │  │                                         │   │
│  │○ 付費或 │ │  └─────────────────────────────────────────┘   │
│  │  訂閱   │ │                                                 │
│  │○ 僅付費 │ │                                                 │
│  │○ 僅訂閱 │ │                                                 │
│  └──────────┘ │                                                 │
│  版權設定：   │                                                 │
│  [發文]       │                                                 │
└───────────────┴─────────────────────────────────────────────────┘
```

- **左側欄**：
  - 回上一步（返回首頁）
  - **排程**：預設「立即」（後期可擴充排程發文）
  - **觀看對象**（Radio 選項）：
    1. 公開，大家都看得到
    2. 付費解鎖，或訂閱都能看到
    3. 僅限付費解鎖貼文才能看到
    4. 僅限訂閱用戶看到
  - **版權設定**（可展開，內容待定）
  - **[發文]** 送出按鈕
- **右側編輯器**：
  - 標題輸入框（單行）
  - 富文字工具列：文章內容選擇器、粗體、斜體、底線、刪除線、插入連結、插入圖片
  - 內容輸入區（多行，WYSIWYG）

---

#### 8.5.4 訊息頁（點了「訊息」後）

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]        首頁  訊息  通知  個人資料  語言                  │
└─────────────────────────────────────────────────────────────────┘
┌───────────────┬─────────────────────────────────────────────────┐
│  回上一步      │  [X]  使用者或創作者ID1                         │
│               │  ┌─────────────────────────────────────────┐   │
│  [全部] [优先级2] [未讀3]                                    │   │
│               │  │                                         │   │
│  使用者/ID1   │  │           內容區塊（訊息記錄）            │   │
│  使用者/ID2   │  │                                         │   │
│               │  └─────────────────────────────────────────┘   │
│  個人化版面   │  ┌─────────────────────────────────────────┐   │
│               │  │  輸入框               [打賞] [傳送]     │   │
│               │  └─────────────────────────────────────────┘   │
└───────────────┴─────────────────────────────────────────────────┘
```

- **左側欄（對話列表）**：
  - 回上一步
  - 篩選 Tab：全部 / 优先级（顯示未讀數 Badge）/ 未讀（顯示未讀數 Badge）
  - 對話列表：使用者或創作者 ID（可多筆）
- **右側（對話視窗）**：
  - 標題列：[X] 關閉、對方 ID
  - 訊息記錄區（可捲動）
  - 底部輸入列：文字輸入框 + **打賞** 按鈕 + **傳送** 按鈕
  - 打賞按鈕：在訊息中直接給創作者打賞虛擬貨幣/金額

---

#### 8.5.5 通知（點了「通知」後）

通知**不跳頁**，而是在首頁版面維持的情況下，於 Header 的「通知」按鈕正下方**直接彈出訊息 Dropdown**。

```
         ┌────────────────────┐
         │    直接跳出訊息     │  ← Dropdown，顯示通知列表
         │                    │
         └────────────────────┘
```

- 樣式：藍色背景 Dropdown，從 Header 通知按鈕下方展開
- 內容：通知列表（新訂閱者、新訊息、付款狀態更新等）

---

#### 8.5.6 個人資料頁（點了「個人資料」後）

個人資料頁為**全寬頁面**（無左側欄），以 Cards 佈局呈現各設定區塊：

```
Header（同全站）
─────────────────────────────────────────
  個人設定        ← Tab 標題，底部紅色底線

  ┌─────────────────────────────────────┐
  │  暱稱設定                           │
  │  您在平台的專屬暱稱                 │
  │  [________________________]         │  ← 文字輸入
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │  上傳頭像                           │
  │       ┌───┐                        │
  │       │ 📷 │                        │  ← 圓形頭像上傳
  │       └───┘                        │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │  上傳封面                           │
  │  ┌─────────────────────────────┐   │
  │  │            📷               │   │  ← 橫幅封面上傳
  │  └─────────────────────────────┘   │
  │  提示：                            │
  │  1. 沒有封面 → 乾淨模式（類似IG）  │
  │  2. 有封面   → 封面模式（類似FB）  │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │  自我介紹                           │
  │  ┌─────────────────────────────┐   │
  │  │ 請輸入自我介紹，或其他讓使用│   │
  │  │ 者更了解你的資訊            │   │  ← Textarea
  │  └─────────────────────────────┘   │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │  訂閱與購買頻道設定                 │
  │  設定價錢，讓支持者訂閱或購買頻道   │
  │  支援 ATM 轉帳、超商代收、信用卡、  │
  │  中國銀聯卡                         │
  │  ⚠️ 此功能需成為創作者後，才能啟用  │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │  留言設定                           │
  │  ⚠️ 此功能需成為創作者後，才能啟用  │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │  版權保護設定                       │
  │  ⚠️ 此功能需成為創作者後，才能啟用  │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │  出金方式設定                       │
  │  我們會匯款到您所填寫的銀行帳號     │
  │  [開始設定]  ← 紅色按鈕             │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │  刪除帳號                           │
  │  帳號刪除後將無法恢復，請謹慎操作。 │
  │  刪除前請先自行將頻道內的貼文刪除。 │
  │  [刪除帳號]  ← 深色按鈕             │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │           儲存設定                  │  ← 全寬黑色按鈕，固定在頁底
  └─────────────────────────────────────┘
```

**設定欄位說明：**

| 欄位 | 說明 | 需求 |
|:-----|:-----|:-----|
| 暱稱設定 | 平台顯示名稱 | 所有用戶 |
| 國籍選項 | 新增/選擇母國 | 所有用戶 |
| 上傳頭像 | 圓形，圓形裁切 | 所有用戶 |
| 上傳封面 | 橫幅，無封面則 IG 乾淨模式；有封面則 FB 封面模式 | 所有用戶 |
| 自我介紹 | Textarea | 所有用戶 |
| 訂閱與購買頻道設定 | 設定訂閱方案價格 | **需先成為創作者** |
| 留言設定 | 管理留言權限 | **需先成為創作者** |
| 版權保護設定 | 版權聲明設定 | **需先成為創作者** |
| 出金方式設定 | 填寫銀行帳號供匯款 | **需先成為創作者** |
| 刪除帳號 | 不可逆操作，需先自行刪除貼文 | 所有用戶 |

---

#### 8.5.7 頁面路由總覽

| 路由 | 頁面 | 元件 |
|:-----|:-----|:-----|
| `/` | 首頁（內容 Feed） | `ContentFeed`, `Sidebar`, `BottomNav` |
| `/creator/[id]` | 創作者主頁 | `CreatorProfile`, `SubscriptionPanel` |
| `/post/new` | 發文頁 | `PostEditor`, `PostSettings` |
| `/messages` | 訊息列表 + 對話視窗 | `MessageList`, `ChatWindow` |
| `/profile/settings` | 個人設定 | `ProfileSettings` |
| `通知` | 不跳頁，Dropdown | `NotificationDropdown` |
| `搜尋` | 不跳頁，側邊欄展開 | `SearchPanel`（內嵌於 Sidebar） |

---

## 8. 安全性設計

| 風險 | 對策 |
|:-----|:-----|
| 未授權存取 Premium 內容 | FastAPI 驗證 Supabase JWT + 訂閱狀態，Supabase RLS 雙重保護 |
| 18+ 內容合規 | 台灣個資法合規，Age Gate 自我聲明 + IP/時間戳記錄，符合中華民國刑法第 235 條規範 |
| 管理員帳號保護 | Supabase 自訂 Role（`admin`），FastAPI `require_admin` Dependency |
| CORS | 明確設定 `allow_origins` 為 Vercel domain，禁止 wildcard `*` |
| Rate Limiting | FastAPI + `slowapi` 限制 `/api/v1/payments` 5 req/min/IP |
| 截圖偽造 | 人工審核為主，後期可加 OCR 驗證金額 |
| Storage 安全 | `payment-receipts` bucket 設為 **Private**，只透過 presigned URL 存取 |

---

## 9. 環境變數規範

```bash
# .env.example

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=...         # 後端專用 service_role key（勿洩漏）
SUPABASE_ANON_KEY=...            # 前端用 anon key

# Translation
GOOGLE_TRANSLATE_API_KEY=...

# Redis (Upstash)
UPSTASH_REDIS_URL=rediss://...
UPSTASH_REDIS_TOKEN=...

# 通知（優先序：LINE Notify → 台灣 SMS）
LINE_NOTIFY_TOKEN=...           # 管理員群組 Notify token（用於新單通知管理員）
MITAKE_USERNAME=...             # 簡訊通帳號（備援 SMS）
MITAKE_PASSWORD=...

# 支付
# Phase 1：固定帳號（人工審核）
PAYMENT_BANK_CODE=807           # 永豐銀行代碼
PAYMENT_ACCOUNT=...             # 收款帳號（顯示給用戶）

# Phase 2：永豐虛擬帳號 API
SINOPAC_API_URL=https://api.sinopac.com/...
SINOPAC_MERCHANT_ID=...
SINOPAC_API_KEY=...
SINOPAC_WEBHOOK_SECRET=...      # HMAC 簽章驗證金鑰

# App
FRONTEND_URL=https://subspark.com
ADMIN_SECRET=...                 # 額外管理員驗證層
```

---

## 10. CI/CD 流程

```yaml
# .github/workflows/deploy.yml（概念）
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    # 1. 執行 pytest
    # 2. Build Docker image
    # 3. Push 至 Koyeb（透過 koyeb CLI 或 webhook）

  deploy-frontend:
    # Vercel 自動偵測 main branch push，無需額外設定
```

---

## 11. 短期里程碑

### Phase 1 — MVP 核心（2-3 週）
- [ ] Supabase 初始化（**日本區域** ap-northeast-1 + RLS 設定）
- [ ] FastAPI 基礎架構 + JWT 驗證 + Health Check + UptimeRobot 監控
- [ ] Next.js 專案初始化 + i18n 設定（zh-TW/vi/id/th/tl/en）
- [ ] Email OTP + LINE Login 登入流程
- [ ] 手動新增創作者與內容（Admin API）

### Phase 2 — 支付閉環（1-2 週）
- [ ] Supabase Storage 截圖上傳（presigned URL 流程）
- [ ] ATM 轉帳截圖申請 API + 管理員審核 API
- [ ] LINE Notify 綁定流程 + 審核通過推播通知
- [ ] 備援 SMS：簡訊通 (mitake) 串接（台灣門號，NT$0.2/則）

### Phase 3 — 內容自動化（2-3 週）
- [ ] APScheduler 排程框架建立
- [ ] TikTok 內容爬蟲（先從單帳號測試）
- [ ] Google Translate API + Upstash Redis 快取
- [ ] 付費牆邏輯（前端 + 後端訂閱狀態驗證）

### Phase 4 — 上線準備
- [ ] Cloudflare Domain 設定（前後端子網域）
- [ ] UptimeRobot 監控（防 cold start）
- [ ] Sentry 錯誤追蹤整合
- [ ] Age Gate 與法律免責頁面

---

## 12. 風險清單

| 風險 | 可能性 | 影響 | 緩解方案 |
|:-----|:-------|:-----|:---------|
| TikTok 爬蟲被封 | 高 | 中 | MVP 先手動，後期用代理輪換 |
| Koyeb 免費方案終止 | 低 | 高 | Docker 化確保可遷移至 Render/Railway |
| Supabase 免費額度超限 | 中 | 中 | 監控用量，超限前升級 Pro（$25/月）|
| 翻譯 API 費用超支 | 中 | 低 | Redis 快取 + 每月用量告警 |
| 18+ 內容法律問題（台灣） | 中 | 高 | 中華民國刑法第 235 條合規，初期定位為「創作者訂閱平台」 |
| 匯款截圖偽造 | 中 | 中 | 人工審核 + 銀行帳號對帳 |

---

## 13. 未來擴展路徑

```
台灣首發（免費）               台灣擴張（付費）              進軍東南亞本地
─────────────────────────────────────────────────────────────────────────
Koyeb Free              →     Koyeb Pro / Railway       →   AWS ECS（新加坡）
Supabase Free (日本)    →     Supabase Pro ($25/月)     →   Supabase Enterprise（多區域）
ATM 截圖 + LINE Notify  →     超商代碼繳費 + LINE Pay   →   GoPay / PromptPay / GCash
Email + LINE Login      →     台灣簡訊 OTP              →   WhatsApp Business API
APScheduler（內嵌）     →     Celery + Upstash Redis    →   AWS SQS / Kafka
繁中 + 移工語言         →     完整在地化各國語言        →   各國獨立 SEO 域名
```

**市場擴張評估指標：**
- 達到 500 付費訂閱用戶 → 升級 Supabase Pro
- 台灣流量穩定 → 開設越南/印尼本地語系站點
- 月收入 > NT$50,000 → 評估超商代碼繳費 API 成本
