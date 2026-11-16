// Achievements grouped by company, ranked by impact (first = biggest). Each one carries the
// poster spec that animates its main number; `kind` picks the archetype in src/gl/posters.js.
// Bilingual: every displayed string is { es, en } (arrays too); localize(value, lang) picks one.
// Sources live in the research notes; numbers marked "según mi CV" have no other evidence.

const palettes = {
  baubap: { bg: '#000000', fg: '#ffffff', muted: '#9aa0a6', track: '#2a2d31', accent: '#ff4d2e', paper: '#ffffff', ink: '#000000', inkSoft: '#b9bdc2' },
  jumpcube: { bg: '#0a24ff', fg: '#ffffff', muted: '#b8c2ff', track: 'rgba(255,255,255,0.22)', accent: '#ffcc1f', paper: '#ffffff', ink: '#0a24ff', inkSoft: '#b8c2ff' },
  lets: { bg: '#c9ccc8', fg: '#000000', muted: '#4a4f55', track: 'rgba(0,0,0,0.12)', accent: '#d7261e', paper: '#ffffff', ink: '#000000', inkSoft: '#b9bdc2' },
  peacedev: { bg: '#0e5a3a', fg: '#ffffff', muted: '#a9d8c1', track: 'rgba(255,255,255,0.18)', accent: '#ffcc1f', paper: '#ffffff', ink: '#0e5a3a', inkSoft: '#a9d8c1' },
  cuatroplus: { bg: '#ffffff', fg: '#000000', muted: '#5b6168', track: 'rgba(0,0,0,0.1)', accent: '#0a8f5a', paper: '#eef0f2', ink: '#000000', inkSoft: '#b9bdc2' },
  sena: { bg: '#ffcc1f', fg: '#000000', muted: '#5c4a00', track: 'rgba(0,0,0,0.12)', accent: '#b3261e', paper: '#ffffff', ink: '#000000', inkSoft: '#c9c9c9' },
  own: { bg: '#ff4d2e', fg: '#000000', muted: '#5e1406', track: 'rgba(0,0,0,0.14)', accent: '#ffffff', stampColor: '#000000', paper: '#ffffff', ink: '#000000', inkSoft: '#d0c4c0' },
};

