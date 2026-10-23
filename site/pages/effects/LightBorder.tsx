import { Zap } from 'lucide-react';
import { LightBorder } from '@ui/components/effects/LightBorder';
import { Pill } from '@ui/components/core/Chips';
import { bool, Demo, range, select } from '../../kit/Demo';
import { Doc, DocSection, Grid, Props, Rules, Tile, Usage, Why } from '../../kit/Doc';

const PAIRS = { theme: undefined, ice: ['#b9d3ff', '#96ffdc'], ember: ['#ffc9a8', '#ffe28a'], lilac: ['#d9d0ff', '#ffaee0'], white: ['#ffffff', '#9aa39d'] } as const;

function NowCard() {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-accent/15 text-accent"><Zap size={13} className="fill-current" style={{ animation: 'pulse-soft 2.4s ease-in-out infinite' }} /></span>
        <span className="eyebrow !text-accent">Now</span>
        <Pill size="sm" tone="neutral" className="ml-auto">25 min left</Pill>
      </div>
      <p className="mt-3 text-body text-bright">Write the physics summary</p>
      <p className="mt-1 text-detail text-dim">Chapter 4 · Waves and interference</p>
    </div>
  );
}

export default function LightBorderPage() {
  return (
    <Doc eyebrow="Effects" title="Light border" source="ui/components/effects/LightBorder.tsx"
      lead="The “Now” frame from Plan: a light runs around the item that is happening right now, and a glow breathes behind it. It answers one question at a glance — what am I doing? — so there is only ever one per screen.">
      <Demo
        title="Playground"
        controls={{ speed: range(2, 14, 6, 0.5, 's'), width: range(1, 4, 1.5, 0.5, 'px'), radius: range(8, 36, 22, 1, 'px'), glow: range(0, 1, 1, 0.05), colors: select(['theme', 'ice', 'ember', 'lilac', 'white'] as const), paused: bool(false) }}
        minHeight={280}
        code={(v) => `<LightBorder speed={${v.speed}} width={${v.width}} radius={${v.radius}} glow={${v.glow}}${v.colors !== 'theme' ? ` colors={['${PAIRS[v.colors]![0]}', '${PAIRS[v.colors]![1]}']}` : ''}${v.paused ? ' paused' : ''}>\n  <NowCard />\n</LightBorder>`}
      >
        {(v) => (
          <LightBorder speed={v.speed} width={v.width} radius={v.radius} glow={v.glow} colors={PAIRS[v.colors] as [string, string] | undefined} paused={v.paused} className="w-full max-w-[360px]">
            <NowCard />
          </LightBorder>
        )}
      </Demo>

      <DocSection title="In context" description="The light only works because everything around it is still.">
        <Grid cols={2}>
          <Tile label="One running item in a list" bg="raised">
            <div className="w-full max-w-[320px] space-y-2">
              <div className="rounded-list border border-line bg-fill-1 px-4 py-3 text-chip text-dim line-through">Read chapter 3</div>
              <LightBorder radius={22}><div className="px-4 py-3 text-chip text-bright">Write the summary</div></LightBorder>
              <div className="rounded-list border border-line bg-fill-1 px-4 py-3 text-chip text-ink">Exercise sheet 5</div>
            </div>
          </Tile>
          <Tile label="Pill-shaped: a live call" bg="raised">
            <LightBorder radius={999} speed={3.5} colors={['#9fe7c8', '#b9d3ff']}>
              <div className="flex items-center gap-2.5 px-4 py-2.5 text-chip text-bright"><span className="ping" style={{ ['--ping' as string]: 'var(--color-mint)' }} />Call · 12:04</div>
            </LightBorder>
          </Tile>
        </Grid>
      </DocSection>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'One light border per screen, on the thing happening now.', dont: 'Use it as decoration on feature cards — then nothing is "now".' },
          { do: 'Stop it (paused) the moment the item is done.', dont: 'Animate the border with a moving gradient background — that repaints every frame.' },
        ]} />
        <Why>
          <p>A conic gradient inside an oversized, rotating child: only <code>transform</code> animates, on the compositor. The glow is a box-shadow on its own layer whose <code>opacity</code> breathes. The content sits on an opaque surface 1.5px inside, so the light shows only in the seam. It carries <code>.deko</code> — rest mode, hidden pages and reduced motion stop it where it is.</p>
        </Why>
      </DocSection>

      <DocSection title="Props">
        <Props rows={[
          { name: 'radius', type: 'number', default: '22', description: 'Outer corner radius (999 for pills).' },
          { name: 'width', type: 'number', default: '1.5', description: 'Width of the light seam.' },
          { name: 'speed', type: 'number', default: '6', description: 'Seconds per lap.' },
          { name: 'glow', type: 'number', default: '1', description: 'Breathing glow strength, 0 = none.' },
          { name: 'colors', type: '[head, tail]', default: 'theme', description: 'Sweep colours (default --ring-a / --ring-b of the accent theme).' },
          { name: 'surface', type: 'string', description: 'Content background (must be opaque).' },
          { name: 'paused', type: 'boolean', description: 'Holds the light where it is.' },
        ]} />
        <Usage code={`<LightBorder>\n  <StoryCard story={now} />\n</LightBorder>`} />
      </DocSection>
    </Doc>
  );
}
