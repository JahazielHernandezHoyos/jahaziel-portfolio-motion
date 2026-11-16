// The work section is rendered at build time (src/render/pages.js). This module finds those
// elements so main.js can wire posters and tabs, and swaps the panel when another top-3
// achievement is selected, using the same markup function as the build.

import { paths } from '../i18n.js';
import { panelHtml } from '../render/html.js';

export function fillPanel(panel, achievement, { lang, cases, readCase }) {
  const c = achievement.caseStudy && cases.find((x) => x.slug === achievement.caseStudy);
  panel.innerHTML = panelHtml(achievement, c ? { caseHref: paths.case(c, lang), caseLabel: readCase } : {});
}

export function hydrateCompanies(companies) {
  return companies.map((company) => {
    const article = document.getElementById(`c-${company.id}`);
    return {
      company,
      article,
      media: article.querySelector('.project-media'),
      tabs: [...article.querySelectorAll('[role="tab"]')],
      panel: article.querySelector('[role="tabpanel"]'),
      indicator: article.querySelector('.top3-indicator'),
    };
  });
}
