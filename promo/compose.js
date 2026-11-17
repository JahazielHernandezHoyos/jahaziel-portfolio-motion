// Draws one frame of the promo at a time (window.renderFrame(i)); render.mjs screenshots each.
// Layers, bottom to top: captured site footage (speed-ramped, motion-blurred, beat punches),
// grain and vignette, title text, then a whole-frame RGB split / slice glitch on beats and cuts,
// and finally the letterbox bars with the HUD and captions, which stay crisp.

import '@fontsource/silkscreen/700.css';
import '@fontsource-variable/anybody/standard.css';
import { catSvg } from '../src/ui/cat-svg.js';
import { DROP, DURATION, END, FPS, HITS, INTRO_WORD, KICKS, SEGMENTS, TEXT } from './timeline.js';

const lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'es';
const W = 1080;
const H = 1920;
const RED = '#ff3b30';
const PIXEL = 'Silkscreen';
const SANS = '"Anybody Variable", sans-serif';
const BAR_OPEN = 180;
const BAR_CLOSED = 555;

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const offscreen = () => {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  return c;
};
const layer = offscreen();
const L = layer.getContext('2d');
const red = offscreen();
const cyan = offscreen();

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (x) => 1 - (1 - clamp(x)) ** 3;
const rand = (i, salt = 0) => {
  const s = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
};
const lastBefore = (list, t) => {
  let best = null;
  for (const x of list) if (x <= t) best = x;
  return best;
};

let counts = {};
let grain;
let catImg;
const cache = new Map();

function load(url) {
  if (!cache.has(url)) {
    cache.set(
      url,
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`missing ${url}`));
        img.src = url;
      }),
    );
    if (cache.size > 60) cache.delete(cache.keys().next().value);
  }
  return cache.get(url);
}

const frameUrl = (clip, i) => `/promo/build/clips-${lang}/${clip}/${String(i).padStart(4, '0')}.jpg`;

function text(c, str, x, y, { size, font = SANS, weight = 800, stretch = 'normal', color = '#fff', align = 'left', spacing = 0 }) {
  c.font = `${weight} ${size}px ${font}`;
  c.fontStretch = stretch;
  c.letterSpacing = `${spacing}px`;
  c.textAlign = align;
  c.textBaseline = 'alphabetic';
  c.fillStyle = color;
  c.fillText(str, x, y);
  return c.measureText(str).width;
}

function fitSize(c, str, width, font, weight = 700) {
  c.font = `${weight} 100px ${font}`;
  c.fontStretch = 'normal';
  c.letterSpacing = '0px';
  return (width / c.measureText(str).width) * 100;
}

function barHeight(t) {
  if (t < DROP) return BAR_CLOSED;
  if (t < END) return BAR_CLOSED + (BAR_OPEN - BAR_CLOSED) * easeOut((t - DROP) / 0.32);
  return BAR_OPEN + (BAR_CLOSED - BAR_OPEN) * easeOut((t - END) / 0.35);
}

// Beat envelope: how far into the current beat we are, for punches and glitches.
function beat(t) {
  const h = lastBefore(t < DROP ? KICKS : HITS, t);
  return h === null ? Infinity : t - h;
}

async function drawFootage(seg, t, f) {
  const local = t - seg.from;
  const clipT = seg.start + local * seg.speed;
  const last = counts[seg.clip] - 1;
  const idx = Math.min(last, Math.max(0, Math.floor(clipT * FPS)));
  // One sharp frame: at 3-4x the page moves too far between captured frames to blend cleanly,
  // and text stays readable; speed comes from the cuts and beat punches instead.
  const imgs = [await load(frameUrl(seg.clip, idx))];

  const p = beat(t);
  const punch = p < 0.22 ? (t < DROP ? 0.03 : 0.06) * (1 - p / 0.22) ** 2 : 0;
  const drift = 1 + 0.035 * (local / (seg.to - seg.from));
  const s = (seg.zoom ?? 1) * drift * (1 + punch);

  L.save();
  L.fillStyle = '#000';
  L.fillRect(0, 0, W, H);
  L.translate(W / 2, H / 2 + (seg.offset ?? 0));
  L.scale(s, s);
  L.drawImage(imgs[0], -W / 2, -H / 2, W, H);
  L.restore();
  if (seg.dim) {
    L.fillStyle = `rgba(0,0,0,${seg.dim})`;
    L.fillRect(0, 0, W, H);
  }
}

