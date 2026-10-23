import type { DocPage } from '../../kit/types';

export const pages: DocPage[] = [
  { id: 'sheet', title: 'Sheet', summary: 'Bottom sheet with snaps on phones, dialog on desktop; compositor springs, keyboard-aware, ConfirmSheet.', load: () => import('./SheetPage'), badge: 'refined' },
  { id: 'menu', title: 'Menu', summary: 'Popover on desktop, sheet on phones: radio, checkbox, rich rows, sections, shortcuts — never a <select>.', load: () => import('./MenuPage'), badge: 'refined' },
  { id: 'context-menu', title: 'Context menu', summary: 'Long-press lifts the item over a blurred screen; right-click opens at the pointer.', load: () => import('./ContextMenuPage'), badge: 'refined' },
  { id: 'toast', title: 'Toast', summary: 'Glass pills with Undo above the tab bar; loading → done in place; stacking rules that never drop an Undo.', load: () => import('./ToastPage'), badge: 'refined' },
  { id: 'swipe-row', title: 'Swipe row', summary: 'iOS Mail-style leading/trailing actions with full swipe, haptics and native vertical scroll.', load: () => import('./SwipeRowPage'), badge: 'refined' },
  { id: 'stack', title: 'Stack', summary: 'In-place navigation with a shared-axis transition, scroll memory and swipe-back.', load: () => import('./StackPage'), badge: 'refined' },
  { id: 'command-palette', title: 'Command palette', summary: '⌘K: one field for places, actions, people and files — keyboard first, forgiving matches.', load: () => import('./CommandPalettePage'), badge: 'new' },
];
