import gsap from 'gsap';

// One cat per section. Cats are inline SVG drawn from parts (head, eyes, tail, paws) so GSAP can
// move each part. Every behaviour is finite and triggered by something: a scroll, a click, a tab
// change, the cursor moving. Idle blinks stop after 25 s without input, when the cats fall asleep.

const NOSE = '#ff8fa3';
const VARIANTS = {
  snow: { body: '#f4f4f4', chest: '#ffffff', ear: '#ffc9d4', mark: '#d6d6d6', eye: '#7fc8ff', whisker: '#000', pattern: 'stripes' },
  calico: { body: '#f7f3ec', chest: '#ffffff', ear: '#ffc9d4', mark: '#e0802e', mark2: '#1a1a1a', eye: '#ffcc1f', whisker: '#000', pattern: 'calico' },
  black: { body: '#141414', chest: '#141414', ear: '#3a3a3a', mark: '#141414', eye: '#ffcc1f', whisker: '#fff', pattern: 'none' },
  tuxedo: { body: '#161616', chest: '#ffffff', ear: '#3a3a3a', mark: '#ffffff', eye: '#9be36b', whisker: '#fff', pattern: 'tuxedo' },
  siamese: { body: '#efe2cc', chest: '#f7eedf', ear: '#4a3426', mark: '#4a3426', eye: '#5ab0ff', whisker: '#000', pattern: 'siamese' },
  gray: { body: '#8b9097', chest: '#c9ccd0', ear: '#ffc9d4', mark: '#5f646a', eye: '#ffcc1f', whisker: '#000', pattern: 'stripes' },
  orange: { body: '#f08a24', chest: '#ffe0b8', ear: '#ffc9d4', mark: '#bf5e0c', eye: '#9be36b', whisker: '#000', pattern: 'stripes' },
  tabby: { body: '#8a6a4a', chest: '#e9dcc8', ear: '#ffc9d4', mark: '#4d3a28', eye: '#ffcc1f', whisker: '#000', pattern: 'stripes' },
  cream: { body: '#f1d9b5', chest: '#fff3e2', ear: '#ffc9d4', mark: '#cfa877', eye: '#7fc8ff', whisker: '#000', pattern: 'stripes' },
};

function pattern(v) {
  switch (v.pattern) {
    case 'stripes':
      return `<path d="M44 21 L46 29 M50 19.5 L50 28 M56 21 L54 29 M25.5 40 L32 41 M26 45 L32 44 M74.5 40 L68 41 M74 45 L68 44" stroke="${v.mark}" stroke-width="2.6" stroke-linecap="round" fill="none"/>`;
    case 'tuxedo':
      return `<ellipse cx="50" cy="51" rx="12" ry="8.5" fill="${v.chest}"/><path d="M50 19 L46 34 L54 34 Z" fill="${v.chest}"/>`;
    case 'siamese':
      return `<ellipse cx="50" cy="47" rx="14" ry="11.5" fill="${v.mark}" opacity="0.85"/>`;
    case 'calico':
      return `<path d="M26 37 L29 9 L47 25 Q38 30 31 43 Z" fill="${v.mark}"/><ellipse cx="63" cy="27" rx="9" ry="6.5" fill="${v.mark2}"/>`;
    default:
      return '';
  }
}

function head(v) {
  const ear = v.pattern === 'siamese' ? v.mark : v.ear;
  return `
  <g class="cat-head">
    <path d="M26 37 L29 9 L47 25 Z" fill="${v.body}"/>
    <path d="M74 37 L71 9 L53 25 Z" fill="${v.body}"/>
    <path d="M31 30 L32.5 16 L42 25.5 Z" fill="${ear}"/>
    <path d="M69 30 L67.5 16 L58 25.5 Z" fill="${ear}"/>
    <ellipse cx="50" cy="40" rx="25" ry="21" fill="${v.body}"/>
    ${pattern(v)}
    <g class="cat-eyes">
      <ellipse cx="40" cy="40" rx="5" ry="5.6" fill="${v.eye}"/>
      <ellipse cx="60" cy="40" rx="5" ry="5.6" fill="${v.eye}"/>
      <ellipse class="cat-pupil" cx="40" cy="40" rx="1.9" ry="4.3" fill="#000"/>
      <ellipse class="cat-pupil" cx="60" cy="40" rx="1.9" ry="4.3" fill="#000"/>
    </g>
    <path class="cat-closed" d="M35 41 Q40 45 45 41 M55 41 Q60 45 65 41" stroke="${v.whisker}" stroke-width="2" stroke-linecap="round" fill="none" opacity="0"/>
    <path d="M47.4 48 L52.6 48 L50 51 Z" fill="${NOSE}"/>
    <path d="M50 51 Q48.3 54 45.5 53 M50 51 Q51.7 54 54.5 53" stroke="${v.whisker}" stroke-width="1.3" stroke-linecap="round" fill="none"/>
    <path d="M31 48 L15 46 M31 51 L15 53.5 M69 48 L85 46 M69 51 L85 53.5" stroke="${v.whisker}" stroke-width="1" opacity="0.7"/>
  </g>`;
}

