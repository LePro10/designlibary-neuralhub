import { ArrowRight, RotateCcw, Shuffle } from 'lucide-react';
import { useState } from 'react';
import { Magnetic } from '@ui/components/effects/Magnetic';
import { Odometer } from '@ui/components/effects/Odometer';
import { TaskCheck } from '@ui/components/effects/TaskCheck';
import { RevealText } from '@ui/components/effects/RevealText';
import { Button } from '@ui/components/core/Button';
import { PLACES, type Place } from '@ui/lib/tokens';
import { Demo, range, select } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Usage, Why } from '../../kit/Doc';

const FORMATS = {
  hours: (v: number) => `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`,
  count: (v: number) => v.toLocaleString('en-US'),
  euro: (v: number) => `€${(v / 100).toFixed(2)}`,
};
const UNIT = { hours: 'h', count: '', euro: '' } as const;

export default function MotionStudiesPage() {
  const [value, setValue] = useState(161);
  const [tasks, setTasks] = useState([false, true, false]);
  const [run, setRun] = useState(0);
  return (
    <Doc eyebrow="Effects" title="Motion studies" source={['ui/components/effects/TaskCheck.tsx', 'ui/components/effects/Odometer.tsx', 'ui/components/effects/RevealText.tsx', 'ui/components/effects/Magnetic.tsx']}
      lead="Small moves with a reason, a fixed timing and no wobble. A task that is done says so in three steps. A number that changes rolls instead of flickering. A title is set, not faded in.">

      <Demo title="Done" description="Circle fills (160 ms), tick draws (240 ms), a line strikes the text (260 ms). 520 ms in all, then it rests. The fill takes the place's colour."
        controls={{ place: select(['plan', 'progress', 'luna', 'screen'] as const) }} center={false}
        code={`<TaskCheck done={done} onChange={setDone} detail="Due tomorrow">Physics sheet 4</TaskCheck>`}>
        {(v) => (
          <div data-signal={PLACES[v.place as Place].signal} className="mx-auto w-full max-w-[380px] list-rows overflow-hidden surface rounded-list">
            {['Physics sheet 4', 'History essay outline', 'Gym — legs'].map((t, i) => (
              <TaskCheck key={t} done={tasks[i]} onChange={(d) => setTasks((x) => x.map((y, j) => (j === i ? d : y)))} detail={['Due tomorrow', 'Friday', 'Today · 17:30'][i]} className="!rounded-none">{t}</TaskCheck>
            ))}
          </div>
        )}
      </Demo>

      <Demo title="Odometer" description="Each digit is a reel (spring 300/30), right to left 30 ms apart. Digits that stay the same do not move."
        controls={{ format: select(['hours', 'count', 'euro'] as const), size: range(24, 88, 56, 4, 'px'), stagger: range(0, 0.1, 0.03, 0.01, 's') }}
        minHeight={240} code={(v) => `<Odometer value={${value}}${v.format === 'hours' ? ' format={(m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`} unit="h"' : ''} className="display" />`}>
        {(v) => (
          <div className="flex flex-col items-center gap-5">
            <span className="display" style={{ fontSize: v.size }}><Odometer value={value} format={FORMATS[v.format]} unit={UNIT[v.format] || undefined} stagger={v.stagger} /></span>
            <Button size="sm" variant="ghost" Icon={Shuffle} onClick={() => setValue((x) => Math.max(1, x + Math.round((Math.random() - 0.5) * 120)))}>Change</Button>
          </div>
        )}
      </Demo>

      <Demo title="Title reveal" description="Lines rise out of a mask, 0.7 s, 90 ms apart. For a page title and the one sentence a hero leads with."
        controls={{ duration: range(0.4, 1.2, 0.7, 0.05, 's'), stagger: range(0, 0.2, 0.09, 0.01, 's') }} minHeight={240}
        code={(v) => `<RevealText as="h2" className="display text-display-lg"${v.duration !== 0.7 ? ` duration={${v.duration}}` : ''}>\n  <RevealText.Line>Two things left</RevealText.Line>\n  <RevealText.Line className="text-dim">before training.</RevealText.Line>\n</RevealText>`}>
        {(v) => (
          <div className="flex flex-col items-center gap-6 text-center">
            <RevealText as="h2" replayKey={run} duration={v.duration} stagger={v.stagger} className="display text-display @min-[700px]:text-display-lg">
              <RevealText.Line>Two things left</RevealText.Line>
              <RevealText.Line className="text-dim">before training.</RevealText.Line>
            </RevealText>
            <Button size="xs" variant="ghost" Icon={RotateCcw} onClick={() => setRun((r) => r + 1)}>Replay</Button>
          </div>
        )}
      </Demo>

      <Demo title="Magnetic" description="One hero action leans towards the pointer and settles without a wobble. Touch and reduced motion get the plain element."
        controls={{ strength: range(0.1, 0.6, 0.25, 0.05), radius: range(1, 3, 1.4, 0.1, '×') }} minHeight={220}
        code={(v) => `<Magnetic strength={${v.strength}}>\n  <Button IconEnd={ArrowRight}>Get started</Button>\n</Magnetic>`}>
        {(v) => <Magnetic strength={v.strength} radius={v.radius}><Button IconEnd={ArrowRight}>Get started</Button></Magnetic>}
      </Demo>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'One motion per moment: the done tick, then rest.', dont: 'Bounce, wobble or overshoot on everyday controls.' },
          { do: 'Odometer for numbers that change while you watch.', dont: 'Rolling numbers on first render. It reads as loading.' },
          { do: 'Reveal the page title and one hero line.', dont: 'Reveal every paragraph. Reading should never wait.' },
        ]} />
        <Why><p>Every study animates transform, opacity, a stroke's dash or one colour, so nothing re-lays out. Exits are quicker than entrances (undo is instant), and all of them respect reduced motion.</p></Why>
      </DocSection>
      <DocSection title="Props">
        <Props rows={[
          { name: 'TaskCheck done / onChange', type: 'boolean / (d) => void', description: 'Controlled. `detail` adds a second line, `color` overrides the fill.' },
          { name: 'Odometer value', type: 'number | string', description: 'Digits roll, other characters swap. `format`, `unit`, `stagger`.' },
          { name: 'RevealText', type: 'children: lines', description: '`as`, `delay`, `stagger`, `duration`, `inView`, `replayKey`.' },
          { name: 'Magnetic strength / radius', type: 'number', default: '0.25 / 1.4', description: 'Share of the pointer offset; reach as a multiple of the child.' },
        ]} />
        <Usage code={`<TaskCheck done={done} onChange={setDone}>Physics sheet 4</TaskCheck>\n<Odometer value={minutes} format={toHours} unit="h" className="display text-hero" />\n<RevealText as="h1" className="display">Good evening</RevealText>`} />
      </DocSection>
    </Doc>
  );
}
