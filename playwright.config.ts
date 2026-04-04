import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  timeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000'),

  expect: {
    timeout: 10000,
  },

  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.BASE_URL,
    headless: process.env.HEADLESS !== 'false',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  projects: [
    // Authentication setup — runs first, saves session state
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },

    // UI tests — depend on auth setup, reuse saved session
    {
      name: 'chromium-ui',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: '**/ui/**/*.spec.ts',
    },

    // API tests — no browser, no auth dependency
    {
      name: 'api-tests',
      use: {
        baseURL: process.env.API_BASE_URL,
      },
      testMatch: '**/api/**/*.spec.ts',
    },
  ],

  outputDir: 'test-results/',
});