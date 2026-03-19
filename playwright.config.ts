import { defineConfig } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const headlessShellExecutablePath = (() => {
  const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH
  if (!browsersPath) return undefined

  const entries = fs.readdirSync(browsersPath, { withFileTypes: true })
  const headlessShellDir = entries.find(
    (e) => e.isDirectory() && e.name.startsWith('chromium_headless_shell-'),
  )?.name
  if (!headlessShellDir) return undefined

  const base = path.join(browsersPath, headlessShellDir)
  const arm64 = path.join(base, 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell')
  const x64 = path.join(base, 'chrome-headless-shell-mac-x64', 'chrome-headless-shell')

  if (fs.existsSync(arm64)) return arm64
  if (fs.existsSync(x64)) return x64
  return undefined
})()

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    headless: true,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 },
        launchOptions: headlessShellExecutablePath ? { executablePath: headlessShellExecutablePath } : undefined,
      },
    },
  ],
})

