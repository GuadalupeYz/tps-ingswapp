import { defineConfig, devices } from '@playwright/test';

// Catálogo de la biblioteca de la UM (sistema Koha).
// Se puede cambiar sin tocar el código: BIBLIOTECA_URL=https://... npx playwright test
const BIBLIOTECA_URL = process.env.BIBLIOTECA_URL ?? 'https://biblioteca.um.edu.ar';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BIBLIOTECA_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
