import type { DocPage } from '../../kit/types';

export const pages: DocPage[] = [
  { id: 'button', title: 'Button', summary: 'Pill buttons: primary with glow, glass, ghost, quiet, danger; sizes, busy, sheen.', load: () => import('./Button'), badge: 'refined' },
  { id: 'controls', title: 'Controls', summary: 'Segmented, Switch, Check and the new Slider — motion and haptics on every choice.', load: () => import('./Controls'), badge: 'refined' },
  { id: 'chips', title: 'Chips & Pills', summary: 'Filter chips that scroll sideways, status pills in seven tones.', load: () => import('./ChipsPills'), badge: 'refined' },
  { id: 'inputs', title: 'Inputs', summary: 'Fields, auto-growing text, search with shortcut hint.', load: () => import('./Inputs') },
  { id: 'lists', title: 'Lists & Rows', summary: 'Grouped lists with quiet icon tiles and flexible leading/trailing slots.', load: () => import('./Lists') },
  { id: 'states', title: 'States', summary: 'Skeletons, spinner, shimmer, empty, callouts, status dots, offline.', load: () => import('./Feedback'), badge: 'refined' },
  { id: 'figures', title: 'Stats & Avatars', summary: 'Stat tiles with trends, big numbers, glossy avatars, stacks.', load: () => import('./Figures') },
];
