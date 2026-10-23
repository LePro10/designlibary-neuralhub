import type { DocPage } from '../../kit/types';

export const pages: DocPage[] = [
  { id: 'chat-screen', title: 'Chat screen', summary: 'Recipe: the full assistant screen on phone and desktop — trace, streaming, sources, composer.', load: () => import('./ChatScreen'), badge: 'refined' },
  { id: 'composer', title: 'Composer', summary: 'Glass input that grows to five lines; voice → send → stop morph, attachments, dictation.', load: () => import('./ComposerPage'), badge: 'refined' },
  { id: 'messages', title: 'Messages & streaming', summary: 'User bubble, document-style answers, word-by-word streaming without layout shift.', load: () => import('./Messages'), badge: 'refined' },
  { id: 'trace', title: 'Agent trace & tools', summary: 'Honest status from real events, live thoughts, tool timeline, tool call cards.', load: () => import('./Trace'), badge: 'refined' },
  { id: 'sources', title: 'Sources & citations', summary: 'Inline numbered citations with previews, source cards, compact source stack.', load: () => import('./SourcesPage'), badge: 'new' },
  { id: 'cards', title: 'Decision cards', summary: 'Question wizard, confirm before acting, diff view, undoable change pills.', load: () => import('./Cards'), badge: 'refined' },
  { id: 'voice', title: 'Voice', summary: 'Assistant orb, live waveform (real mic or simulated), voice mode with karaoke transcript.', load: () => import('./Voice'), badge: 'refined' },
  { id: 'start', title: 'Empty chat', summary: 'Hero with orb and greeting, context suggestions, model pill with fallback warning.', load: () => import('./StartPage'), badge: 'new' },
];
