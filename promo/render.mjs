// Renders the promo from captured clips: composes each frame in compose.html, then encodes.
//
//   npm run dev                        # in another terminal
//   node promo/capture.mjs             # once, or after the site changes
//   node promo/render.mjs [es|en]      # → promo/out/
//
// The music is the reference reel's audio, kept out of git in promo/build/reference-audio.m4a.
// Two files come out: one with that track and one silent, for adding the sound inside Instagram.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { launch, openPage, ORIGIN } from './browser.mjs';
import { DURATION, FPS } from './timeline.js';

const lang = process.argv[2] === 'en' ? 'en' : 'es';
const BUILD = new URL('./build/', import.meta.url).pathname;
const OUT = new URL('./out/', import.meta.url).pathname;
const FRAMES = `${BUILD}frames-${lang}/`;
const AUDIO = `${BUILD}reference-audio.m4a`;

const CLIPS = `${BUILD}clips-${lang}/`;
const counts = Object.fromEntries(readdirSync(CLIPS).map((c) => [c, readdirSync(`${CLIPS}${c}`).length]));
rmSync(FRAMES, { recursive: true, force: true });
mkdirSync(FRAMES, { recursive: true });
mkdirSync(OUT, { recursive: true });

const browser = await launch();
try {
  const { page, cdp, js } = await openPage(browser, { width: 1080, height: 1920, scale: 1 });
  // The first visit can make Vite optimize new deps and reload the page; load twice to be safe.
  for (let i = 0; i < 2; i++) await page.goto(`${ORIGIN}/promo/compose.html?lang=${lang}`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => typeof window.setup === 'function' && typeof window.renderFrame === 'function');
  await js(`window.setup(${JSON.stringify(counts)})`);
  const total = Math.round(DURATION * FPS);
  for (let f = 0; f < total; f++) {
    await js(`window.renderFrame(${f})`);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 95 });
    writeFileSync(`${FRAMES}${String(f).padStart(4, '0')}.jpg`, Buffer.from(data, 'base64'));
    if (f % 90 === 0) console.log(`frame ${f}/${total}`);
  }
} finally {
  await browser.close();
}

const name = `presentacion-jahaziel-${lang}`;
const video = ['-framerate', String(FPS), '-i', `${FRAMES}%04d.jpg`];
const encode = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-t', String(DURATION)];

execFileSync('ffmpeg', ['-v', 'error', '-y', ...video, ...encode, '-an', `${OUT}${name}-sin-musica.mp4`], { stdio: 'inherit' });
if (existsSync(AUDIO)) {
  execFileSync(
    'ffmpeg',
    ['-v', 'error', '-y', ...video, '-i', AUDIO, ...encode, '-af', 'apad', '-c:a', 'aac', '-b:a', '192k', `${OUT}${name}.mp4`],
    { stdio: 'inherit' },
  );
}
console.log(`done → ${OUT}`);
