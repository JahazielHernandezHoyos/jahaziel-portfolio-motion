import '@fontsource-variable/anybody/standard.css';
import './style.css';
import { inject } from '@vercel/analytics';
import Lenis from 'lenis';
import gsap from 'gsap';
import { cases as allCases } from './content/cases.js';
import { companies as allCompanies } from './content/companies.js';
import { POSTER_DURATION, createPosterCanvas } from './gl/posters.js';
import { createStage } from './gl/stage.js';
import { localize, ui } from './i18n.js';
import { motion, wirePauseButton } from './motion.js';
import { installHomeCats } from './ui/cats.js';
import { fillPanel, hydrateCompanies } from './ui/companies.js';
import { scramble } from './ui/scramble.js';

inject();

const lang = document.documentElement.lang === 'en' ? 'en' : 'es';
const t = ui(lang);
const companies = localize(allCompanies, lang);
const cases = localize(allCases, lang);
const body = document.body;
const bar = document.querySelector('.preloader-bar i');
const cats = installHomeCats(t.cats);
wirePauseButton(t.nav);

// Smooth scrolling runs only while motion is on; pausing drops back to native scrolling.
const scroller = {
  lenis: null,
  sync() {
    if (motion.still && this.lenis) {
      this.lenis.destroy();
      this.lenis = null;
    } else if (!motion.still && !this.lenis) {
      this.lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    }
  },
};

// Tweens register here so the render loop knows to keep drawing while they run.
const active = new Set();
function animate(target, vars) {
  const tween = gsap.to(target, {
    ...vars,
    onComplete() {
      active.delete(tween);
      vars.onComplete?.();
    },
    onInterrupt() {
      active.delete(tween);
    },
  });
  active.add(tween);
  return tween;
}

const progress = { value: 0 };
let loaded = 0;
const TOTAL = 3;
function step() {
  loaded += 1;
  cats.preloaderStep();
  gsap.to(progress, {
    value: loaded / TOTAL,
    duration: 0.4,
    onUpdate: () => {
      bar.style.transform = `scaleX(${progress.value})`;
      cats.preloader(progress.value);
    },
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch {
    return false;
  }
}

async function boot() {
  const started = performance.now();
  await Promise.all([document.fonts.load('800 40px "Anybody Variable"'), document.fonts.load('400 16px "Anybody Variable"')]);
  step();
  const portrait = await loadImage('/portrait.jpg');
  step();
  const cards = hydrateCompanies(companies);
  for (const card of cards) {
    card.poster = createPosterCanvas();
    card.spec = (i) => ({ ...card.company.palette, labels: t.posterLabels, ...card.company.achievements[i].poster });
    card.poster.paint(card.spec(0), motion.still ? 1 : 0);
  }
  cats.addCompanies(cards);
  step();

  const gl = webglAvailable();
  if (!gl) {
    body.classList.add('no-gl');
    for (const card of cards) card.media.append(card.poster.canvas);
  }

  const canvases = Object.fromEntries(cards.map((c) => [c.company.id, c.poster.canvas]));
  const stage = gl ? createStage({ canvas: document.querySelector('.gl'), portrait, posters: canvases, motion }) : null;

  scroller.sync();
  let velocity = 0;
  let lastScroll = -1;
  let dirty = true;

  // Time since the previous tick, counted only when that tick also rendered: idle gaps (no frame
  // drawn) never look like slow frames, and genuinely slow frames are never filtered out.
  let prevTick = 0;
  let renderedPrev = false;
  function tick(ms) {
    const lenis = scroller.lenis;
    lenis?.raf(ms);
    const raw = lenis ? clampVel(lenis.velocity / 45) : 0;
    velocity += (raw - velocity) * 0.12;
    if (Math.abs(velocity) < 0.0005) velocity = 0;
    const y = window.scrollY;
    const render = stage && (dirty || y !== lastScroll || velocity !== 0 || active.size > 0 || stage.needsFrame());
    if (render) {
      if (renderedPrev) stage.adapt(ms - prevTick);
      stage.render(ms / 1000, velocity);
      dirty = false;
    }
    renderedPrev = render;
    prevTick = ms;
    lastScroll = y;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  window.addEventListener('resize', () => {
    stage?.resize();
    cards.forEach((c) => c.placeIndicator?.());
    dirty = true;
  });
  window.addEventListener('pointermove', (e) => stage?.pointer(e), { passive: true });

  motion.onChange(() => {
    scroller.sync();
    if (motion.still) {
      gsap.globalTimeline.getChildren(true, true, false).forEach((tw) => tw.progress(1));
      cards.forEach((c) => c.finish?.());
    }
    dirty = true;
  });

  wireAnchors();
  wireMenu();
  wireIndex();
  wireCompanies(stage, cards);
  wireReveals();
  wireScramble();

  const wait = Math.max(0, 900 - (performance.now() - started));
  await new Promise((r) => setTimeout(r, wait));
  intro(stage);
}

function clampVel(v) {
  return Math.max(-1, Math.min(1, v));
}

function intro(stage) {
  const still = motion.still;
  const pre = document.querySelector('.preloader');
  gsap.to(pre, {
    autoAlpha: 0,
    duration: still ? 0 : 0.5,
    delay: still ? 0 : 0.15,
    onComplete: () => {
      pre.remove();
      body.classList.remove('is-loading');
    },
  });
  if (stage) {
    if (still) stage.heroUniforms.uReveal.value = 1;
    else animate(stage.heroUniforms.uReveal, { value: 1, duration: 2.8, delay: 0.3, ease: 'power2.inOut' });
  }
  const heroText = document.querySelectorAll('.hero [data-scramble]');
  heroText.forEach((el, i) => scramble(el, { delay: still ? 0 : 900 + i * 250, reduced: still }));
  gsap.from('.hero-name p, .hero-hint', { autoAlpha: 0, duration: still ? 0 : 0.8, delay: still ? 0 : 1.6 });
  gsap.delayedCall(still ? 0 : 3.3, () => cats.heroIn());
}

function wireAnchors() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    closeMenu();
    if (scroller.lenis) scroller.lenis.scrollTo(target, { duration: 1.6 });
    else target.scrollIntoView();
    history.replaceState(null, '', a.getAttribute('href'));
  });
}

