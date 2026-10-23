import { Inbox, Sparkles, Star, Zap } from 'lucide-react';
import { useState } from 'react';
import { Chips, Pill, ToggleChip, type Tone } from '@ui/components/core/Chips';
import { StatusDot } from '@ui/components/core/Feedback';
import { bool, Demo, select } from '../../kit/Demo';
import { Doc, DocSection, Grid, Rules, Tile, Why } from '../../kit/Doc';

const TONES: Tone[] = ['neutral', 'accent', 'success', 'warning', 'danger', 'live', 'ember'];

export default function ChipsPage() {
  return (
    <Doc eyebrow="Components" title="Chips & Pills" source="ui/components/core/Chips.tsx"
      lead="Chips filter — they are buttons, 36px tall, and scroll sideways on phones without stealing the swipe. Pills label — static status in one of seven tones. The dashboard had three hand-made pills; this is the one.">
      <Demo title="Filter chips" controls={{ counts: bool(true), dots: bool(false), lead: bool(true), nowrap: bool(false) }} padded center={false}
        code={(v) => `<Chips value={filter} onChange={setFilter}${v.nowrap ? ' nowrap' : ''}\n  ${v.lead ? 'lead={<ToggleChip on={starred} onChange={setStarred} label="Starred" Icon={Star} />}\n  ' : ''}options={[{ value: 'all', label: 'All'${v.counts ? ', count: 24' : ''} }, …]} />`}>
        {(v) => <ChipDemo {...v} />}
      </Demo>

      <DocSection title="Pills" description="Seven tones. dot for state, Icon for meaning. sm for inside rows, md beside titles.">
        <Demo controls={{ size: select(['md', 'sm'] as const), dot: bool(true) }} code={(v) => `<Pill tone="live"${v.dot ? ' dot' : ''}${v.size === 'sm' ? ' size="sm"' : ''}>Live</Pill>`}>
          {(v) => <div className="flex flex-wrap justify-center gap-2">{TONES.map((t) => <Pill key={t} tone={t} dot={v.dot} size={v.size}>{t}</Pill>)}</div>}
        </Demo>
        <Grid cols={3}>
          <Tile label="Mail draft states"><div className="flex flex-wrap justify-center gap-2"><Pill tone="neutral" dot>Draft</Pill><Pill tone="accent" Icon={Sparkles}>Luna wrote</Pill><Pill tone="success" dot>Sent</Pill></div></Tile>
          <Tile label="Limits"><div className="flex flex-wrap justify-center gap-2"><Pill tone="warning">82 % used</Pill><Pill tone="danger" Icon={Zap}>Over limit</Pill></div></Tile>
          <Tile label="Live"><Pill tone="live"><StatusDot tone="live" pulse size={6} />Luna is browsing</Pill></Tile>
        </Grid>
      </DocSection>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'Chips for filters with more than ~4 options or counts.', dont: 'Pills as buttons. A pill never has a hover or a press state.' },
          { do: 'Let a chip row bleed to the screen edge on phones (it scrolls).', dont: 'Wrap chips on a phone into three lines — the list moves too far down.' },
        ]} />
        <Why><p>The row carries <code>data-no-swipe</code> and <code>touch-action: pan-x pan-y</code>: a sideways drag scrolls the chips and never flips the tab pager behind it. On wide containers (≥ 700px, container query) it wraps instead.</p></Why>
      </DocSection>
    </Doc>
  );
}

function ChipDemo({ counts, dots, lead, nowrap }: { counts: boolean; dots: boolean; lead: boolean; nowrap: boolean }) {
  const [v, setV] = useState('all');
  const [star, setStar] = useState(false);
  const opts = [
    { value: 'all', label: 'All', count: 24, dot: '#b9d3ff' }, { value: 'unread', label: 'Unread', count: 5, dot: '#ff8a5c' },
    { value: 'school', label: 'School', count: 9, dot: '#a898ff' }, { value: 'gym', label: 'Gym', count: 3, dot: '#9fe7c8' },
    { value: 'family', label: 'Family', count: 4, dot: '#eadcbc' }, { value: 'later', label: 'Later', count: 2, dot: '#5b9bff', Icon: Inbox },
  ].map((o) => ({ ...o, count: counts ? o.count : undefined, dot: dots ? o.dot : undefined }));
  return <div className="w-full"><Chips value={v} onChange={setV} nowrap={nowrap} options={opts} lead={lead ? <ToggleChip on={star} onChange={setStar} label="Starred" Icon={Star} /> : undefined} /></div>;
}
