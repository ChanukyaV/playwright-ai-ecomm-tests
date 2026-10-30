import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import config from '../../../config.json';

/*
 * INSTALLATION & PORTABILITY TESTING - can it be installed/deployed and run ANYWHERE
 * (your laptop, Docker, Cloud Run, another environment) without code changes?
 * For a web app that means: configuration comes from the environment, nothing is hard-coded,
 * and the same tests pass against any base URL.
 *
 * Real installation check (needs Docker) - run by hand or in CI:
 *   docker build -t shoplab platform
 *   docker run -p 8080:8080 shoplab
 *   BASE_URL=http://localhost:8080 npx playwright test -c "sdet-interview-prep/Ep1 - types-of-testing" --grep @smoke
 */

test.describe('deployment recipe (static checks on platform/Dockerfile)', () => {
  const dockerfile = readFileSync(join(__dirname, '../../../platform/Dockerfile'), 'utf8');

  test('image listens on the port given by the PORT variable', () => {
    expect(dockerfile).toMatch(/ENV PORT=8080/);
    expect(dockerfile).toMatch(/EXPOSE 8080/);
  });

  test('image starts the app without extra manual steps', () => {
    expect(dockerfile).toMatch(/CMD \["node", "server.js"\]/);
  });

  test('external services are configured by environment variables, not hard-coded', () => {
    expect(dockerfile).toMatch(/ENV OLLAMA_BASE_URL=/);
  });
});

test.describe('environment portability', () => {
  test('every environment in config.json has a valid URL, and the active one exists', () => {
    for (const [name, env] of Object.entries(config.environments)) {
      expect(() => new URL(env.baseUrl), `environment ${name}`).not.toThrow();
    }
    expect(Object.keys(config.environments)).toContain(config.activeEnvironment);
  });

  test('page links are relative, so the app works on any host', async ({ page }) => {
    await page.goto('/products');

    const hrefs = await page.locator('a[href]').evaluateAll((links) => links.map((a) => a.getAttribute('href')!));

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href, 'link must not point to a hard-coded host').not.toMatch(/^https?:\/\//);
    }
  });

  test('all assets load from the same origin and nothing fails to load', async ({ page, baseURL }) => {
    const broken: string[] = [];
    const foreignHosts = new Set<string>();
    page.on('response', (r) => { if (r.status() >= 400) broken.push(`${r.status()} ${r.url()}`); });
    page.on('request', (r) => {
      if (new URL(r.url()).origin !== new URL(baseURL!).origin) foreignHosts.add(new URL(r.url()).origin);
    });

    await page.goto('/products', { waitUntil: 'networkidle' });

    expect(broken).toEqual([]);
    expect([...foreignHosts]).toEqual([]);
  });
});
