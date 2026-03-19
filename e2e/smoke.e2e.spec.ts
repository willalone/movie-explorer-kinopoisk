import { test, expect } from '@playwright/test'

test('movies page basic UI loads', async ({ page }) => {
  await page.goto('/movies', { waitUntil: 'domcontentloaded', timeout: 10_000 })
  await expect(page.getByPlaceholder('Название фильма')).toBeVisible({ timeout: 5_000 })
})

