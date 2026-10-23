import { Donut } from '@ui/components/data/Donut';
import { Demo, range } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules } from '../../kit/Doc';

const PARTS = [
  { value: 94, color: 'var(--color-series-1)', label: 'Learning' },
  { value: 61, color: 'var(--color-series-2)', label: 'Social' },
  { value: 38, color: 'var(--color-series-3)', label: 'Tools' },
  { value: 22, color: 'var(--color-series-4)', label: 'Other' },
];

export default function DonutPage() {
  return (
    <Doc eyebrow="Data" title="Donut" source="ui/components/data/Donut.tsx"
      lead="Shares of a whole, at a glance. Segments keep a small gap and round ends and draw in one after another; the centre carries the total.">
      <Demo title="Playground" controls={{ size: range(72, 200, 128, 4, 'px'), thickness: range(4, 20, 11, 1), gap: range(0, 8, 3, 0.5) }} minHeight={240}
        code={(v) => `<Donut parts={parts} center="3h 35m" sub="today" size={${v.size}} thickness={${v.thickness}} gap={${v.gap}} />`}>
        {(v) => <Donut key={`${v.size}-${v.thickness}-${v.gap}`} parts={PARTS} center="3h 35m" sub="today" size={v.size} thickness={v.thickness} gap={v.gap} />}
      </Demo>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'Up to five parts; fold the rest into "Other".', dont: 'Compare donuts side by side — use bars for comparison.' },
        ]} />
      </DocSection>
      <DocSection title="Props">
        <Props rows={[
          { name: 'parts', type: '{ value, color, label? }[]', description: 'Segments; labels feed the legend and aria-label.' },
          { name: 'center / sub', type: 'string', description: 'Total and its unit in the middle.' },
          { name: 'thickness', type: 'number', default: '11', description: 'Ring width (viewBox 100).' },
          { name: 'gap', type: 'number', default: '3', description: 'Gap between segments.' },
        ]} />
      </DocSection>
    </Doc>
  );
}
