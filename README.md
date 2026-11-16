# jahaziel-portfolio-motion

Portafolio bilingüe (ES/EN) con WebGL (three.js), scroll suave (Lenis) y tweens (GSAP). Vite, sin framework.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/
```

## Páginas

| Ruta | Página |
|---|---|
| `/`, `/en/` | Inicio |
| `/casos/agente-carga/`, `/en/cases/agent-under-load/` | Caso: agente que aguanta 4× más carga |
| `/casos/lecturas-71x/`, `/en/cases/reads-71x/` | Caso: lecturas 71× más rápidas |
| `/cv/`, `/en/cv/` | CV (imprimible) |

Todas se generan en el build desde `src/content`, así que el texto, el idioma, `hreflang`, `canonical` y la vista previa al compartir existen sin JavaScript. `vite.config.js` registra cada ruta como entrada HTML; en dev el mismo renderer responde por petición.

## Dónde está cada cosa

- `src/i18n.js`: textos de la interfaz, rutas, `localize()` y `SITE` (origen canónico). Todo texto visible es `{ es, en }`.
- `src/content/companies.js`: empresas y su top 3 de logros, ordenado por impacto. Cada logro trae su texto, su cifra corta y el `poster` que anima esa cifra; `caseStudy` lo enlaza con un caso.
- `src/content/cases.js`: los dos casos de estudio.
- `src/content/cv.js`: el CV. Los PDF de `public/cv/` se generan imprimiendo `/cv/` y `/en/cv/` (A4, ver "Regenerar archivos").
- `src/render/pages.js`: HTML de cada página y de la imagen para compartir (`/__og/es/` y `/__og/en/` en dev).
- `src/main.js`: inicio (WebGL, pósters, pestañas, menú). `src/page.js`: casos y CV (contadores, gato, imprimir).
- `src/motion.js`: el botón de pausa. Arranca según `prefers-reduced-motion`, guarda la elección en `localStorage` y todo lo animado lo consulta en el momento.
- `src/gl/posters.js`: animaciones de impacto (`race`, `crash`, `shrink`, `parallel`, `growth`, `share`, `counter`, `failures`, `stamp`, `signs`). Cada una pinta `paint(spec, t)` con `t` de 0 (antes) a 1 (resultado).
- `src/gl/shaders.js` y `src/gl/stage.js`: hoja del hero, pósters con curvatura y el pasillo del centro de datos. El pasillo se raymarchea en un render target con resolución adaptativa (`MARCH_LEVELS`): baja si los cuadros pasan de ~22 ms y sube si hay margen.
- `src/ui/cats.js` y `src/ui/cat-svg.js`: los gatos. Escribir "miau" o "meow" hace llover gatos.
- `public/wahi-es.jpg`, `public/wahi-en.jpg`: capturas de wahi.jhzel.com.

Tipografía: Anybody (variable). El eje de ancho hace de segunda familia: expandida para títulos y cifras, normal para lectura, condensada para etiquetas.

Los logros de Baubap están en versión pública: sin detalles de incidentes, sin nombres internos y sin cifras de costo. Antes de agregar métricas internas, confirma que la empresa permite mostrarlas.

## Regenerar archivos

Con `npm run dev` corriendo, desde un navegador sin cabeza:

- PDF del CV: imprimir `/cv/` y `/en/cv/` en A4 con fondos a `public/cv/jahaziel-hernandez-cv-{es,en}.pdf`.
- Imagen para compartir: captura de 1200×630 de `/__og/es/` y `/__og/en/` a `public/og-{es,en}.png`.

## Despliegue

Vercel detecta Vite: build `npm run build`, salida `dist/`. Cada push a `main` despliega a producción. Web Analytics de Vercel está activo (`@vercel/analytics`).

Dominio: `me.jhzel.com` ya está agregado al proyecto en Vercel. Falta crear en Cloudflare el registro `A me → 76.76.21.21` (sin proxy). Cuando resuelva, cambia `SITE` en `src/i18n.js`, regenera las imágenes para compartir y despliega.
