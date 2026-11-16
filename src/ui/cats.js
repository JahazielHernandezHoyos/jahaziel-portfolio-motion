import gsap from 'gsap';
import { fill } from '../i18n.js';
import { motion } from '../motion.js';
import { MUG, PAW, POSES, VARIANTS, catSvg } from './cat-svg.js';

// One cat per section. Cats are inline SVG drawn from parts (head, eyes, tail, paws) so GSAP can
// move each part. Every behaviour is finite and triggered by something: a scroll, a click, a tab
// change, the cursor moving. Idle blinks stop after 25 s without input, when the cats fall asleep.
// While motion is paused cats still talk and look at the cursor, but skip hops, flicks and falls.

export class Cat {
  constructor({ variant, pose = 'sit', size = 64, name = '', rotate = 0, t }) {
    const spec = POSES[pose];
    this.pose = pose;
    this.name = name;
    this.t = t;
    this.rotate = (rotate * Math.PI) / 180;
    this.tailOrigin = spec.tailOrigin;

    const root = document.createElement('span');
    root.className = `cat cat-${pose}`;
    root.style.setProperty('--cat-w', `${size}px`);
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML = `<span class="cat-clip">${catSvg(variant, pose)}</span><span class="cat-bubble"></span><span class="cat-z"><i>z</i><i>z</i><i>Z</i></span>`;
    this.root = root;
    this.svg = root.querySelector('svg');
    this.headEl = root.querySelector('.cat-head');
    this.eyes = root.querySelector('.cat-eyes');
    this.closedEyes = root.querySelector('.cat-closed');
    this.pupils = [...root.querySelectorAll('.cat-pupil')];
    this.tail = root.querySelector('.cat-tail');
    this.paw = root.querySelector('.cat-paw-r');
    this.bubble = root.querySelector('.cat-bubble');
    this.zs = [...root.querySelectorAll('.cat-z i')];
    this.awake = true;

    gsap.set(this.bubble, { xPercent: -50, autoAlpha: 0 });
    gsap.set(this.zs, { autoAlpha: 0 });
    if (pose === 'loaf') this.close();
    if (pose === 'peek') gsap.set(this.svg, { yPercent: 100 });
    this.svg.addEventListener('click', () => (this.onClick ? this.onClick() : this.hello()));
  }

  get reduced() {
    return motion.still;
  }