function drawGrainAndVignette(f) {
  L.save();
  L.globalCompositeOperation = 'overlay';
  L.globalAlpha = 0.22;
  const ox = Math.floor(rand(f, 1) * 512);
  const oy = Math.floor(rand(f, 2) * 512);
  for (let x = -ox; x < W; x += 512) for (let y = -oy; y < H; y += 512) L.drawImage(grain, x, y);
  L.restore();
  const g = L.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.55)');
  L.fillStyle = g;
  L.fillRect(0, 0, W, H);
}

// Intro: each beat shows one letter of the name, alone, at its place in the word.
function drawIntroLetter(t, f) {
  const k = Math.max(0, KICKS.filter((x) => x <= t).length - 1);
  const size = fitSize(L, INTRO_WORD, 880, PIXEL);
  L.font = `700 ${size}px ${PIXEL}`;
  L.letterSpacing = '0px';
  const x0 = (W - L.measureText(INTRO_WORD).width) / 2;
  const x = x0 + L.measureText(INTRO_WORD.slice(0, k)).width;
  const ch = INTRO_WORD[k];
  const w = L.measureText(ch).width;
  const p = t - KICKS[k];
  const pop = 1 + 0.35 * clamp(1 - p / 0.14) ** 2;
  const jx = (rand(f, 3) - 0.5) * 8;
  const jy = (rand(f, 4) - 0.5) * 8;
  const y = 1180;

  L.save();
  L.globalAlpha = rand(f, 5) < 0.1 ? 0.35 : 1;
  L.translate(x + w / 2 + jx, y - size * 0.35 + jy);
  L.scale(pop, pop);
  L.shadowColor = RED;
  L.shadowBlur = 40;
  text(L, ch, 0, size * 0.35, { size, font: PIXEL, weight: 700, color: RED, align: 'center' });
  L.restore();
}

function drawNameCard(t, f) {
  const p = t - DROP;
  const slam = 1 + 0.5 * clamp(1 - p / 0.16) ** 2;
  const size = fitSize(L, 'HERNÁNDEZ', 920, PIXEL);
  L.save();
  L.translate(W / 2, 900);
  L.scale(slam, slam);
  L.shadowColor = RED;
  L.shadowBlur = 36;
  text(L, 'JAHAZIEL', 0, -size * 0.08, { size, font: PIXEL, weight: 700, color: RED, align: 'center' });
  text(L, 'HERNÁNDEZ', 0, size * 0.92, { size, font: PIXEL, weight: 700, color: RED, align: 'center' });
  L.restore();
  const role = TEXT.role[lang];
  const shown = role.slice(0, Math.max(0, Math.floor((p - 0.14) / 0.022)));
  text(L, shown, W / 2, 900 + size * 1.55, { size: 44, stretch: 'expanded', color: '#fff', align: 'center', spacing: 2 });
}

function drawEndCard(t, f) {
  const p = t - END;
  const size = fitSize(L, 'HERNÁNDEZ', 760, PIXEL);
  const slam = 1 + 0.35 * clamp(1 - p / 0.16) ** 2;
  L.save();
  L.translate(W / 2, 880);
  L.scale(slam, slam);
  L.shadowColor = RED;
  L.shadowBlur = 30;
  text(L, 'JAHAZIEL', 0, -size * 0.08, { size, font: PIXEL, weight: 700, color: RED, align: 'center' });
  text(L, 'HERNÁNDEZ', 0, size * 0.92, { size, font: PIXEL, weight: 700, color: RED, align: 'center' });
  L.restore();
  const shown = TEXT.url.slice(0, Math.max(0, Math.floor((p - 0.1) / 0.008)));
  text(L, shown, W / 2, 880 + size * 1.75, { size: 40, weight: 700, color: '#fff', align: 'center' });
  const cat = 150;
  const nameW = (760 / 2) * slam;
  L.drawImage(catImg, W / 2 + nameW - cat * 0.9, 880 - size * 0.95 - cat * 0.98, cat, cat);
}

