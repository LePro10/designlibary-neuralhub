import type { DocPage } from '../../kit/types';

export const pages: DocPage[] = [
  { id: 'glass', title: 'Glass', summary: 'Glass levels, the non-uniform rim, the liquid lens and a tilting liquid-glass card.', load: () => import('./Glass'), badge: 'refined' },
  { id: 'light-border', title: 'Light border', summary: 'The "Now" frame: a light that runs around one item and a glow that breathes.', load: () => import('./LightBorder'), badge: 'refined' },
  { id: 'spotlight', title: 'Spotlight', summary: 'Pointer-following light on cards and their borders, without re-renders.', load: () => import('./Spotlight'), badge: 'new' },
  { id: 'orbs', title: 'Orbs', summary: 'Voice orb (CSS) and particle orb (WebGL): presence for an assistant, themed by accent.', load: () => import('./Orbs'), badge: 'refined' },
  { id: 'ambient', title: 'Light', summary: 'Each place has its own light: a 1 KB SVG at the top of the page, no shader, no grain.', load: () => import('./AmbientPage'), badge: 'refined' },
  { id: 'motion', title: 'Motion studies', summary: 'Task done in three steps, odometer digits, title reveal, magnetic hero action.', load: () => import('./MotionBits'), badge: 'new' },
  { id: 'text', title: 'Text effects', summary: 'Shimmer, word-by-word arrival, caret, line reveal and decode.', load: () => import('./TextEffects'), badge: 'refined' },
  { id: 'logo', title: 'Logo & intro', summary: 'A mark with one playful reaction, the mark at work, and the "point of light" intro.', load: () => import('./LogoPage'), badge: 'refined' },
];
