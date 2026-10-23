import { CalendarHeatmap, GridHeatmap } from '@ui/components/data/Heatmap';
import { colors, Demo } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules } from '../../kit/Doc';
import { rng, WEEK, yearDays } from './sample';

const DAYS = yearDays();
const r = rng(21);
const GRID = WEEK.map((_, d) => Array.from({ length: 24 }, (_, h) => (h < 7 || h > 23 ? 0 : Math.round(r() * (d > 4 ? 30 : 18) * (h > 18 ? 2 : 1)))));
const C = ['var(--color-tab)', 'var(--color-mint)', 'var(--color-accent)', 'var(--color-ember)'] as const;

export default function HeatmapsPage() {
  return (
    <Doc eyebrow="Data" title="Heatmaps" source="ui/components/data/Heatmap.tsx"
      lead="Rhythm over time. One colour (the place's, by default), brightness is the amount, five steps, and always the less → more legend, so nobody has to guess what bright means.">
      <Demo title="A year of days" description="Weeks are columns, Monday is on top; on a phone the strip starts at the newest week. Tap or hover a day." controls={{ color: colors(C) }} center={false} minHeight={240}
        code={(v) => `<CalendarHeatmap days={days} color="${v.color}" />`}>
        {(v) => <div data-signal="green" className="w-full"><CalendarHeatmap days={DAYS} color={v.color} /></div>}
      </Demo>
      <Demo title="Hour × weekday" controls={{ color: colors(C) }} center={false} minHeight={260}
        code={(v) => `<GridHeatmap values={minutes} rowLabels={WEEK} colLabels={hours} color="${v.color}" />`}>
        {(v) => <div data-signal="coral" className="w-full"><GridHeatmap values={GRID} rowLabels={WEEK} colLabels={Array.from({ length: 24 }, (_, h) => (h % 6 ? '' : String(h)))} color={v.color} describe={(rr, c, x) => `${WEEK[rr]} ${c}:00 — ${x} min`} /></div>}
      </Demo>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'One colour per heatmap; let brightness carry the amount.', dont: 'Rainbow scales — they read as categories.' },
        ]} />
      </DocSection>
      <DocSection title="Props">
        <Props rows={[
          { name: 'days', type: '{ date, value, detail? }[]', description: 'CalendarHeatmap, ISO dates, oldest first.' },
          { name: 'values', type: 'number[][]', description: 'GridHeatmap matrix [row][col].' },
          { name: 'color', type: 'string', default: 'mint / accent', description: 'Any CSS colour or var(--…).' },
          { name: 'describe', type: '(r, c, v) => string', description: 'Headline and aria-label of a cell.' },
        ]} />
      </DocSection>
    </Doc>
  );
}
