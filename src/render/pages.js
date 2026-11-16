// Renders every page of the site to static HTML at build time (and per request in dev), so
// content, metadata and share previews exist without JavaScript. vite.config.js turns each route
// into an HTML entry; the browser entries (main.js, page.js) only add behaviour.

import { cases } from '../content/cases.js';
import { companies } from '../content/companies.js';
import { cv } from '../content/cv.js';
import { CALENDLY, EMAIL, LANGS, SITE, fill, localize, paths, ui } from '../i18n.js';
import { catSvg } from '../ui/cat-svg.js';
import { attrs, esc, external, panelHtml } from './html.js';

const GITHUB = 'https://github.com/JahazielHernandezHoyos';
const LINKEDIN = 'https://www.linkedin.com/in/jahaziel-anthony-h-6586b5139/';
const caseBySlug = new Map(cases.map((c) => [c.slug, c]));

export function routes() {
  const list = [];
  for (const lang of LANGS) {
    list.push({ kind: 'home', lang, path: paths.home(lang) });
    list.push({ kind: 'cv', lang, path: paths.cv(lang) });
    for (const c of cases) list.push({ kind: 'case', lang, slug: c.slug, path: paths.case(c, lang) });
  }
  return list.map((r) => ({ ...r, file: `${r.path.slice(1)}index.html` }));
}

const other = (lang) => (lang === 'es' ? 'en' : 'es');

function counterpart(route) {
  const lang = other(route.lang);
  if (route.kind === 'home') return paths.home(lang);
  if (route.kind === 'cv') return paths.cv(lang);
  return paths.case(caseBySlug.get(route.slug), lang);
}

const PAUSE_ICON =
  '<svg viewBox="0 0 20 20" aria-hidden="true"><rect class="i-pause" x="5" y="4" width="3.4" height="12"/><rect class="i-pause" x="11.6" y="4" width="3.4" height="12"/><path class="i-play" d="M6 4 L16 10 L6 16 Z"/></svg>';

// Runs before first paint so a paused visitor never sees a frame of motion.
const MOTION_BOOT = `try{var s=localStorage.getItem('motion');if(s==='paused'||(s===null&&matchMedia('(prefers-reduced-motion: reduce)').matches))document.documentElement.classList.add('still')}catch(e){}`;

function doc({ route, title, description, type = 'website', body, entry, bodyClass = '' }) {
  const t = ui(route.lang);
  const alt = counterpart(route);
  const esPath = route.lang === 'es' ? route.path : alt;
  const enPath = route.lang === 'en' ? route.path : alt;
  const image = `${SITE}${paths.og(route.lang)}`;
  return `<!doctype html>
<html lang="${route.lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${SITE}${route.path}" />
    <link rel="alternate" hreflang="es" href="${SITE}${esPath}" />
    <link rel="alternate" hreflang="en" href="${SITE}${enPath}" />
    <link rel="alternate" hreflang="x-default" href="${SITE}${esPath}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:site_name" content="Jahaziel Hernández" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${SITE}${route.path}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(t.meta.title)}" />
    <meta property="og:locale" content="${t.meta.locale}" />
    <meta property="og:locale:alternate" content="${ui(other(route.lang)).meta.locale}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="theme-color" content="#000000" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <script>${MOTION_BOOT}</script>
  </head>
  <body class="${bodyClass}">
${body}
    <script type="module" src="${entry}"></script>
  </body>
</html>
`;
}

