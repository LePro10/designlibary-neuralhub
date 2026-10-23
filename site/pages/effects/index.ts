import type { DocPage } from '../../kit/types';

export const pages: DocPage[] = [
  { id: 'glass', title: 'Glass', summary: 'Glass levels, the non-uniform rim, the liquid lens and a tilting liquid-glass card.', load: () => import('./Glass'), badge: 'refined' },
  { id: 'light-border', title: 'Light border', summary: 'The "Now" frame: a light that runs around one item and a glow that breathes.', load: () => import('./LightBorder'), badge: 'refined' },
  { id: 'spotlight', title: 'Spotlight', summary: 'Pointer-following light on cards and their borders, without re-renders.', load: () => import('./Spotlight'), badge: 'new' },
  { id: 'orbs', title: 'Orbs', summary: 'Voice orb (CSS) and particle orb (WebGL): presence for an assistant, themed by accent.', load: () => import('./Orbs'), badge: 'refined' },
  { id: 'ambient', title: 'Ambient light', summary: 'Mesh-gradient light behind a page top, rendered once, with palettes and seeds.', load: () => import('./AmbientPage') },
  { id: 'texture', title: 'Texture', summary: 'Grain, dither against banding, dot grid, hatched "blocked" surfaces.', load: () => import('./Texture') },
  { id: 'text', title: 'Text effects', summary: 'Shimmer, word-by-word arrival, caret, glow ink and decode.', load: () => import('./TextEffects'), badge: 'refined' },
  { id: 'motion-bits', title: 'Magnetic & ticker', summary: 'A hero action that leans to the pointer; numbers that roll like an odometer.', load: () => import('./MotionBits'), badge: 'new' },
  { id: 'logo', title: 'Logo & intro', summary: 'A mark with one playful reaction, and the "point of light" start intro.', load: () => import('./LogoPage') },
];
