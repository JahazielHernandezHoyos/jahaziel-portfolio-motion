// Shared by the build-time renderer (vite.config.js) and the browser. Content files store every
// user-facing string as { es, en }; localize() resolves a whole tree to one language.

// Canonical origin for links and share images. Switch to https://me.jhzel.com once its DNS
// record exists; until then share previews must point at a host that resolves.
export const SITE = 'https://jahaziel-portfolio-motion.vercel.app';
export const LANGS = ['es', 'en'];
export const CALENDLY = 'https://calendly.com/jahazielhernandezhoyos/30min';
export const EMAIL = 'jahazielhernandezhoyoz@gmail.com';

const isPair = (v) => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 2 && 'es' in v && 'en' in v;

export function localize(value, lang) {
  if (isPair(value)) return value[lang];
  if (Array.isArray(value)) return value.map((v) => localize(v, lang));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = localize(v, lang);
    return out;
  }
  return value;
}

export const paths = {
  home: (lang) => (lang === 'en' ? '/en/' : '/'),
  cv: (lang) => (lang === 'en' ? '/en/cv/' : '/cv/'),
  cvPdf: (lang) => `/cv/jahaziel-hernandez-cv-${lang}.pdf`,
  case: (c, lang) => (lang === 'en' ? `/en/cases/${c.enSlug}/` : `/casos/${c.slug}/`),
  og: (lang) => `/og-${lang}.png`,
};

