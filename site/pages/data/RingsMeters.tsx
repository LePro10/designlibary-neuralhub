import { Ring } from '@ui/components/data/Ring';
import { Meter } from '@ui/components/data/Meter';
import { TickRing } from '@ui/components/data/TickRing';
import { PLACES } from '@ui/lib/tokens';
import { Demo, bool, range, select } from '../../kit/Demo';
import { Doc, DocSection, Grid, Props, Rules, Tile, Why } from '../../kit/Doc';
import { DATA_PLACES } from './sample';

export default function RingsMetersPage() {
  return (
    <Doc eyebrow="Data" title="Rings & meters" source={['ui/components/data/Ring.tsx', 'ui/components/data/TickRing.tsx', 'ui/components/data/Meter.tsx']}
      lead="How far along, how much used. A ring is for a goal (it closes), a meter for a budget (it can run over), the tick ring for the one hero figure. All take the place's colour and fill once when they come into view.">
      <Demo title="Tick ring" description="Sixty ticks light up one after another, the count follows in step, the last lit tick wears the place's colour."
        controls={{ value: range(0, 1, 0.72, 0.01), place: select(DATA_PLACES, 'progress'), size: range(120, 240, 176, 4, 'px'), step: range(4, 30, 12, 1, 'ms') }}
        minHeight={280} code={(v) => `<TickRing value={${v.value}} caption="of goal" />   // inside data-signal="${PLACES[v.place].signal}"`}>
        {(v) => (
          <div data-signal={PLACES[v.place].signal} className="rounded-card bg-bg p-6">
            <TickRing value={v.value} size={v.size} step={v.step} caption="of goal" label="Weekly goal" />
          </div>
        )}
      </Demo>

      <Demo title="Ring" controls={{ value: range(0, 1, 0.68, 0.01), place: select(DATA_PLACES, 'screen'), size: range(40, 180, 112, 4, 'px'), stroke: range(2, 10, 4, 1, 'px') }}
        minHeight={240} code={(v) => `<Ring value={${v.value}} size={${v.size}}${v.stroke !== 4 ? ` stroke={${v.stroke}}` : ''} caption="of goal">${Math.round(v.value * 100)}%</Ring>`}>
        {(v) => <div data-signal={PLACES[v.place].signal}><Ring value={v.value} size={v.size} stroke={v.stroke} caption="of goal" label="Weekly goal" immediate>{Math.round(v.value * 100)}%</Ring></div>}
      </Demo>

      <Demo title="Meter" description="Drag the value past 80 % and 100 %: the colour follows the fill, not the caller."
        controls={{ used: range(0, 130, 62, 1, '%'), place: select(DATA_PLACES, 'screen'), mono: bool(false), small: bool(false) }}
        minHeight={180} code={(v) => `<Meter value={${v.used}} max={100}${v.mono ? ' variant="mono"' : ''}${v.small ? ' size="sm"' : ''} label="Screen time" detail="${v.used} of 100 min" />`}>
        {(v) => <div data-signal={PLACES[v.place].signal} className="w-full max-w-[420px]"><Meter value={v.used} max={100} variant={v.mono ? 'mono' : 'tab'} size={v.small ? 'sm' : 'md'} label="Screen time today" detail={`${v.used} of 100 min`} /></div>}
      </Demo>

      <DocSection title="In tiles">
        <Grid cols={3}>
          <Tile label="Goal ring with caption"><div data-signal="green"><Ring value={0.82} size={76} caption="5 of 6">82%</Ring></div></Tile>
          <Tile label="Mono meter for storage"><Meter value={3.2} max={5} variant="mono" label="Storage" detail="3.2 of 5 GB" className="w-full" /></Tile>
          <Tile label="Small rings, one per day">
            <div data-signal="coral" className="flex gap-2.5">{[0.3, 0.6, 1, 0.8, 0.45].map((x, i) => <Ring key={i} value={x} size={30} stroke={3} />)}</div>
          </Tile>
        </Grid>
      </DocSection>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'Ring for goals that close; meter for budgets that can overflow.', dont: 'A ring above 100 %. It cannot show overflow; use a meter.' },
          { do: 'Let the meter choose its colour (warn at 80 %, danger at 100 %).', dont: 'Colour a meter red because the topic is serious.' },
          { do: 'One tick ring per screen, for the figure that matters.', dont: 'Gradient rings. One colour, the place\'s.' },
        ]} />
        <Why><p>The dashboard had four rings with strokes of 5, 7 and 8 and two fixed gradient ids that collided when two rings rendered at once, plus seven progress bars. Now there is one ring, one meter and one tick ring, all thin, all in the place's colour (<code>--color-tab</code>), all filling once on view.</p></Why>
      </DocSection>
      <DocSection title="Props">
        <Props rows={[
          { name: 'Ring value', type: 'number', description: '0–1.' },
          { name: 'stroke', type: 'number', default: '4', description: 'Stroke width in px.' },
          { name: 'colors', type: 'string | string[]', default: 'var(--color-tab)', description: 'One colour, or a gradient if you must.' },
          { name: 'caption / immediate', type: 'string / boolean', description: 'Small line under the value; fill now instead of on view.' },
          { name: 'TickRing value / ticks / step', type: 'number', default: '— / 60 / 12 ms', description: 'Share, number of ticks, delay between ticks.' },
          { name: 'readout / caption', type: '(share) => node / string', description: 'Centre value (default percent) and the small label.' },
          { name: 'Meter value / max / warn', type: 'number', default: 'max 1, warn 0.8', description: 'Used, capacity, share from which it turns ember.' },
          { name: 'variant', type: "'tab' | 'mono'", default: "'tab'", description: 'Calm colour below warn.' },
        ]} />
      </DocSection>
    </Doc>
  );
}
