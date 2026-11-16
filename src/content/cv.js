// Résumé content, bilingual. Numbers match the portfolio; Baubap items are in their public form.

export const cv = {
  name: 'Jahaziel Anthony Hernández Hoyos',
  headline: { es: 'Ingeniero backend e IA', en: 'Backend and AI Engineer' },
  location: { es: 'Marinilla, Antioquia, Colombia. Remoto.', en: 'Marinilla, Antioquia, Colombia. Remote.' },
  links: [
    { label: 'jahazielhernandezhoyoz@gmail.com', href: 'mailto:jahazielhernandezhoyoz@gmail.com' },
    { label: 'github.com/JahazielHernandezHoyos', href: 'https://github.com/JahazielHernandezHoyos' },
    { label: 'linkedin.com/in/jahaziel-anthony-h-6586b5139', href: 'https://www.linkedin.com/in/jahaziel-anthony-h-6586b5139/' },
  ],
  summary: {
    es: 'Ingeniero backend con más de cuatro años llevando sistemas de IA a producción: agentes LLM, RAG y arquitectura serverless en AWS. Me especializo en encontrar la causa raíz con evidencia y en hacer que los sistemas aguanten carga real a menor costo. He liderado equipos backend en Colombia, Estados Unidos y España.',
    en: "Backend engineer with 4+ years taking AI systems to production: LLM agents, RAG and serverless architecture on AWS. I specialise in finding root causes with evidence and making systems hold real load at lower cost. I've led backend teams for companies in Colombia, the US and Spain.",
  },
  experience: [
    {
      company: 'Baubap',
      role: { es: 'Ingeniero backend e IA (contrato, remoto)', en: 'Backend and AI Engineer (contract, remote)' },
      dates: { es: 'may 2026 – hoy', en: 'May 2026 – present' },
      place: { es: 'Fintech, México', en: 'Fintech, Mexico' },
      bullets: {
        es: [
          'Cuadrupliqué la capacidad por instancia de una plataforma de agentes LLM en producción y bajé ~70% su memoria pico, con un laboratorio de carga reproducible y un PR con prueba por cada causa raíz.',
          'Migré la capa de datos de un agente de soporte a un motor de búsqueda con despliegue gradual y fallback: lecturas 71× más rápidas, p95 de ~14 s a menos de 0.1 s.',
          'Diseñé y llevé a producción en 10 días un servicio serverless de correo masivo en AWS (colas, funciones, envío) que reemplaza a una plataforma SaaS.',
          'Más de 170 PRs mergeados en una docena de servicios: Python, FastAPI, LangGraph, AWS y Airflow.',
        ],
        en: [
          'Quadrupled per-instance capacity of a production LLM agent platform and cut its peak memory ~70%, using a reproducible load lab and one PR with proof per root cause.',
          "Migrated a support agent's data layer to a search engine with gradual rollout and fallback: 71× faster reads, p95 from ~14 s to under 0.1 s.",
          'Designed and shipped in 10 days a serverless bulk-email service on AWS (queues, functions, sending) that replaces a SaaS platform.',
          '170+ merged PRs across a dozen services: Python, FastAPI, LangGraph, AWS and Airflow.',
        ],
      },
    },
    {
      company: 'Wahi',
      role: { es: 'Fundador', en: 'Founder' },
      dates: { es: '2026 – hoy', en: '2026 – present' },
      place: { es: 'Producto propio', en: 'Own product' },
      bullets: {
        es: [
          'Construí de punta a punta un SaaS de agentes de IA para WhatsApp: FastAPI, LangGraph, Qdrant y Next.js, con infraestructura propia. El motor es open source (openwahi).',
        ],
        en: [
          'Built end to end an AI-agent SaaS for WhatsApp: FastAPI, LangGraph, Qdrant and Next.js on self-managed infrastructure. The engine is open source (openwahi).',
        ],
      },
    },
    {
      company: 'Jump Cube Technologies',
      role: { es: 'Tech lead backend, IA y serverless', en: 'Backend Tech Lead, AI and Serverless' },
      dates: { es: 'oct 2024 – ene 2026', en: 'Oct 2024 – Jan 2026' },
      place: { es: 'Colombia', en: 'Colombia' },
      bullets: {
        es: [
          'Parte del equipo del asistente de IA omnicanal de Altipal sobre Amazon Bedrock y Amazon Connect: 30% de las consultas resueltas por IA (resultado público del equipo).',
          'Reduje ~20× el tiempo de procesamiento pasando trabajos en serie a ejecución paralela con AWS Lambda y Step Functions.',
          'Diseñé la carga masiva de documentos de 400 GB con subida multiparte a S3, Step Functions y 20 funciones en paralelo.',
        ],
        en: [
          "Part of the team behind Altipal's omnichannel AI assistant on Amazon Bedrock and Amazon Connect: 30% of queries resolved by AI (public team result).",
          'Cut processing time ~20× by moving sequential jobs to parallel execution with AWS Lambda and Step Functions.',
          'Designed 400 GB bulk document ingestion with S3 multipart upload, Step Functions and 20 parallel functions.',
        ],
      },
    },
    {
      company: "Let's Do It Now",
      role: { es: 'Tech lead full stack', en: 'Full-stack Tech Lead' },
      dates: { es: 'jun 2023 – sep 2024', en: 'Jun 2023 – Sep 2024' },
      place: { es: 'Nueva York, remoto', en: 'New York, remote' },
      bullets: {
        es: [
          'Bajé hasta 4× el costo de nube optimizando la arquitectura y la infraestructura en AWS.',
          'Eliminé los timeouts de base de datos de SIDOC al encontrar una regla de red que bloqueaba conexiones, y documenté el postmortem.',
        ],
        en: [
          'Cut cloud cost up to 4× by optimizing the AWS architecture and infrastructure.',
          "Eliminated SIDOC's database timeouts by tracing them to a network rule blocking connections, and wrote the postmortem.",
        ],
      },
    },
    {
      company: 'Peacedev',
      role: { es: 'Líder técnico backend', en: 'Backend Tech Lead' },
      dates: { es: 'oct 2022 – jun 2023', en: 'Oct 2022 – Jun 2023' },
      place: { es: 'Colombia', en: 'Colombia' },
      bullets: {
        es: [
          'Escribí el 90% del backend de Vaya, una red social con geolocalización, matches y chat, en Django.',
          'Construí el backend de lealtad de Galerías Pacífico: 12 módulos de API documentados.',
        ],
        en: [
          'Wrote 90% of the backend of Vaya, a social app with geolocation, matching and chat, in Django.',
          'Built the loyalty backend for Galerías Pacífico mall: 12 documented API modules.',
        ],
      },
    },
    {
      company: '4Plus Ingenieros',
      role: { es: 'Ingeniero backend', en: 'Backend Engineer' },
      dates: { es: '2022', en: '2022' },
      place: { es: 'España, remoto', en: 'Spain, remote' },
      bullets: {
        es: ['Backend de huella de carbono e integración solar (Huawei FusionSolar) para una plataforma agrícola financiada por la UE, con FastAPI y Odoo.'],
        en: ['Carbon-footprint backend and solar integration (Huawei FusionSolar) for an EU-funded agriculture platform, with FastAPI and Odoo.'],
      },
    },
    {
      company: 'Tecnoacademia SENA',
      role: { es: 'Investigación y docencia', en: 'Research and Teaching' },
      dates: { es: '2021 – 2022', en: '2021 – 2022' },
      place: { es: 'Oriente Antioqueño', en: 'Antioquia, Colombia' },
      bullets: {
        es: ['Investigación en visión artificial para la lengua de señas colombiana; enseñé desarrollo web con JavaScript y Python.'],
        en: ['Computer-vision research for Colombian sign language; taught web development with JavaScript and Python.'],
      },
    },
  ],
  skills: [
    { label: { es: 'Backend', en: 'Backend' }, items: 'Python, Node.js, FastAPI, Django, REST, Go' },
    { label: { es: 'IA', en: 'AI' }, items: { es: 'LLMs, RAG, embeddings, LangGraph, LangChain, evaluación con LLM', en: 'LLMs, RAG, embeddings, LangGraph, LangChain, LLM-as-judge evals' } },
    { label: { es: 'Nube', en: 'Cloud' }, items: 'AWS Lambda, Step Functions, ECS, S3, SES, Bedrock, Pulumi, Terraform' },
    { label: { es: 'Datos', en: 'Data' }, items: 'PostgreSQL, MySQL, DynamoDB, MongoDB, Qdrant, Meilisearch, Airflow' },
    { label: { es: 'Operación', en: 'Operations' }, items: { es: 'Docker, CI/CD, GitHub Actions, Datadog, OpenTelemetry, pruebas de carga', en: 'Docker, CI/CD, GitHub Actions, Datadog, OpenTelemetry, load testing' } },
  ],
  education: {
    es: [
      'Estudios técnicos en Análisis y Desarrollo de Software, SENA.',
      'Primer autor: "Ajuste de hiperparámetros de una red neuronal convolucional para el reconocimiento de lengua de señas", revista CON-CIENCIA y TÉCNICA del SENA, 2021.',
      'Proyecto ganador de Expociencia 2022, Ingeniería y Tecnología. Charla en el Encuentro Mundial de Big Data 2021.',
      'Certificados: Containerized Applications on AWS (2023), Machine Learning with Python, IBM (2026).',
    ],
    en: [
      'Technical studies in Software Analysis and Development, SENA (Colombia).',
      'First author: "Hyperparameter tuning of a convolutional neural network for sign language recognition", SENA CON-CIENCIA y TÉCNICA journal, 2021 (in Spanish).',
      'Winning project at Expociencia 2022, Engineering and Technology. Talk at the 2021 World Big Data Meeting.',
      'Certificates: Containerized Applications on AWS (2023), Machine Learning with Python, IBM (2026).',
    ],
  },
  languages: {
    es: 'Español nativo. Inglés intermedio (B1), en mejora constante.',
    en: 'Spanish, native. English, intermediate (B1) and actively improving.',
  },
};
