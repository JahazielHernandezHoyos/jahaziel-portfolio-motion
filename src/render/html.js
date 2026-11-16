// Tiny string helpers shared by the build-time page renderer and the browser (panel swaps).

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

// Attribute object -> string; false/null/undefined drop the attribute, true renders it bare.
export function attrs(obj) {
  return Object.entries(obj)
    .filter(([, v]) => v !== false && v !== null && v !== undefined)
    .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${esc(v)}"`))
    .join('');
}

export const external = { target: '_blank', rel: 'noreferrer' };

// Body of the selected-achievement panel; `caseHref`/`caseLabel` add the case-study link.
export function panelHtml(a, { caseHref, caseLabel } = {}) {
  const links = [];
  if (caseHref) links.push(`<a class="project-link project-link-case"${attrs({ href: caseHref })}>${esc(caseLabel)}</a>`);
  if (a.link) links.push(`<a class="project-link"${attrs({ href: a.link.href, ...external })}>${esc(a.link.label)}</a>`);
  return `<h4>${esc(a.title)}</h4><p>${esc(a.what)}</p><p class="project-impact">${esc(a.impact)}</p>${
    links.length ? `<p class="project-links">${links.join('')}</p>` : ''
  }`;
}