  // Pupils follow a screen point; rotated cats convert the direction into their own frame.
  look(px, py) {
    if (!this.awake || px < 0) return;
    const r = this.eyes.getBoundingClientRect();
    if (!r.width) return;
    let dx = px - (r.left + r.width / 2);
    let dy = py - (r.top + r.height / 2);
    if (this.rotate) {
      const c = Math.cos(-this.rotate);
      const s = Math.sin(-this.rotate);
      [dx, dy] = [dx * c - dy * s, dx * s + dy * c];
    }
    const len = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, len / 160);
    const t = `translate(${((dx / len) * 2.6 * k).toFixed(2)} ${((dy / len) * 1.3 * k).toFixed(2)})`;
    this.pupils.forEach((p) => p.setAttribute('transform', t));
  }

  blink() {
    if (!this.awake || this.reduced) return;
    gsap.to(this.eyes, { scaleY: 0.1, transformOrigin: '50% 50%', duration: 0.07, yoyo: true, repeat: 1 });
  }

  flick() {
    if (!this.tail || !this.tailOrigin || this.reduced) return;
    gsap.fromTo(this.tail, { rotation: 0 }, { rotation: -16, svgOrigin: this.tailOrigin, duration: 0.16, yoyo: true, repeat: 3, ease: 'sine.inOut' });
  }

  bat(times = 1) {
    if (!this.paw || this.reduced) return;
    gsap
      .timeline({ repeat: times - 1 })
      .to(this.paw, { y: -12, rotation: -25, transformOrigin: '50% 100%', duration: 0.12, ease: 'power2.out' })
      .to(this.paw, { y: 0, rotation: 0, duration: 0.14, ease: 'power2.in' });
  }

  hop() {
    if (this.reduced || this.pose === 'peek') return this.bat(2);
    gsap
      .timeline()
      .to(this.svg, { scaleY: 0.86, transformOrigin: '50% 100%', duration: 0.08 })
      .to(this.svg, { y: -22, scaleY: 1.06, duration: 0.2, ease: 'power2.out' })
      .to(this.svg, { y: 0, scaleY: 1, duration: 0.2, ease: 'power2.in' })
      .to(this.svg, { scaleY: 0.9, duration: 0.06 })
      .to(this.svg, { scaleY: 1, duration: 0.16, ease: 'back.out(3)' });
  }

  say(text, ms = 1500) {
    this.bubble.textContent = text;
    gsap.killTweensOf(this.bubble);
    if (this.reduced) {
      gsap.set(this.bubble, { autoAlpha: 1 });
      gsap.delayedCall(ms / 1000, () => gsap.set(this.bubble, { autoAlpha: 0 }));
      return;
    }
    gsap.fromTo(this.bubble, { autoAlpha: 0, y: 6, scale: 0.8 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.25, ease: 'back.out(2)' });
    gsap.to(this.bubble, { autoAlpha: 0, y: -4, duration: 0.2, delay: ms / 1000 });
  }

  close() {
    this.awake = false;
    gsap.set(this.eyes, { autoAlpha: 0 });
    gsap.set(this.closedEyes, { autoAlpha: 1 });
  }

  open() {
    this.awake = true;
    gsap.set(this.closedEyes, { autoAlpha: 0 });
    gsap.set(this.eyes, { autoAlpha: 1 });
    if (!this.reduced) gsap.fromTo(this.headEl, { y: 3 }, { y: 0, duration: 0.35, ease: 'back.out(3)' });
  }

  snore() {
    if (this.reduced) return;
    const tl = gsap.timeline();
    this.zs.forEach((z, i) => {
      const at = i * 0.45;
      tl.fromTo(z, { x: 0, y: 0 }, { x: 10 + i * 6, y: -26 - i * 10, duration: 1.4, ease: 'sine.out' }, at)
        .fromTo(z, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, at)
        .to(z, { autoAlpha: 0, duration: 0.5 }, at + 0.9);
    });
  }

  pop(show) {
    if (this.pose !== 'peek' || this.shown === show) return;
    this.shown = show;
    gsap.to(this.svg, {
      yPercent: show ? 0 : 100,
      duration: this.reduced ? 0 : show ? 0.55 : 0.3,
      ease: show ? 'back.out(1.7)' : 'power2.in',
      overwrite: true,
    });
  }

  hello() {
    this.say(this.name ? fill(this.t.hi, { name: this.name }) : this.t.meow);
    this.hop();
  }
}

function createManager() {
  const visible = new Set();
  const all = new Set();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) e.isIntersecting ? visible.add(e.target.cat) : visible.delete(e.target.cat);
  });
  let px = -1;
  let py = -1;
  let raf = 0;
  let last = performance.now();
  let timer = 0;
  let napping = false;

  const frame = () => {
    raf = 0;
    visible.forEach((c) => c.look(px, py));
  };

  function idle() {
    timer = 0;
    if (document.hidden || motion.still) return;
    if (performance.now() - last > 25000) {
      napping = true;
      all.forEach((c) => {
        if (c.awake && c.pose !== 'loaf') {
          c.napped = true;
          c.close();
          if (visible.has(c)) c.snore();
        }
      });
      return;
    }
    const pool = [...visible].filter((c) => c.awake);
    if (pool.length) {
      const c = pool[(Math.random() * pool.length) | 0];
      Math.random() < 0.6 ? c.blink() : c.flick();
    }
    timer = setTimeout(idle, 1800 + Math.random() * 2600);
  }

  function activity() {
    last = performance.now();
    if (napping) {
      napping = false;
      all.forEach((c) => {
        if (!c.napped) return;
        c.napped = false;
        c.open();
      });
    }
    if (!timer && !motion.still) timer = setTimeout(idle, 1500);
  }

  window.addEventListener(
    'pointermove',
    (e) => {
      px = e.clientX;
      py = e.clientY;
      activity();
      if (!raf) raf = requestAnimationFrame(frame);
    },
    { passive: true },
  );
  for (const ev of ['keydown', 'wheel', 'touchstart', 'scroll']) window.addEventListener(ev, activity, { passive: true });
  document.addEventListener('visibilitychange', () => !document.hidden && activity());
  motion.onChange(activity);

  document.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || motion.still) return;
    const print = document.createElement('span');
    print.className = 'paw-print';
    print.innerHTML = PAW;
    print.style.left = `${e.clientX}px`;
    print.style.top = `${e.clientY}px`;
    document.body.append(print);
    gsap.fromTo(
      print,
      { xPercent: -50, yPercent: -50, scale: 0.5, autoAlpha: 0.9, rotation: Math.random() * 60 - 30 },
      { scale: 1, autoAlpha: 0, duration: 0.9, ease: 'power2.out', onComplete: () => print.remove() },
    );
  });
  activity();

  return {
    add(cat, parent, className) {
      cat.root.classList.add(...className.split(' '));
      cat.root.cat = cat;
      parent.append(cat.root);
      all.add(cat);
      io.observe(cat.root);
      return cat;
    },
  };
}

