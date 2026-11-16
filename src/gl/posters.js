// Every achievement card is a 2D canvas animated by one of a few archetypes, fed by data in
// src/content/companies.js. paint(t) draws the frame at progress t in [0, 1]: t = 0 is the
// "before" state, t = 1 the measured result. Playback is driven from main.js (once on enter,
// again on hover or when another achievement of the same company is selected); nothing loops.
export const POSTER_SIZE = { w: 1600, h: 1000 };

const FAMILY = '"Anybody Variable", sans-serif';
// Posters render at ~45% of their pixel size on a laptop; 40px keeps labels around 18 CSS px.
const MIN_LABEL = 40;
const PAD = 90;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = (t) => 1 - Math.pow(1 - t, 3);
const lerp = (a, b, t) => a + (b - a) * t;
const thousands = (n) => Math.round(n).toLocaleString('en-US');

function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function text(ctx, str, x, y, { size = 40, weight = 400, stretch = 'normal', color, align = 'left', alpha = 1, maxWidth } = {}) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `${weight} ${Math.max(size, MIN_LABEL)}px ${FAMILY}`;
  ctx.fontStretch = stretch;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  // maxWidth squeezes the glyphs horizontally instead of letting long labels leave the poster.
  if (maxWidth) ctx.fillText(str, x, y, maxWidth);
  else ctx.fillText(str, x, y);
  const width = Math.min(ctx.measureText(str).width, maxWidth ?? Infinity);
  ctx.restore();
  return width;
}

function caption(ctx, s, str) {
  text(ctx, str, PAD, 120, { stretch: 'condensed', color: s.muted });
}

function result(ctx, s, value, alpha, { size = 260, y = 920 } = {}) {
  text(ctx, value, s.w - PAD, y, { size, weight: 800, stretch: 'extra-expanded', color: s.fg, align: 'right', alpha });
}

function subLines(ctx, s, lines, alpha, y = 850) {
  lines.forEach((line, i) => text(ctx, line, PAD, y + i * 52, { size: i ? 40 : 44, stretch: i ? 'condensed' : 'normal', color: i ? s.muted : s.fg, alpha }));
}

// Formats a value expressed in the spec's base unit.
const formats = {
  ms: (v) => `${thousands(v)} ms`,
  s: (v) => `${Math.round(v)} s`,
  min: (v) => (v >= 60 ? `${(v / 60).toFixed(1)} min` : `${Math.round(v)} s`),
  plain: (v) => thousands(v),
  // Relative comparisons without real units: the bars carry the story.
  none: () => '',
};

// Two lanes that fill at the real ratio of their durations: the slow one crawls, the fast one
// is done almost immediately. Then the multiplier lands.
function race(ctx, s, t) {
  caption(ctx, s, s.caption);
  const fmt = formats[s.format ?? 'ms'];
  const max = Math.max(s.before.value, s.after.value);
  const elapsed = max * seg(t, 0.04, 0.78);
  [s.before, s.after].forEach((lane, i) => {
    const y = 260 + i * 220;
    const p = clamp(elapsed / lane.value);
    text(ctx, lane.label, PAD, y, { weight: 500, color: s.fg });
    text(ctx, fmt(Math.min(elapsed, lane.value)), s.w - PAD, y, { weight: 700, color: s.fg, align: 'right' });
    ctx.fillStyle = s.track;
    ctx.fillRect(PAD, y + 26, s.w - PAD * 2, 76);
    ctx.fillStyle = s.fg;
    ctx.fillRect(PAD, y + 26, (s.w - PAD * 2) * p, 76);
  });
  const r = ease(seg(t, 0.78, 1));
  subLines(ctx, s, s.sub, r, 800);
  result(ctx, s, s.result, r, { size: 230 });
}

// Memory climbs into the limit and the service dies; after the fix it runs flat and the
// headline number counts up.
const noise = (() => {
  const r = seeded(11);
  return Array.from({ length: 200 }, () => r());
})();

