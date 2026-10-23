import { ChevronRight } from 'lucide-react';
import { BarChart } from '@ui/components/data/BarChart';
import { bool, Demo, range, select } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Usage, Why } from '../../kit/Doc';
import { PLACES } from '@ui/lib/tokens';
import { DATA_PLACES, rng, WEEK } from './sample';

const r = rng(11);
const HOURS = Array.from({ length: 24 }, (_, h) => (h < 7 ? 0 : Math.round(r() * (h > 18 ? 40 : 22))));
const DAYS = WEEK.map(() => Math.round(60 + r() * 180));
const STACK = Array.from({ length: 12 }, () => [Math.round(r() * 30), Math.round(r() * 20), Math.round(r() * 12)]);
const MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`);

export default function BarsPage() {
  return (
    <Doc eyebrow="Data" title="Bar chart" source={['ui/components/data/BarChart.tsx', 'ui/components/data/scrub.ts']}
      lead="Thin bars with round ends, a hairline average, and a headline that shows the value under your finger. The bar you look at wears the place's colour. Drag across to scrub; a tap pins a bar so the value stays when the finger lifts.">
      <Demo title="One series" controls={{ data: select(['week', 'hours'] as const), place: select(DATA_PLACES, 'screen'), future: bool(true), average: bool(true), height: range(80, 220, 140, 10, 'px') }}
        center={false} minHeight={300}
        code={(v) => `<BarChart\n  values={minutes}\n  labels={${v.data === 'week' ? 'WEEK' : 'hourLabels'}}\n  title={(i) => titles[i]}\n  format={fmtMin}${v.future ? `\n  future={${v.data === 'week' ? 4 : 21}}` : ''}${v.average ? '' : '\n  average={false}'}\n  height={${v.height}}\n/>`}>
        {(v) => (
          <div data-signal={PLACES[v.place].signal} className="w-full max-w-[560px]">
            {v.data === 'week'
              ? <BarChart values={DAYS} labels={WEEK} title={(i) => `${WEEK[i]}, ${17 + i} Oct`} format={fmtMin} future={v.future ? 4 : Infinity} average={v.average} height={v.height}
                  action={(i) => <button type="button" className="flex h-6 items-center gap-0.5 rounded-full bg-fill-3 pr-1 pl-2 text-meta text-ink hover:bg-fill-4">Open {WEEK[i]}<ChevronRight size={12} /></button>} />
              : <BarChart values={HOURS} labels={HOURS.map((_, h) => (h % 6 ? '' : String(h)))} title={(i) => `${i}:00 – ${i + 1}:00`} format={fmtMin} future={v.future ? 21 : Infinity} average={v.average} height={v.height} />}
          </div>
        )}
      </Demo>
      <Demo title="Stacked series" description="Series take their colours and get a legend; while scrubbing, the other columns recede." center={false} minHeight={300}
        code={`<BarChart\n  values={rows}               // rows[i] = [focus, lessons, sport]\n  labels={MONTHS}\n  series={[\n    { name: 'Focus', color: 'var(--color-series-1)' },\n    { name: 'Lessons', color: 'var(--color-series-2)' },\n    { name: 'Sport', color: 'var(--color-series-3)' },\n  ]}\n  unit="h"\n/>`}>
        {() => (
          <BarChart className="w-full max-w-[560px]" values={STACK} labels={MONTHS} unit="h" title={(i) => `${MONTHS[i]} 2026`}
            series={[{ name: 'Focus', color: 'var(--color-series-1)' }, { name: 'Lessons', color: 'var(--color-series-2)' }, { name: 'Sport', color: 'var(--color-series-3)' }]} />
        )}
      </Demo>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'Text stays in ink colours; only the bars carry colour.', dont: 'More than four series. Split the chart.' },
          { do: 'Let the page scroll over the chart (touch-pan-y).', dont: 'touch-action: none on a chart — a thumb landing on it gets stuck.' },
        ]} />
        <Why><p>On touch a value is chosen on drag or release, not on touch-down — someone who only wanted to scroll gets no tick. If the browser starts scrolling, <code>pointercancel</code> drops the half-made choice. A tap pins, because on a phone the value would otherwise only show while the finger covers it.</p></Why>
      </DocSection>
      <DocSection title="Props">
        <Props rows={[
          { name: 'values', type: 'number[] | number[][]', description: 'One series, or stacked rows (values[i][s]).' },
          { name: 'labels', type: 'string[]', description: "Axis labels; '' to skip one." },
          { name: 'title', type: '(i) => string', description: 'Line under the headline for bar i.' },
          { name: 'series', type: '{ name, color }[]', description: 'Stacked series; legend appears from two.' },
          { name: 'highlight', type: 'number', default: 'last past bar', description: 'Shown when nothing is hovered or pinned.' },
          { name: 'future', type: 'number', description: 'Bars from this index on are ghosts.' },
          { name: 'action', type: '(i) => ReactNode', description: 'Top-right slot for the shown bar.' },
        ]} />
        <Usage code={`<BarChart values={minutes} labels={WEEK} title={(i) => days[i]} format={fmtMin} />`} />
      </DocSection>
    </Doc>
  );
}
