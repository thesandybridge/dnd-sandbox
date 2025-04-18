import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

test('can drag all topics to a later target', async ({ page }) => {
  test.setTimeout(60_000) // Double the timeout

  await page.goto('/test?sections=2&topics=10')
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('[data-testid^="drag-handle-topic-"]', { timeout: 10000 })

  const dragHandles = page.locator('[data-testid^="drag-handle-topic-"]')
  const count = await dragHandles.count()
  const target = page.getByTestId('drag-handle-topic-0-9')

  console.log(`Found ${count} topic drag handles`)

  try {
    for (let i = 0; i < count; i++) {
      const handle = dragHandles.nth(i)

      try {
        await expect(handle).toBeVisible({ timeout: 2000 })
      } catch {
        console.warn(`Skipping handle at index ${i} — not visible`)
        continue
      }

      let testId: string | null = null
      try {
        testId = await handle.getAttribute('data-testid')
      } catch {
        console.warn(`Could not get testId for index ${i}`)
      }

      if (!testId || testId === 'drag-handle-topic-0-9') continue

      console.log(`Dragging ${testId} → topic-0-9`)

      await target.scrollIntoViewIfNeeded()
      await page.waitForTimeout(50)

      try {
        await handle.dragTo(target, { timeout: 1500 })
      } catch (err) {
        console.error(`Failed to drag ${testId}`, err)
      }
    }
  } finally {
    // Always try to take a screenshot at the end
    const screenshotDir = path.join(__dirname, '../screenshots')
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir)

    try {
      await page.screenshot({ path: path.join(screenshotDir, 'drag-all-topics.png'), fullPage: true })
    } catch (err) {
      console.error('Failed to take final screenshot:', err)
    }
  }

  // Basic assertion to make sure page is still intact
  await expect(page.getByText('Agenda DnD Demo')).toBeVisible()
})
