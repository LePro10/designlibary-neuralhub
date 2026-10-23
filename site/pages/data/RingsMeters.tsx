import { Ring } from '@ui/components/data/Ring';
import { Meter } from '@ui/components/data/Meter';
import { Demo, colors, range, select } from '../../kit/Demo';
import { Doc, DocSection, Grid, Props, Rules, Tile, Why } from '../../kit/Doc';

const GRADIENTS = { 'accent → lilac': ['var(--color-accent)', 'var(--color-lilac)'], 'ice → lilac → sand': ['var(--color-ice)', 'var(--color-lilac)', 'var(--color-sand)'], mint: ['var(--color-mint)'], ember: ['var(--color-ember)'], bright: ['var(--color-bright)'] } as const;

export default function RingsMetersPage() {
  return (
    <Doc eyebrow="Data" title="Rings & meters" source={['ui/components/data/Ring.tsx', 'ui/components/data/Meter.tsx']}
      lead="How far along, how much used. The ring is for a goal (it closes); the meter for a budget (it can run over). Both fill once when they come into view.">
      <Demo title="Ring" controls={{ value: range(0, 1, 0.68, 0.01), size: range(40, 180, 120, 4, 'px'), stroke: range(3, 16, 9, 1, 'px'), paint: select(Object.keys(GRADIENTS) as (keyof typeof GRADIENTS)[]) }}
        minHeight={260} code={(v) => `<Ring value={${v.value}} size={${v.size}} stroke={${v.stroke}} colors={${JSON.stringify(GRADIENTS[v.paint])}} caption="of goal">\n  ${Math.round(v.value * 100)}%\n</Ring>`}>
        {(v) => <Ring key={v.paint} value={v.value} size={v.size} stroke={v.stroke} colors={[...GRADIENTS[v.paint]]} caption="of goal" label="Weekly goal">{Math.round(v.value * 100)}%</Ring>}
      </Demo>
      <Demo title="Meter" description="Drag the value past 80 % and 100 %: the colour follows the fill, not the caller." controls={{ used: range(0, 130, 62, 1, '%'), variant: select(['gradient', 'mono'] as const), size: select(['sm', 'md'] as const, 'md') }}
        minHeight={200} code={(v) => `<Meter value={${v.used}} max={100} variant="${v.variant}" size="${v.size}" label="Screen time" detail="${v.used} of 100 min" />`}>
        {(v) => <Meter value={v.used} max={100} variant={v.variant} size={v.size} label="Screen time today" detail={`${v.used} of 100 min`} className="w-full max-w-[420px]" />}
      </Demo>
      <DocSection title="In tiles">
        <Grid cols={3}>
          <Tile label="Goal ring with caption"><Ring value={0.82} size={84} stroke={7} caption="5 of 6">82%</Ring></Tile>
          <Tile label="Mono meter for storage"><Meter value={3.2} max={5} variant="mono" label="Storage" detail="3.2 of 5 GB" className="w-full" /></Tile>
          <Tile label="Small rings in a row">
            <div className="flex gap-3">{[0.3, 0.6, 1].map((x, i) => <Ring key={i} value={x} size={40} stroke={4} colors={['var(--color-mint)']} />)}</div>
          </Tile>
        </Grid>
      </DocSection>
      <DocSection title="Colour of a single ring" description="One colour per ring when it shares a row with others; the gradient for the hero ring.">
        <Demo controls={{ c: colors(['var(--color-accent)', 'var(--color-mint)', 'var(--color-ember)', 'var(--color-lilac)', 'var(--color-sand)'] as const, 'var(--color-accent)', 'colour') }} minHeight={160} code={(v) => `<Ring value={0.5} colors="${v.c}" />`}>
          {(v) => <Ring value={0.5} size={72} stroke={6} colors={v.c} immediate>50%</Ring>}
        </Demo>
      </DocSection>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'Ring for goals that close; meter for budgets that can overflow.', dont: 'A ring above 100 % — it cannot show overflow; use a meter.' },
          { do: 'Let the meter choose its colour (warn at 80 %, danger at 100 %).', dont: 'Colour a meter red because the topic is serious.' },
        ]} />
        <Why><p>The dashboard had four rings with strokes of 5, 7 and 8 and two fixed gradient ids (<code>ring-g</code>, <code>tg</code>) that collided when two rings rendered at once. The gradient id now comes from <code>useId</code>. Seven different progress bars became one meter with thresholds and a minimum visible sliver.</p></Why>
      </DocSection>
      <DocSection title="Props">
        <Props rows={[
          { name: 'Ring value', type: 'number', description: '0–1.' },
          { name: 'colors', type: 'string | string[]', default: 'accent → lilac', description: 'One colour or a gradient.' },
          { name: 'caption', type: 'string', description: 'Small line under the centre content.' },
          { name: 'immediate', type: 'boolean', description: 'Fill now instead of on view.' },
          { name: 'Meter value / max', type: 'number', default: 'max 1', description: 'Used and capacity.' },
          { name: 'warn', type: 'number', default: '0.8', description: 'Share from which the meter turns ember.' },
          { name: 'variant', type: "'gradient' | 'mono'", default: "'gradient'", description: 'Calm colour below warn.' },
        ]} />
      </DocSection>
    </Doc>
  );
}