function header(route, { home }) {
  const t = ui(route.lang).nav;
  const homeHref = paths.home(route.lang);
  const talk = home ? '#contact' : `${homeHref}#contact`;
  return `<header class="site-header">
      <a class="brand" href="${homeHref}">Jahaziel Hernández</a>
      <nav class="header-nav" aria-label="${esc(t.sections)}">
        <a class="lang-switch"${attrs({ href: counterpart(route), hreflang: other(route.lang), lang: other(route.lang), 'aria-label': t.switchLabel })}>${esc(t.switchTo)}</a>
        <button class="motion-toggle" type="button" data-motion-toggle aria-pressed="false" aria-label="${esc(t.pause)}">${PAUSE_ICON}</button>
        <a href="${talk}">${esc(t.talk)}</a>
        ${home ? `<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu" data-open="${esc(t.menu)}" data-close="${esc(t.close)}">${esc(t.menu)}</button>` : ''}
      </nav>
    </header>`;
}

function footer(route) {
  const t = ui(route.lang);
  return `<footer class="site-footer">
      <span>Jahaziel Hernández</span>
      <a href="${paths.cv(route.lang)}">${esc(t.nav.cv)}</a>
      <span>${esc(t.footer.place)}</span>
    </footer>`;
}

function companyHtml(company, lang) {
  const t = ui(lang).work;
  const a0 = company.achievements[0];
  const caseOpts = (a) =>
    a.caseStudy ? { caseHref: paths.case(caseBySlug.get(a.caseStudy), lang), caseLabel: t.readCase } : {};
  const tabs = company.achievements
    .map(
      (a, i) => `<button${attrs({
        type: 'button',
        role: 'tab',
        id: `tab-${company.id}-${i}`,
        'aria-controls': `panel-${company.id}`,
        'aria-selected': String(i === 0),
        tabindex: i === 0 ? '0' : '-1',
        style: `--i: ${i}`,
      })}><span class="top-rank">${String(i + 1).padStart(2, '0')}</span><span class="top-title">${esc(a.title)}</span><span class="top-value">${esc(a.short)}</span></button>`,
    )
    .join('');
  return `<article class="company" id="c-${company.id}">
            <div${attrs({ class: 'project-media', 'data-gl': 'poster', 'data-poster': company.id, tabindex: '0', role: 'img', 'aria-label': a0.alt })}></div>
            <div class="company-meta">
              <div class="company-side">
                <header class="company-head"><h3><span class="reveal-line">${esc(company.name)}</span></h3><p class="project-role">${esc(company.role)}</p></header>
                <div class="top3" role="tablist" aria-label="${esc(fill(t.top, { n: company.achievements.length, company: company.name }))}"><span class="top3-indicator" aria-hidden="true"></span>${tabs}</div>
              </div>
              <div class="achievement" role="tabpanel" id="panel-${company.id}" aria-labelledby="tab-${company.id}-0" tabindex="0">${panelHtml(a0, caseOpts(a0))}</div>
            </div>
          </article>`;
}

function home(route) {
  const { lang } = route;
  const t = ui(lang);
  const list = localize(companies, lang);
  const ext = attrs(external);
  const body = `    <div class="preloader" aria-hidden="true">
      <span class="preloader-label">${esc(t.loading)}</span>
      <div class="preloader-bar"><i></i></div>
    </div>

    <canvas class="gl" aria-hidden="true"></canvas>

    ${header(route, { home: true })}

    <div class="menu" id="menu" hidden>
      <nav aria-label="${esc(t.nav.sections)}">
        <a href="#top">${esc(t.nav.home)}</a>
        <a href="#work">${esc(t.nav.work)}</a>
        <a href="#wahi">${esc(t.nav.wahi)}</a>
        <a href="#about">${esc(t.nav.about)}</a>
        <a href="#path">${esc(t.nav.path)}</a>
        <a href="#contact">${esc(t.nav.contact)}</a>
        <a href="${paths.cv(lang)}">${esc(t.nav.cv)}</a>
      </nav>
    </div>

    <main>
      <section class="hero" id="top" data-gl="hero">
        <img class="hero-fallback" src="/portrait.jpg" alt="${esc(t.hero.alt)}" />
        <div class="hero-name">
          <h1 data-scramble>Jahaziel Hernández</h1>
          <p>${esc(t.hero.role)} <span>${esc(t.hero.place)}</span></p>
        </div>
        <p class="hero-intro" data-scramble>${esc(t.hero.intro)}</p>
        <p class="hero-hint">${esc(t.hero.hint)}</p>
      </section>

      <section class="work" id="work">
        <aside class="work-index">
          <h2>${esc(t.work.heading)}</h2>
          <ol>${list.map((c) => `<li><a href="#c-${c.id}">${esc(c.name)}</a></li>`).join('')}</ol>
        </aside>
        <div class="work-list">
          ${list.map((c) => companyHtml(c, lang)).join('\n          ')}
        </div>
      </section>

      <section class="wahi" id="wahi">
        <figure class="wahi-shot">
          <div class="wahi-bar" aria-hidden="true"><i></i><i></i><i></i><span>wahi.jhzel.com</span></div>
          <img src="/wahi-${lang}.jpg" width="1440" height="688" loading="lazy" alt="${esc(t.wahi.alt)}" />
        </figure>
        <div class="wahi-copy">
          <h2>${esc(t.wahi.title)}</h2>
          ${t.wahi.body.map((p) => `<p>${esc(p)}</p>`).join('\n          ')}
          <p class="wahi-status">${esc(t.wahi.status)}</p>
          <p class="actions">
            <a class="btn btn-solid" data-demo href="${CALENDLY}"${ext}>${esc(t.wahi.demo)}</a>
            <a class="btn" href="https://wahi.jhzel.com/${lang}"${ext}>${esc(t.wahi.visit)}</a>
            <a class="btn" href="https://github.com/JahazielHernandezHoyos/openwahi"${ext}>${esc(t.wahi.code)}</a>
          </p>
        </div>
      </section>

      <div class="corridor" data-gl="corridor">
        <section class="chapter" id="about" data-tint="about">
          <div class="chapter-body">
            <h2 data-scramble>${esc(t.about.heading)}</h2>
            ${t.about.body.map((p) => `<p>${esc(p)}</p>`).join('\n            ')}
          </div>
        </section>

        <section class="chapter" id="more" data-tint="more">
          <div class="chapter-body">
            <h2 data-scramble>${esc(t.more.heading)}</h2>
            <ul class="more-list">
              ${t.more.items.map(([href, label, rest]) => `<li><a href="${href}"${ext}>${esc(label)}</a>, ${esc(rest)}</li>`).join('\n              ')}
            </ul>
          </div>
        </section>

        <section class="chapter" id="path" data-tint="path">
          <div class="chapter-body">
            <h2 data-scramble>${esc(t.path.heading)}</h2>
            <ol class="timeline">
              ${t.path.items.map(([when, what]) => `<li><span>${esc(when)}</span>${esc(what)}</li>`).join('\n              ')}
            </ol>
          </div>
        </section>

        <section class="chapter" id="contact" data-tint="contact">
          <div class="chapter-body">
            <h2 data-scramble>${esc(t.contact.heading)}</h2>
            <p>${esc(t.contact.body)}</p>
            <p class="actions contact-actions">
              <a class="btn btn-light" href="${CALENDLY}"${ext}>${esc(t.contact.book)}</a>
              <a class="btn btn-ghost" href="${paths.cvPdf(lang)}" download>${esc(t.contact.cv)}</a>
            </p>
            <a class="contact-mail" href="mailto:${EMAIL}">${EMAIL}</a>
            <ul class="contact-links">
              <li><a href="${GITHUB}"${ext}>GitHub</a></li>
              <li><a href="${LINKEDIN}"${ext}>LinkedIn</a></li>
            </ul>
          </div>
        </section>
      </div>

      ${footer(route)}
    </main>`;
  return doc({ route, title: t.meta.title, description: t.meta.description, body, entry: '/src/main.js' });
}

function casePage(route) {
  const { lang } = route;
  const t = ui(lang);
  const c = localize(caseBySlug.get(route.slug), lang);
  const next = localize(cases.find((x) => x.slug !== route.slug), lang);
  const companyId = companies.find((co) => co.achievements.some((a) => a.caseStudy === route.slug)).id;
  const body = `    ${header(route, { home: false })}
    <main class="page case">
      <p class="page-back"><a href="${paths.home(lang)}#c-${companyId}">${esc(t.case.back)}</a></p>
      <p class="case-meta">${esc(c.company)}, ${c.year}</p>
      <h1 class="case-title" data-scramble>${esc(c.title)}</h1>
      <p class="case-summary">${esc(c.summary)}</p>
      <dl class="case-metrics">
        ${c.metrics.map((m) => `<div><dt>${esc(m.label)}</dt><dd data-count>${esc(m.value)}</dd></div>`).join('\n        ')}
      </dl>
      ${c.sections
        .map((s) => `<section class="case-section"><h2>${esc(s.heading)}</h2>${s.body.map((p) => `<p>${esc(p)}</p>`).join('')}</section>`)
        .join('\n      ')}
      <p class="case-stack"><strong>${esc(t.case.stack)}</strong> ${esc(c.stack.join(', '))}</p>
      <p class="case-note">${esc(t.case.note)}</p>
      <p class="case-next">${esc(t.case.other)}: <a href="${paths.case(caseBySlug.get(next.slug), lang)}">${esc(next.title)}</a></p>
    </main>
    ${footer(route)}`;
  return doc({ route, title: `${c.title} — Jahaziel Hernández`, description: c.summary, type: 'article', body, entry: '/src/page.js', bodyClass: 'paper-page' });
}

function cvPage(route) {
  const { lang } = route;
  const t = ui(lang);
  const r = localize(cv, lang);
  const body = `    ${header(route, { home: false })}
    <main class="page cv">
      <p class="actions cv-actions">
        <a class="btn btn-solid" href="${paths.cvPdf(lang)}" download>${esc(t.cv.download)}</a>
        <button class="btn" type="button" data-print>${esc(t.cv.print)}</button>
      </p>
      <header class="cv-head">
        <h1>${esc(r.name)}</h1>
        <p class="cv-headline">${esc(r.headline)}</p>
        <p class="cv-contact"><span>${esc(r.location)}</span>${r.links.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join('')}</p>
      </header>
      <section><h2>${esc(t.cv.summary)}</h2><p>${esc(r.summary)}</p></section>
      <section>
        <h2>${esc(t.cv.experience)}</h2>
        ${r.experience
          .map(
            (j) => `<article class="cv-job"><h3>${esc(j.role)}, ${esc(j.company)}</h3><p class="cv-when">${esc(j.dates)}. ${esc(j.place)}</p><ul>${j.bullets
              .map((b) => `<li>${esc(b)}</li>`)
              .join('')}</ul></article>`,
          )
          .join('\n        ')}
      </section>
      <section>
        <h2>${esc(t.cv.skills)}</h2>
        <dl class="cv-skills">${r.skills.map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.items)}</dd></div>`).join('')}</dl>
      </section>
      <section><h2>${esc(t.cv.education)}</h2><ul>${r.education.map((e) => `<li>${esc(e)}</li>`).join('')}</ul></section>
      <section><h2>${esc(t.cv.languages)}</h2><p>${esc(r.languages)}</p></section>
    </main>
    ${footer(route)}`;
  return doc({ route, title: t.cv.title, description: r.summary, body, entry: '/src/page.js', bodyClass: 'paper-page' });
}

