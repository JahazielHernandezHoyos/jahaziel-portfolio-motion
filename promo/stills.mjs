// Real public pages used as intercut inserts in the promo, captured at 1920x1080.
//
//   node promo/stills.mjs

import { mkdirSync } from 'node:fs';
import { launch, sleep } from './browser.mjs';

const OUT = new URL('./build/stills/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const STILLS = {
  github: { url: 'https://github.com/JahazielHernandezHoyos', scrollTo: '.js-yearly-contributions' },
  openwahi: { url: 'https://github.com/JahazielHernandezHoyos/openwahi' },
};

const browser = await launch();
try {
  for (const [name, s] of Object.entries(STILLS)) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1.5 });
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    await page.goto(s.url, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(1200);
    if (s.scrollTo) await page.evaluate((sel) => document.querySelector(sel)?.scrollIntoView({ block: 'center' }), s.scrollTo);
    await sleep(600);
    await page.screenshot({ path: `${OUT}${name}.jpg`, type: 'jpeg', quality: 92 });
    await page.close();
    console.log(`${name} ✓`);
  }
} finally {
  await browser.close();
}
