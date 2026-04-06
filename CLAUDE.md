# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SubSpark is a subscription-based video aggregation platform for Southeast Asian communities in Taiwan (migrant workers, new residents, international students). It aggregates content from TikTok, YouTube, and Instagram. Currently only the frontend is implemented; the backend (FastAPI + Supabase) is designed but not yet built — see `design.md` for the full spec.

## Commands

All commands run from the `frontend/` directory:

```bash
npm run dev          # Dev server on http://localhost:3000
npm run dev:https    # Dev with HTTPS (required for Instagram embeds)
npm run build        # Static export to frontend/out/
npm test             # Playwright E2E tests (requires running dev server)
npm run test:ui      # Playwright with interactive UI
```

Instagram embeds require HTTPS — use `npm run dev:https` when working on Instagram embed features.

## Architecture

### Frontend (Next.js 14 App Router, static export)

```
frontend/
├── app/
│   ├── layout.tsx        # Root layout: Header + Sidebar + BottomNav + CSP meta tag
│   ├── page.tsx          # Homepage with ContentFeed
│   └── providers.tsx     # next-themes ThemeProvider wrapper
├── components/
│   ├── layout/           # Header, Sidebar (desktop), BottomNav (mobile)
│   └── content/
│       ├── ContentFeed.tsx        # Filter buttons + maps mockContent to cards
│       ├── ContentCard.tsx        # Card UI: embed + creator info + stats
│       ├── VideoEmbed.tsx         # Routes to platform-specific embed
│       └── embeds/                # TikTokEmbed, YouTubeEmbed, InstagramEmbed
└── data/
    └── mockContent.ts    # 8 sample items (4 TikTok, 2 YouTube, 2 Instagram)
```

**Responsive layout**: Desktop uses a three-column layout (sidebar + feed). Mobile uses full-width feed + fixed bottom nav. Sidebar is `hidden md:block`; BottomNav is `md:hidden`.

**Dark mode**: `next-themes` with `class` strategy. Theme toggle in Header uses a `mounted` guard to prevent SSR hydration mismatch. TikTok embeds use `key={theme}` to force remount on theme change (required for TikTok's embed.js to pick up `data-theme`).

**YouTube autoplay**: `YouTubeEmbed` uses `IntersectionObserver` to add `&autoplay=1` to the iframe src only when the element is in the viewport.

**Static export**: `next.config.mjs` sets `output: 'export'` with unoptimized images for GitHub Pages deployment.

### Content Security Policy

The CSP `frame-src` in `app/layout.tsx` explicitly allows TikTok, YouTube, and Instagram iframe origins. When adding new embed sources, update this meta tag.

### CI/CD

`.github/workflows/deploy.yml` builds from `frontend/` and deploys `frontend/out/` to GitHub Pages on push to `main`.

### Planned Backend (not yet implemented)

See `design.md` for the full spec. Key stack: FastAPI, Supabase (Postgres + Auth, Japan region), Upstash Redis, Google Translate API, LINE Notify, APScheduler for scraping. Deployment target: Koyeb free tier.
