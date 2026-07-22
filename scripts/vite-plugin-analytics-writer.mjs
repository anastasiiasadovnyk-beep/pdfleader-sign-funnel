import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const PRODUCTS = new Set(['pdfguru', 'tbp', 'pdfleader']);
const SLUG = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

export function resolveConceptPath(root, product, slug) {
  if (!PRODUCTS.has(product) || !SLUG.test(slug)) return null;
  const base = path.join(root, 'src/concepts');
  const target = path.join(base, product, slug, 'analytics.json');
  if (!target.startsWith(base + path.sep)) return null;
  return target;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
}

export default function analyticsWriter() {
  return {
    name: 'analytics-writer',
    apply: 'serve',
    configureServer(server) {
      const root = server.config.root;
      server.middlewares.use('/__analytics', async (req, res) => {
        const parts = req.url.split('?')[0].split('/').filter(Boolean);
        const file = parts.length === 2 ? resolveConceptPath(root, parts[0], parts[1]) : null;
        if (!file) { res.statusCode = 400; res.end('bad target'); return; }
        if (req.method === 'GET') {
          res.setHeader('content-type', 'application/json');
          res.end(existsSync(file) ? readFileSync(file, 'utf8') : JSON.stringify({ version: 1, product: parts[0], concept: parts[1], events: [] }));
          return;
        }
        if (req.method === 'POST') {
          try {
            const body = JSON.parse(await readBody(req));
            mkdirSync(path.dirname(file), { recursive: true });
            writeFileSync(file, JSON.stringify(body, null, 2) + '\n');
            res.statusCode = 200; res.end('ok');
          } catch (e) { res.statusCode = 400; res.end('invalid analytics payload'); }
          return;
        }
        res.statusCode = 405; res.end('method not allowed');
      });
    },
  };
}
