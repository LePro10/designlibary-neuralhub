import type { DocPage } from '../../kit/types';

export const pages: DocPage[] = [
  { id: 'app-shell', title: 'App shell', summary: 'Tab bar on phones, sidebar on desktop, decided by the shell’s own width.', load: () => import('./AppShellPage'), badge: 'refined' },
  { id: 'tab-bar', title: 'Liquid tab bar', summary: 'Draggable glass lens with squash & stretch and refraction.', load: () => import('./TabBarPage') },
  { id: 'page', title: 'Page', summary: 'Large title that lifts off and pins, frosted fade, ambient light.', load: () => import('./PagePage') },
  { id: 'sidebar', title: 'Sidebar', summary: 'Slim rail that opens over the content on hover.', load: () => import('./SidebarPage') },
];
