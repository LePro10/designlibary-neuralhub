import type { ComponentType } from 'react';

/** One page of the showcase. Each group keeps its own list in site/pages/<group>/index.ts. */
export interface DocPage {
  /** URL segment, unique within its group. */
  id: string;
  title: string;
  /** One line for search and the overview grid. */
  summary: string;
  /** Lazy so the showcase loads fast; each page is its own chunk. */
  load: () => Promise<{ default: ComponentType }>;
  /** Marks pages that are new/refined versus the dashboard original. */
  badge?: 'new' | 'refined';
}

export interface DocGroup {
  id: string;
  title: string;
  pages: DocPage[];
}
