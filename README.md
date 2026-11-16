# jahaziel-portfolio-motion

Portafolio con WebGL (three.js), scroll suave (Lenis) y tweens (GSAP). Vite, sin framework.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/
```

## Dónde está cada cosa

- `index.html`: hero, capítulos del pasillo (sobre mí, más cosas, trayectoria, contacto).
- `src/content/companies.js`: empresas y su top 3 de logros, ordenado por impacto (el primero es el mayor). Cada logro trae su texto, su cifra corta para la lista y el `poster` que anima esa cifra.
- `src/ui/companies.js`: arma la sección por empresa (póster, pestañas del top 3 y panel del logro activo).
- `src/gl/posters.js`: tipos de animación reutilizables (`race`, `crash`, `shrink`, `parallel`, `growth`, `share`, `counter`, `failures`, `stamp`, `signs`). Cada uno pinta `paint(spec, t)` con `t` de 0 (antes) a 1 (resultado). Corre una vez al entrar en pantalla, otra vez en hover o foco, y cada vez que eliges otro logro de la misma empresa.
- `src/gl/shaders.js`: curvatura de tambor ligada a la velocidad del scroll, retrato pixelado del hero, glitch de las tarjetas y corredor raymarched.
- `src/gl/stage.js`: sincroniza los planos WebGL con los rectángulos del DOM y el tinte de cada capítulo (`data-tint`).
- `public/portrait.jpg`: retrato del hero; el encuadre se ajusta con `uCrop` en `stage.js`.

Tipografía: Anybody (variable, `@fontsource-variable/anybody`). El eje de ancho hace de segunda familia: expandida y pesada para títulos y cifras, normal para lectura, condensada para etiquetas.

Los logros de Baubap están en versión pública: sin detalles de incidentes, sin nombres internos y sin cifras de costo. Antes de agregar métricas internas, confirma que la empresa permite mostrarlas.

Solo se renderiza mientras algo se mueve (scroll, tween o cursor); en reposo no hay frames. Con `prefers-reduced-motion` no hay curvatura, revelado ni scramble, y sin WebGL la misma página se muestra plana.

## Despliegue

Vercel detecta Vite: build `npm run build`, salida `dist/`. Cada push a `main` despliega a producción.

