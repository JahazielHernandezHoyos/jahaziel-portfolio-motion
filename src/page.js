// Entry for the light pages (case studies, résumé): no WebGL, a cat, the pause button,
// counting metrics and the scrambled title.

import '@fontsource-variable/anybody/standard.css';
import './style.css';
import { inject } from '@vercel/analytics';
import gsap from 'gsap';
import { ui } from './i18n.js';
import { motion, wirePauseButton } from './motion.js';
import { installPageCats } from './ui/cats.js';
import { scramble } from './ui/scramble.js';

inject();

const lang = document.documentElement.lang === 'en' ? 'en' : 'es';
const t = ui(lang);
wirePauseButton(t.nav);
installPageCats(t.cats, document.querySelector('.case-metrics, .cv-head'));

document.querySelectorAll('[data-scramble]').forEach((el) => scramble(el, { delay: 150, reduced: motion.still }));
document.querySelector('[data-print]')?.addEventListener('click', () => window.print());

// Metric values count up from zero when they come into view: "26,000+" counts the 26,000,
// "<0.1 s" and "~70%" keep their prefix and suffix around the number.
const io = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      io.unobserve(entry.target);
      countUp(entry.target);
    }
  },
  { threshold: 0.6 },
);
document.querySelectorAll('[data-count]').forEach((el) => io.observe(el));

function countUp(el) {
  const text = el.textContent;
  const m = text.match(/^([^\d]*)([\d,]*\.?\d+)(.*)$/);
  if (!m || motion.still) return;
  const [, pre, num, post] = m;
  const decimals = (num.split('.')[1] || '').length;
  const target = Number(num.replace(/,/g, ''));
  const state = { v: 0 };
  el.setAttribute('aria-label', text);
  gsap.to(state, {
    v: target,
    duration: 1.2,
    ease: 'power3.out',
    onUpdate: () => {
      const v = state.v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      el.textContent = `${pre}${v}${post}`;
    },
    onComplete: () => {
      el.textContent = text;
      el.removeAttribute('aria-label');
    },
  });
}
