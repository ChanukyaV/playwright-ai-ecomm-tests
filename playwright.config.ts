import { defineConfig, devices } from '@playwright/test';
import config from './config.json';

const env = (process.env.TEST_ENV as keyof typeof config.environments) || config.activeEnvironment;
const { baseUrl } = config.environments[env];

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: baseUrl,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
