import { LineChart, Sparkline } from '@ui/components/data/LineChart';
import { Stat } from '@ui/components/core/Stat';
import { bool, Demo, select } from '../../kit/Demo';
import { Doc, DocSection, Grid, Props, Rules } from '../../kit/Doc';
import { rng } from './sample';

const r = rng(5);
const WEIGHT = Array.from({ length: 30 }, (_, i) => (i === 9 || i === 10 ? null : Math.round((72.4 - i * 0.05 + (r() - 0.5) * 0.8) * 10) / 10));
const AVG = WEIGHT.map((_, i) => { const w = WEIGHT.slice(Math.max(0, i - 6), i + 1).filter((x): x is number => x !== null); return w.length ? Math.round((w.reduce((a, b) => a + b, 0) / w.length) * 10) / 10 : null; });

export default function LinesPage() {
  return (
    <Doc eyebrow="Data" title="Line & sparkline" source="ui/components/data/LineChart.tsx"
      lead="For values that drift: weight, sleep, focus. The line draws itself once, gaps stay gaps, and a mint band marks where you want to be. Sparklines carry the same line into small tiles.">
      <Demo title="Line" controls={{ band: bool(true), secondary: bool(true), area: bool(true), color: select(['bright', 'accent', 'mint'] as const) }} center={false} minHeight={300}
        code={(v) => `<LineChart\n  points={avg7}${v.secondary ? '\n  secondary={readings}' : ''}${v.band ? '\n  band={[71.5, 72.5]}' : ''}\n  labels={['Sep 24', 'Oct 8', 'Oct 23']}\n  color="var(--color-${v.color})"${v.area ? '' : '\n  area={false}'}\n  format={(v) => v === null ? '–' : \`\${v} kg\`}\n/>`}>
        {(v) => (
          <LineChart className="w-full max-w-[600px]" points={AVG} secondary={v.secondary ? WEIGHT : undefined} band={v.band ? [71.5, 72.5] : undefined} area={v.area}
            color={`var(--color-${v.color})`} labels={['Sep 24', 'Oct 8', 'Oct 23']} title={(i) => `Day ${i + 1} · 7-day average`} format={(x) => (x === null ? '–' : `${x} kg`)} />
        )}
      </Demo>
      <DocSection title="Sparklines in stat tiles">
        <Grid cols={3}>
          <Stat value="7h 12m" label="Sleep, avg" trend={4}><Sparkline values={[6.5, 7, 6.8, 7.4, 7.1, 7.6, 7.2]} width={120} color="var(--color-accent)" area /></Stat>
          <Stat value="3h 40m" label="Screen time" trend={-12}><Sparkline values={[5, 4.6, 4.8, 4.1, 3.9, 4.2, 3.7]} width={120} color="var(--color-mint)" area /></Stat>
          <Stat value="12" label="Sessions" trend={8}><Sparkline values={[8, 9, 7, 10, 11, 10, 12]} width={120} /></Stat>
        </Grid>
      </DocSection>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'Show gaps as gaps (null).', dont: 'Interpolate missing days — it invents data.' },
          { do: 'A quiet secondary series behind an average.', dont: 'Two bright lines with the same weight.' },
        ]} />
      </DocSection>
      <DocSection title="Props">
        <Props rows={[
          { name: 'points', type: '(number | null)[]', description: 'Series; null = gap.' },
          { name: 'band', type: '[low, high]', description: 'Target range, shaded mint.' },
          { name: 'secondary', type: '(number | null)[]', description: 'Quiet series behind.' },
          { name: 'area', type: 'boolean', default: 'true', description: 'Soft fill under a gap-free line.' },
          { name: 'Sparkline values', type: 'number[]', description: 'Last point is marked.' },
        ]} />
      </DocSection>
    </Doc>
  );
}
