import { useState } from 'react';
import { TabBar } from '@ui/components/layout/TabBar';
import { bool, Demo, range } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Usage, Why } from '../../kit/Doc';
import { TABS, type DemoTab } from './demoApp';
import { Backdrop } from '../../kit/Backdrop';

export default function TabBarPage() {
  return (
    <Doc eyebrow="Navigation & Layout" title="Liquid tab bar" source="ui/components/layout/TabBar.tsx"
      lead="The signature piece. A glass capsule — the lens — sits under the active tab. Grab it and slide: it swells while held, stretches with speed, and the icons under it are re-drawn bright and magnified, as if seen through glass.">
      <Demo title="Playground" controls={{ tabs: range(3, 5, 5), badges: bool(true), backdrop: bool(true) }} padded={false} minHeight={300}
        description="Drag across the bar, flick it, or tap. Keyboard: focus a tab, then ←/→, Home, End."
        code={`<TabBar items={tabs} value={tab} onChange={setTab} />`}>
        {(v) => <Bar n={v.tabs} badges={v.badges} backdrop={v.backdrop} />}
      </Demo>
      <DocSection title="Anatomy">
        <ol className="mt-4 max-w-[680px] list-decimal space-y-2 pl-5 text-[14px] leading-relaxed text-ink marker:text-dim">
          <li><strong className="font-medium text-bright">Bar</strong> — <code className="inline-code">.glass</code>, 66px, max 440px wide, floating 10px above the home indicator.</li>
          <li><strong className="font-medium text-bright">Lens</strong> — <code className="inline-code">.glass-lens</code>: faint fill, specular rim brightest top-left, inner bevel, accent-tinted bottom glow.</li>
          <li><strong className="font-medium text-bright">Refraction row</strong> — a second, white, slightly larger icon row, clipped to the lens and counter-scaled against its squash so it stays crisp.</li>
          <li><strong className="font-medium text-bright">Place colour</strong> — each item may carry its place's <code className="inline-code">signal</code>: the icon under the lens wears it and the lens picks up a faint tint.</li>
          <li><strong className="font-medium text-bright">Fade</strong> — content scrolling past the bar sinks into black instead of peeking out beneath it.</li>
        </ol>
      </DocSection>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'Four fixed destinations + one "More" launcher (launcher: true) for the rest.', dont: 'Six tabs. Labels get cut and the lens shrinks under a thumb.' },
          { do: 'Badges are a quiet ember dot with an accessible description.', dont: 'Numbers in red bubbles — this is a calm app.' },
        ]} />
        <Why>
          <p>Real refraction on the web needs SVG displacement filters — Chromium-only, pixelated, and expensive on phones. The double-row trick reads as glass at 60fps on any device. Everything that moves is a motion value; dragging never re-renders React.</p>
          <p>The bar hides while the on-screen keyboard is open, and the lens snaps with the finger's velocity but never skips a tab.</p>
        </Why>
      </DocSection>
      <DocSection title="Props">
        <Props rows={[
          { name: 'items', type: 'TabItem[]', description: '{ id, label, Icon, badge?, launcher? }' },
          { name: 'value / onChange', type: 'T / (id) => void', description: 'Controlled.' },
          { name: 'onLaunch', type: '(id) => void', description: 'Called for launcher items (open a "More" sheet).' },
          { name: 'position', type: 'MotionValue<number>', description: 'Drive the lens from a swipeable pager (float tab index).' },
          { name: 'floating', type: 'boolean', default: 'true', description: 'Absolute at the bottom of its shell, or in flow.' },
        ]} />
        <Usage code={`const tabs = [\n  { id: 'luna', label: 'Luna', Icon: Sparkles },\n  { id: 'plan', label: 'Plan', Icon: CalendarDays, signal: 'amber', badge: 'Two stories due' },\n  …\n  { id: 'more', label: 'More', Icon: LayoutGrid, launcher: true },\n];\n<TabBar items={tabs} value={tab} onChange={setTab} onLaunch={() => setMoreOpen(true)} />`} />
      </DocSection>
    </Doc>
  );
}

function Bar({ n, badges, backdrop }: { n: number; badges: boolean; backdrop: boolean }) {
  const [tab, setTab] = useState<DemoTab>('luna');
  const items = TABS.slice(0, n).map((t) => ({ ...t, badge: badges ? t.badge : undefined }));
  const value = items.some((t) => t.id === tab) ? tab : items[0].id;
  return (
    <div className="relative h-[300px] w-full overflow-hidden" style={{ ['--safe-bottom' as string]: '12px' }}>
      {backdrop && <Backdrop variant="scene" />}
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[480px]"><TabBar items={items} value={value} onChange={setTab} floating={false} /></div>
    </div>
  );
}