function onView(el, enter, leave, threshold = 0.5) {
  new IntersectionObserver(
    (entries) => {
      for (const e of entries) (e.isIntersecting ? enter : leave)?.();
    },
    { threshold },
  ).observe(el);
}

const later = (s, fn) => gsap.delayedCall(motion.still ? 0 : s, fn);

// Typing "miau" or "meow" anywhere makes it rain cats. With motion paused, one cat just says it.
function wireMeowRain(t, m, cat) {
  const words = ['miau', 'meow'];
  let typed = '';
  const variants = Object.keys(VARIANTS);
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
    if (e.target.closest?.('input, textarea, [contenteditable]')) return;
    typed = (typed + e.key.toLowerCase()).slice(-4);
    if (!words.includes(typed)) return;
    typed = '';
    const layer = document.createElement('div');
    layer.className = 'cat-rain';
    layer.setAttribute('aria-hidden', 'true');
    document.body.append(layer);
    const count = motion.still ? 1 : 16;
    const vh = window.innerHeight;
    for (let i = 0; i < count; i++) {
      const size = 44 + Math.random() * 40;
      const c = m.add(cat(variants[(Math.random() * variants.length) | 0], 'sit', size), layer, 'cat-falling');
      gsap.set(c.root, { left: `${motion.still ? 50 : Math.random() * 92}%`, top: motion.still ? '40%' : -120 });
      if (motion.still) {
        c.say(t.secret, 1600);
        continue;
      }
      const land = vh - size - 8 - Math.random() * 40;
      gsap
        .timeline({ delay: i * 0.09 })
        .fromTo(c.root, { y: 0, rotation: Math.random() * 120 - 60 }, { y: land + 120, rotation: 0, duration: 0.7 + Math.random() * 0.4, ease: 'bounce.out' })
        .add(() => i % 4 === 0 && c.say(t.secret, 900))
        .to(c.root, { autoAlpha: 0, duration: 0.5 }, '+=1.1');
    }
    gsap.delayedCall(motion.still ? 2 : 3.6, () => layer.remove());
  });
}

function base(t) {
  const m = createManager();
  const cat = (variant, pose, size, name, rotate) => new Cat({ variant, pose, size, name, rotate, t });
  wireMeowRain(t, m, cat);

  // Footer: pops up to say bye when you reach the end of any page.
  const footer = document.querySelector('.site-footer');
  const bye = m.add(cat('calico', 'peek', 64, 'Fin'), footer, 'cat-footer');
  onView(
    footer,
    () => {
      bye.pop(true);
      later(0.5, () => {
        bye.bat(3);
        bye.say(t.bye);
      });
    },
    () => bye.pop(false),
    0.6,
  );
  return { m, cat };
}

