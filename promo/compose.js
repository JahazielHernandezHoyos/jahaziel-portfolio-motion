// Draws one frame of the promo at a time (window.renderFrame(i)); render.mjs screenshots each.
// Cinematic grammar only: hard cuts on beats, flash frames, whip pans with real motion blur,
// snap zooms that settle, exposure punches on hits, mask reveals for type, 2.39:1 letterbox.

import '@fontsource-variable/anybody/standard.css';
import { CODE, DROP, DURATION, END, FPS, FULL_NAME, H, HITS, KICKS, NAME, ROLE, SEGMENTS, TITLES, URL, W } from './timeline.js';

const lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'es';
const SANS = '"Anybody Variable", sans-serif';
const MONO = 'Menlo, "SF Mono", monospace';
const ACCENT = '#ff3b30';
const BAR = Math.round((H - W / 2.39) / 2);
const PIC = { y: BAR, h: H - BAR * 2 };

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const layer = document.createElement('canvas');
layer.width = W;
layer.height = H;
const L = layer.getContext('2d');

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const expoOut = (x) => (x >= 1 ? 1 : 1 - 2 ** (-10 * clamp(x)));
const rand = (i, salt = 0) => {
  const s = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

let counts = {};
let grain;
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
    if (cache.size > 80) cache.delete(cache.keys().next().value);
  }
  return cache.get(url);
}
const frameUrl = (clip, i) => `/promo/build/clips-${lang}/${clip}/${String(i).padStart(4, '0')}.jpg`;
const stillUrl = (name) => `/promo/build/stills/${name}.jpg`;

function setFont(c, { size, weight = 800, stretch = '150%', spacing = 0, font = SANS }) {
  c.font = `${weight} ${size}px ${font}`;
  c.fontStretch = stretch === '150%' ? 'ultra-expanded' : stretch === '75%' ? 'condensed' : stretch;
  c.letterSpacing = `${spacing}px`;
}

// Text that rises out of a mask whose bottom edge is the baseline; p is the reveal progress.
// style.max caps the rendered width: the size shrinks to fit instead of overflowing the frame.
function revealText(c, str, x, y, p, style, align = 'center') {
  let s = style;
  if (style.max) {
    setFont(c, style);
    const w = c.measureText(str).width;
    if (w > style.max) s = { ...style, size: style.size * (style.max / w), spacing: style.spacing * (style.max / w) };
  }
  setFont(c, s);
  c.textAlign = align;
  c.textBaseline = 'alphabetic';
  const h = s.size * 1.05;
  c.save();
  c.beginPath();
  c.rect(-W * 2, y - h, W * 5, h + s.size * 0.28);
  c.clip();
  c.fillStyle = s.color ?? '#fff';
  c.fillText(str, x, y + h * (1 - expoOut(p)));
  c.restore();
  return c.measureText(str).width;
}

const beatOf = (t) => {
  let best = -Infinity;
  for (const x of t < DROP ? KICKS : HITS) if (x <= t) best = x;
  return t - best;
};

async function sourceImage(seg, local) {
  if (seg.clip) {
    const idx = Math.min(counts[seg.clip] - 1, Math.max(0, Math.floor((seg.start + local * seg.speed) * FPS)));
    return load(frameUrl(seg.clip, idx));
  }
  if (seg.still) return load(stillUrl(seg.still));
  return null;
}

function drawCode(c, local, len) {
  c.fillStyle = '#0d1117';
  c.fillRect(0, 0, W, H);
  c.fillStyle = '#161b22';
  c.fillRect(0, PIC.y, W, 64);
  setFont(c, { size: 26, weight: 500, stretch: 'normal', font: MONO });
  c.textAlign = 'left';
  c.fillStyle = '#8b949e';
  c.fillText(CODE.file, 120, PIC.y + 42);
  const lh = 50;
  const scroll = 120 + local * 260;
  const top = PIC.y + 120 - scroll;
  const kw = /\b(def|async|await|return|if|else|and|from|import|class)\b/g;
  CODE.lines.forEach((line, i) => {
    const y = top + i * lh + lh;
    if (y < PIC.y + 70 || y > PIC.y + PIC.h + lh) return;
    const active = line.includes('add_conditional_edges') || line.includes('compile');
    if (active) {
      c.fillStyle = 'rgba(56,139,253,0.18)';
      c.fillRect(0, y - lh + 12, W, lh);
    }
    let x = 160;
    const tokens = line.split(/("[^"]*"|\b\w+\b|\s+|[^\w\s"])/).filter(Boolean);
    setFont(c, { size: 34, weight: 400, stretch: 'normal', font: MONO });
    for (const tok of tokens) {
      c.fillStyle = tok.startsWith('"') ? '#a5d6ff' : kw.test(tok) ? '#ff7b72' : /^(StateGraph|ToolNode|END|AgentState)$/.test(tok) ? '#ffa657' : '#e6edf3';
      kw.lastIndex = 0;
      c.fillText(tok, x, y);
      x += c.measureText(tok).width;
    }
  });
}