// Whole-frame chromatic split; cyan and red copies drift apart by dx pixels.
function composite(dx, slices, f) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  if (dx < 0.5) ctx.drawImage(layer, 0, 0);
  else {
    for (const [c, colour] of [
      [red, '#f00'],
      [cyan, '#0ff'],
    ]) {
      const g = c.getContext('2d');
      g.globalCompositeOperation = 'source-over';
      g.drawImage(layer, 0, 0);
      g.globalCompositeOperation = 'multiply';
      g.fillStyle = colour;
      g.fillRect(0, 0, W, H);
    }
    ctx.drawImage(red, -dx, 0);
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(cyan, dx, 0);
    ctx.globalCompositeOperation = 'source-over';
  }
  for (let i = 0; i < slices; i++) {
    const y = Math.floor(rand(f, 10 + i) * H);
    const h = 18 + Math.floor(rand(f, 30 + i) * 110);
    const ox = (rand(f, 50 + i) - 0.5) * 140;
    ctx.drawImage(layer, 0, y, W, h, ox, y, W, h);
  }
}

function drawBarsAndHud(t, seg, f) {
  const bar = barHeight(t);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, bar);
  ctx.fillRect(0, H - bar, W, bar);
  if (t < DROP + 0.25 || t >= END || bar > BAR_OPEN + 30) return;

  const onBeat = beat(t) < 0.15;
  ctx.fillStyle = RED;
  if (onBeat) ctx.fillRect(60, 84, 16, 16);
  text(ctx, 'JAHAZIEL HERNÁNDEZ', 92, 102, { size: 28, stretch: 'expanded', color: '#fff' });
  text(ctx, TEXT.hud[lang], W - 60, 102, { size: 26, weight: 400, stretch: 'condensed', color: '#9aa0a6', align: 'right' });

  if (!seg.caption) return;
  const captioned = SEGMENTS.filter((s) => s.caption);
  const n = captioned.indexOf(seg) + 1;
  const caption = seg.caption[lang];
  const typed = Math.floor((t - seg.from) / 0.016);
  const shown = caption.slice(0, typed);
  const y = H - BAR_OPEN / 2 + 18;
  const w = text(ctx, shown, 60, y, { size: 50, font: PIXEL, weight: 700, color: '#fff' });
  if (typed < caption.length || Math.floor(t * 4) % 2 === 0) {
    ctx.fillStyle = RED;
    ctx.fillRect(60 + w + 10, y - 40, 26, 44);
  }
  text(ctx, `${String(n).padStart(2, '0')}/${String(captioned.length).padStart(2, '0')}`, W - 60, y, { size: 30, font: PIXEL, weight: 700, color: RED, align: 'right' });
}

window.setup = async (clipCounts) => {
  counts = clipCounts;
  await Promise.all([document.fonts.load(`700 100px ${PIXEL}`), document.fonts.load(`800 40px ${SANS}`), document.fonts.load(`400 40px ${SANS}`)]);
  grain = document.createElement('canvas');
  grain.width = grain.height = 512;
  const g = grain.getContext('2d');
  const data = g.createImageData(512, 512);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = Math.floor(rand(i / 4, 7) * 255);
    data.data[i] = data.data[i + 1] = data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  g.putImageData(data, 0, 0);
  catImg = await load(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(catSvg('tuxedo', 'sit').replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '))}`);
  return true;
};

window.renderFrame = async (f) => {
  const t = f / FPS;
  const seg = SEGMENTS.find((s) => t >= s.from && t < s.to) ?? SEGMENTS[SEGMENTS.length - 1];

  await drawFootage(seg, t, f);
  drawGrainAndVignette(f);
  if (seg.kind === 'intro') drawIntroLetter(t, f);
  if (seg.kind === 'name') drawNameCard(t, f);
  if (seg.kind === 'end') drawEndCard(t, f);

  const p = beat(t);
  const sinceCut = t - seg.from;
  const dx = p < 0.15 ? (t < DROP ? 10 : 18) * (1 - p / 0.15) : 0;
  const slices = sinceCut < 0.1 && seg.from > 0 ? 7 : 0;
  composite(dx, slices, f);
  drawBarsAndHud(t, seg, f);

  if (t >= DROP && t < DROP + 0.12) {
    ctx.fillStyle = `rgba(255,255,255,${0.9 * (1 - (t - DROP) / 0.12)})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (t > DURATION - 0.15) {
    ctx.fillStyle = `rgba(0,0,0,${clamp((t - (DURATION - 0.15)) / 0.15)})`;
    ctx.fillRect(0, 0, W, H);
  }
  return true;
};
