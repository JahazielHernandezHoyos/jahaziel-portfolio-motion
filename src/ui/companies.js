// Builds the work section from src/content/companies.js: one article per company with its
// poster, a ranked tab list (top 3) and a panel describing the selected achievement.

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  }
  node.append(...children);
  return node;
}

const rank = (i) => String(i + 1).padStart(2, '0');

export function fillPanel(panel, achievement) {
  const children = [
    el('h4', { text: achievement.title }),
    el('p', { text: achievement.what }),
    el('p', { class: 'project-impact', text: achievement.impact }),
  ];
  if (achievement.link) {
    children.push(el('a', { class: 'project-link', href: achievement.link.href, target: '_blank', rel: 'noreferrer', text: achievement.link.label }));
  }
  panel.replaceChildren(...children);
}

export function renderCompanies(companies) {
  const list = document.querySelector('[data-companies]');
  const index = document.querySelector('[data-company-index]');

  return companies.map((company) => {
    const media = el('div', {
      class: 'project-media',
      'data-gl': 'poster',
      'data-poster': company.id,
      tabindex: '0',
      role: 'img',
      'aria-label': company.achievements[0].alt,
    });

    const tabs = company.achievements.map((a, i) =>
      el(
        'button',
        {
          type: 'button',
          role: 'tab',
          id: `tab-${company.id}-${i}`,
          'aria-controls': `panel-${company.id}`,
          'aria-selected': String(i === 0),
          tabindex: i === 0 ? '0' : '-1',
        },
        [el('span', { class: 'top-rank', text: rank(i) }), el('span', { class: 'top-title', text: a.title }), el('span', { class: 'top-value', text: a.short })],
      ),
    );

    const panel = el('div', { class: 'achievement', role: 'tabpanel', id: `panel-${company.id}`, 'aria-labelledby': `tab-${company.id}-0`, tabindex: '0' });
    fillPanel(panel, company.achievements[0]);

    const article = el('article', { class: 'company', id: `c-${company.id}` }, [
      media,
      el('div', { class: 'company-meta' }, [
        el('div', { class: 'company-side' }, [
          el('header', { class: 'company-head' }, [el('h3', { text: company.name }), el('p', { class: 'project-role', text: company.role })]),
          el('div', { class: 'top3', role: 'tablist', 'aria-label': `Top ${company.achievements.length} en ${company.name}` }, tabs),
        ]),
        panel,
      ]),
    ]);
    list.append(article);
    index.append(el('li', {}, [el('a', { href: `#c-${company.id}`, text: company.name })]));

    return { company, article, media, tabs, panel };
  });
}
