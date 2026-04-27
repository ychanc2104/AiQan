import { test, expect } from '@playwright/test'

// ─────────────────────────────────────────────────────────────────────────────
// 1. Landing page (/)
// ─────────────────────────────────────────────────────────────────────────────
test('landing page loads with no console errors', async ({ page }) => {
  const errors: string[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      const ignored = [
        'favicon',
        '404',
        'net::ERR_',
        'tiktok',
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
  await page.waitForFunction(() => document.readyState === 'complete')

  expect(errors, `Console errors found:\n${errors.join('\n')}`).toHaveLength(0)
})

test('landing page shows AiQan logo', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  await expect(page.getByText('AiQan')).toBeVisible()
})

test('landing page has 4 feature sections', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')

  const features = page.locator('section h2')
  expect(await features.count()).toBeGreaterThanOrEqual(4)
})

test('landing CTA button links to /home', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')

  const ctaLink = page.locator('a[href="/home"]').first()
  await expect(ctaLink).toBeVisible()
})

test('landing page footer shows copyright', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')

  await expect(page.getByText(/AiQanCorp/)).toBeVisible()
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. Home / feed page (/home)
// ─────────────────────────────────────────────────────────────────────────────
test('home page loads with no console errors', async ({ page }) => {
  const errors: string[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      const ignored = [
        'favicon',
        '404',
        'net::ERR_',
        'tiktok',
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

  await page.goto('/home')
  await page.waitForFunction(() => document.readyState === 'complete')

  expect(errors, `Console errors found:\n${errors.join('\n')}`).toHaveLength(0)
})

test('home page header shows AiQan branding', async ({ page }) => {
  await page.goto('/home')
  await page.waitForLoadState('domcontentloaded')

  await expect(page.locator('header')).toBeVisible()
  await expect(page.getByText('AiQan')).toBeVisible()
})

test('home page content cards are rendered', async ({ page }) => {
  await page.goto('/home')
  await page.waitForLoadState('domcontentloaded')

  const cards = page.locator('[data-testid="content-card"]')
  await expect(cards.first()).toBeVisible({ timeout: 10_000 })
  expect(await cards.count()).toBeGreaterThan(0)
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. Dark mode
// ─────────────────────────────────────────────────────────────────────────────
test('dark mode toggle adds .dark class to <html>', async ({ page }) => {
  await page.goto('/home')
  await page.evaluate(() => localStorage.setItem('theme', 'light'))
  await page.reload()
  await page.waitForLoadState('domcontentloaded')

  const html = page.locator('html')
  await expect(html).not.toHaveClass(/\bdark\b/)

  const toggle = page.getByRole('button', { name: '切換深色模式' })
  await expect(toggle).toBeVisible()
  await toggle.click()

  await expect(html).toHaveClass(/\bdark\b/)

  const bgColor = await page.evaluate(() =>
    getComputedStyle(document.body).backgroundColor
  )
  expect(bgColor).not.toBe('rgb(255, 255, 255)')
})

test('dark mode toggle switches back to light mode', async ({ page }) => {
  await page.goto('/home')
  await page.evaluate(() => localStorage.setItem('theme', 'dark'))
  await page.reload()
  await page.waitForLoadState('domcontentloaded')

  const html = page.locator('html')
  await expect(html).toHaveClass(/\bdark\b/)

  await page.getByRole('button', { name: '切換深色模式' }).click()
  await expect(html).not.toHaveClass(/\bdark\b/)
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. Native posts (/home)
// ─────────────────────────────────────────────────────────────────────────────
test('home page shows native user posts without external embeds', async ({ page }) => {
  await page.goto('/home')
  await page.waitForLoadState('domcontentloaded')

  await expect(page.locator('iframe[src*="youtube.com/embed"]')).toHaveCount(0)
  await expect(page.locator('.tiktok-embed')).toHaveCount(0)
  await expect(page.locator('iframe[src*="instagram.com"]')).toHaveCount(0)

  const cards = page.locator('[data-testid="content-card"]')
  await expect(cards.first()).toContainText('今天下班後在台北車站附近找到一間超好吃的越南河粉')
})
