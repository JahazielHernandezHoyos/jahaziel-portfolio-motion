import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { renderRoute, routes } from './src/render/pages.js';

// Every page is rendered from src/content at build time. The HTML entries are virtual: Vite
// resolves and loads them through this plugin, bundles their scripts and writes them to dist/
// at their route path (dist/en/index.html, dist/casos/<slug>/index.html, ...).
// In dev the same renderer runs per request through ssrLoadModule, so content edits show on reload.

const ROOT = import.meta.dirname;
const RENDERER = '/src/render/pages.js';

function pages() {
  const files = new Map(routes().map((r) => [resolve(ROOT, r.file), r]));

  return {
    name: 'portfolio-pages',
    config: () => ({
      build: {
        rollupOptions: {
          input: Object.fromEntries([...files].map(([abs, r]) => [r.file.replace(/\/?index\.html$/, '') || 'index', abs])),
        },
      },
    }),
    resolveId: (id) => (files.has(id) ? id : null),
    load: (id) => (files.has(id) ? renderRoute(files.get(id)) : null),
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://local');
        try {
          const mod = await server.ssrLoadModule(RENDERER);
          let html = null;
          const og = url.pathname.match(/^\/__og\/(es|en)\/?$/);
          if (og) html = mod.renderOg(og[1]);
          else {
            const route = mod.routes().find((r) => r.path === url.pathname || r.path === `${url.pathname}/`);
            if (route) html = mod.renderRoute(route);
          }
          if (!html) return next();
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(await server.transformIndexHtml(url.pathname, html));
        } catch (err) {
          next(err);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [pages()],
});