export const ui = localize.bind(null, {
  meta: {
    title: { es: 'Jahaziel Hernández — Ingeniero backend e IA', en: 'Jahaziel Hernández — Backend and AI engineer' },
    description: {
      es: 'Ingeniero backend que lleva agentes de IA a producción y los hace aguantar: 4× más capacidad, lecturas 71× más rápidas. Colombia, remoto.',
      en: 'Backend engineer who takes AI agents to production and keeps them standing: 4× capacity, 71× faster reads. Colombia, remote.',
    },
    locale: { es: 'es_CO', en: 'en_US' },
  },
  loading: { es: 'Cargando', en: 'Loading' },
  nav: {
    talk: { es: 'Hablemos', en: "Let's talk" },
    menu: { es: 'Menú', en: 'Menu' },
    close: { es: 'Cerrar', en: 'Close' },
    sections: { es: 'Secciones', en: 'Sections' },
    home: { es: 'Inicio', en: 'Home' },
    work: { es: 'Por empresa', en: 'By company' },
    wahi: { es: 'Wahi', en: 'Wahi' },
    about: { es: 'Sobre mí', en: 'About' },
    more: { es: 'Más cosas', en: 'More' },
    path: { es: 'Trayectoria', en: 'Experience' },
    contact: { es: 'Contacto', en: 'Contact' },
    cv: { es: 'CV', en: 'Résumé' },
    switchTo: { es: 'English', en: 'Español' },
    switchLabel: { es: 'Ver en inglés', en: 'Ver en español' },
    pause: { es: 'Pausar animación', en: 'Pause motion' },
    resume: { es: 'Reanudar animación', en: 'Resume motion' },
  },
  hero: {
    role: { es: 'Ingeniero backend e IA', en: 'Backend and AI engineer' },
    place: { es: 'Colombia', en: 'Colombia' },
    intro: {
      es: 'Llevo agentes de IA a producción y me encargo de que aguanten: que no se caigan, que respondan rápido y que cuesten menos.',
      en: 'I take AI agents to production and make sure they hold up: they stay up, answer fast and cost less to run.',
    },
    alt: { es: 'Jahaziel Hernández en la montaña', en: 'Jahaziel Hernández in the mountains' },
    hint: { es: 'Desliza', en: 'Scroll' },
  },
  work: {
    heading: { es: 'Lo mejor de cada empresa', en: 'The best from each company' },
    top: { es: 'Top {n} en {company}', en: 'Top {n} at {company}' },
    readCase: { es: 'Leer el caso completo', en: 'Read the full case study' },
  },
  // Fixed words drawn inside the animated posters.
  posterLabels: {
    limit: { es: 'límite', en: 'limit' },
    saturates: { es: 'se satura', en: 'saturates' },
    serial: { es: 'Uno tras otro', en: 'One after another' },
    parallel: { es: 'En paralelo', en: 'In parallel' },
    timeoutsBefore: { es: 'timeouts antes', en: 'timeouts before' },
    signTitle: { es: 'Lengua de señas a texto', en: 'Sign language to text' },
    vowels: { es: 'vocales reconocidas en tiempo real', en: 'vowels recognised in real time' },
  },
  wahi: {
    title: { es: 'Wahi: tu WhatsApp atiende y vende con IA', en: 'Wahi: your WhatsApp handles support and sales with AI' },
    body: {
      es: [
        'Wahi conecta un número de WhatsApp con un agente de IA que responde con los datos reales del negocio: catálogo, políticas y preguntas frecuentes. Se conecta escaneando un QR y queda listo en minutos.',
        'Lo diseñé y lo opero de punta a punta: backend en FastAPI y LangGraph, búsqueda semántica con Qdrant, frontend en Next.js e infraestructura propia. El motor es open source.',
      ],
      en: [
        "Wahi connects a WhatsApp number to an AI agent that answers with the business's real data: catalog, policies and FAQs. You connect it by scanning a QR code and it is ready in minutes.",
        'I designed it and run it end to end: FastAPI and LangGraph backend, semantic search with Qdrant, Next.js frontend and self-managed infrastructure. The engine is open source.',
      ],
    },
    status: { es: 'En acceso anticipado.', en: 'In early access.' },
    visit: { es: 'Visitar wahi.jhzel.com', en: 'Visit wahi.jhzel.com' },
    demo: { es: 'Agendar una demo', en: 'Book a demo' },
    code: { es: 'Ver el motor open source', en: 'See the open-source engine' },
    alt: { es: 'Página de inicio de Wahi', en: 'Wahi landing page' },
  },
  about: {
    heading: { es: 'Sobre mí', en: 'About' },
    body: {
      es: [
        'Soy de Marinilla, Antioquia. Empecé en una Tecnoacademia del SENA entrenando redes neuronales para la lengua de señas y hoy diseño y opero los backends que ponen a trabajar agentes de IA con clientes reales.',
        'Lo que más disfruto es encontrar la causa raíz: reproducir la falla, medirla y arreglarla con evidencia. En los últimos seis meses mergeé más de 170 PRs en una docena de servicios.',
      ],
      en: [
        "I'm from Marinilla, Antioquia, Colombia. I started at a SENA Tecnoacademia training neural networks for sign language, and today I design and run the backends that put AI agents to work with real customers.",
        'What I enjoy most is finding the root cause: reproduce the failure, measure it and fix it with evidence. In the last six months I merged more than 170 PRs across a dozen services.',
      ],
    },
  },
  more: {
    heading: { es: 'Más cosas que hice', en: 'More things I did' },
    items: {
      es: [
        ['https://web.archive.org/web/20230103060141/https://encuentromundialbigdata.com/2021/conferencista/jahaziel-antony-hernandez/', 'Charla en el Encuentro Mundial de Big Data 2021', 'sobre visión artificial para la lengua de señas colombiana.'],
        ['https://revistas.sena.edu.co/index.php/conciencia/article/view/4525', 'Segundo artículo publicado (2022)', 'sobre MediaPipe para reconocer las vocales de la lengua de señas.'],
        ['https://www.youtube.com/channel/UCAcWYVxjxCIh8XybsaVluMw', 'Curioso Código', 'mi canal de YouTube sobre programación, con 33 videos.'],
      ],
      en: [
        ['https://web.archive.org/web/20230103060141/https://encuentromundialbigdata.com/2021/conferencista/jahaziel-antony-hernandez/', 'Talk at the 2021 World Big Data Meeting', 'on computer vision for Colombian sign language.'],
        ['https://revistas.sena.edu.co/index.php/conciencia/article/view/4525', 'Second published paper (2022)', 'on using MediaPipe to recognise sign-language vowels.'],
        ['https://www.youtube.com/channel/UCAcWYVxjxCIh8XybsaVluMw', 'Curioso Código', 'my Spanish-language programming channel on YouTube, 33 videos.'],
      ],
    },
  },
  path: {
    heading: { es: 'Trayectoria', en: 'Experience' },
    items: {
      es: [
        ['2026 – hoy', 'Backend e IA en Baubap, fintech de México (remoto)'],
        ['2026 – hoy', 'Fundador de Wahi'],
        ['2024 – 2026', 'Tech lead backend en Jump Cube Technologies, Colombia'],
        ['2023 – 2024', "Tech lead en Let's Do It Now, Nueva York"],
        ['2022 – 2023', 'Líder técnico backend en Peacedev, Colombia'],
        ['2022', 'Ingeniero backend en 4Plus Ingenieros, España'],
        ['2021 – 2022', 'Investigación y docencia en Tecnoacademia SENA'],
      ],
      en: [
        ['2026 – present', 'Backend and AI at Baubap, a Mexican fintech (remote)'],
        ['2026 – present', 'Founder of Wahi'],
        ['2024 – 2026', 'Backend tech lead at Jump Cube Technologies, Colombia'],
        ['2023 – 2024', "Tech lead at Let's Do It Now, New York"],
        ['2022 – 2023', 'Backend tech lead at Peacedev, Colombia'],
        ['2022', 'Backend engineer at 4Plus Ingenieros, Spain'],
        ['2021 – 2022', 'Research and teaching at Tecnoacademia SENA'],
      ],
    },
  },
  contact: {
    heading: { es: 'Hablemos de tu próximo sistema', en: "Let's talk about your next system" },
    body: {
      es: 'Agenda 30 minutos o escríbeme y te respondo con una primera idea de arquitectura.',
      en: "Book 30 minutes or write to me and I'll reply with a first take on the architecture.",
    },
    book: { es: 'Agendar 30 minutos', en: 'Book 30 minutes' },
    cv: { es: 'Descargar CV (PDF)', en: 'Download résumé (PDF)' },
  },
  footer: {
    place: { es: 'Marinilla, Colombia, 2026', en: 'Marinilla, Colombia, 2026' },
  },
  case: {
    back: { es: 'Volver al portafolio', en: 'Back to the portfolio' },
    stack: { es: 'Tecnologías', en: 'Stack' },
    other: { es: 'Otro caso', en: 'Another case study' },
    note: {
      es: 'Versión pública: sin nombres internos ni datos de clientes.',
      en: 'Public version: no internal names or customer data.',
    },
  },
  cv: {
    title: { es: 'CV — Jahaziel Hernández', en: 'Résumé — Jahaziel Hernández' },
    download: { es: 'Descargar PDF', en: 'Download PDF' },
    print: { es: 'Imprimir', en: 'Print' },
    summary: { es: 'Perfil', en: 'Summary' },
    experience: { es: 'Experiencia', en: 'Experience' },
    skills: { es: 'Habilidades', en: 'Skills' },
    education: { es: 'Formación y reconocimientos', en: 'Education and recognition' },
    languages: { es: 'Idiomas', en: 'Languages' },
  },
  cats: {
    meow: { es: 'miau', en: 'meow' },
    hi: { es: 'Soy {name}, miau', en: "I'm {name}, meow" },
    boo: { es: '¡miau!', en: 'meow!' },
    where: { es: '¿a dónde vamos?', en: 'where to?' },
    what: { es: '¿qué pasó?', en: 'huh?' },
    oops: { es: 'ups', en: 'oops' },
    almost: { es: '¡ya casi llego!', en: 'almost there!' },
    write: { es: 'escríbele, no muerdo', en: "write him, I don't bite" },
    bye: { es: '¡chao!', en: 'bye!' },
    secret: { es: 'miau', en: 'meow' },
  },
});

export const fill = (str, vars) => str.replace(/\{(\w+)\}/g, (_, k) => vars[k]);
