// Edit of the 15 s promo, cut to the reference reel's track (97.5 BPM). Beat times were measured
// from that audio: KICKS are the eight intro beats (one letter of the name each), HITS are the
// percussion hits after the drop at 4.865 s; every cut lands on one and every hit punches the frame.

export const FPS = 30;
export const DURATION = 15;
export const DROP = 4.865;
export const END = 14.106;

export const KICKS = [0, 0.557, 1.173, 1.788, 2.403, 3.03, 3.646, 4.261];
export const HITS = [
  4.865, 5.341, 5.793, 6.107, 6.409, 6.722, 7.036, 7.338, 7.802, 8.255, 8.568, 8.87, 9.172, 9.497, 9.799, 10.263,
  10.716, 11.041, 11.343, 11.656, 11.958, 12.272, 12.725, 13.177, 13.502, 13.804, 14.106, 14.431, 14.733,
];

// One letter per intro beat, each alone at its place in the word, then the full name on the drop.
export const INTRO_WORD = 'JAHAZIEL';

// Captured clips (promo/capture.mjs). start/speed map output time to clip time.
// zoom/offset frame the 1080x1920 capture:
// the settled portrait sits around y=690, and at 1.6× with this offset it fills the frame centre
// while the site's own header stays behind the open letterbox bars.
const HERO = { clip: 'hero', zoom: 1.6, offset: 432 };

export const SEGMENTS = [
  { from: 0, to: DROP, ...HERO, start: 0.8, speed: 1, dim: 0.42, kind: 'intro' },
  { from: DROP, to: 5.793, ...HERO, start: 5.6, speed: 0.4, dim: 0.62, kind: 'name' },
  { from: 5.793, to: 7.036, clip: 'work', start: 0.4, speed: 3.3, caption: { es: '4× MÁS CAPACIDAD', en: '4× MORE CAPACITY' } },
  { from: 7.036, to: 8.255, clip: 'tabs', start: 0, speed: 3.3, caption: { es: 'TOP 3 POR EMPRESA', en: 'TOP 3 PER COMPANY' } },
  { from: 8.255, to: 9.799, clip: 'corridor', start: 0.3, speed: 3.8, caption: { es: 'MI HISTORIA', en: 'MY STORY' } },
  { from: 9.799, to: 10.716, clip: 'wahi', start: 0.2, speed: 2.8, caption: { es: 'WAHI, MI PRODUCTO', en: 'WAHI, MY PRODUCT' } },
  { from: 10.716, to: 11.958, clip: 'case', start: 0, speed: 2.6, caption: { es: 'CASOS DE ESTUDIO', en: 'CASE STUDIES' } },
  { from: 11.958, to: 13.177, clip: 'rain', start: 0.1, speed: 2.2, caption: { es: 'ESCRIBE MIAU', en: 'TYPE MEOW' } },
  { from: 13.177, to: END, clip: 'cv', start: 0, speed: 3.2, caption: { es: 'CV EN PDF', en: 'RÉSUMÉ PDF' } },
  { from: END, to: DURATION, ...HERO, start: 6.9, speed: 0, dim: 0.72, kind: 'end' },
];

export const TEXT = {
  role: { es: 'INGENIERO BACKEND E IA', en: 'BACKEND AND AI ENGINEER' },
  hud: { es: 'PORTAFOLIO 2026', en: 'PORTFOLIO 2026' },
  url: 'jahaziel-portfolio-motion.vercel.app',
};
