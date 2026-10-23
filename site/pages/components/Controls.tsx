import { CalendarDays, Columns3, List as ListIcon, Moon, Rows3 } from 'lucide-react';
import { useState } from 'react';
import { Segmented } from '@ui/components/core/Segmented';
import { Check, Switch } from '@ui/components/core/Switch';
import { Slider } from '@ui/components/core/Slider';
import { List, Row } from '@ui/components/core/List';
import { bool, colors, Demo, range, select } from '../../kit/Demo';
import { Doc, DocSection, Grid, Props, Rules, Tile, Why } from '../../kit/Doc';

export default function ControlsPage() {
  return (
    <Doc eyebrow="Components" title="Controls" source={['ui/components/core/Segmented.tsx', 'ui/components/core/Switch.tsx', 'ui/components/core/Slider.tsx']}
      lead="Segmented, Switch, Check and Slider. Each one answers a choice with motion: a pill that slides, a thumb that stretches, a tick that draws itself, a haptic at every detent.">

      <DocSection title="Segmented" description="A page's main switcher is md (bright pill, dark text). Secondary switches inside a card use sm — no fill, so it never competes. Many options? `scroll` lets it run sideways on phones.">
        <Demo controls={{ size: select(['md', 'sm'] as const), icons: bool(false), options: range(2, 5, 3) }}
          code={(v) => `<Segmented size="${v.size}" value={view} onChange={setView}\n  options={[{ value: 'day', label: 'Day'${v.icons ? ', Icon: CalendarDays' : ''} }, …]} />`}>
          {(v) => <SegDemo size={v.size} icons={v.icons} n={v.options} />}
        </Demo>
      </DocSection>

      <DocSection title="Switch" description="Spring thumb (stiffness 700) that stretches sideways while pressed. On = the deep accent, so it themes with the accent.">
        <Demo controls={{ size: select(['md', 'sm'] as const), disabled: bool(false) }} code={(v) => `<Switch${v.size === 'sm' ? ' size="sm"' : ''} checked={on} onChange={setOn} label="Focus mode" />`}>
          {(v) => <SwitchDemo size={v.size} disabled={v.disabled} />}
        </Demo>
      </DocSection>

      <DocSection title="Check" description="Round for single tasks and radios, square for multi-select. The tick draws with pathLength; `indeterminate` shows a bar for 'some'. `display` turns it visual-only when the whole row is the button.">
        <Demo controls={{ shape: select(['round', 'square'] as const), color: colors(['var(--color-bright)', 'var(--color-accent)', 'var(--color-mint)', 'var(--color-ember)', 'var(--color-lilac)'] as const) }}
          code={(v) => `<Check checked={done} onChange={setDone} label="Done"${v.shape === 'square' ? ' square' : ''} color="${v.color}" />`}>
          {(v) => <CheckDemo square={v.shape === 'square'} color={v.color} />}
        </Demo>
      </DocSection>

      <DocSection title="Slider" description="New. The track fills with an accent gradient, the thumb swells while held, every step ticks (haptic), a glass bubble shows the value while dragging. The whole 44px row is the target.">
        <Demo controls={{ step: select(['1', '5', '10', '25'] as const, '5'), ticks: bool(false), bubble: bool(true) }}
          code={(v) => `<Slider label="Volume" value={v} onChange={setV} step={${v.step}}${v.ticks ? ' ticks' : ''}${v.bubble ? '' : ' bubble={false}'} format={(x) => \`\${x}%\`} />`}>
          {(v) => <SliderDemo step={Number(v.step)} ticks={v.ticks} bubble={v.bubble} />}
        </Demo>
      </DocSection>

      <DocSection title="In a settings list">
        <Grid cols={2}>
          <Tile><SettingsDemo /></Tile>
          <Tile label="sm segmented in a card header"><div className="card w-full p-4"><div className="flex items-center justify-between"><span className="eyebrow">Activity</span><SmallSeg /></div><div className="mt-6 h-16 rounded-[12px] bg-fill-1" /></div></Tile>
        </Grid>
      </DocSection>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'Segmented for 2–5 views of the same data. More than five → Chips.', dont: 'A native <select> — on phones it opens the OS picker, which breaks the look and the sheet flow. Use Menu.' },
          { do: 'Switch for settings that apply immediately.', dont: 'Switch in a form that still needs “Save” — use Check there.' },
        ]} />
        <Why><p>Every control fires a haptic on change (<code>select</code>) or on each detent (<code>tick</code>). On Android in the browser this is navigator.vibrate; a native shell plugs in its own driver with <code>setHapticDriver()</code>. Choices feel physical without sound or colour.</p></Why>
      </DocSection>

      <DocSection title="Props">
        <Props rows={[
          { name: 'Segmented.size', type: "'md' | 'sm'", default: "'md'", description: 'Main or secondary switcher.' },
          { name: 'Segmented.scroll', type: 'boolean', description: 'Scroll sideways instead of squeezing (phones).' },
          { name: 'Switch.size', type: "'md' | 'sm'", default: "'md'", description: '50×30 or 40×24.' },
          { name: 'Check.square / indeterminate / display', type: 'boolean', description: 'Checkbox shape / tri-state / visual only.' },
          { name: 'Slider.step / ticks / bubble / format', type: 'number / boolean / boolean / fn', description: 'Detents, dots per step, value bubble, label.' },
        ]} />
      </DocSection>
    </Doc>
  );
}