export const companies = [
  {
    id: 'baubap',
    name: 'Baubap',
    role: { es: '2026 – hoy. Backend e IA en una fintech de México, remoto.', en: '2026 – present. Backend and AI at a Mexican fintech, remote.' },
    palette: palettes.baubap,
    achievements: [
      {
        title: { es: 'Un agente de IA que aguanta la carga', en: 'An AI agent that holds up under load' },
        short: { es: '4× capacidad', en: '4× capacity' },
        caseStudy: 'agente-carga',
        what: {
          es: 'Una plataforma de agentes LLM en producción se saturaba bajo carga. Armé un laboratorio de carga reproducible con un LLM simulado, encontré la causa raíz en el manejo de conexiones a base de datos y en la presión de memoria, y cada arreglo salió con su prueba de antes y después.',
          en: 'A production LLM agent platform saturated under load. I built a reproducible load lab with a simulated LLM, traced the root cause to database connection handling and memory pressure, and shipped every fix with before-and-after proof.',
        },
        impact: {
          es: '4× más capacidad por instancia y cerca de 70% menos memoria pico, medido en el laboratorio de carga.',
          en: '4× more capacity per instance and about 70% lower peak memory, measured in the load lab.',
        },
        alt: {
          es: 'La memoria del servicio sube hasta el límite y se satura; después del arreglo queda plana y la capacidad pasa de 1× a 4×.',
          en: 'Service memory climbs to its limit and saturates; after the fix it stays flat and capacity goes from 1× to 4×.',
        },
        poster: {
          kind: 'crash',
          caption: { es: 'Memoria de un servicio de agentes bajo carga', en: 'Memory of an agent service under load' },
          value: 4,
          sub: { es: ['capacidad por instancia', '~70% menos memoria pico'], en: ['capacity per instance', '~70% lower peak memory'] },
        },
      },
      {
        title: { es: 'Lecturas 71× más rápidas', en: 'Reads 71× faster' },
        short: { es: '71× más rápido', en: '71× faster' },
        caseStudy: 'lecturas-71x',
        what: {
          es: 'Migré la capa de datos de un agente de IA de un data warehouse a un motor de búsqueda, con despliegue gradual por feature flags, lecturas en sombra y respaldo automático al origen anterior.',
          en: 'I moved an AI agent’s data layer from a data warehouse to a search engine, with a gradual rollout behind feature flags, shadow reads and automatic fallback to the old source.',
        },
        impact: {
          es: 'Lecturas 71× más rápidas en promedio. El p95 bajó de unos 14 s a menos de 0.1 s.',
          en: 'Reads are 71× faster on average. p95 dropped from about 14 s to under 0.1 s.',
        },
        alt: {
          es: 'Dos barras de tiempo: la de antes tarda unos 3 segundos y la de después unos 40 milisegundos. Resultado: 71 veces más rápido.',
          en: 'Two timing bars: before takes about 3 seconds, after about 40 milliseconds. Result: 71 times faster.',
        },
        poster: {
          kind: 'race',
          caption: { es: 'Lo que tarda el agente en leer los datos', en: 'How long the agent takes to read its data' },
          format: 'ms',
          before: { label: { es: 'Antes, desde un data warehouse', en: 'Before, from a data warehouse' }, value: 3000 },
          after: { label: { es: 'Después, desde un motor de búsqueda', en: 'After, from a search engine' }, value: 42 },
          result: '71×',
          sub: { es: ['más rápido en promedio', 'p95: de ~14 s a menos de 0.1 s'], en: ['faster on average', 'p95: from ~14 s to under 0.1 s'] },
        },
      },
      {
        title: { es: 'Un canal de email propio en 10 días', en: 'An in-house email channel in 10 days' },
        short: { es: '10 días', en: '10 days' },
        what: {
          es: 'Diseñé y construí un servicio serverless de correo masivo en AWS que reemplaza a una plataforma SaaS: cola, funciones y envío, con idempotencia, ritmo de envío controlado, supresión de rebotes y quejas, y monitoreo.',
          en: 'I designed and built a serverless bulk email service on AWS to replace a SaaS platform: queue, functions and delivery, with idempotency, rate-controlled sending, bounce and complaint suppression, and monitoring.',
        },
        impact: {
          es: 'Del diseño a producción en 10 días. Primer envío masivo sin errores y un costo mucho menor que la plataforma que reemplaza.',
          en: 'From design to production in 10 days. Zero errors on the first bulk send, at a much lower cost than the platform it replaces.',
        },
        alt: {
          es: 'Diez bloques se encienden, uno por día, hasta llegar a producción.',
          en: 'Ten blocks light up, one per day, until it reaches production.',
        },
        poster: {
          kind: 'counter',
          caption: { es: 'Del diseño a producción', en: 'From design to production' },
          value: 10,
          unit: { es: 'días', en: 'days' },
          blocks: 10,
          sub: { es: ['primer envío masivo: 0 errores', 'serverless en AWS'], en: ['first bulk send: 0 errors', 'serverless on AWS'] },
        },
      },
    ],
  },
  {
    id: 'jumpcube',
    name: 'Jump Cube Technologies',
    role: { es: '2024 – 2026. Tech lead backend de IA y serverless, Colombia.', en: '2024 – 2026. Backend tech lead for AI and serverless, Colombia.' },
    palette: palettes.jumpcube,
    achievements: [
      {
        title: { es: 'Asistente de IA omnicanal para Altipal', en: 'Omnichannel AI assistant for Altipal' },
        short: { es: '30% resuelto por IA', en: '30% solved by AI' },
        what: {
          es: 'Formé parte del equipo que construyó el asistente de IA generativa de Altipal sobre Amazon Bedrock y Amazon Connect, para WhatsApp, Instagram y web. Trabajé en el backend de casos, correos y métricas de agentes.',
          en: 'I was part of the team that built Altipal’s generative AI assistant on Amazon Bedrock and Amazon Connect for WhatsApp, Instagram and web. I worked on the backend for cases, email and agent metrics.',
        },
        impact: {
          es: 'Resultado del equipo, publicado en prensa: 30% de las consultas se resuelven directo con IA y 20% menos carga para los agentes humanos.',
          en: 'Team result, reported in the press: 30% of inquiries are solved directly by AI, and human agents carry 20% less load.',
        },
        alt: {
          es: 'Una cuadrícula de 100 consultas se ilumina hasta 30: las que resuelve la IA sin un humano.',
          en: 'A grid of 100 inquiries lights up to 30: the ones the AI solves without a human.',
        },
        poster: {
          kind: 'share',
          caption: { es: 'Consultas de clientes de Altipal', en: 'Altipal customer inquiries' },
          percent: 30,
          sub: { es: ['resueltas directo por la IA', '20% menos carga para el equipo humano'], en: ['solved directly by the AI', '20% less load for the human team'] },
        },
        link: { href: 'https://www.bluradio.com/tecnologia/la-adopcion-de-inteligencia-artificial-permite-a-las-empresas-reducir-costos-en-mas-del-40-so35', label: { es: 'Ver el caso en prensa', en: 'Read the press coverage' } },
      },
      {
        title: { es: 'Procesamiento 20× más rápido', en: 'Processing 20× faster' },
        short: { es: '20× más rápido', en: '20× faster' },
        what: {
          es: 'Rediseñé flujos de procesamiento que corrían en serie para ejecutarlos en paralelo con AWS Lambda sin estado, colas y Step Functions.',
          en: 'I redesigned processing pipelines that ran serially so they run in parallel with stateless AWS Lambda, queues and Step Functions.',
        },
        impact: { es: 'El tiempo de procesamiento bajó 20 veces (según mi CV).', en: 'Processing time dropped 20× (per my CV).' },
        alt: {
          es: 'Dos barras de tiempo: el proceso en serie avanza lento; el paralelo termina 20 veces antes.',
          en: 'Two timing bars: the serial run crawls; the parallel one finishes 20 times sooner.',
        },
        poster: {
          kind: 'race',
          caption: { es: 'Mismo trabajo, distinta arquitectura', en: 'Same work, different architecture' },
          format: 'none',
          before: { label: { es: 'En serie', en: 'Serial' }, value: 20 },
          after: { label: { es: 'En paralelo con Lambda', en: 'Parallel on Lambda' }, value: 1 },
          result: '20×',
          sub: { es: ['menos tiempo de procesamiento'], en: ['less processing time'] },
        },
      },
      {
        title: { es: 'Arquitectura para cargas de 400 GB', en: 'Architecture for 400 GB uploads' },
        short: { es: '400 GB por carga', en: '400 GB per upload' },
        what: {
          es: 'Diseñé la carga y el procesamiento masivo de documentos con subida multiparte a S3, Step Functions y 20 funciones Lambda en paralelo sobre DynamoDB.',
          en: 'I designed bulk document upload and processing with S3 multipart uploads, Step Functions and 20 parallel Lambda functions on DynamoDB.',
        },
        impact: {
          es: 'Dimensionada para unos 160 mil archivos y al menos 400 mil registros por carga.',
          en: 'Sized for about 160,000 files and at least 400,000 records per upload.',
        },
        alt: {
          es: 'Bloques se llenan uno a uno como una transferencia hasta llegar a 400 GB.',
          en: 'Blocks fill one by one like a transfer until they reach 400 GB.',
        },
        poster: {
          kind: 'counter',
          caption: { es: 'Una sola carga masiva de documentos', en: 'A single bulk document upload' },
          value: 400,
          unit: 'GB',
          sub: { es: ['~160 mil archivos', '20 funciones en paralelo'], en: ['~160,000 files', '20 functions in parallel'] },
        },
      },
    ],
  },
  {
    id: 'lets',
    name: "Let's Do It Now",
    role: { es: '2023 – 2024. Tech lead full stack, Nueva York, remoto.', en: '2023 – 2024. Full stack tech lead, New York, remote.' },
    palette: palettes.lets,
    achievements: [
      {
        title: { es: 'Costo de nube 4× menor', en: 'Cloud cost 4× lower' },
        short: { es: '4× menos costo', en: '4× lower cost' },
        what: {
          es: 'Optimicé la arquitectura e infraestructura en AWS de la plataforma: tamaños de cómputo, despliegues automatizados y servicios que sobraban.',
          en: 'I optimized the platform’s AWS architecture and infrastructure: compute sizing, automated deployments and services it didn’t need.',
        },
        impact: { es: 'El costo de nube bajó hasta 4 veces (según mi CV).', en: 'Cloud cost dropped up to 4× (per my CV).' },
        alt: { es: 'La barra del costo de nube se encoge hasta una cuarta parte.', en: 'The cloud cost bar shrinks to a quarter.' },
        poster: {
          kind: 'shrink',
          caption: { es: 'Costo mensual de infraestructura', en: 'Monthly infrastructure cost' },
          before: { es: 'Antes', en: 'Before' },
          after: { es: 'Después de optimizar', en: 'After optimizing' },
          ratio: 0.25,
          asFactor: true,
          sub: { es: ['menos costo de nube'], en: ['lower cloud cost'] },
        },
      },
      {
        title: { es: 'Timeouts de base de datos eliminados', en: 'Database timeouts eliminated' },
        short: { es: '0 timeouts', en: '0 timeouts' },
        what: {
          es: 'Las conexiones a la base de datos de SIDOC fallaban por timeout. Encontré que una regla del grupo de seguridad de la red bloqueaba conexiones externas, la ajusté y dejé el postmortem documentado.',
          en: 'Connections to the SIDOC database were timing out. I found a network security group rule blocking external connections, fixed it and wrote up the postmortem.',
        },
        impact: { es: 'Después del ajuste no volvió a haber timeouts.', en: 'No timeouts since the fix.' },
        alt: {
          es: 'Una línea de solicitudes con fallas rojas; después del ajuste todas pasan.',
          en: 'A line of requests with red failures; after the fix they all go through.',
        },
        poster: {
          kind: 'failures',
          caption: { es: 'Conexiones a la base de datos de SIDOC', en: 'Connections to the SIDOC database' },
          fix: { es: 'ajuste de red', en: 'network fix' },
          result: '0',
          sub: { es: ['timeouts después del arreglo'], en: ['timeouts after the fix'] },
        },
      },
    ],
  },
  {
    id: 'peacedev',
    name: 'Peacedev',
    role: { es: '2022 – 2023. Líder técnico backend, Colombia.', en: '2022 – 2023. Backend tech lead, Colombia.' },
    palette: palettes.peacedev,
    achievements: [
      {
        title: { es: 'Backend de Vaya, una red social', en: 'Backend for Vaya, a social network' },
        short: { es: '90% del backend', en: '90% of the backend' },
        what: {
          es: 'Lideré el backend de Vaya, una red social con geolocalización, matches, chat, eventos cercanos y analítica para el panel de administración, en Django.',
          en: 'I led the Django backend for Vaya, a social network with geolocation, matches, chat, nearby events and analytics for the admin panel.',
        },
        impact: { es: 'Escribí el 90% del backend.', en: 'I wrote 90% of the backend.' },
        alt: { es: 'Una cuadrícula de 100 bloques se llena hasta 90.', en: 'A grid of 100 blocks fills up to 90.' },
        poster: {
          kind: 'share',
          caption: { es: 'Backend de Vaya', en: 'Vaya backend' },
          percent: 90,
          sub: { es: ['del backend escrito por mí', 'geolocalización, matches y chat'], en: ['of the backend written by me', 'geolocation, matches and chat'] },
        },
      },
      {
        title: { es: 'Programa de lealtad para un centro comercial', en: 'Loyalty program for a shopping mall' },
        short: { es: '12 módulos', en: '12 modules' },
        what: {
          es: 'Construí y documenté el backend de lealtad de Galerías Pacífico: facturas que suman puntos, aprobación, beneficios, premios, cupones y notificaciones.',
          en: 'I built and documented the loyalty backend for Galerías Pacífico: receipts that earn points, approval, benefits, rewards, coupons and notifications.',
        },
        impact: { es: '12 módulos de API en Django REST, documentados.', en: '12 documented Django REST API modules.' },
        alt: { es: 'Doce bloques se encienden, uno por módulo de la API.', en: 'Twelve blocks light up, one per API module.' },
        poster: {
          kind: 'counter',
          caption: { es: 'Backend de lealtad de Galerías Pacífico', en: 'Galerías Pacífico loyalty backend' },
          value: 12,
          unit: { es: 'módulos', en: 'modules' },
          blocks: 12,
          sub: { es: ['facturas, puntos, premios y cupones'], en: ['receipts, points, rewards, coupons'] },
        },
      },
    ],
  },
  {
    id: 'cuatroplus',
    name: '4Plus Ingenieros',
    role: { es: '2022. Ingeniero backend, España, remoto.', en: '2022. Backend engineer, Spain, remote.' },
    palette: palettes.cuatroplus,
    achievements: [
      {
        title: { es: 'Huella de carbono agrícola', en: 'Agricultural carbon footprint' },
        short: { es: '16 endpoints', en: '16 endpoints' },
        what: {
          es: 'Trabajé en el backend del módulo de huella de carbono (emisiones directas e indirectas) para una plataforma agrícola financiada por la Unión Europea, conectado a Odoo.',
          en: 'I worked on the backend of the carbon footprint module (direct and indirect emissions) for an EU-funded agricultural platform connected to Odoo.',
        },
        impact: { es: 'Revisé y cerré los 16 endpoints de emisiones directas.', en: 'I reviewed and finished all 16 direct-emissions endpoints.' },
        alt: { es: 'Dieciséis bloques se encienden, uno por endpoint terminado.', en: 'Sixteen blocks light up, one per finished endpoint.' },
        poster: {
          kind: 'counter',
          caption: { es: 'Módulo de emisiones directas', en: 'Direct emissions module' },
          value: 16,
          unit: 'endpoints',
          blocks: 16,
          sub: { es: ['revisados y terminados'], en: ['reviewed and finished'] },
        },
      },
      {
        title: { es: 'Energía solar en la plataforma', en: 'Solar energy in the platform' },
        short: { es: 'Integrado', en: 'Integrated' },
        what: {
          es: 'Consumí la API de Huawei FusionSolar e implementé los endpoints de energía, con consulta general y por rango de fechas.',
          en: 'I integrated the Huawei FusionSolar API and built the energy endpoints, with overall and date-range queries.',
        },
        impact: { es: 'Integración terminada y en uso.', en: 'Integration finished and in use.' },
        alt: {
          es: 'Un documento se escribe línea por línea y recibe el sello de integrado.',
          en: 'A document is written line by line and gets an “integrated” stamp.',
        },
        poster: {
          kind: 'stamp',
          stamp: { es: 'Integrado', en: 'Integrated' },
          lines: { es: ['Huawei FusionSolar', 'consulta general y por fechas'], en: ['Huawei FusionSolar', 'overall and date-range queries'] },
          seed: 5,
        },
      },
    ],
  },
  {
    id: 'sena',
    name: 'Tecnoacademia SENA',
    role: { es: '2021 – 2022. Investigación y docencia, Oriente Antioqueño.', en: '2021 – 2022. Research and teaching, eastern Antioquia.' },
    palette: palettes.sena,
    achievements: [
      {
        title: { es: 'Ganador de Expociencia 2022', en: 'Expociencia 2022 winner' },
        short: { es: 'Ganador', en: 'Winner' },
        what: {
          es: 'Mi proyecto de visión artificial para identificar la lengua de señas colombiana quedó entre los ganadores de Expociencia 2022. También lo presenté en el Encuentro Mundial de Big Data 2021.',
          en: 'My computer vision project for recognizing Colombian Sign Language was among the Expociencia 2022 winners. I also presented it at the 2021 World Big Data Meeting.',
        },
        impact: { es: 'Proyecto ganador de la feria nacional de ciencia.', en: 'Winning project at the national science fair.' },
        alt: {
          es: 'Un documento se escribe línea por línea y recibe el sello de ganador de Expociencia 2022.',
          en: 'A document is written line by line and gets an Expociencia 2022 winner stamp.',
        },
        poster: {
          kind: 'stamp',
          stamp: { es: 'Ganador', en: 'Winner' },
          lines: { es: ['Expociencia 2022', 'Visión artificial para', 'la lengua de señas'], en: ['Expociencia 2022', 'Computer vision for', 'sign language'] },
          seed: 3,
        },
      },
      {
        title: { es: 'Red neuronal para lengua de señas', en: 'Neural network for sign language' },
        short: { es: '100% en validación', en: '100% on validation' },
        what: {
          es: 'Ajusté los hiperparámetros de una red neuronal convolucional para reconocer manos, la primera etapa del traductor. Lo publiqué como primer autor en la revista del SENA.',
          en: 'I tuned the hyperparameters of a convolutional neural network to detect hands, the first stage of the translator. I published it as first author in SENA’s journal.',
        },
        impact: {
          es: 'La validación pasó de 70–90% a 100% en una tarea de dos clases.',
          en: 'Validation accuracy went from 70–90% to 100% on a two-class task.',
        },
        alt: { es: 'Barras crecen de 70 a 100 por ciento de clasificación.', en: 'Bars grow from 70 to 100 percent classification accuracy.' },
        poster: {
          kind: 'growth',
          caption: { es: 'Clasificación en validación', en: 'Validation accuracy' },
          from: 70,
          to: 100,
          suffix: '%',
          unit: { es: 'al ajustar la red', en: 'after tuning the network' },
          sub: { es: ['publicado en la revista del SENA, 2021'], en: ['published in SENA’s journal, 2021'] },
        },
        link: { href: 'https://revistas.sena.edu.co/index.php/conciencia/article/view/3926/4602', label: { es: 'Leer el artículo', en: 'Read the paper' } },
      },
      {
        title: { es: 'Las 5 vocales en tiempo real', en: 'The 5 vowels in real time' },
        short: { es: '5 vocales', en: '5 vowels' },
        what: {
          es: 'En la segunda fase usé MediaPipe para extraer los puntos de la mano y reconocer las cinco vocales de la lengua de señas colombiana. Quedó como API y app web abiertas.',
          en: 'In the second phase I used MediaPipe to extract hand landmarks and recognize the five vowels of Colombian Sign Language. It shipped as an open API and web app.',
        },
        impact: { es: 'Reconocimiento de las 5 vocales, publicado en 2022.', en: 'Recognition of all 5 vowels, published in 2022.' },
        alt: {
          es: 'Aparecen los puntos de una mano, se conectan y se iluminan las cinco vocales.',
          en: 'Hand landmarks appear, connect, and the five vowels light up.',
        },
        poster: { kind: 'signs' },
        link: { href: 'https://github.com/JahazielHernandezHoyos/Traductor-de-lengua-de-se-as-al-espa-ol', label: { es: 'Ver el código', en: 'View the code' } },
      },
    ],
  },
  {
    id: 'propios',
    name: { es: 'Proyectos propios', en: 'Personal projects' },
    role: { es: '2025 – hoy. Lo que construyo por mi cuenta.', en: '2025 – present. What I build on my own.' },
    palette: palettes.own,
    achievements: [
      {
        title: { es: 'Agentes de código en contenedores', en: 'Coding agents in containers' },
        short: { es: '2.4× más rápido', en: '2.4× faster' },
        what: {
          es: 'Una herramienta que pone a agentes de IA a programar dentro de contenedores efímeros y sin credenciales, y solo deja pasar un cambio si se demuestra: falla en la rama base, pasa en la nueva y queda grabado.',
          en: 'A tool that runs AI coding agents inside ephemeral, credential-free containers and only accepts a change with proof: it fails on the base branch, passes on the new one, and is recorded.',
        },
        impact: {
          es: '4 cambios verificados en 196 s en vez de 471 s. El equipo de Baubap la adoptó.',
          en: '4 verified changes in 196 s instead of 471 s. The Baubap team adopted it.',
        },
        alt: {
          es: 'Cuatro cambios uno tras otro tardan 471 segundos; en paralelo, 196 segundos.',
          en: 'Four changes one after another take 471 seconds; in parallel, 196 seconds.',
        },
        poster: {
          kind: 'parallel',
          caption: { es: '4 cambios hechos por agentes y verificados con prueba', en: '4 agent-made changes, each verified with proof' },
          serial: 471,
          lanes: [168, 196, 181, 188],
          sub: { es: ['más rápido, y el equipo lo adoptó'], en: ['faster, and the team adopted it'] },
        },
      },
      {
        title: { es: 'Laboratorio de búsqueda con 4 millones de registros', en: 'Search lab with 4 million records' },
        short: { es: '1,582 consultas/s', en: '1,582 queries/s' },
        what: {
          es: 'Un laboratorio abierto para estresar Meilisearch con 4 millones de clientes ficticios y comprobar que los conteos salen exactos.',
          en: 'An open lab that stress-tests Meilisearch with 4 million fake customers and checks that counts come out exact.',
        },
        impact: {
          es: 'Hasta 1,582 consultas por segundo sin errores, con 189 de 189 conteos exactos.',
          en: 'Up to 1,582 queries per second with zero errors, and 189 of 189 counts exact.',
        },
        alt: {
          es: 'Bloques se llenan mientras el contador sube a 1,582 consultas por segundo.',
          en: 'Blocks fill while the counter climbs to 1,582 queries per second.',
        },
        poster: {
          kind: 'counter',
          caption: { es: '4 millones de registros bajo carga', en: '4 million records under load' },
          value: 1582,
          unit: { es: 'consultas/s', en: 'queries/s' },
          sub: { es: ['0 errores, 189/189 conteos exactos'], en: ['0 errors, 189/189 exact counts'] },
        },
        link: { href: 'https://github.com/JahazielHernandezHoyos/meilisearch-fintech-stress-lab', label: { es: 'Ver el repositorio', en: 'View the repository' } },
      },
      {
        title: { es: 'Coautor en hermes-agent', en: 'Co-author on hermes-agent' },
        short: { es: 'Fusionado', en: 'Merged' },
        what: {
          es: 'Propuse favoritos de modelos para el selector de escritorio de hermes-agent, el proyecto open source de agentes de NousResearch. El equipo integró mi diseño y mis tests en su versión final.',
          en: 'I proposed model favorites for the desktop picker in hermes-agent, NousResearch’s open source agent project. The team folded my design and tests into the final version.',
        },
        impact: { es: 'Fusionado con crédito de coautor.', en: 'Merged with co-author credit.' },
        alt: {
          es: 'Un documento se escribe línea por línea y recibe el sello de fusionado.',
          en: 'A document is written line by line and gets a “merged” stamp.',
        },
        poster: {
          kind: 'stamp',
          stamp: { es: 'Fusionado', en: 'Merged' },
          lines: { es: ['hermes-agent', 'NousResearch', 'coautor del cambio'], en: ['hermes-agent', 'NousResearch', 'co-author of the change'] },
          seed: 9,
        },
        link: { href: 'https://github.com/NousResearch/hermes-agent/pull/126535', label: { es: 'Ver el PR', en: 'View the PR' } },
      },
    ],
  },
];