// Footage or still, cover-fit into the frame, with snap zoom, slow push, beat punch, whip blur.
async function drawSource(seg, t, f) {
  const local = t - seg.from;
  const len = seg.to - seg.from;
  L.fillStyle = '#000';
  L.fillRect(0, 0, W, H);
  if (seg.black) return;

  if (seg.code) {
    drawCode(L, local, len);
  } else {
    const img = await sourceImage(seg, local);
    const snap = seg.enter === 'cut' || seg.enter === 'flash' ? 0.09 * (1 - expoOut(local / 0.35)) : 0;
    const push = seg.still ? 0.12 + 0.1 * (local / len) : 0.05 * (local / len);
    const b = beatOf(t);
    const punch = t >= DROP && b < 0.12 ? 0.012 * (1 - b / 0.12) : 0;
    const s = 1 + snap + push + punch;
    const [fx, fy] = seg.focus ?? [0.5, 0.5];
    const whip = seg.enter === 'whip' ? (1 - expoOut(local / 0.16)) * 420 : 0;
    const taps = whip > 4 ? 9 : 1;
    L.save();
    L.filter = 'contrast(1.12) saturate(0.88) brightness(0.96)';
    L.globalCompositeOperation = taps > 1 ? 'lighter' : 'source-over';
    for (let k = 0; k < taps; k++) {
      const dx = taps > 1 ? whip * (k / (taps - 1) - 0.5) : 0;
      L.globalAlpha = 1 / taps;
      // Centre the focus point, but never let the image edge enter the frame.
      const tx = Math.min(0, Math.max(W - s * W, W / 2 - s * W * fx));
      const ty = Math.min(0, Math.max(H - s * H, H / 2 - s * H * fy));
      L.setTransform(s, 0, 0, s, tx + dx, ty);
      L.drawImage(img, 0, 0, W, H);
    }
    L.restore();
  }
  if (seg.dim) {
    L.fillStyle = `rgba(0,0,0,${seg.dim})`;
    L.fillRect(0, 0, W, H);
  }
}

function grade(f) {
  const g = L.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.6)');
  L.fillStyle = g;
  L.fillRect(0, 0, W, H);
  L.save();
  L.globalCompositeOperation = 'overlay';
  L.globalAlpha = 0.14;
  const ox = Math.floor(rand(f, 1) * 256);
  const oy = Math.floor(rand(f, 2) * 256);
  for (let x = -ox; x < W; x += 256) for (let y = -oy; y < H; y += 256) L.drawImage(grain, x, y);
  L.restore();
}

// Intro titles: thin rule, then the name alone, then the role alone, then both locked up.
function drawTitles(t) {
  if (t >= DROP) return;
  const state = [...TITLES].reverse().find((s) => t >= s.from);
  const p = t - state.from;
  const cy = H / 2;
  const ruleW = state.kind === 'rule' ? 1200 * expoOut(p / 0.5) : 1200;
  L.fillStyle = 'rgba(255,255,255,0.85)';
  L.fillRect(W / 2 - ruleW / 2, cy + 34, ruleW, 2);
  if (state.kind === 'name' || state.kind === 'role') {
    const word = state.kind === 'name' ? NAME : ROLE;
    const spacing = 48 - 36 * clamp(p / 1.8);
    const scale = 1.06 - 0.06 * expoOut(p / 1.6);
    L.save();
    L.translate(W / 2, cy);
    L.scale(scale, scale);
    revealText(L, word, 0, 0, p / 0.32, { size: 210, spacing, color: '#fff', max: 1500 });
    L.restore();
  }
  if (state.kind === 'lockup') {
    revealText(L, NAME, W / 2, cy - 4, p / 0.3, { size: 176, spacing: 10, color: '#fff', max: 1300 });
    revealText(L, ROLE, W / 2, cy + 112, (p - 0.08) / 0.3, { size: 46, weight: 600, stretch: '75%', spacing: 22, color: '#fff', max: 1300 });
  }
}

function drawEnd(t) {
  const p = t - END;
  const cy = H / 2;
  revealText(L, FULL_NAME, W / 2, cy - 10, (p - 0.04) / 0.3, { size: 132, spacing: 6, color: '#fff', max: 1500 });
  L.fillStyle = ACCENT;
  const rw = 220 * expoOut((p - 0.33) / 0.3);
  L.fillRect(W / 2 - rw / 2, cy + 30, rw, 4);
  revealText(L, ROLE, W / 2, cy + 112, (p - 0.33) / 0.3, { size: 46, weight: 600, stretch: '75%', spacing: 22, color: '#fff', max: 1300 });
  revealText(L, URL, W / 2, cy + 196, (p - 0.62) / 0.3, { size: 30, weight: 500, stretch: 'normal', spacing: 2, color: 'rgba(255,255,255,0.7)' });
}