const SEG = [
  { value: 'day', label: 'Day', Icon: CalendarDays }, { value: 'week', label: 'Week', Icon: Rows3 }, { value: 'month', label: 'Month', Icon: Columns3 },
  { value: 'year', label: 'Year', Icon: ListIcon }, { value: 'all', label: 'All', Icon: Moon },
];
function SegDemo({ size, icons, n }: { size: 'md' | 'sm'; icons: boolean; n: number }) {
  const [v, setV] = useState('day');
  return <Segmented size={size} value={v} onChange={setV} options={SEG.slice(0, n).map((o) => ({ ...o, Icon: icons ? o.Icon : undefined }))} />;
}
function SmallSeg() { const [v, setV] = useState('w'); return <Segmented size="sm" value={v} onChange={setV} options={[{ value: 'w', label: 'Week' }, { value: 'm', label: 'Month' }]} />; }
function SwitchDemo({ size, disabled }: { size: 'md' | 'sm'; disabled: boolean }) {
  const [a, setA] = useState(true); const [b, setB] = useState(false);
  return <div className="flex items-center gap-6"><Switch size={size} disabled={disabled} checked={a} onChange={setA} label="A" /><Switch size={size} disabled={disabled} checked={b} onChange={setB} label="B" /></div>;
}
function CheckDemo({ square, color }: { square: boolean; color: string }) {
  const [s, setS] = useState([true, false, false]);
  const all = s.every(Boolean), some = s.some(Boolean);
  return (
    <div className="w-full max-w-[320px] space-y-4">
      {square && <label className="flex items-center gap-3 border-b border-line pb-3 text-body text-bright"><Check square checked={all} indeterminate={some && !all} onChange={(x) => setS(s.map(() => x))} label="All" color={color} /> Select all</label>}
      {['Read chapter 4', 'Gym — legs', 'Reply to Mia'].map((t, i) => (
        <label key={t} className="flex items-center gap-3 text-body text-bright">
          <Check square={square} color={color} checked={s[i]} label={t} onChange={(x) => setS(s.map((y, j) => (j === i ? x : y)))} />
          <span className={s[i] ? 'text-dim line-through decoration-faint' : ''}>{t}</span>
        </label>
      ))}
    </div>
  );
}
function SliderDemo({ step, ticks, bubble }: { step: number; ticks: boolean; bubble: boolean }) {
  const [v, setV] = useState(40);
  return <div className="w-full max-w-[360px]"><Slider label="Volume" value={v} onChange={setV} step={step} ticks={ticks} bubble={bubble} format={(x) => `${x}%`} /></div>;
}
function SettingsDemo() {
  const [a, setA] = useState(true), [b, setB] = useState(false), [c, setC] = useState(60);
  return (
    <div className="w-full">
      <List footer="Luna stays quiet during focus blocks.">
        <Row title="Focus mode" detail="Mute non-urgent notifications" trailing={<Switch checked={a} onChange={setA} label="Focus mode" />} />
        <Row title="Haptics" trailing={<Switch checked={b} onChange={setB} label="Haptics" />} />
        <div className="px-4 pt-3 pb-1"><div className="flex justify-between text-body text-bright"><span>Speech rate</span><span className="text-dim tabular">{c}%</span></div><Slider label="Speech rate" value={c} onChange={setC} step={10} ticks /></div>
      </List>
    </div>
  );
}