const POSES = {
  sit: {
    viewBox: '0 0 100 100',
    tailOrigin: '72 95',
    body: (v) => `
      <path class="cat-tail" d="M72 95 C94 97 99 76 90 64" stroke="${v.body}" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M25 99 C22 72 35 57 50 57 C65 57 78 72 75 99 Z" fill="${v.body}"/>
      <path d="M41 99 C41 80 45 66 50 66 C55 66 59 80 59 99 Z" fill="${v.chest}"/>
      ${head(v)}
      <ellipse class="cat-paw-l" cx="41" cy="96" rx="6.5" ry="4.5" fill="${v.chest}"/>
      <ellipse class="cat-paw-r" cx="59" cy="96" rx="6.5" ry="4.5" fill="${v.chest}"/>`,
  },
  peek: {
    viewBox: '0 0 100 70',
    body: (v) => `
      ${head(v)}
      <ellipse class="cat-paw-l" cx="35" cy="64" rx="8" ry="5.5" fill="${v.chest}"/>
      <ellipse class="cat-paw-r" cx="65" cy="64" rx="8" ry="5.5" fill="${v.chest}"/>`,
  },
  loaf: {
    viewBox: '0 0 120 84',
    body: (v) => `
      <ellipse cx="68" cy="62" rx="44" ry="19" fill="${v.body}"/>
      <path d="M58 52 Q70 46 84 52 M66 46 Q76 42 90 48" stroke="${v.mark}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
      <path class="cat-tail" d="M108 66 C116 82 76 84 46 80" stroke="${v.body}" stroke-width="8" stroke-linecap="round" fill="none"/>
      <g transform="translate(-12 16) scale(0.9)">${head(v)}</g>
      <ellipse class="cat-paw-l" cx="40" cy="79" rx="7" ry="4.5" fill="${v.chest}"/>
      <ellipse class="cat-paw-r" cx="55" cy="79" rx="7" ry="4.5" fill="${v.chest}"/>`,
  },
};

const PAW = '<svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="20" cy="27" rx="9" ry="8"/><ellipse cx="8.5" cy="16" rx="4" ry="5"/><ellipse cx="16" cy="9.5" rx="4" ry="5"/><ellipse cx="24" cy="9.5" rx="4" ry="5"/><ellipse cx="31.5" cy="16" rx="4" ry="5"/></svg>';
const MUG = '<svg viewBox="0 0 32 28" aria-hidden="true"><path d="M3 6 H22 V22 Q22 26 18 26 H7 Q3 26 3 22 Z" fill="#fff" stroke="#000" stroke-width="1.6"/><path d="M22 10 Q29 10 29 15 Q29 20 22 20" fill="none" stroke="#000" stroke-width="1.6"/><path d="M9 1 Q7 3 9 4.5 M15 1 Q13 3 15 4.5" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>';

export class Cat {
  constructor({ variant, pose = 'sit', size = 64, name = '', reduced = false, rotate = 0 }) {
    const v = VARIANTS[variant];
    const spec = POSES[pose];
    this.pose = pose;
    this.name = name;
    this.reduced = reduced;
    this.rotate = (rotate * Math.PI) / 180;
    this.tailOrigin = spec.tailOrigin;

    const root = document.createElement('span');
    root.className = `cat cat-${pose}`;
    root.style.setProperty('--cat-w', `${size}px`);
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML = `<span class="cat-clip"><svg viewBox="${spec.viewBox}">${spec.body(v)}</svg></span><span class="cat-bubble"></span><span class="cat-z"><i>z</i><i>z</i><i>Z</i></span>`;
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
    this.say(this.name ? `Soy ${this.name}, miau` : 'miau');
    this.hop();
  }
}

