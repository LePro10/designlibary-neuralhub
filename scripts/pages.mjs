// Shared by bundle.mjs and screenshots.mjs: the showcase pages, read from
// site/registry.ts (group order) and site/pages/<group>/index.ts (page list).
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

export const root = resolve(dirname(new URL(import.meta.url).pathname), '..');

export function readPages() {
  const reg = readFileSync(join(root, 'site/registry.ts'), 'utf8');
  const groups = [...reg.matchAll(/\{ id: '([a-z]+)', title: '([^']+)', pages: [a-z]+ \}/g)];
  return groups.flatMap(([, gid, gtitle]) => {
    let src = '';
    try { src = readFileSync(join(root, `site/pages/${gid}/index.ts`), 'utf8'); } catch { return []; }
    return [...src.matchAll(/\{ id: '([^']+)', title: '([^']+)', summary: '((?:[^'\\]|\\.)*)'/g)]
      .map(([, id, title, summary]) => ({ path: `${gid}/${id}`, group: gtitle, title, summary: summary.replace(/\\'/g, "'") }));
  });
}
