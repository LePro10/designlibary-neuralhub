import type { DocPage } from '../../kit/types';

export const pages: DocPage[] = [
  { id: 'overview', title: 'Overview', summary: 'What this library is and how it feels.', load: () => import('./Overview') },
  { id: 'use-with-ai', title: 'Use it with Claude', summary: 'Prompts, setup and the files an AI reads to build in this design.', load: () => import('./UseWithAI'), badge: 'new' },
  { id: 'refinements', title: 'What changed', summary: 'Everything refined versus the dashboard original, and why.', load: () => import('./Refinements') },
];