function createManager(reduced) {
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
    if (document.hidden) return;
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
    if (!timer && !reduced) timer = setTimeout(idle, 1500);
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

  if (!reduced) {
    document.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
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
  }
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

const COMPANY_CATS = {
  baubap: ['tuxedo', 'Cache'],
  jumpcube: ['siamese', 'Lambda'],
  lets: ['gray', 'Timeout'],
  peacedev: ['orange', 'Match'],
  cuatroplus: ['tabby', 'Solar'],
  sena: ['calico', 'Señas'],
  propios: ['black', 'Orb'],
};

export function installCats({ reduced }) {
  const m = createManager(reduced);
  const cat = (variant, pose, size, name, rotate) => new Cat({ variant, pose, size, name, reduced, rotate });

  // Preloader: rides the loading bar and bats at it on every step.
  const pre = m.add(cat('calico', 'sit', 40), document.querySelector('.preloader-bar'), 'cat-on-bar');

  // Hero: peeks from the bottom edge after the portrait resolves; click for peekaboo.
  const hero = m.add(cat('snow', 'peek', 70, 'Pixel'), document.querySelector('.hero'), 'cat-hero');
  hero.onClick = () => {
    hero.say('¡miau!');
    hero.pop(false);
    gsap.delayedCall(reduced ? 0 : 0.7, () => hero.pop(true));
  };

  // Menu: pops up when it opens.
  const menuCat = m.add(cat('calico', 'peek', 80), document.getElementById('menu'), 'cat-menu');

  // About: asleep on the panel; wakes up when touched, then goes back to sleep.
  const aboutPanel = document.querySelector('#sobre-mi .chapter-body');
  const sleeper = m.add(cat('orange', 'loaf', 104, 'Siesta'), aboutPanel, 'cat-panel cat-panel-loaf');
  let napTimer = null;
  const wake = () => {
    if (sleeper.awake) return;
    sleeper.open();
    sleeper.say('¿qué pasó?');
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
  const morePanel = document.querySelector('#mas .chapter-body');
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
      if (!armed || reduced) return;
      armed = false;
      const r = mug.getBoundingClientRect();
      pusher.look(r.left + r.width / 2, r.top + r.height / 2);
      gsap
        .timeline({ delay: 0.5 })
        .add(() => pusher.bat(1))
        .to(mug, { x: 6, rotation: 18, transformOrigin: '0% 100%', duration: 0.15, ease: 'power1.out' }, '+=0.12')
        .add(() => pusher.bat(1))
        .to(mug, { x: 34, y: 420, rotation: 220, autoAlpha: 0, duration: 0.9, ease: 'power2.in' }, '+=0.1')
        .add(() => pusher.say('ups'), '-=0.6');
    },
    () => {
      armed = true;
      gsap.set(mug, { clearProps: 'all' });
    },
    0.6,
  );

  // Path: climbs the timeline as you scroll, from the first job to today; the year it reaches lights up.
  const pathPanel = document.querySelector('#trayectoria .chapter-body');
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
    if (reduced) gsap.set(climber.root, { y: target });
    else gsap.to(climber.root, { y: target, duration: 0.5, ease: 'power3.out', overwrite: true });
  };
  const queueClimb = () => climbing && !climbRaf && (climbRaf = requestAnimationFrame(place));
  window.addEventListener('scroll', queueClimb, { passive: true });
  window.addEventListener('resize', queueClimb);
  onView(pathPanel, () => ((climbing = true), queueClimb()), () => (climbing = false), 0);
  climber.onClick = () => climber.say('¡ya casi llego!');

  // Contact: watches the email and paws at it when you hover it.
  const contactPanel = document.querySelector('#contacto .chapter-body');
  const guard = m.add(cat('snow', 'sit', 64, 'Michi'), contactPanel, 'cat-panel');
  const mail = contactPanel.querySelector('.contact-mail');
  mail.addEventListener('pointerenter', () => guard.bat(2));
  guard.onClick = () => {
    guard.say('escríbele, no muerdo');
    guard.hop();
  };

  // Footer: pops up to say bye when you reach the end.
  const bye = m.add(cat('calico', 'peek', 64, 'Fin'), document.querySelector('.site-footer'), 'cat-footer');
  onView(
    document.querySelector('.site-footer'),
    () => {
      bye.pop(true);
      gsap.delayedCall(reduced ? 0 : 0.5, () => {
        bye.bat(3);
        bye.say('¡chao!');
      });
    },
    () => bye.pop(false),
    0.6,
  );

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
      gsap.delayedCall(reduced ? 0 : 0.6, () => hero.say('miau'));
    },
    menu(open) {
      menuCat.pop(open);
      if (open) gsap.delayedCall(reduced ? 0 : 0.6, () => menuCat.say('¿a dónde vamos?'));
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
      if (first || reduced) {
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
