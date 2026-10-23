import { ArrowRight, Shuffle } from 'lucide-react';
import { useState } from 'react';
import { Magnetic } from '@ui/components/effects/Magnetic';
import { NumberTicker } from '@ui/components/effects/NumberTicker';
import { VoiceOrb } from '@ui/components/effects/VoiceOrb';
import { Button } from '@ui/components/core/Button';
import { Demo, range, select } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Why } from '../../kit/Doc';

const FORMATS = {
  plain: (v: number) => v.toLocaleString('en-US'),
  euro: (v: number) => `€${(v / 100).toFixed(2)}`,
  time: (v: number) => `${Math.floor(v / 60) % 24}:${String(v % 60).padStart(2, '0')}`,
};

export default function MotionBitsPage() {
  const [value, setValue] = useState(4821);
  return (
    <Doc eyebrow="Effects" title="Magnetic & ticker" source={['ui/components/effects/Magnetic.tsx', 'ui/components/effects/NumberTicker.tsx']}
      lead="Two small pieces of life. Magnetic lets one hero action lean towards the pointer. The ticker rolls digits like an odometer, so a changing number reads as change instead of a flicker.">
      <Demo title="Magnetic" description="Move the mouse near the button or the orb. Touch gets the plain element." controls={{ strength: range(0.1, 0.8, 0.35, 0.05), radius: range(1, 3, 1.4, 0.1, '×'), target: select(['button', 'orb'] as const) }}
        minHeight={260} code={(v) => `<Magnetic strength={${v.strength}} radius={${v.radius}}>\n  ${v.target === 'button' ? '<Button IconEnd={ArrowRight}>Get started</Button>' : '<VoiceOrb size={72} />'}\n</Magnetic>`}>
        {(v) => (
          <Magnetic strength={v.strength} radius={v.radius}>
            {v.target === 'button' ? <Button IconEnd={ArrowRight} sheen>Get started</Button> : <VoiceOrb size={72} />}
          </Magnetic>
        )}
      </Demo>
      <Demo title="Number ticker" controls={{ format: select(['plain', 'euro', 'time'] as const), stagger: range(0, 0.12, 0.03, 0.01, 's'), size: range(24, 96, 64, 4, 'px') }}
        minHeight={240} code={(v) => `<NumberTicker value={value}${v.format !== 'plain' ? ' format={fmt}' : ''} stagger={${v.stagger}} className="display" />`}>
        {(v) => (
          <div className="flex flex-col items-center gap-5">
            <span className="display" style={{ fontSize: v.size }}><NumberTicker value={value} format={FORMATS[v.format]} stagger={v.stagger} /></span>
            <Button size="sm" variant="ghost" Icon={Shuffle} onClick={() => setValue(Math.floor(Math.random() * 99999))}>Change</Button>
          </div>
        )}
      </Demo>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'Magnetic on one hero action per page.', dont: 'Every button — the page starts to wobble.' },
          { do: 'Ticker for numbers that change while you watch (totals, timers, counts).', dont: 'Ticker on first render of static numbers; it reads as loading.' },
        ]} />
        <Why><p>Both run on motion values: the pointer never re-renders React. The ticker's digit cells have a fixed width (tabular figures), so a headline does not jump as digits change.</p></Why>
      </DocSection>
      <DocSection title="Props">
        <Props rows={[
          { name: 'Magnetic strength', type: 'number', default: '0.35', description: 'Share of the pointer offset the child follows.' },
          { name: 'radius', type: 'number', default: '1.4', description: 'Reach as a multiple of the child size.' },
          { name: 'NumberTicker value', type: 'number', description: 'The number.' },
          { name: 'format', type: '(v) => string', description: 'Digits roll, other characters swap.' },
          { name: 'stagger', type: 'number', default: '0.03', description: 'Seconds between columns, right to left.' },
        ]} />
      </DocSection>
    </Doc>
  );
}
