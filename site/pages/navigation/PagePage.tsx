import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Page, Section } from '@ui/components/layout/Page';
import { IconButton } from '@ui/components/core/Button';
import { List, Row } from '@ui/components/core/List';
import { SearchField } from '@ui/components/core/Field';
import { AMBIENT, type AmbientName } from '@ui/lib/tokens';
import { bool, Demo, select } from '../../kit/Demo';
import { Doc, DocSection, Props, Why } from '../../kit/Doc';
import { Phone } from '../../kit/Phone';

const NAMES = Object.keys(AMBIENT) as AmbientName[];

export default function PagePage() {
  return (
    <Doc eyebrow="Navigation & Layout" title="Page" source="ui/components/layout/Page.tsx"
      lead="A large light title in DM Sans 300 that scrolls up, lifts off 16px from the top and stays — with a frosted black fade rising behind it like a shadow. No second, smaller title. Ambient light per place sits behind the top and fades as you scroll.">
      <Demo title="Scroll it" padded={false} minHeight={760}
        controls={{ ambient: select(['plan', 'luna', 'files', 'screen', 'account', 'notes', 'ember', 'mono', 'none'] as const), back: bool(false), header: bool(true), eyebrow: bool(true) }}
        code={(v) => `<Page title="Plan"${v.eyebrow ? ' eyebrow="Week 43"' : ''}${v.ambient !== 'none' ? ` ambient="${v.ambient}"` : ''}${v.back ? ' backLabel="Projects" onBack={pop}' : ''}\n  actions={<IconButton label="New"><Plus /></IconButton>}${v.header ? '\n  header={<SearchField … />}' : ''}>\n  …\n</Page>`}>
        {(v) => <div className="w-full py-6"><Phone><PageDemo ambient={v.ambient === 'none' ? undefined : v.ambient as AmbientName} back={v.back} header={v.header} eyebrow={v.eyebrow} /></Phone></div>}
      </Demo>
      <DocSection title="Ambient palettes" description={`${NAMES.length} palettes, each five stops dark → mid-tone → dark. Mid-tones only: the light tints the dark, it never washes out text. A pushed level keeps its parent's light, so a folder still feels like Files.`}>
        <div className="mt-5 grid grid-cols-2 gap-3 @min-[700px]:grid-cols-4">
          {NAMES.map((n) => <div key={n} className="overflow-hidden rounded-stat border border-line"><div className="h-14" style={{ background: `linear-gradient(90deg, ${AMBIENT[n].join(',')})` }} /><div className="px-3 py-2 font-mono text-tiny text-dim">{n}</div></div>)}
        </div>
      </DocSection>
      <DocSection title="Props">
        <Props rows={[
          { name: 'title / eyebrow / heading', type: 'string / string / ReactNode', description: 'Large title, mono label above, or a custom heading.' },
          { name: 'actions', type: 'ReactNode', description: 'Top bar on phones (thumb reach), title line on desktop.' },
          { name: 'backLabel / onBack', type: 'string / () => void', description: 'Back button with the parent’s name; the title then pins in place.' },
          { name: 'header', type: 'ReactNode', description: 'Between title and body: search, segmented.' },
          { name: 'ambient / ambientSeed', type: 'AmbientName | string[] / number', description: 'Light behind the top. Seed fixed at mount — renaming never reshuffles it.' },
          { name: 'wide', type: 'boolean', description: '1240px instead of 980px.' },
          { name: 'scrollTopSignal', type: 'unknown', description: 'Change it to smooth-scroll to top (re-tap of the active tab).' },
        ]} />
        <Why><p>The scroll position never re-renders the page: <code>useScroll</code> feeds motion values, and only one boolean (“scrolled”) crosses into React to mount the fades. Invisible backdrop blurs still cost every frame, so they exist only while needed.</p></Why>
      </DocSection>
    </Doc>
  );
}

function PageDemo({ ambient, back, header, eyebrow }: { ambient?: AmbientName; back: boolean; header: boolean; eyebrow: boolean }) {
  const [q, setQ] = useState('');
  return (
    <div className="h-full">
      <Page key={`${ambient}${back}`} title={back ? 'Biology' : 'Plan'} eyebrow={eyebrow ? 'Week 43 · 5 open' : undefined} ambient={ambient} backLabel={back ? 'Projects' : undefined} onBack={() => {}}
        actions={<><IconButton label="Filter"><SlidersHorizontal size={17} /></IconButton><IconButton label="New"><Plus size={18} /></IconButton></>}
        header={header ? <SearchField className="mb-5" value={q} onChange={setQ} placeholder="Search stories" /> : undefined}>
        {['Now', 'Next', 'Later'].map((s) => (
          <Section key={s} label={s}>
            <List>{Array.from({ length: 4 }, (_, i) => <Row key={i} Icon={Search} title={`${s} — story ${i + 1}`} detail="Biology · due Fri" onClick={() => {}} />)}</List>
          </Section>
        ))}
      </Page>
    </div>
  );
}
