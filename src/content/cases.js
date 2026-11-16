export const cases = [
  {
    slug: 'agente-carga',
    enSlug: 'agent-under-load',
    company: 'Baubap',
    year: 2026,
    title: {
      es: 'Un agente LLM que aguanta 4× más carga',
      en: 'An LLM agent that handles 4× the load',
    },
    summary: {
      es: 'Reproduje en laboratorio la saturación de una plataforma de agentes LLM en producción, encontré tres causas raíz y las corregí una por una hasta cuadruplicar la capacidad por instancia.',
      en: 'I reproduced the saturation of a production LLM agent platform in a lab, found three root causes, and fixed them one by one until each instance handled four times the load.',
    },
    metrics: [
      { value: '4×', label: { es: 'capacidad por instancia', en: 'capacity per instance' } },
      { value: '~70%', label: { es: 'menos memoria pico (laboratorio)', en: 'lower peak memory (lab)' } },
      { value: '26,000+', label: { es: 'solicitudes de prueba de autoescalado', en: 'autoscaling test requests' } },
    ],
    sections: [
      {
        heading: { es: 'Contexto', en: 'Context' },
        body: {
          es: [
            'Una fintech mexicana atiende soporte con una plataforma de agentes LLM en producción. Bajo carga sostenida, cada instancia aguantaba cerca de una solicitud por segundo antes de quedarse sin memoria o sin conexiones a la base de datos.',
            'Agregar instancias solo movía el problema: más réplicas con el mismo cuello de botella. Necesitaba saber qué se agotaba primero y por qué.',
          ],
          en: [
            'A Mexican fintech runs customer support on a production LLM agent platform. Under sustained load, each instance handled about one request per second before it ran out of memory or database connections.',
            'Adding instances only moved the problem around: more replicas with the same bottleneck. I needed to know what ran out first, and why.',
          ],
        },
      },
      {
        heading: { es: 'Cómo lo reproduje', en: 'How I reproduced it' },
        body: {
          es: [
            'Armé un laboratorio local con el servicio real y un LLM simulado que responde con latencias realistas. Así podía generar carga sostenida sin gastar en llamadas al modelo y repetir cada experimento en las mismas condiciones.',
            'Medí por turno de conversación: conexiones ocupadas del pool de base de datos, memoria por proceso y tiempo de CPU por etapa. En el escenario de saturación, solo 23 de 270 solicitudes terminaban bien, igual que lo que se veía en producción.',
          ],
          en: [
            'I built a local lab with the real service and a mocked LLM that answers with realistic latency. That let me generate sustained load without paying for model calls and rerun every experiment under the same conditions.',
            'I measured per conversation turn: busy database pool connections, memory per process, and CPU time per stage. In the saturation scenario only 23 of 270 requests completed, matching what production showed.',
          ],
        },
      },
      {
        heading: { es: 'Causas raíz', en: 'Root causes' },
        body: {
          es: [
            'Primero, cada turno mantenía abierta una sesión de base de datos mientras esperaba la respuesta del LLM. Con varios segundos por respuesta, el pool de conexiones se agotaba y las solicitudes nuevas quedaban en cola.',
            'Segundo, cada turno cargaba en memoria todo el historial de versiones de prompts, aunque solo usaba la activa. Tercero, el detector de datos personales consumía una parte importante de la CPU en cada mensaje.',
          ],
          en: [
            'First, each turn kept a database session open while waiting for the LLM. With responses taking several seconds, the connection pool ran dry and new requests queued up.',
            'Second, every turn loaded the full prompt version history into memory even though it only needed the active one. Third, the PII detector took a significant share of CPU on every message.',
          ],
        },
      },
      {
        heading: { es: 'Las correcciones', en: 'The fixes' },
        body: {
          es: [
            'Liberé la sesión de base de datos antes de llamar al LLM y la reabro solo para guardar el resultado. Cambié la carga de prompts para traer únicamente la versión activa. Ajusté el detector de datos personales para que gastara cerca de 40% menos CPU.',
            'Cada corrección salió en su propio PR con una prueba de antes y después en el laboratorio. Después configuré autoescalado con varias métricas y lo validé con más de 26,000 solicitudes de prueba.',
          ],
          en: [
            'I released the database session before calling the LLM and reopen it only to save the result. I changed prompt loading to fetch only the active version. I tuned the PII detector so it used about 40% less CPU.',
            'Each fix shipped in its own PR with a before/after proof from the lab. Then I set up multi-metric autoscaling and validated it with more than 26,000 test requests.',
          ],
        },
      },
      {
        heading: { es: 'Resultados', en: 'Results' },
        body: {
          es: [
            'Cada instancia soporta 4× más carga que antes y la memoria pico bajó cerca de 70% en el laboratorio. El mismo escenario de saturación pasó de 23 a 270 de 270 solicitudes completadas. El autoescalado ahora reacciona a la presión real del servicio y no solo a la CPU.',
          ],
          en: [
            'Each instance now handles 4× the previous load, and peak memory dropped about 70% in the lab. The same saturation scenario went from 23 to 270 of 270 completed requests. Autoscaling now reacts to real service pressure instead of CPU alone.',
          ],
        },
      },
      {
        heading: { es: 'Qué haría después', en: "What I'd do next" },
        body: {
          es: [
            'Convertiría el laboratorio en una prueba de carga que corra antes de cada release, con umbrales de conexiones y memoria que bloqueen el despliegue si empeoran.',
          ],
          en: [
            'I would turn the lab into a load test that runs before every release, with connection and memory thresholds that block the deploy if they regress.',
          ],
        },
      },
    ],
    stack: ['Python', 'FastAPI', 'LangGraph', 'SQLAlchemy', 'AWS ECS', 'Docker', 'Load testing'],
  },
  {
    slug: 'lecturas-71x',
    enSlug: 'reads-71x',
    company: 'Baubap',
    year: 2026,
    title: {
      es: 'Lecturas 71× más rápidas sin cortar el servicio',
      en: '71× faster reads without a hard cutover',
    },
    summary: {
      es: 'Migré la capa de datos de un agente de soporte de un data warehouse a un motor de búsqueda, paso a paso y con fallback automático. Las lecturas promedio quedaron 71× más rápidas.',
      en: "I moved a support agent's data layer from a data warehouse to a search engine, step by step and with automatic fallback. Average reads became 71× faster.",
    },
    metrics: [
      { value: '71×', label: { es: 'lecturas promedio más rápidas', en: 'faster average reads' } },
      { value: '<0.1 s', label: { es: 'p95, antes ~14 s', en: 'p95, down from ~14 s' } },
      { value: '5', label: { es: 'días medidos en producción', en: 'days measured in production' } },
    ],
    sections: [
      {
        heading: { es: 'El problema', en: 'The problem' },
        body: {
          es: [
            'El agente de soporte de una fintech mexicana consultaba los datos del cliente directamente en un data warehouse. El warehouse está pensado para análisis, no para lecturas puntuales, y el p95 rondaba los 14 segundos por consulta.',
            'Esa espera se sumaba a cada respuesta del agente. Cambiar la fuente de un golpe era riesgoso porque el agente atiende clientes reales todo el día.',
          ],
          en: [
            "A Mexican fintech's support agent read customer data straight from a data warehouse. The warehouse is built for analytics, not point lookups, and p95 sat around 14 seconds per query.",
            'That wait landed on every agent reply. Switching sources in one go was risky because the agent serves real customers all day.',
          ],
        },
      },
      {
        heading: { es: 'Cómo lo medí', en: 'How I measured it' },
        body: {
          es: [
            'Agregué telemetría por fuente: latencia, errores y qué fuente respondió en cada lectura. Antes de servir datos nuevos, hice lecturas en sombra: el motor de búsqueda respondía en paralelo y se comparaba con el warehouse sin afectar al cliente.',
            'Al medir en producción encontré una ventana ciega de unos 66 segundos por ciclo: una corrida de la sincronización incremental tardaba más que su ventana de búsqueda hacia atrás, y algunos cambios recientes podían quedar fuera del índice.',
          ],
          en: [
            'I added per-source telemetry: latency, errors, and which source answered each read. Before serving new data, I ran shadow reads: the search engine answered in parallel and was compared with the warehouse without touching the customer.',
            'Measuring in production exposed a blind window of about 66 seconds per cycle: one incremental sync run took longer than its lookback window, so some recent changes could miss the index.',
          ],
        },
      },
      {
        heading: { es: 'El diseño', en: 'The design' },
        body: {
          es: [
            'Usé el patrón strangler fig: el camino de lectura nuevo envuelve al viejo y lo reemplaza poco a poco. Implementé tres estrategias intercambiables: cascada (motor de búsqueda primero, warehouse si falla), carrera (ambos a la vez, gana el primero) y hedged (el segundo arranca solo si el primero tarda).',
            'Si el motor de búsqueda falla o no tiene el dato, el sistema regresa automáticamente al warehouse. Migré así 16 de las 18 herramientas de lectura del agente.',
          ],
          en: [
            'I used the strangler fig pattern: the new read path wraps the old one and replaces it gradually. I built three swappable strategies: cascade (search engine first, warehouse on failure), race (both at once, first answer wins), and hedged (the second starts only if the first is slow).',
            "If the search engine fails or doesn't have the record, the system falls back to the warehouse automatically. I migrated 16 of the agent's 18 read tools this way.",
          ],
        },
      },
      {
        heading: { es: 'El rollout', en: 'The rollout' },
        body: {
          es: [
            'Activé el camino nuevo por cohortes detrás de feature flags, para que crecer o revertir fuera un cambio de configuración y no un despliegue. Apagar la flag regresa todas las lecturas al warehouse.',
          ],
          en: [
            'I enabled the new path by cohort behind feature flags, so growing or reverting was a config change, not a deploy. Turning the flag off sends every read back to the warehouse.',
          ],
        },
      },
      {
        heading: { es: 'Resultados', en: 'Results' },
        body: {
          es: [
            'Medido en producción durante cinco días sobre una cohorte de usuarios, las lecturas promedio quedaron 71× más rápidas y el p95 bajó de unos 14 s a menos de 0.1 s. Los picos de casi un minuto del warehouse desaparecieron para esa cohorte.',
          ],
          en: [
            'Measured in production over five days on a user cohort, average reads became 71× faster and p95 dropped from about 14 s to under 0.1 s. The warehouse spikes of almost a minute disappeared for that cohort.',
          ],
        },
      },
      {
        heading: { es: 'Qué haría después', en: "What I'd do next" },
        body: {
          es: [
            'Reduciría la ventana de sincronización con actualizaciones por eventos en lugar de lotes incrementales, y ampliaría la cohorte hasta retirar el warehouse del camino de lectura.',
          ],
          en: [
            'I would shrink the sync window with event-driven updates instead of incremental batches, and widen the cohort until the warehouse is out of the read path.',
          ],
        },
      },
    ],
    stack: ['Python', 'FastAPI', 'Search engine', 'Data warehouse', 'Airflow', 'Feature flags', 'Observability'],
  },
];
