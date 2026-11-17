// Films the real portfolio for the promo: each clip is an image sequence at 30 fps, 1080x1920
// (the site's phone layout at 540x960 CSS px, 2x). Page time only advances between frames, so
// WebGL, GSAP, Lenis and the cats move exactly 1/30 s per frame no matter how slow capture is.
//
//   npm run dev                          # in another terminal
//   node promo/capture.mjs es|en [clip ...]

import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { FPS, ORIGIN, launch, openPage, sleep } from './browser.mjs';

const lang = process.argv[2] === 'en' ? 'en' : 'es';
const OUT = new URL(`./build/clips-${lang}/`, import.meta.url).pathname;
const HOME = lang === 'en' ? '/en/' : '/';
const W = 540;
const H = 960;

// Each output frame is two 1/60 s steps: motion is sampled finely and the corridor's adaptive
// resolution sees 60 fps, so it stays at full quality.
const SUBSTEPS = 2;

const lenis = (call) => `window.__portfolio.scroller.lenis.${call}`;
const waitBooted = async (js) => {
  for (let i = 0; i < 100; i++) {
    if (await js('!document.querySelector(".preloader") && !!window.__portfolio?.scroller.lenis')) return;
    await sleep(100);
  }
  throw new Error('page did not finish booting');
};
const keys = (word) => word.split('').map((k) => `document.dispatchEvent(new KeyboardEvent('keydown',{key:'${k}',bubbles:true}));`).join('');
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

const clips = {
  // Load to settled hero: preloader, pixel portrait assembling, name decoding, cat peeking.
  hero: { path: HOME, clockOn: true, duration: 7 },

  // Fast scroll into Baubap: the poster bends with scroll speed, then plays its 4x animation.
  work: {
    path: HOME,
    prep: [lenis(`scrollTo(document.getElementById('c-baubap').offsetTop - innerHeight * 0.95, { immediate: true })`)],
    actions: [{ at: 0.05, js: lenis(`scrollTo('#c-baubap', { offset: -70, duration: 1.1 })`) }],
    duration: 4.8,
  },

  // Top 3 tabs: the black block slides, the poster pixelates and swaps, the cat hops.
  tabs: {
    path: HOME,
    prep: [lenis(`scrollTo('#c-jumpcube', { offset: -70, immediate: true })`)],
    settle: 4200,
    actions: [
      { at: 0.3, js: `document.getElementById('tab-jumpcube-1').click()` },
      { at: 2.3, js: `document.getElementById('tab-jumpcube-2').click()` },
    ],
    duration: 4.4,
  },

  // The window opens into the data-center aisle and flies through all four chapters.
  corridor: {
    path: HOME,
    prep: [lenis(`scrollTo(document.querySelector('.corridor').offsetTop - innerHeight, { immediate: true })`)],
    actions: [
      {
        at: 0.05,
        js: lenis(
          `scrollTo(document.querySelector('.corridor').offsetTop + document.querySelector('.corridor').offsetHeight - innerHeight, { duration: 6, easing: (x) => x })`,
        ),
      },
    ],
    duration: 6.3,
  },

  // Wahi: the browser frame tilts in, copy follows.
  wahi: {
    path: HOME,
    prep: [lenis(`scrollTo(document.getElementById('wahi').offsetTop - innerHeight * 0.9, { immediate: true })`)],
    actions: [{ at: 0.05, js: lenis(`scrollTo('#wahi', { offset: -60, duration: 1.3 })`) }],
    duration: 2.8,
  },

  // Typing "miau" over the yellow poster makes it rain cats.
  rain: {
    path: HOME,
    prep: [lenis(`scrollTo('#c-sena', { offset: -70, immediate: true })`)],
    settle: 4000,
    actions: [{ at: 0.15, js: keys(lang === 'en' ? 'meow' : 'miau') }],
    duration: 3.4,
  },

  // Case study: title decodes, metrics count up, then a slow scroll.
  case: {
    path: lang === 'en' ? '/en/cases/reads-71x/' : '/casos/lecturas-71x/',
    clockOn: true,
    duration: 4,
    perFrame: (t) => (t > 2 ? `window.scrollTo(0, ${Math.round(easeInOut(Math.min(1, (t - 2) / 2)) * 520)})` : null),
  },

  // Résumé: one smooth scroll down the page.
  cv: {
    path: lang === 'en' ? '/en/cv/' : '/cv/',
    duration: 3,
    perFrame: (t) => `window.scrollTo(0, ${Math.round(easeInOut(Math.min(1, t / 3)) * 1500)})`,
  },
};

async function capture(browser, name, clip) {
  const dir = `${OUT}${name}/`;
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  const { page, cdp, js } = await openPage(browser, { width: W, height: H, scale: 2, clockOn: !!clip.clockOn });
  await page.goto(`${ORIGIN}${clip.path}`, { waitUntil: 'domcontentloaded' });
  if (!clip.clockOn) {
    if (clip.path === HOME) await waitBooted(js);
    else await sleep(1500);
    for (const step of clip.prep ?? []) await js(step);
    await sleep(clip.settle ?? 600);
    await js('window.__startClock()');
  }

  const total = Math.round(clip.duration * FPS);
  const pending = [...(clip.actions ?? [])];
  for (let f = 0; f < total; f++) {
    const t = f / FPS;
    while (pending.length && pending[0].at <= t) await js(pending.shift().js);
    const per = clip.perFrame?.(t);
    if (per) await js(per);
    for (let s = 0; s < SUBSTEPS; s++) await js(`window.__step(${1000 / FPS / SUBSTEPS})`);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 93 });
    writeFileSync(`${dir}${String(f).padStart(4, '0')}.jpg`, Buffer.from(data, 'base64'));
  }
  await page.close();
  console.log(`${name}: ${total} frames`);
}

const wanted = process.argv.slice(3);
const browser = await launch();
try {
  for (const [name, clip] of Object.entries(clips)) {
    if (wanted.length && !wanted.includes(name)) continue;
    await capture(browser, name, clip);
  }
} finally {
  await browser.close();
}