// Lower-left overlays inside the picture: a big metric or a section label, both masked in.
function drawOverlay(seg, t) {
  const p = t - seg.from;
  if (!seg.metric && !seg.caption) return;
  const g = L.createLinearGradient(0, PIC.y + PIC.h, 0, PIC.y + PIC.h - 460);
  g.addColorStop(0, 'rgba(0,0,0,0.78)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  L.fillStyle = g;
  L.fillRect(0, PIC.y + PIC.h - 460, W, 460);
  const x = 120;
  const base = PIC.y + PIC.h - 84;
  // "4×", "71×", "1,036": the number counts from zero with an exponential ease, keeping its suffix.
  const countUp = (value, q) => {
    const m = value.match(/^([\d,]+)(.*)$/);
    if (!m) return value;
    const n = Math.round(Number(m[1].replace(/,/g, '')) * expoOut(q));
    return `${n.toLocaleString('en-US')}${m[2]}`;
  };
  if (seg.metric) {
    revealText(L, countUp(seg.metric.value, (p - 0.06) / 0.7), x, base - 64, (p - 0.06) / 0.28, { size: 210, spacing: 0, color: '#fff' }, 'left');
    L.fillStyle = ACCENT;
    L.fillRect(x, base - 36, 120 * expoOut((p - 0.18) / 0.3), 4);
    revealText(L, seg.metric.label[lang], x, base + 10, (p - 0.2) / 0.28, { size: 34, weight: 600, stretch: '75%', spacing: 10, color: '#fff' }, 'left');
  } else {
    L.fillStyle = ACCENT;
    L.fillRect(x, base - 58, 90 * expoOut((p - 0.04) / 0.3), 4);
    revealText(L, seg.caption[lang], x, base, (p - 0.08) / 0.28, { size: 58, weight: 800, stretch: '150%', spacing: 6, color: '#fff' }, 'left');
  }
}

function drawBars(t) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, BAR);
  ctx.fillRect(0, H - BAR, W, BAR);
  if (t < DROP || t >= END) return;
  const a = clamp((t - DROP) / 0.4);
  setFont(ctx, { size: 22, weight: 700, stretch: '150%', spacing: 8 });
  ctx.textAlign = 'left';
  ctx.fillStyle = `rgba(255,255,255,${0.9 * a})`;
  ctx.fillText(FULL_NAME, 120, BAR / 2 + 8);
  setFont(ctx, { size: 22, weight: 500, stretch: '75%', spacing: 10 });
  ctx.textAlign = 'right';
  ctx.fillStyle = `rgba(255,255,255,${0.6 * a})`;
  ctx.fillText(ROLE, W - 120, BAR / 2 + 8);
}

window.setup = async (clipCounts) => {
  counts = clipCounts;
  await Promise.all([document.fonts.load(`800 100px ${SANS}`), document.fonts.load(`600 40px ${SANS}`), document.fonts.load(`400 40px ${SANS}`)]);
  grain = document.createElement('canvas');
  grain.width = grain.height = 256;
  const g = grain.getContext('2d');
  const data = g.createImageData(256, 256);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = Math.floor(rand(i / 4, 7) * 255);
    data.data[i] = data.data[i + 1] = data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  g.putImageData(data, 0, 0);
  return true;
};

window.renderFrame = async (f) => {
  const t = f / FPS;
  const seg = SEGMENTS.find((s) => t >= s.from && t < s.to) ?? SEGMENTS[SEGMENTS.length - 1];

  await drawSource(seg, t, f);
  if (!seg.black) grade(f);
  drawTitles(t);
  if (seg.kind === 'end') drawEnd(t);
  drawOverlay(seg, t);

  ctx.drawImage(layer, 0, 0);

  // Exposure punch on hits that are not cuts.
  const b = beatOf(t);
  if (t >= DROP && t < END && b < 0.1 && t - seg.from > 0.05) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `rgba(255,255,255,${0.16 * (1 - b / 0.1)})`;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  // Flash frames: two frames of white at flash cuts.
  if (seg.enter === 'flash' && t - seg.from < 2 / FPS) {
    ctx.fillStyle = `rgba(255,255,255,${t - seg.from < 1 / FPS ? 1 : 0.55})`;
    ctx.fillRect(0, 0, W, H);
  }
  drawBars(t);
  if (t > DURATION - 0.2) {
    ctx.fillStyle = `rgba(0,0,0,${clamp((t - (DURATION - 0.2)) / 0.2)})`;
    ctx.fillRect(0, 0, W, H);
  }
  return true;
};
