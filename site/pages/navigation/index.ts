import type { DocPage } from '../../kit/types';

export const pages: DocPage[] = [
  { id: 'app-shell', title: 'App shell', summary: 'One list of places → tab bar with More on phones, glass sidebar on desktop.', load: () => import('./AppShellPage'), badge: 'new' },
  { id: 'tab-bar', title: 'Liquid tab bar', summary: 'Draggable glass lens; the rest of the places grow out of the bar.', load: () => import('./TabBarPage'), badge: 'new' },
  { id: 'page', title: 'Page', summary: 'Large title that lifts off and pins, frosted fade, ambient light.', load: () => import('./PagePage') },
  { id: 'sidebar', title: 'Sidebar', summary: 'Floating glass island: hover-intent peek, pin, groups.', load: () => import('./SidebarPage'), badge: 'new' },
];
