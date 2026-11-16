// Cat drawings as SVG strings, with no DOM access, so the build-time renderer (share images)
// and the animated Cat class in cats.js use the same artwork. Parts carry class names
// (cat-head, cat-eyes, cat-tail, cat-paw-r...) that cats.js animates.

const NOSE = '#ff8fa3';
export const VARIANTS = {
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

export const POSES = {
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

export const PAW = '<svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="20" cy="27" rx="9" ry="8"/><ellipse cx="8.5" cy="16" rx="4" ry="5"/><ellipse cx="16" cy="9.5" rx="4" ry="5"/><ellipse cx="24" cy="9.5" rx="4" ry="5"/><ellipse cx="31.5" cy="16" rx="4" ry="5"/></svg>';
export const MUG = '<svg viewBox="0 0 32 28" aria-hidden="true"><path d="M3 6 H22 V22 Q22 26 18 26 H7 Q3 26 3 22 Z" fill="#fff" stroke="#000" stroke-width="1.6"/><path d="M22 10 Q29 10 29 15 Q29 20 22 20" fill="none" stroke="#000" stroke-width="1.6"/><path d="M9 1 Q7 3 9 4.5 M15 1 Q13 3 15 4.5" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>';

export function catSvg(variant, pose = 'sit') {
  const spec = POSES[pose];
  return `<svg viewBox="${spec.viewBox}" aria-hidden="true">${spec.body(VARIANTS[variant])}</svg>`;
}
