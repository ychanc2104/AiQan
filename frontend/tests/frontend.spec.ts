import { test, expect } from '@playwright/test'

// ─────────────────────────────────────────────────────────────────────────────
// 1. 頁面無 error
// ─────────────────────────────────────────────────────────────────────────────
test('page loads with no console errors', async ({ page }) => {
  const errors: string[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      // Ignore expected third-party / browser noise
      const ignored = [
        'favicon',
        '404',
        'net::ERR_',               // network errors for third-party embeds
        'tiktok',                  // TikTok embed may log non-critical errors
        'instagram',
        'youtube',
        'chrome-extension',
        'com.chrome.devtools',
      ]
      if (!ignored.some((s) => text.toLowerCase().includes(s))) {
        errors.push(text)
      }
    }
  })

  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')

  // Wait for React hydration to complete
  await page.waitForFunction(() => document.readyState === 'complete')

  expect(errors, `Console errors found:\n${errors.join('\n')}`).toHaveLength(0)
})

test('header and nav render correctly', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('header')).toBeVisible()
  await expect(page.getByText('SubSpark')).toBeVisible()
  await expect(page.getByRole('link', { name: '首頁' })).toBeVisible()
})

test('content cards are rendered', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')

  const cards = page.locator('[data-testid="content-card"]')
  await expect(cards.first()).toBeVisible({ timeout: 10_000 })
  expect(await cards.count()).toBeGreaterThan(0)
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. Dark mode / Light mode
// ─────────────────────────────────────────────────────────────────────────────
test('dark mode toggle adds .dark class to <html>', async ({ page }) => {
  // Start in light mode (force via localStorage before page loads)
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('theme', 'light'))
  await page.reload()
  await page.waitForLoadState('domcontentloaded')

  const html = page.locator('html')

  // Should be light initially
  await expect(html).not.toHaveClass(/\bdark\b/)

  // Click the toggle button
  const toggle = page.getByRole('button', { name: '切換深色模式' })
  await expect(toggle).toBeVisible()
  await toggle.click()

  // html element must have class="dark"
  await expect(html).toHaveClass(/\bdark\b/)

  // Visual check: body background should be dark
  const bgColor = await page.evaluate(() =>
    getComputedStyle(document.body).backgroundColor
  )
  // dark:bg-gray-950 = rgb(3, 7, 18)  (Tailwind gray-950)
  // dark:bg-gray-900 = rgb(17, 24, 39) (Tailwind gray-900)
  // Either dark value — not white (255, 255, 255)
  expect(bgColor).not.toBe('rgb(255, 255, 255)')
})

test('dark mode toggle switches back to light mode', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('theme', 'dark'))
  await page.reload()
  await page.waitForLoadState('domcontentloaded')

  const html = page.locator('html')
  await expect(html).toHaveClass(/\bdark\b/)

  await page.getByRole('button', { name: '切換深色模式' }).click()
  await expect(html).not.toHaveClass(/\bdark\b/)
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. 滑動時影片 autoplay（YouTube iframe 驗證）
// ─────────────────────────────────────────────────────────────────────────────
test('YouTube embed uses autoplay=1 when in viewport', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')

  // Scroll until a YouTube iframe comes into view
  await page.evaluate(() =>
    document.querySelector('iframe[src*="youtube"]')?.scrollIntoView({ behavior: 'instant', block: 'center' })
  )

  // Give Intersection Observer time to fire and iframe to reload with autoplay
  await page.waitForTimeout(1500)

  const ytFrame = page.locator('iframe[src*="youtube.com/embed"]').first()
  await expect(ytFrame).toBeVisible({ timeout: 8_000 })

  const src = await ytFrame.getAttribute('src')
  expect(src).toContain('autoplay=1')
})

test('TikTok blockquote embeds are present in DOM', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')

  const embeds = page.locator('.tiktok-embed')
  await expect(embeds.first()).toBeAttached({ timeout: 8_000 })
  expect(await embeds.count()).toBeGreaterThan(0)
})

test('Instagram iframe is present', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')

  const igFrame = page.locator('iframe[src*="instagram.com"]').first()
  await expect(igFrame).toBeAttached({ timeout: 8_000 })
})