let closeMenu = () => {};
function wireMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('menu');
  const open = () => {
    const d = motion.still ? 0 : 1;
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.textContent = toggle.dataset.close;
    scroller.lenis?.stop();
    gsap.fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.6 * d, ease: 'power3.inOut' });
    gsap.fromTo(menu.querySelectorAll('a'), { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.5 * d, stagger: 0.05 * d, delay: 0.25 * d });
    menu.querySelector('a').focus();
    cats.menu(true);
  };
  closeMenu = () => {
    if (menu.hidden) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = toggle.dataset.open;
    scroller.lenis?.start();
    cats.menu(false);
    gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: motion.still ? 0 : 0.45, ease: 'power3.inOut', onComplete: () => (menu.hidden = true) });
  };
  toggle.addEventListener('click', () => (menu.hidden ? open() : closeMenu()));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && closeMenu());
}

function wireIndex() {
  const links = new Map([...document.querySelectorAll('.work-index a')].map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((a) => a.removeAttribute('aria-current'));
        const link = links.get(entry.target.id);
        link?.setAttribute('aria-current', 'true');
        if (link) cats.indexMoved(link);
      }
    },
    { rootMargin: '-45% 0px -45% 0px' },
  );
  document.querySelectorAll('.company').forEach((p) => io.observe(p));
}

