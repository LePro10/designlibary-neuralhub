/** Shared demo content: one believable conversation, used across the AI pages. */
import { CalendarDays, Dumbbell, Globe, ListChecks, Mail, Search } from 'lucide-react';
import type { Source } from '@ui/components/ai/Sources';
import { ev } from './_sim';

export const QUESTION = 'I have 30 minutes before training. What can I still get done?';

export const ANSWER = `You have **34 minutes** until gym at 18:00 — enough for one focused block, not two.

- **Physics sheet 4**, tasks 2–3: due tomorrow, you started it Monday [1]
- Reply to **Anna** about Saturday — she asked twice [2]
- Skip the reading for history: the quiz moved to next week [3]

I'd do the physics first and send Anna a one-liner on the way out. Want me to block 17:25–17:55 for it?`;

export const SOURCES: Source[] = [
  { title: 'Physics — Sheet 4 (Waves)', where: 'Files · School', kind: 'file', snippet: 'Tasks 1–5, due Thu. Task 1 done Mon 21:10.' },
  { title: 'Re: Saturday?', where: 'Mail · Anna Keller', kind: 'mail', snippet: '“Are you in for Saturday? Need to know by tonight.”' },
  { title: 'History quiz moved to 31 Oct', where: 'school-portal.ch', kind: 'web', snippet: 'The quiz on the French Revolution is postponed by one week.' },
];

export const THINKING = 'Gym is at 18:00 and it is 17:26 — so roughly half an hour. Due soon: physics sheet tomorrow, history quiz… let me check if that date still holds. Anna asked about Saturday twice, a short reply is cheap. Physics needs focus, do that first. ';

export const RUN = [
  ev.think(200, 'Gym is at 18:00 and it is 17:26 — so roughly half an hour. '),
  ev.think(700, 'Due soon: physics sheet tomorrow, history quiz… let me check if that date still holds. '),
  ev.status(1300, 's1', 'Checking what is due'),
  ev.start(1500, { id: 'cal', label: 'Calendar', detail: 'today 17:00–19:00', Icon: CalendarDays }),
  ev.start(1650, { id: 'plan', label: 'Plan', detail: 'due ≤ 2 days', Icon: ListChecks }),
  ev.finish(2300, 'cal', { ms: 640 }),
  ev.finish(2700, 'plan', { ms: 1050 }),
  ev.start(2900, { id: 'web', label: 'School portal', detail: '“history quiz date”', Icon: Globe }),
  ev.start(3100, { id: 'mail', label: 'Mail', detail: 'from:Anna unread', Icon: Mail }),
  ev.finish(3900, 'mail', { ms: 800 }),
  ev.finish(4300, 'web', { ms: 1400 }),
  ev.think(4500, 'Anna asked about Saturday twice, a short reply is cheap. Physics needs focus, do that first. '),
  ev.answer(5200),
  ev.end(5300),
];

export const SUGGESTIONS = [
  { title: 'Plan tonight around gym', detail: '3 things due this week', Icon: Dumbbell },
  { title: 'What did Anna ask me?', detail: '2 unread from Anna', Icon: Mail },
  { title: 'Find the physics sheet', detail: 'Files · School', Icon: Search },
  { title: 'Move tomorrow’s study block', detail: 'Clashes with dentist', Icon: CalendarDays },
];

export const MODELS = [
  { id: 'smart', label: 'Smart', detail: 'Best answers, a bit slower', badge: 'default' },
  { id: 'fast', label: 'Fast', detail: 'Quick replies, short tasks' },
  { id: 'local', label: 'On device', detail: 'Private, offline, limited' },
];
