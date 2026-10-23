/** A small fake app used by the navigation pages: tabs, pages, content. */
import { Bell, CalendarDays, CalendarRange, FolderClosed, Home, LayoutGrid, Mail, MessageCircle, Plus, Search, Settings2, Sparkles, StickyNote, Timer, TrendingUp, Wrench } from 'lucide-react';
import { useState } from 'react';
import { AppShell, type NavItem } from '@ui/components/layout/AppShell';
import { Page, Section } from '@ui/components/layout/Page';
import type { TabItem } from '@ui/components/layout/TabBar';
import { IconButton, Button } from '@ui/components/core/Button';
import { List, Row } from '@ui/components/core/List';
import { Stat } from '@ui/components/core/Stat';
import { Chips } from '@ui/components/core/Chips';
import { Avatar } from '@ui/components/core/Avatar';
import { LogoMark, Wordmark } from '@ui/components/effects/Logo';

export type DemoTab = 'home' | 'luna' | 'plan' | 'files' | 'screen' | 'mail' | 'calendar' | 'notes' | 'progress' | 'tools';
/** Places, once. The shell puts the first four in the tab bar and the rest behind its last cell. */
export const NAV: NavItem<DemoTab>[] = [
  { id: 'home', label: 'Home', Icon: Home, place: 'home', group: 'You' },
  { id: 'luna', label: 'Luna', Icon: Sparkles, place: 'luna', group: 'You' },
  { id: 'plan', label: 'Plan', Icon: CalendarDays, badge: 'Two stories due today', place: 'plan', group: 'Organise' },
  { id: 'files', label: 'Files', Icon: FolderClosed, place: 'files', group: 'Organise' },
  { id: 'calendar', label: 'Calendar', Icon: CalendarRange, place: 'calendar', group: 'Organise' },
  { id: 'mail', label: 'Mail', Icon: Mail, badge: '2 unread', place: 'mail', group: 'Organise' },
  { id: 'notes', label: 'Notes', Icon: StickyNote, place: 'notes', group: 'Library' },
  { id: 'screen', label: 'Screen', Icon: Timer, place: 'screen', group: 'Library' },
  { id: 'progress', label: 'Progress', Icon: TrendingUp, place: 'progress', group: 'Library' },
  { id: 'tools', label: 'Tools', Icon: Wrench, place: 'tools', group: 'Library' },
];
/** The five used by the tab-bar demo. */
export const TABS: TabItem<DemoTab>[] = NAV.slice(0, 5).map(({ group: _g, ...t }) => t);
const TITLE: Partial<Record<DemoTab, string>> = { home: 'Friday 24', screen: 'Screen time' };

export function DemoApp({ mode, ambient = true, badges = true, overflow = true }: { mode: 'phone' | 'desktop'; ambient?: boolean; badges?: boolean; overflow?: boolean }) {
  const [tab, setTab] = useState<DemoTab>('home');
  const [retap, setRetap] = useState(0);
  const items = (overflow ? NAV : NAV.slice(0, 5)).map((t) => ({ ...t, badge: badges ? t.badge : undefined }));
  const pick = (t: DemoTab) => { if (t === tab) setRetap((n) => n + 1); else setTab(t); };
  const title = TITLE[tab] ?? NAV.find((t) => t.id === tab)!.label;
  return (
    <AppShell mode={mode} className="!h-full" nav={{
      items, value: tab, onChange: pick, search: () => {},
      brand: { mark: <LogoMark size={22} />, word: <Wordmark /> },
      account: (open) => <div className="flex h-10 items-center gap-3 px-[9px]"><Avatar name="Leandro P" size={26} /><span className="text-chip text-ink transition-opacity duration-200" style={{ opacity: open ? 1 : 0 }}>Leandro</span></div>,
    }}>
      <Page key={tab} title={title} eyebrow={tab === 'home' ? 'October · Week 43' : undefined} place={NAV.find((t) => t.id === tab)!.place} ambient={ambient ? undefined : false} scrollTopKey={retap}
        actions={<><IconButton label="Search"><Search size={17} strokeWidth={1.75} /></IconButton><IconButton label="New"><Plus size={17} strokeWidth={1.75} /></IconButton></>}>
        <DemoContent tab={tab} />
      </Page>
    </AppShell>
  );
}

function DemoContent({ tab }: { tab: DemoTab }) {
  const [f, setF] = useState('all');
  return (
    <>
      <Chips value={f} onChange={setF} options={[{ value: 'all', label: 'All', count: 12 }, { value: 'today', label: 'Today', count: 3 }, { value: 'school', label: 'School' }, { value: 'gym', label: 'Gym' }, { value: 'later', label: 'Later' }]} />
      <div className="mt-5 grid grid-cols-2 gap-3 @min-[700px]:grid-cols-3">
        <Stat value="6.4" unit="h" label="Focus this week" trend={12} />
        <Stat value="3" label="Due today" />
        <Stat className="hidden @min-[700px]:block" value="81%" label="Plan done" />
      </div>
      <Section label="Up next" action={<Button size="xs" variant="quiet">See all</Button>}>
        <List>
          <Row Icon={CalendarDays} title="Biology test — cells" detail="Tomorrow · 08:00" onClick={() => {}} />
          <Row Icon={MessageCircle} title="Reply to Mia" detail="Training at 6?" onClick={() => {}} />
          <Row Icon={Bell} title="Gym — legs" detail="Today · 17:30" onClick={() => {}} />
        </List>
      </Section>
      <Section label={tab === 'files' ? 'Recent' : 'More'}>
        <List>
          {['Notes', 'Reading list', 'Ideas', 'Trips', 'Recipes', 'Archive'].map((t) => <Row key={t} Icon={t === 'Archive' ? LayoutGrid : Settings2} title={t} value={String(t.length)} onClick={() => {}} />)}
        </List>
      </Section>
    </>
  );
}
