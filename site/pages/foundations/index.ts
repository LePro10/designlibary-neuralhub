import type { DocPage } from '../../kit/types';

export const pages: DocPage[] = [
  { id: 'color', title: 'Color', summary: 'Near-black surfaces, four fills, grey-green ink, the glow palette.', load: () => import('./Color') },
  { id: 'typography', title: 'Typography', summary: 'DM Sans light display + IBM Plex Mono index labels; one 15-step scale.', load: () => import('./Typography'), badge: 'refined' },
  { id: 'shape', title: 'Shape & depth', summary: 'Radii named by role, card / glass / rim recipes, soft shadows.', load: () => import('./Shape'), badge: 'refined' },
  { id: 'motion', title: 'Motion', summary: 'Seven named springs, four easings, the compositor performance contract.', load: () => import('./Motion'), badge: 'refined' },
  { id: 'layout', title: 'Layout & mobile', summary: 'One breakpoint, safe areas, 44px targets, gestures, z layers.', load: () => import('./Layout') },
  { id: 'themes', title: 'Themes', summary: 'Six accent sets and four glass levels, switchable per subtree.', load: () => import('./Themes'), badge: 'new' },
];
