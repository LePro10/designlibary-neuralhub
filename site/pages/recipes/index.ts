import type { DocPage } from '../../kit/types';

export const pages: DocPage[] = [
  { id: 'today', title: 'Today', summary: 'Home as a letter: week strip, prose brief with links, one glowing hero.', load: () => import('./Today'), badge: 'new' },
  { id: 'settings', title: 'Settings', summary: 'Lists, menu instead of select, edit sheet, swipe + undo, confirm sheet.', load: () => import('./Settings'), badge: 'new' },
  { id: 'sign-in', title: 'Sign in', summary: 'The mark draws, the dot drops, the form rises; error and success paths.', load: () => import('./Login'), badge: 'new' },
];