function crash(ctx, s, t) {
  caption(ctx, s, s.caption);
  const x0 = PAD;
  const x1 = 900;
  const top = 250;
  const bottom = 800;
  const span = bottom - top;
  ctx.strokeStyle = s.accent;
  ctx.setLineDash([14, 12]);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x0, top);
  ctx.lineTo(x1, top);
  ctx.stroke();
  ctx.setLineDash([]);
  text(ctx, 'límite', x0, top - 18, { stretch: 'condensed', color: s.accent });

  const crashX = lerp(x0, x1, 0.46);
  const a = seg(t, 0.04, 0.42);
  if (a > 0) {
    ctx.strokeStyle = s.accent;
    ctx.lineWidth = 6;
    ctx.beginPath();
    const steps = Math.max(1, Math.floor(a * 90));
    for (let i = 0; i <= steps; i++) {
      const k = i / 90;
      const y = bottom - span * Math.min(0.3 + 0.7 * k + (noise[i] - 0.5) * 0.05, 1);
      const x = lerp(x0, crashX, k);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
    if (a >= 1) {
      ctx.beginPath();
      ctx.moveTo(crashX, top);
      ctx.lineTo(crashX, bottom);
      ctx.stroke();
      text(ctx, 'se satura', crashX + 18, top + 60, { weight: 700, stretch: 'condensed', color: s.accent });
    }
  }
  const b = seg(t, 0.48, 0.96);
  if (b > 0) {
    ctx.strokeStyle = s.fg;
    ctx.lineWidth = 6;
    ctx.beginPath();
    const steps = Math.max(1, Math.floor(b * 80));
    for (let i = 0; i <= steps; i++) {
      const k = i / 80;
      const y = bottom - span * (0.28 + (noise[100 + i] - 0.5) * 0.03);
      const x = lerp(crashX, x1, k);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  }
  const v = 1 + (s.value - 1) * ease(b);
  text(ctx, `${v < s.value - 0.05 ? v.toFixed(1) : s.value}×`, s.w - PAD, 560, { size: 300, weight: 800, stretch: 'extra-expanded', color: s.fg, align: 'right' });
  s.sub.forEach((line, i) => text(ctx, line, s.w - PAD, 650 + i * 56, { stretch: i ? 'condensed' : 'normal', color: i ? s.muted : s.fg, align: 'right' }));
}

// Optional pipeline the work flows through, then a cost bar shrinks to its new size.
function shrink(ctx, s, t) {
  let y = 120;
  if (s.flow) {
    const n = s.flow.steps.length;
    const bw = 340;
    const gap = (s.w - PAD * 2 - bw * n) / (n - 1);
    ctx.strokeStyle = s.fg;
    ctx.lineWidth = 3;
    s.flow.steps.forEach((label, i) => {
      const x = PAD + i * (bw + gap);
      ctx.strokeRect(x, 90, bw, 120);
      text(ctx, label, x + bw / 2, 166, { weight: 700, stretch: 'expanded', color: s.fg, align: 'center' });
    });
    const flow = seg(t, 0.02, 0.45);
    for (let i = 0; i < 16; i++) {
      const p = clamp(flow * 1.9 - i * 0.06);
      if (p <= 0 || p >= 1) continue;
      const x = lerp(PAD, s.w - PAD, p);
      ctx.fillStyle = s.fg;
      ctx.fillRect(x - 18, 140 + (i % 3) * 14, 36, 24);
    }
    text(ctx, flow >= 1 ? s.flow.done : s.flow.busy, PAD, 280, { stretch: 'condensed', color: s.fg });
    y = 400;
  } else {
    caption(ctx, s, s.caption);
    y = 260;
  }
  if (s.flow) text(ctx, s.caption, PAD, y, { stretch: 'condensed', color: s.muted });
  const c = ease(seg(t, s.flow ? 0.48 : 0.1, 0.9));
  const top = y + 70;
  text(ctx, s.before, PAD, top, { weight: 500, color: s.fg });
  ctx.fillStyle = s.track;
  ctx.fillRect(PAD, top + 22, s.w - PAD * 2, 64);
  text(ctx, s.after, PAD, top + 160, { weight: 500, color: s.fg });
  ctx.fillStyle = s.fg;
  ctx.fillRect(PAD, top + 182, (s.w - PAD * 2) * lerp(1, s.ratio, c), 64);
  subLines(ctx, s, s.sub, ease(seg(t, 0.8, 1)), 880);
  // ratio is new/old cost: shown as a percentage cut, or as "N× less" when the cut is large.
  const headline = s.asFactor ? `${(1 + (1 / s.ratio - 1) * c).toFixed(c < 1 ? 1 : 0)}×` : `−${Math.round((1 - s.ratio) * 100 * c)}%`;
  result(ctx, s, headline, 1, { size: 200, y: 930 });
}

// The same jobs one after another vs. side by side, with a time cursor sweeping both.
function parallel(ctx, s, t) {
  caption(ctx, s, s.caption);
  const x0 = PAD;
  const x1 = s.w - PAD;
  const total = s.serial;
  const X = (v) => lerp(x0, x1, v / total);
  const now = total * seg(t, 0.04, 0.86);
  const longest = Math.max(...s.lanes);

  text(ctx, 'Uno tras otro', x0, 230, { weight: 600, color: s.fg });
  text(ctx, `${Math.round(Math.min(now, total))} s`, x1, 230, { weight: 700, color: s.fg, align: 'right' });
  ctx.fillStyle = s.track;
  ctx.fillRect(x0, 252, x1 - x0, 60);
  const each = total / s.lanes.length;
  s.lanes.forEach((_, i) => {
    const a = each * i;
    const b = Math.min(now, a + each);
    if (b <= a) return;
    ctx.fillStyle = i % 2 ? s.muted : s.fg;
    ctx.fillRect(X(a), 252, X(b) - X(a), 60);
  });

  text(ctx, 'En paralelo', x0, 410, { weight: 600, color: s.fg });
  text(ctx, `${Math.round(Math.min(now, longest))} s`, x1, 410, { weight: 700, color: s.fg, align: 'right' });
  s.lanes.forEach((len, i) => {
    const y = 432 + i * 58;
    ctx.fillStyle = s.track;
    ctx.fillRect(x0, y, X(len) - x0, 42);
    ctx.fillStyle = s.fg;
    ctx.fillRect(x0, y, X(Math.min(now, len)) - x0, 42);
  });
  ctx.fillStyle = s.accent;
  ctx.fillRect(X(Math.min(now, total)) - 2, 246, 4, 432 - 246 + s.lanes.length * 58);

  const r = ease(seg(t, 0.55, 1));
  subLines(ctx, s, s.sub, r, 860);
  result(ctx, s, `${(1 + (total / longest - 1) * r).toFixed(1)}×`, 1, { size: 210, y: 930 });
}

// A metric grows from A to B over a run of bars; the number counts with it.
function growth(ctx, s, t) {
  caption(ctx, s, s.caption);
  const bars = 12;
  const x0 = PAD;
  const x1 = s.w - PAD;
  const base = 800;
  const maxH = 360;
  const bw = (x1 - x0) / bars - 18;
  const g = seg(t, 0.06, 0.85);
  for (let i = 0; i < bars; i++) {
    const k = i / (bars - 1);
    const shown = clamp(g * bars - i);
    if (shown <= 0) continue;
    const v = lerp(s.from, s.to, ease(k));
    const h = (v / s.to) * maxH * ease(shown);
    ctx.fillStyle = i === bars - 1 ? s.fg : s.muted;
    ctx.fillRect(x0 + i * (bw + 18), base - h, bw, h);
  }
  ctx.fillStyle = s.fg;
  ctx.fillRect(x0, base + 8, x1 - x0, 4);
  const v = lerp(s.from, s.to, ease(g));
  text(ctx, `${thousands(v)}${s.suffix ?? ''}`, x0, 330, { size: 200, weight: 800, stretch: 'extra-expanded', color: s.fg });
  text(ctx, s.unit, x0, 400, { color: s.fg });
  subLines(ctx, s, s.sub, ease(seg(t, 0.8, 1)), 860);
}

// 10 x 10 grid: a share of cells lights up.
function share(ctx, s, t) {
  caption(ctx, s, s.caption);
  const cells = 100;
  const size = 58;
  const gap = 10;
  const x0 = s.w - PAD - 10 * (size + gap) + gap;
  const y0 = 200;
  const lit = Math.round(s.percent * ease(seg(t, 0.08, 0.8)));
  for (let i = 0; i < cells; i++) {
    const cx = x0 + (i % 10) * (size + gap);
    const cy = y0 + Math.floor(i / 10) * (size + gap);
    ctx.fillStyle = i < lit ? s.fg : s.track;
    ctx.fillRect(cx, cy, size, size);
  }
  text(ctx, `${lit}%`, PAD, 520, { size: 260, weight: 800, stretch: 'extra-expanded', color: s.fg });
  s.sub.forEach((line, i) => text(ctx, line, PAD, 610 + i * 56, { stretch: i ? 'condensed' : 'normal', color: i ? s.muted : s.fg, alpha: ease(seg(t, 0.7, 1)) }));
}

// A quantity fills block by block, like a transfer in progress.
function counter(ctx, s, t) {
  caption(ctx, s, s.caption);
  // Without `blocks` the grid is 100 small cells; with it, one big cell per counted item.
  const total = s.blocks ?? 100;
  const cols = s.blocks ? Math.min(total, 9) : 20;
  const size = s.blocks ? 130 : 60;
  const gap = s.blocks ? 14 : 9;
  const c = seg(t, 0.06, 0.82);
  const filled = Math.floor(c * total + (c >= 1 ? 0 : 0.0001));
  for (let i = 0; i < total; i++) {
    const x = PAD + (i % cols) * (size + gap);
    const y = 200 + Math.floor(i / cols) * (size + gap);
    ctx.fillStyle = i < filled ? s.fg : s.track;
    ctx.fillRect(x, y, size, size);
  }
  const w = text(ctx, thousands(s.value * ease(c)), PAD, 720, { size: 200, weight: 800, stretch: 'extra-expanded', color: s.fg });
  text(ctx, s.unit, PAD + w + 30, 720, { size: 64, weight: 700, color: s.fg });
  subLines(ctx, s, s.sub, ease(seg(t, 0.75, 1)), 820);
}

// Requests over time: before the fix a share of them time out; after it, every one passes.
function failures(ctx, s, t) {
  caption(ctx, s, s.caption);
  const n = 48;
  const x0 = PAD;
  const x1 = s.w - PAD;
  const step = (x1 - x0) / n;
  const fixAt = n / 2;
  const r = seeded(21);
  const fails = Array.from({ length: n }, (_, i) => i < fixAt && r() < 0.38);
  const shown = Math.floor(seg(t, 0.04, 0.82) * n);
  let count = 0;
  for (let i = 0; i < shown; i++) {
    const x = x0 + i * step;
    if (fails[i]) {
      count += 1;
      ctx.fillStyle = s.accent;
      ctx.fillRect(x, 380, step - 8, 70);
    } else {
      ctx.fillStyle = s.fg;
      ctx.fillRect(x, 260, step - 8, 190);
    }
  }
  ctx.fillStyle = s.fg;
  ctx.fillRect(x0, 470, x1 - x0, 4);
  if (shown > fixAt) {
    const fx = x0 + fixAt * step - 4;
    ctx.fillStyle = s.fg;
    ctx.fillRect(fx - 2, 200, 4, 290);
    text(ctx, s.fix, fx + 16, 220, { weight: 700, stretch: 'condensed', color: s.fg });
  }
  text(ctx, `${count} timeouts antes`, x0, 560, { weight: 600, color: s.accent });
  const a = ease(seg(t, 0.82, 1));
  subLines(ctx, s, s.sub, a, 860);
  result(ctx, s, s.result, a, { size: 300, y: 940 });
}

// A document writes itself line by line, then a stamp lands on it.
function stamp(ctx, s, t) {
  const px = PAD;
  const pw = 640;
  ctx.fillStyle = s.paper;
  ctx.fillRect(px, 90, pw, 820);
  const lines = 14;
  const w = seg(t, 0.04, 0.6) * lines;
  const r = seeded(s.seed ?? 3);
  for (let i = 0; i < lines; i++) {
    const len = i === 0 ? 0.7 : 0.55 + r() * 0.4;
    const k = clamp(w - i);
    if (k <= 0) continue;
    ctx.fillStyle = i === 0 ? s.ink : s.inkSoft;
    ctx.fillRect(px + 50, 160 + i * 50 + (i ? 40 : 0), (pw - 100) * len * k, i === 0 ? 34 : 16);
  }
  const k = ease(seg(t, 0.62, 0.8));
  if (k > 0) {
    ctx.save();
    ctx.translate(px + pw / 2 + 40, 640);
    ctx.rotate(-0.16);
    ctx.scale(lerp(1.6, 1, k), lerp(1.6, 1, k));
    ctx.globalAlpha = k;
    const ink = s.stampColor ?? s.accent;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 10;
    ctx.strokeRect(-260, -90, 520, 180);
    text(ctx, s.stamp, 0, 24, { size: 76, weight: 800, stretch: 'extra-expanded', color: ink, align: 'center' });
    ctx.restore();
  }
  const a = ease(seg(t, 0.78, 1));
  s.lines.forEach((line, i) =>
    text(ctx, line, 820, 420 + i * 70, { size: i ? 40 : 64, weight: i ? 400 : 800, stretch: i ? 'condensed' : 'expanded', color: s.fg, alpha: a, maxWidth: s.w - 820 - PAD }),
  );
}

// Hand landmarks appear and connect, then the five vowels light up.
const HAND = [
  [500, 900], [380, 830], [300, 740], [250, 650], [210, 570],
  [400, 560], [380, 420], [370, 330], [362, 250],
  [500, 540], [500, 380], [500, 280], [500, 190],
  [595, 560], [610, 410], [618, 320], [625, 245],
  [680, 610], [720, 500], [745, 430], [765, 365],
];
const BONES = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]];

