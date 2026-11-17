// Shared by capture.mjs and render.mjs: launches headless Chrome with WebGL and gives a page whose
// clock only moves when we step it (see vclock.js), so captured frames are exactly 1/30 s apart.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

export const ORIGIN = process.env.PROMO_ORIGIN ?? 'http://localhost:5173';
export const FPS = 30;
const VCLOCK = readFileSync(new URL('./vclock.js', import.meta.url), 'utf8');

function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const omp = join(homedir(), '.omp/puppeteer/chrome');
  if (existsSync(omp)) {
    for (const dir of readdirSync(omp).sort().reverse()) {
      const bin = join(omp, dir, 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
      if (existsSync(bin)) return bin;
    }
  }
  return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
}

export async function launch() {
  return puppeteer.launch({
    executablePath: chromePath(),
    headless: true,
    args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars', '--mute-audio'],
  });
}

// width/height are CSS pixels; scale is the device pixel ratio of the captured frames.
export async function openPage(browser, { width, height, scale = 1, clockOn = false }) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: scale });
  await page.evaluateOnNewDocument(VCLOCK.replace('on: false', `on: ${clockOn}`));
  const cdp = await page.createCDPSession();
  const js = async (expression) => {
    const { result, exceptionDetails } = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (exceptionDetails) throw new Error(`${expression}: ${exceptionDetails.exception?.description ?? exceptionDetails.text}`);
    return result.value;
  };
  return { page, cdp, js };
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
