import { Doc, DocSection, Rules, Why } from '../../kit/Doc';

const Z = [['header', 30], ['sidebar', 40], ['tabbar', 50], ['sheet', '80/81'], ['context', 85], ['search', 88], ['toast', 95], ['popover', 120], ['intro', 200]] as const;

export default function LayoutPage() {
  return (
    <Doc eyebrow="Foundations" title="Layout & mobile" source={['ui/styles/tokens.css', 'ui/lib/hooks.ts', 'ui/lib/surface.tsx']}
      lead="Phone first, desktop equal. One breakpoint (900px), safe areas from one place, 44px touch targets, and gestures that never fight the operating system. Desktop and phone can do the same things — just shaped for a thumb or a pointer.">
      <DocSection title="One breakpoint" description="Below 900px of its own width: tab bar, swipes, sheets from the bottom. Above: sidebar, centred dialogs, popover menus. Components in narrow panes use container queries (@container) instead of viewport breakpoints.">
        <div className="mt-5 grid gap-3 @min-[700px]:grid-cols-2">
          <Card title="Phone · < 900" items={['Floating tab bar (4 + More)', 'Menus pull down from their button — no <select>', 'Choices expand inline, panels only for long tasks', 'Actions in the top bar, in thumb reach', 'Long-press for context menus', '16px text in fields (no zoom)']} />
          <Card title="Desktop · ≥ 900" items={['Rail sidebar, opens over content', 'Centred dialogs, popover menus', 'Actions on the title line', 'Right-click for context menus', '⌘K search, ⌘1–9 tabs', 'Hover states (only on fine pointers)']} />
        </div>
      </DocSection>
      <DocSection title="Touch targets" description="Everything tappable is at least 44 × 44. Small visuals keep a larger hit area via a pseudo-element.">
        <div className="mt-5 flex flex-wrap items-end gap-6">
          {[32, 40, 44, 56].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div className="relative grid place-items-center" style={{ width: Math.max(44, s), height: Math.max(44, s) }}>
                <span className="absolute inset-0 rounded-full border border-dashed border-accent/40" />
                <span className="rounded-full bg-fill-4" style={{ width: s, height: s }} />
              </div>
              <span className="font-mono text-tiny text-dim">{s}px{s < 44 ? ' → 44' : ''}</span>
            </div>
          ))}
        </div>
      </DocSection>
      <DocSection title="Safe areas & keyboard">
        <ul className="mt-4 max-w-[720px] list-disc space-y-2 pl-5 text-[14px] leading-relaxed text-ink marker:text-dim">
          <li><code className="inline-code">--safe-top / --safe-bottom</code> are defined once from <code className="inline-code">env()</code>. Components never call env() themselves.</li>
          <li><code className="inline-code">--tabbar-space</code> = 88px + safe bottom on phones, 0 on desktop. Own scrollers pad with it — never a guessed pb-[…].</li>
          <li><code className="inline-code">h-dvh</code>, never vh. Heights come from flex chains, not calc(100vh − header).</li>
          <li>When the keyboard opens (visual viewport shrinks): the tab bar slides away, sheets fill exactly the visible area above it, composers drop their tab-bar gap.</li>
          <li>The document never scrolls — only <code className="inline-code">.scroller</code>s do. No rubber-band of the whole app, no body scroll lock needed.</li>
        </ul>
      </DocSection>
      <DocSection title="Gestures">
        <ul className="mt-4 max-w-[720px] list-disc space-y-2 pl-5 text-[14px] leading-relaxed text-ink marker:text-dim">
          <li>Horizontal swipes start anywhere — but never within 24px of the screen edge (Android back gesture lives there).</li>
          <li>Axis lock after 10px: vertical wins → native scroll; horizontal wins → pager / swipe row.</li>
          <li>Elements with their own horizontal drag opt out with <code className="inline-code">data-no-swipe</code> (rails, sliders, swipe rows, scrub charts).</li>
          <li>The back gesture closes the topmost overlay first (<code className="inline-code">useLayer</code>), then pops a stack level, never a tab.</li>
          <li>A long-press never also fires the tap.</li>
        </ul>
      </DocSection>
      <DocSection title="Z layers" description="Never invent another.">
        <div className="mt-5 flex flex-wrap gap-2">{Z.map(([n, z]) => <span key={n} className="rounded-full border-hair border-line bg-fill-1 px-3 py-1.5 font-mono text-[12px] text-ink">{n} <span className="text-dim">{z}</span></span>)}</div>
      </DocSection>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'Scroll and focus follow navigation: new content starts at the top, Back restores the old position.', dont: 'Navigate into the void: every notification and widget tap lands on the concrete item.' },
          { do: 'Check the other form factor whenever you build on one.', dont: 'Negative margins, calc(100dvh − …), estimated tab-bar paddings.' },
        ]} />
        <Why><p>Most layout bugs in the dashboard came from two layers both owning the same space. The fix was a rule, not a component: exactly one owner per spacing — see App shell.</p></Why>
      </DocSection>
    </Doc>
  );
}
function Card({ title, items }: { title: string; items: string[] }) {
  return <div className="card p-5"><div className="eyebrow mb-3">{title}</div><ul className="space-y-1.5 text-[13.5px] text-ink">{items.map((i) => <li key={i} className="flex gap-2"><span className="text-faint">—</span>{i}</li>)}</ul></div>;
}
