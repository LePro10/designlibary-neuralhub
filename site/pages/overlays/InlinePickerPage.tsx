import { useState } from 'react';
import { AlarmClock, Bell, Repeat, Timer } from 'lucide-react';
import { List, Row } from '@ui/components/core/List';
import { Switch } from '@ui/components/core/Switch';
import { Disclosure, InlinePicker } from '@ui/components/overlays/Disclosure';
import { Slider } from '@ui/components/core/Slider';
import { Demo, select } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Usage, Why } from '../../kit/Doc';
import { PhoneScreen, Side } from './_shared';

const TIMES = ['07:00', '12:30', '17:30', '18:00', '19:30', '21:00'] as const;
const REPEAT = [
  { value: 'never', label: 'Never' }, { value: 'daily', label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays', detail: 'Mon – Fri' }, { value: 'weekly', label: 'Weekly' },
] as const;
type RepeatV = (typeof REPEAT)[number]['value'];

function Reminder({ kind }: { kind: 'chips' | 'list' }) {
  const [time, setTime] = useState<(typeof TIMES)[number]>('17:30');
  const [repeat, setRepeat] = useState<RepeatV>('weekly');
  const [alert, setAlert] = useState(true);
  const [snooze, setSnooze] = useState(10);
  return (
    <List footer="Every value opens right under its row. Tap the row again to close it.">
      <Row Icon={Bell} title="Gym — legs" detail="Reminder" />
      <InlinePicker Icon={AlarmClock} title="Time" value={time} onChange={setTime} kind={kind}
        options={TIMES.map((t) => ({ value: t, label: t }))} />
      <InlinePicker Icon={Repeat} title="Repeat" value={repeat} onChange={setRepeat} kind="list" options={[...REPEAT]} />
      <Disclosure Icon={Timer} title="Snooze" value={`${snooze} min`}>
        <Slider label="Snooze" value={snooze} onChange={setSnooze} min={5} max={30} step={5} ticks format={(v) => `${v} min`} />
      </Disclosure>
      <Row Icon={Bell} title="Alert" trailing={<Switch checked={alert} onChange={setAlert} label="Alert" />} />
    </List>
  );
}

export default function InlinePickerPage() {
  return (
    <Doc eyebrow="Overlays" title="Inline picker" source="ui/components/overlays/Disclosure.tsx"
      lead="The value opens right under its row, the way the time picker works in iOS Settings. The rows below slide down, nothing covers the screen, and the open row shows its value in the place’s colour.">
      <Demo title="Reminder" center={false} controls={{ times: select(['chips', 'list'] as const) }}
        description="Open “Time”, pick one: it lands, then the row closes itself. “Repeat” is a list; “Snooze” holds any content (a slider)."
        code={(v) => `<List>
  <InlinePicker
    Icon={AlarmClock}
    title="Time"
    value={time}
    onChange={setTime}${v.times === 'list' ? "\n    kind=\"list\"" : ''}
    options={TIMES.map((t) => ({ value: t, label: t }))}
  />
  <Disclosure Icon={Timer} title="Snooze" value={\`\${snooze} min\`}>
    <Slider … />
  </Disclosure>
</List>`}>
        {(v) => (
          <Side
            desktop={<div className="max-w-[420px]" data-signal="amber"><Reminder kind={v.times} /></div>}
            phone={<PhoneScreen title="Reminder" eyebrow="Plan"><div data-signal="amber"><Reminder kind={v.times} /></div></PhoneScreen>}
          />
        )}
      </Demo>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'A handful of short values (times, durations, a colour): chips. Longer labels: kind="list".', dont: 'Thirty options inline — that is a Menu with a search, or its own page.' },
          { do: 'One open at a time feels calmest: control `open` when a list holds several pickers.', dont: 'A bottom sheet for picking a time — half the screen moves to change one word.' },
        ]} />
        <Why>
          <p>The height opens on a spring without overshoot (420/40); the content follows 60ms later and the chips arrive 22ms apart, so the area appears to unfold rather than pop. Closing is a touch faster than opening.</p>
          <p>After a pick, the row waits 180ms before it closes — long enough to see the choice land, short enough that it never feels slow.</p>
          <p>The value at the right turns to the place’s signal colour while open: with several rows it is always clear which one the open area belongs to.</p>
        </Why>
      </DocSection>

      <DocSection title="Props">
        <Props rows={[
          { name: 'InlinePicker.value / onChange', type: 'T / (v: T) => void', description: 'Controlled value.' },
          { name: 'options', type: '{ value, label, detail? }[]', description: 'The choices.' },
          { name: 'kind', type: "'chips' | 'list'", default: "'chips'", description: 'Chips for short values, a checked list for longer labels.' },
          { name: 'format', type: '(v) => ReactNode', description: 'Text of the value at the right (default: the option label).' },
          { name: 'open / onOpenChange', type: 'boolean / (open) => void', description: 'Control it (one open at a time) or leave it alone.' },
          { name: 'Disclosure', type: '{ title, value?, Icon?, detail?, children }', description: 'The same row with any content inside.' },
        ]} />
        <Usage code={`import { InlinePicker, Disclosure } from '@/ui/components/overlays/Disclosure';`} />
      </DocSection>
    </Doc>
  );
}