// Each company shows one achievement at a time on its poster. The poster plays once when it is
// mostly on screen, again on hover/focus, and whenever another achievement of the top 3 is
// selected: the shader pixelates, the canvas swaps content at the peak, then resolves while the
// new animation plays. The texture is only re-uploaded during tweens; nothing repaints at rest.
function wireCompanies(stage, cards) {
  const players = new Map();
  for (const card of cards) {
    const u = stage?.posterUniforms(card.media);
    const state = { index: 0, t: motion.still ? 1 : 0, tween: null };
    const kind = () => card.company.achievements[state.index].poster.kind;
    const redraw = () => {
      card.poster.paint(card.spec(state.index), state.t);
      if (u) u.uTex.value.needsUpdate = true;
    };
    const play = (force = false) => {
      if (motion.still) return;
      if (state.tween?.isActive()) {
        if (!force) return;
        state.tween.kill();
      }
      state.t = 0;
      redraw();
      state.tween = animate(state, { t: 1, duration: POSTER_DURATION[kind()], ease: 'none', onUpdate: redraw });
    };
    // Pausing motion jumps every poster to its final frame (the result).
    card.finish = () => {
      state.tween?.kill();
      state.t = 1;
      redraw();
    };
    players.set(card.media, () => {
      play();
      cats.posterPlayed(card.company.id);
    });

    // The selected-row highlight is one block that slides between rows. Resize calls it with no
    // arguments to snap it back under the selected tab.
    let selected = 0;
    card.placeIndicator = (i = selected, moving = false) => {
      selected = i;
      const tab = card.tabs[i];
      const to = { y: tab.offsetTop, height: tab.offsetHeight };
      if (moving && !motion.still) gsap.to(card.indicator, { ...to, duration: 0.45, ease: 'power3.inOut', overwrite: true });
      else gsap.set(card.indicator, to);
    };
    card.placeIndicator();

    const pulse = () => {
      if (!u || motion.still) return;
      gsap.killTweensOf(u.uPulse);
      u.uPulse.value = 1;
      animate(u.uPulse, { value: 0, duration: 0.55, ease: 'steps(8)' });
    };

    const select = (i) => {
      if (i === state.index) return;
      cats.companySelected(card.company.id);
      const achievement = card.company.achievements[i];
      card.tabs.forEach((tab, k) => {
        tab.setAttribute('aria-selected', String(k === i));
        tab.tabIndex = k === i ? 0 : -1;
      });
      card.panel.setAttribute('aria-labelledby', card.tabs[i].id);
      card.media.setAttribute('aria-label', achievement.alt);

      card.placeIndicator(i, true);
      const fillOpts = { lang, cases, readCase: t.work.readCase };
      if (motion.still) {
        state.index = i;
        fillPanel(card.panel, achievement, fillOpts);
        state.t = 1;
        redraw();
        return;
      }
      gsap.killTweensOf(card.panel);
      gsap.to(card.panel, {
        autoAlpha: 0,
        y: 8,
        duration: 0.16,
        onComplete: () => {
          fillPanel(card.panel, achievement, fillOpts);
          gsap.to(card.panel, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' });
        },
      });
      const swap = () => {
        state.index = i;
        play(true);
      };
      if (!u) return swap();
      gsap.killTweensOf(u.uPulse);
      animate(u.uPulse, {
        value: 1,
        duration: 0.2,
        ease: 'steps(4)',
        onComplete: () => {
          swap();
          animate(u.uPulse, { value: 0, duration: 0.5, ease: 'steps(7)' });
        },
      });
    };

    card.tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(i));
      tab.addEventListener('keydown', (e) => {
        const n = card.tabs.length;
        const moves = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
        let next = null;
        if (e.key in moves) next = (i + moves[e.key] + n) % n;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = n - 1;
        if (next === null) return;
        e.preventDefault();
        card.tabs[next].focus();
        select(next);
      });
    });

    const enter = () => {
      play();
      pulse();
      cats.posterPlayed(card.company.id);
      if (u) animate(u.uHover, { value: 1, duration: 0.6, ease: 'power3.out' });
    };
    const leave = () => u && animate(u.uHover, { value: 0, duration: 0.6, ease: 'power3.out' });
    card.media.addEventListener('pointerenter', enter);
    card.media.addEventListener('pointerleave', leave);
    card.media.addEventListener('focus', enter);
    card.media.addEventListener('blur', leave);
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        io.unobserve(entry.target);
        players.get(entry.target)();
      }
    },
    { threshold: 0.6 },
  );
  players.forEach((_, el) => io.observe(el));
}

// Company names slide up out of a mask and the top 3 rows follow, once per company.
function wireReveals() {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        io.unobserve(entry.target);
        entry.target.classList.add('is-in');
      }
    },
    { threshold: 0.2 },
  );
  document.querySelectorAll('.company, .wahi').forEach((c) => io.observe(c));
}

function wireScramble() {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        io.unobserve(entry.target);
        scramble(entry.target, { reduced: motion.still });
      }
    },
    { rootMargin: '0px 0px -20% 0px' },
  );
  document.querySelectorAll('main > :not(.hero) [data-scramble]').forEach((el) => io.observe(el));
}

// Dev-only handle for scripted captures (the promo video); stripped from production builds.
if (import.meta.env.DEV) window.__portfolio = { scroller };

boot();