export function renderRoute(route) {
  if (route.kind === 'home') return home(route);
  if (route.kind === 'case') return casePage(route);
  return cvPage(route);
}

// 1200x630 share image, rendered in the dev server and captured to public/og-{lang}.png.
export function renderOg(lang) {
  const t = ui(lang);
  const metrics = {
    es: [['4×', 'capacidad por instancia'], ['71×', 'lecturas más rápidas'], ['10 días', 'de diseño a producción']],
    en: [['4×', 'capacity per instance'], ['71×', 'faster reads'], ['10 days', 'from design to production']],
  }[lang];
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="UTF-8" />
<script type="module">import '@fontsource-variable/anybody/standard.css';</script>
<style>
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: #000; color: #fff; font-family: 'Anybody Variable', sans-serif; }
  .og { position: relative; box-sizing: border-box; width: 1200px; height: 630px; padding: 64px 72px; display: grid; grid-template-rows: auto 1fr auto; }
  h1 { margin: 0; font-size: 84px; line-height: 0.95; font-weight: 800; font-stretch: 140%; letter-spacing: -0.01em; max-width: 820px; }
  .role { margin: 18px 0 0; font-size: 34px; font-stretch: 75%; color: #b9bdc2; }
  .metrics { display: flex; gap: 56px; margin: 0; align-self: end; }
  .metrics div { display: grid; gap: 4px; }
  .metrics dd { margin: 0; font-size: 64px; font-weight: 800; font-stretch: 125%; line-height: 1; order: -1; }
  .metrics dt { font-size: 24px; font-stretch: 75%; color: #b9bdc2; }
  .cat { position: absolute; right: 72px; top: 150px; width: 230px; }
  .cat svg { display: block; width: 100%; height: auto; }
  .site { position: absolute; right: 72px; bottom: 56px; font-size: 22px; font-stretch: 75%; color: #9aa0a6; }
</style></head>
<body><div class="og">
  <div><h1>Jahaziel Hernández</h1><p class="role">${esc(t.hero.role)}</p></div>
  <span></span>
  <dl class="metrics">${metrics.map(([v, l]) => `<div><dt>${esc(l)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  <div class="cat">${catSvg('tuxedo', 'sit')}</div>
  <span class="site">${SITE.replace('https://', '')}</span>
</div></body></html>`;
}
