/** A small fake app used by the navigation pages: tabs, pages, content. */
import { Bell, CalendarDays, FolderClosed, Home, LayoutGrid, MessageCircle, Plus, Search, Settings2, Sparkles, Timer } from 'lucide-react';
import { useState } from 'react';
import { AppShell } from '@ui/components/layout/AppShell';
import { Page, Section } from '@ui/components/layout/Page';
import { TabBar, type TabItem } from '@ui/components/layout/TabBar';
import { Sidebar } from '@ui/components/layout/Sidebar';
import { IconButton, Button } from '@ui/components/core/Button';
import { List, Row } from '@ui/components/core/List';
import { Stat } from '@ui/components/core/Stat';
import { Chips } from '@ui/components/core/Chips';
import { Avatar } from '@ui/components/core/Avatar';
import { LogoMark, Wordmark } from '@ui/components/effects/Logo';
import type { AmbientName } from '@ui/lib/tokens';

export type DemoTab = 'luna' | 'plan' | 'files' | 'screen' | 'home';
export const TABS: TabItem<DemoTab>[] = [
  { id: 'luna', label: 'Luna', Icon: Sparkles },
  { id: 'plan', label: 'Plan', Icon: CalendarDays, badge: 'Two stories due today' },
  { id: 'files', label: 'Files', Icon: FolderClosed },
  { id: 'screen', label: 'Screen', Icon: Timer },
  { id: 'home', label: 'Home', Icon: Home },
];
const AMB: Record<DemoTab, AmbientName> = { luna: 'luna', plan: 'plan', files: 'files', screen: 'screen', home: 'home' };
const TITLE: Record<DemoTab, string> = { luna: 'Luna', plan: 'Plan', files: 'Files', screen: 'Screen time', home: 'Friday 24' };

export function DemoApp({ mode, ambient = true, badges = true }: { mode: 'phone' | 'desktop'; ambient?: boolean; badges?: boolean }) {
  const [tab, setTab] = useState<DemoTab>('home');
  const [retap, setRetap] = useState(0);
  const items = TABS.map((t) => ({ ...t, badge: badges ? t.badge : undefined }));
  const pick = (t: DemoTab) => { if (t === tab) setRetap((n) => n + 1); else setTab(t); };
  return (
    <AppShell mode={mode} className="!h-full"
      sidebar={<Sidebar items={[...items.slice(4), ...items.slice(0, 4)].map((t, i) => ({ ...t, groupStart: i === 1 }))} value={tab} onChange={pick} search={() => {}}
        brand={{ mark: <LogoMark size={24} />, word: <Wordmark /> }}
        footer={(open) => <div className="flex items-center gap-3 rounded-field px-[11px] py-2"><Avatar name="Leandro P" size={32} /><span className="text-[13px] text-bright transition-opacity" style={{ opacity: open ? 1 : 0 }}>Leandro</span></div>} />}
      tabbar={<TabBar items={items} value={tab} onChange={pick} />}>
      <Page key={tab} title={TITLE[tab]} eyebrow={tab === 'home' ? 'October · Week 43' : undefined} ambient={ambient ? AMB[tab] : undefined} scrollTopSignal={retap}
        actions={<><IconButton label="Search"><Search size={18} /></IconButton><IconButton label="New"><Plus size={18} /></IconButton></>}>
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
