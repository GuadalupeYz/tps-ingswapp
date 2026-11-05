import { defineConfig, devices } from '@playwright/test';

// Diario digital sobre el que corre el test E2E.
// Se puede cambiar sin tocar el código: SITIO_URL=https://... npx playwright test
const SITIO_URL = process.env.SITIO_URL ?? 'https://www.infobae.com';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: SITIO_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