// Case-study and résumé pages: a cat sits on the page's anchor element and greets on arrival.
export function installPageCats(t, perch) {
  const { m, cat } = base(t);
  if (!perch) return;
  const host = m.add(cat('tuxedo', 'sit', 58, 'Cache'), perch, 'cat-perch');
  later(0.8, () => host.hello());
}

const COMPANY_CATS = {
  baubap: ['tuxedo', 'Cache'],
  jumpcube: ['siamese', 'Lambda'],
  lets: ['gray', 'Timeout'],
  peacedev: ['orange', 'Match'],
  cuatroplus: ['tabby', 'Solar'],
  sena: ['calico', 'Señas'],
  propios: ['black', 'Orb'],
};

export function installHomeCats(t) {
  const { m, cat } = base(t);

  // Preloader: rides the loading bar and bats at it on every step.
  const pre = m.add(cat('calico', 'sit', 40), document.querySelector('.preloader-bar'), 'cat-on-bar');

  // Hero: peeks from the bottom edge after the portrait resolves; click for peekaboo.
  const hero = m.add(cat('snow', 'peek', 70, 'Pixel'), document.querySelector('.hero'), 'cat-hero');
  hero.onClick = () => {
    hero.say(t.boo);
    hero.pop(false);
    later(0.7, () => hero.pop(true));
  };

  // Menu: pops up when it opens.
  const menuCat = m.add(cat('calico', 'peek', 80), document.getElementById('menu'), 'cat-menu');

  // Wahi: sits on the browser frame and paws at the demo button when you point at it.
  const wahiFrame = document.querySelector('.wahi-shot');
  const wahiCat = m.add(cat('cream', 'sit', 60, 'Wahi'), wahiFrame, 'cat-perch');
  document.querySelectorAll('[data-demo]').forEach((b) => b.addEventListener('pointerenter', () => wahiCat.bat(2)));

  // About: asleep on the panel; wakes up when touched, then goes back to sleep.
  const aboutPanel = document.querySelector('#about .chapter-body');
  const sleeper = m.add(cat('orange', 'loaf', 104, 'Siesta'), aboutPanel, 'cat-panel cat-panel-loaf');
  let napTimer = null;
  const wake = () => {
    if (sleeper.awake) return;
    sleeper.open();
    sleeper.say(t.what);
    sleeper.flick();
    napTimer?.kill();
    napTimer = gsap.delayedCall(2.8, () => {
      sleeper.close();
      sleeper.snore();
    });
  };
  sleeper.onClick = wake;
  sleeper.svg.addEventListener('pointerenter', wake);
  onView(sleeper.root, () => !sleeper.awake && sleeper.snore(), null, 0.9);

  // More: the cat knocks the mug off the panel every time you arrive.
  const morePanel = document.querySelector('#more .chapter-body');
  const pusher = m.add(cat('cream', 'sit', 64, 'Caos'), morePanel, 'cat-panel cat-panel-pusher');
  const mug = document.createElement('span');
  mug.className = 'mug';
  mug.setAttribute('aria-hidden', 'true');
  mug.innerHTML = MUG;
  morePanel.append(mug);
  let armed = true;
  onView(
    morePanel,
    () => {
      if (!armed || motion.still) return;
      armed = false;
      const r = mug.getBoundingClientRect();
      pusher.look(r.left + r.width / 2, r.top + r.height / 2);
      gsap
        .timeline({ delay: 0.5 })
        .add(() => pusher.bat(1))
        .to(mug, { x: 6, rotation: 18, transformOrigin: '0% 100%', duration: 0.15, ease: 'power1.out' }, '+=0.12')
        .add(() => pusher.bat(1))
        .to(mug, { x: 34, y: 420, rotation: 220, autoAlpha: 0, duration: 0.9, ease: 'power2.in' }, '+=0.1')
        .add(() => pusher.say(t.oops), '-=0.6');
    },
    () => {
      armed = true;
      gsap.set(mug, { clearProps: 'all' });
    },
    0.6,
  );

  // Path: climbs the timeline as you scroll, from the first job to today; the year it reaches lights up.
  const pathPanel = document.querySelector('#path .chapter-body');
  const items = [...pathPanel.querySelectorAll('.timeline li')];
  const climber = m.add(cat('gray', 'peek', 44, 'Trepa', 90), pathPanel, 'cat-climb');
  climber.pop(true);
  let climbRaf = 0;
  let climbing = false;
  let climbY = null;
  const place = () => {
    climbRaf = 0;
    const vh = window.innerHeight;
    const list = items[0].parentElement.getBoundingClientRect();
    const panel = pathPanel.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (vh * 0.85 - (list.top + list.height / 2)) / (vh * 0.5)));
    const center = (li) => {
      const r = li.getBoundingClientRect();
      return r.top + r.height / 2 - panel.top;
    };
    const y = center(items[items.length - 1]) + (center(items[0]) - center(items[items.length - 1])) * p;
    let near = items[0];
    let best = Infinity;
    for (const li of items) {
      const d = Math.abs(center(li) - y);
      if (d < best) {
        best = d;
        near = li;
      }
    }
    items.forEach((li) => li.classList.toggle('is-here', li === near));
    const target = y - climber.root.offsetHeight / 2;
    if (climbY !== null && Math.abs(target - climbY) < 0.5) return;
    climbY = target;
    if (motion.still) gsap.set(climber.root, { y: target });
    else gsap.to(climber.root, { y: target, duration: 0.5, ease: 'power3.out', overwrite: true });
  };
  const queueClimb = () => climbing && !climbRaf && (climbRaf = requestAnimationFrame(place));
  window.addEventListener('scroll', queueClimb, { passive: true });
  window.addEventListener('resize', queueClimb);
  onView(pathPanel, () => ((climbing = true), queueClimb()), () => (climbing = false), 0);
  climber.onClick = () => climber.say(t.almost);

  // Contact: watches the booking and email links and paws at them when you point at them.
  const contactPanel = document.querySelector('#contact .chapter-body');
  const guard = m.add(cat('snow', 'sit', 64, 'Michi'), contactPanel, 'cat-panel');
  contactPanel.querySelectorAll('.contact-actions a, .contact-mail').forEach((a) => a.addEventListener('pointerenter', () => guard.bat(2)));
  guard.onClick = () => {
    guard.say(t.write);
    guard.hop();
  };

  const companyCats = new Map();
  let indexCat = null;

  return {
    preloader(progress) {
      pre.root.style.left = `calc(${progress * 100}% - 20px)`;
    },
    preloaderStep() {
      pre.bat(1);
    },
    heroIn() {
      hero.pop(true);
      later(0.6, () => hero.say(t.meow));
    },
    menu(open) {
      menuCat.pop(open);
      if (open) later(0.6, () => menuCat.say(t.where));
    },
    addCompanies(cards) {
      for (const card of cards) {
        const [variant, name] = COMPANY_CATS[card.company.id];
        companyCats.set(card.company.id, m.add(cat(variant, 'sit', 60, name), card.article, 'cat-perch'));
      }
      indexCat = m.add(cat('cream', 'sit', 30, 'Índice'), document.querySelector('.work-index'), 'cat-index');
      gsap.set(indexCat.root, { autoAlpha: 0 });
    },
    // The small cat in the index jumps to the company you are looking at.
    indexMoved(link) {
      if (!indexCat) return;
      const x = link.offsetLeft + link.offsetWidth + 14;
      const y = link.offsetTop + link.offsetHeight - indexCat.root.offsetHeight + 2;
      const first = !indexCat.placed;
      indexCat.placed = true;
      if (first || motion.still) {
        gsap.set(indexCat.root, { x, y, autoAlpha: 1 });
        return;
      }
      const from = gsap.getProperty(indexCat.root, 'y');
      gsap.to(indexCat.root, { x, duration: 0.45, ease: 'power1.inOut', overwrite: 'auto' });
      gsap.to(indexCat.root, { keyframes: { y: [from, Math.min(from, y) - 16, y], easeEach: 'sine.inOut' }, duration: 0.45 });
    },
    companySelected(id) {
      companyCats.get(id)?.hop();
    },
    posterPlayed(id) {
      companyCats.get(id)?.bat(1);
    },
  };
}
