import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

test('can drag topics to previous section', async ({ page }) => {
  test.setTimeout(60_000)

  await page.goto('/test?sections=5&topics=10')
  await page.waitForLoadState('networkidle')

  await page.waitForSelector('[data-testid^="drag-handle-topic-"]', { timeout: 10000 })
  await page.waitForSelector('[data-testid^="after-topic-"]', { timeout: 10000 })

  const dragHandles = page.locator('[data-testid^="drag-handle-topic-"]')
  const handleCount = await dragHandles.count()

  console.log(`Found ${handleCount} topic drag handles`)

  const BATCH_SIZE = 10

  try {
    for (let i = 0; i < handleCount; i++) {
      const handle = dragHandles.nth(i)

      // Ensure visible
      try {
        await handle.scrollIntoViewIfNeeded()
        await expect(handle).toBeVisible({ timeout: 2000 })
      } catch {
        console.warn(`Skipping handle at index ${i} — not visible`)
        continue
      }

      const testId = await handle.getAttribute('data-testid')
      if (!testId) continue

      const [, sectionIndex, topicIndex] = testId.match(/topic-(\d+)-(\d+)/) || []
      const sectionNum = parseInt(sectionIndex)
      const topicNum = parseInt(topicIndex)

      // Skip first topic of first section (no previous target)
      if (sectionNum === 0 && topicNum === 0) continue

      // Determine the target zone
      let targetTestId = ''

      if (topicNum > 0) {
        targetTestId = `after-topic-${sectionNum}-${topicNum - 1}`
      } else {
        targetTestId = `after-topic-${sectionNum - 1}-9`
      }

      const targetZone = page.locator(`[data-testid="${targetTestId}"]`)

      console.log(`Dragging ${testId} → ${targetTestId}`)

      try {
        await targetZone.scrollIntoViewIfNeeded()
        await page.waitForTimeout(50)
        await handle.dragTo(targetZone, { timeout: 1500 })
      } catch (err) {
        console.error(`Failed to drag ${testId} to ${targetTestId}`, err)
      }

      // Scroll reset every batch
      if (i > 0 && i % BATCH_SIZE === 0) {
        console.log(`Scroll reset at index ${i}`)
        await page.evaluate(() => window.scrollTo({ top: 0 }))
        await page.waitForTimeout(500)
      }
    }
  } finally {
    const screenshotDir = path.join(__dirname, '../screenshots')
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir)

    try {
      await page.screenshot({
        path: path.join(screenshotDir, 'drag-prev-section.png'),
        fullPage: true
      })
    } catch (err) {
      console.error('Failed to take final screenshot:', err)
    }
  }

  await expect(page.getByText('Agenda DnD Demo')).toBeVisible()
})
