// @ts-check
/**
 * Motel demo capture script.
 *
 * Drives a headless Chromium through the core guest journey and records:
 *   - a full-quality WebM/MP4 screen recording (Playwright compositor capture)
 *   - PNG screenshots at each meaningful step
 *
 * Usage:
 *   1. Start the stack:  bun run dev            (API :3001, web :3000)
 *   2. Seed the data:    bun run db:seed
 *   3. Record:           node scripts/record-demo.mjs
 *
 * Override targets with env vars:
 *   WEB_URL (default http://localhost:3000)
 *   OUT_DIR (default docs/demo)
 *
 * NOTE: Playwright's recordVideo captures real composited page frames, so the
 * output is never a black screen — unlike naive X11/ffmpeg grabs of a headless
 * session that record before the page has painted.
 */
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';
const OUT_DIR = join(REPO_ROOT, process.env.OUT_DIR || 'docs/demo');
const RAW_DIR = join(OUT_DIR, '.raw');

const VIEWPORT = { width: 1440, height: 900 };

/** Resolve the Playwright module whether or not it is a project dependency. */
async function loadChromium() {
  const { homedir } = await import('node:os');
  const candidates = [
    'playwright',
    join(REPO_ROOT, 'node_modules/playwright/index.mjs'),
    // Playwright installed globally via mise (npm global toolchain).
    join(
      homedir(),
      '.local/share/mise/installs/npm-playwright/latest/node_modules/playwright/index.mjs',
    ),
  ];
  for (const spec of candidates) {
    try {
      const mod = await import(spec);
      return mod.chromium;
    } catch {
      /* try next */
    }
  }
  throw new Error('Playwright not found. Install it with: bun add -d playwright');
}

/** @param {import('playwright').Page} page */
async function shot(page, name, { fullPage = false } = {}) {
  const path = join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage });
  console.log(`  📸 screenshot -> docs/demo/${name}.png`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  rmSync(RAW_DIR, { recursive: true, force: true });
  mkdirSync(RAW_DIR, { recursive: true });

  const chromium = await loadChromium();

  console.log(`🎬 Recording motel demo against ${WEB_URL}`);
  const browser = await chromium.launch({ headless: true, timeout: 60_000 });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: RAW_DIR, size: VIEWPORT },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(45_000);

  try {
    // 1. Home — discover Beachfront listings ------------------------------
    await page.goto(WEB_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('article', { timeout: 40_000 });
    await page.waitForTimeout(2200); // let images + entry animations settle
    await shot(page, 'screenshot', { fullPage: true });
    await shot(page, '01-home');

    // 2. Filter by category — Cabins --------------------------------------
    await page.getByRole('button', { name: 'Cabins' }).click();
    await page.waitForTimeout(1800);
    await shot(page, '02-category-cabins');

    // 3. Open a listing detail page ---------------------------------------
    await page.locator('article a').first().click();
    await page.waitForURL(/\/listings\//, { timeout: 40_000 });
    await page.waitForSelector('text=Reserve', { timeout: 40_000 });
    await page.waitForTimeout(1500);
    await shot(page, '03-listing-detail', { fullPage: true });

    // 4. Reserve — confirm the booking ------------------------------------
    await page.getByRole('button', { name: 'Reserve', exact: true }).click();
    await page.waitForSelector('text=Reservation confirmed', { timeout: 40_000 });
    await page.waitForTimeout(1200);
    await shot(page, '04-reservation-confirmed');

    // 5. Trips — review confirmed reservations ----------------------------
    await page.goto(`${WEB_URL}/trips`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Trips', { timeout: 40_000 });
    await page.waitForTimeout(1600);
    await shot(page, '05-trips', { fullPage: true });

    // 6. Become a host — the 7-step listing wizard ------------------------
    await page.goto(`${WEB_URL}/host/create`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await shot(page, '06-host-wizard', { fullPage: true });
  } finally {
    // Closing the context finalises the WebM recording on disk.
    await context.close();
    await browser.close();
  }

  const rawVideo = await page.video().path();
  console.log(`\n✅ Raw recording: ${rawVideo.replace(REPO_ROOT + '/', '')}`);
  console.log('   Convert to mp4/gif with:');
  console.log('     bun run demo:video && bun run demo:gif');
}

main().catch((err) => {
  console.error('❌ record-demo failed:', err);
  process.exit(1);
});
