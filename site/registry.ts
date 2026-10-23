import type { DocGroup } from './kit/types';
import { pages as start } from './pages/start';
import { pages as foundations } from './pages/foundations';
import { pages as components } from './pages/components';
import { pages as navigation } from './pages/navigation';
import { pages as overlays } from './pages/overlays';
import { pages as effects } from './pages/effects';
import { pages as data } from './pages/data';
import { pages as ai } from './pages/ai';
import { pages as recipes } from './pages/recipes';

export const GROUPS: DocGroup[] = [
  { id: 'start', title: 'Start', pages: start },
  { id: 'foundations', title: 'Foundations', pages: foundations },
  { id: 'components', title: 'Components', pages: components },
  { id: 'navigation', title: 'Navigation & Layout', pages: navigation },
  { id: 'overlays', title: 'Overlays & Gestures', pages: overlays },
  { id: 'effects', title: 'Effects', pages: effects },
  { id: 'data', title: 'Data', pages: data },
  { id: 'ai', title: 'AI & Chat', pages: ai },
  { id: 'recipes', title: 'Recipes', pages: recipes },
].filter((g) => g.pages.length > 0);

export function findPage(path: string) {
  const [g, p] = path.split('/');
  const group = GROUPS.find((x) => x.id === g);
  const page = group?.pages.find((x) => x.id === p);
  return group && page ? { group, page } : null;
}

export const ALL = GROUPS.flatMap((g) => g.pages.map((p) => ({ ...p, group: g, path: `${g.id}/${p.id}` })));
