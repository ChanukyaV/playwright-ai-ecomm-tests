import { defineConfig, devices } from '@playwright/test';
import config from '../../config.json';

const env = (process.env.TEST_ENV as keyof typeof config.environments) || config.activeEnvironment;
const baseURL = process.env.BASE_URL || config.environments[env].baseUrl;

// ShopLab keeps ONE global cart on the server, so tests must not run in parallel.
export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  workers: 1,
  fullyParallel: false,
  timeout: 30_000,
  reporter: [['list']],
  use: { baseURL, trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