function signs(ctx, s, t) {
  ctx.fillStyle = s.track;
  for (let x = 40; x < s.w; x += 40) for (let y = 40; y < s.h; y += 40) ctx.fillRect(x, y, 3, 3);
  const P = (i) => [800 + HAND[i][0] * 0.95, -10 + HAND[i][1] * 0.95];
  const bones = seg(t, 0.15, 0.55);
  ctx.strokeStyle = s.fg;
  ctx.lineWidth = 7;
  BONES.forEach(([a, b], i) => {
    const k = clamp(bones * BONES.length - i);
    if (k <= 0) return;
    const [ax, ay] = P(a);
    const [bx, by] = P(b);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(lerp(ax, bx, k), lerp(ay, by, k));
    ctx.stroke();
  });
  const dots = seg(t, 0.02, 0.3);
  ctx.fillStyle = s.fg;
  HAND.forEach((_, i) => {
    if (dots * HAND.length < i) return;
    const [x, y] = P(i);
    ctx.fillRect(x - 11, y - 11, 22, 22);
  });
  text(ctx, 'LSC', 80, 300, { size: 230, weight: 800, stretch: 'extra-expanded', color: s.fg });
  text(ctx, 'Lengua de señas a texto', 90, 380, { color: s.fg });
  const vowels = ['A', 'E', 'I', 'O', 'U'];
  const lit = seg(t, 0.55, 0.95) * vowels.length;
  vowels.forEach((v, i) => {
    const x = 90 + i * 118;
    const on = lit > i + 0.5;
    ctx.fillStyle = on ? s.fg : s.track;
    ctx.fillRect(x, 480, 96, 120);
    text(ctx, v, x + 48, 570, { size: 70, weight: 800, stretch: 'expanded', color: on ? s.bg : s.muted, align: 'center' });
  });
  text(ctx, 'vocales reconocidas en tiempo real', 90, 680, { stretch: 'condensed', color: s.fg });
}

const archetypes = { race, crash, shrink, parallel, growth, share, counter, failures, stamp, signs };

export const POSTER_DURATION = { race: 3.2, crash: 3.4, shrink: 3.4, parallel: 3.6, growth: 3, share: 2.8, counter: 3, failures: 3, stamp: 2.8, signs: 3.2 };

// One canvas per company; the active achievement decides what gets painted on it.
export function createPosterCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = POSTER_SIZE.w;
  canvas.height = POSTER_SIZE.h;
  const ctx = canvas.getContext('2d');
  return {
    canvas,
    paint(spec, t) {
      const s = { w: canvas.width, h: canvas.height, ...spec };
      ctx.fillStyle = s.bg;
      ctx.fillRect(0, 0, s.w, s.h);
      archetypes[spec.kind](ctx, s, t);
    },
  };
}
