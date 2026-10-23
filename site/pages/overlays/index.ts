import type { DocPage } from '../../kit/types';

export const pages: DocPage[] = [
  { id: 'menu', title: 'Pull-down menu', summary: 'Grows from the button you tapped, on phones too: translucent, small, no sheet — never a <select>.', load: () => import('./MenuPage'), badge: 'refined' },
  { id: 'inline-picker', title: 'Inline picker', summary: 'A row that opens its choices right under itself, like the time picker in iOS Settings.', load: () => import('./InlinePickerPage'), badge: 'new' },
  { id: 'confirm-button', title: 'Confirm button', summary: 'Tap twice, in place: the button widens and asks, then acts — no dialog.', load: () => import('./ConfirmButtonPage'), badge: 'new' },
  { id: 'sheet', title: 'Panel', summary: 'For long tasks only: a full-height panel on phones, a light dialog on desktop.', load: () => import('./SheetPage'), badge: 'refined' },
  { id: 'context-menu', title: 'Context menu', summary: 'Long-press lifts the item over a blurred screen; right-click opens at the pointer.', load: () => import('./ContextMenuPage'), badge: 'refined' },
  { id: 'toast', title: 'Toast', summary: 'Glass pills with Undo above the tab bar; loading → done in place; stacking rules that never drop an Undo.', load: () => import('./ToastPage'), badge: 'refined' },
  { id: 'swipe-row', title: 'Swipe row', summary: 'iOS Mail-style leading/trailing actions with full swipe, haptics and native vertical scroll.', load: () => import('./SwipeRowPage'), badge: 'refined' },
  { id: 'stack', title: 'Stack', summary: 'In-place navigation with a shared-axis transition, scroll memory and swipe-back.', load: () => import('./StackPage'), badge: 'refined' },
  { id: 'command-palette', title: 'Command palette', summary: '⌘K: one field for places, actions, people and files — keyboard first, forgiving matches.', load: () => import('./CommandPalettePage'), badge: 'new' },
];
