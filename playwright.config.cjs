const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests/browser',
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: process.env.QUIZ_TEST_URL || 'http://localhost:3100',
    channel: 'chrome',
    viewport: { width: 1440, height: 1000 },
    screenshot: 'only-on-failure',
  },
})
