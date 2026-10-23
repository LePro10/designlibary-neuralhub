import { useRef, useState } from 'react';
import { Surface } from '@ui/lib/surface';
import { TabBar } from '@ui/components/layout/TabBar';
import { bool, Demo, range } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Usage, Why } from '../../kit/Doc';
import { NAV, type DemoTab } from './demoApp';
import { Backdrop } from '../../kit/Backdrop';

export default function TabBarPage() {
  return (
    <Doc eyebrow="Navigation & Layout" title="Liquid tab bar" source="ui/components/layout/TabBar.tsx"
      lead="The signature piece. A glass capsule — the lens — sits under the active tab. Grab it and slide: it swells while held, stretches with speed, and the icons under it are re-drawn bright and magnified. Places that do not fit live inside the bar: tap the last cell, or pull the bar up, and the glass grows into a grid.">
      <Demo title="Playground" controls={{ tabs: range(3, 5, 4), more: bool(true), badges: bool(true), backdrop: bool(true) }} padded={false} minHeight={420}
        description="Drag across the bar, flick it, or tap. Tap the last cell or pull the bar up for the rest; pull it down or tap outside to fold it. Pick a place from there and the last cell becomes it."
        code={(v) => v.more ? `<TabBar items={places.slice(0, 4)} more={places.slice(4)} value={tab} onChange={setTab} />` : `<TabBar items={tabs} value={tab} onChange={setTab} />`}>
        {(v) => <Bar n={v.tabs} more={v.more} badges={v.badges} backdrop={v.backdrop} />}
      </Demo>
      <DocSection title="Anatomy">
        <ol className="mt-4 max-w-[680px] list-decimal space-y-2 pl-5 text-[14px] leading-relaxed text-ink marker:text-dim">
          <li><strong className="font-medium text-bright">Bar</strong> — <code className="inline-code">.glass</code>, 58px, max 400px wide, floating 10px above the home indicator.</li>
          <li><strong className="font-medium text-bright">Lens</strong> — <code className="inline-code">.glass-lens</code>: faint fill, specular rim brightest top-left, inner bevel, accent-tinted bottom glow.</li>
          <li><strong className="font-medium text-bright">Refraction row</strong> — a second, white, slightly larger icon row, clipped to the lens and counter-scaled against its squash so it stays crisp.</li>
          <li><strong className="font-medium text-bright">Place colour</strong> — each item may carry its place's <code className="inline-code">signal</code>: the icon under the lens wears it and the lens picks up a faint tint.</li>
          <li><strong className="font-medium text-bright">More</strong> — the last cell. It stands for every place in <code className="inline-code">more</code>, and while you are in one of them it wears that place's icon, label and colour. Open, the same glass grows upward (one progress value drives height, grid and scrim, so a pull and a tap are the same animation) and its icon turns into a chevron.</li>
          <li><strong className="font-medium text-bright">Fade</strong> — content scrolling past the bar sinks into black instead of peeking out beneath it.</li>
        </ol>
      </DocSection>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'Four places in the bar, the rest in `more` — or simply `<AppShell nav>`, which splits them for you.', dont: 'Six tabs, or a "More" that opens a sheet with a list — a second surface for what the bar could hold.' },
          { do: 'Badges are a quiet ember dot with an accessible description.', dont: 'Numbers in red bubbles — this is a calm app.' },
        ]} />
        <Why>
          <p>Real refraction on the web needs SVG displacement filters — Chromium-only, pixelated, and expensive on phones. The double-row trick reads as glass at 60fps on any device. Everything that moves is a motion value; dragging never re-renders React.</p>
          <p>The bar hides while the on-screen keyboard is open, and the lens snaps with the finger's velocity but never skips a tab.</p>
        </Why>
      </DocSection>
      <DocSection title="Props">
        <Props rows={[
          { name: 'items', type: 'TabItem[]', description: '{ id, label, Icon, place?, signal?, badge? }' },
          { name: 'more', type: 'TabItem[]', description: 'Places behind the last cell. It becomes the place you are in.' },
          { name: 'value / onChange', type: 'T / (id) => void', description: 'Controlled.' },
          { name: 'moreLabel', type: 'string', default: "'More'", description: 'Label of the last cell while you are not in one of its places.' },
          { name: 'position', type: 'MotionValue<number>', description: 'Drive the lens from a swipeable pager (float tab index).' },
          { name: 'floating', type: 'boolean', default: 'true', description: 'Absolute at the bottom of its shell, or in flow.' },
        ]} />
        <Usage code={`const places = [
  { id: 'home', label: 'Home', Icon: Home, place: 'home' },
  { id: 'plan', label: 'Plan', Icon: CalendarDays, place: 'plan', badge: 'Two stories due' },
  …
];
<TabBar items={places.slice(0, 4)} more={places.slice(4)} value={tab} onChange={setTab} />`} />
      </DocSection>
    </Doc>
  );
}

function Bar({ n, more, badges, backdrop }: { n: number; more: boolean; badges: boolean; backdrop: boolean }) {
  const [tab, setTab] = useState<DemoTab>('home');
  const all = NAV.map(({ group: _g, ...t }) => ({ ...t, badge: badges ? t.badge : undefined }));
  const items = all.slice(0, n);
  const rest = more ? all.slice(n) : [];
  const value = [...items, ...rest].some((t) => t.id === tab) ? tab : items[0].id;
  const ref = useRef<HTMLDivElement>(null);
  return (
    // A transformed box, so the scrim and the grid stay inside the demo.
    <div ref={ref} className="relative h-[420px] w-full overflow-hidden [transform:translateZ(0)]" style={{ ['--safe-bottom' as string]: '12px' }}>
      <Surface portal={ref} mode="phone">
        {backdrop && <Backdrop variant="scene" />}
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[480px]"><TabBar items={items} more={rest} value={value} onChange={setTab} floating={false} /></div>
      </Surface>
    </div>
  );
}
