import { PLACES } from '@ui/lib/tokens';
import { CopyButton } from '../../kit/Code';
import { Doc, DocSection, Rules, Why } from '../../kit/Doc';

const SURFACES = [
  ['bg', '#080909', 'Page ground'], ['chrome', '#0b0c0c', 'Sidebar, canvases'], ['raised', '#0e100f', 'Inset wells, code'],
  ['sheet', '#111312', 'Sheets, dialogs'], ['card', '#121413', 'Solid cards'], ['popover', '#161817', 'Menus, toasts'],
  ['card-2', '#181a19', 'Raised step'], ['card-3', '#202321', 'Highest step'],
] as const;
const FILLS = [['fill-1', '2.5%', 'Card, field at rest'], ['fill-2', '4%', 'Hover, track'], ['fill-3', '6.5%', 'Icon button, bubble, search'], ['fill-4', '10%', 'Switch off, pressed'], ['line', '8%', 'Separator'], ['line-2', '13%', 'Card / list edge']] as const;
const INK = [['bright', '#eef1ee', 'Titles, primary text'], ['ink', '#c6c9c6', 'Body text'], ['dim', '#7d847f', 'Secondary, inactive icons'], ['faint', '#4a504c', 'Hints, chevrons']] as const;
const GLOW = [['ice', '#b9d3ff', 'Default accent: focus, links'], ['azure', '#3b5bff', 'Deep accent, switch on'], ['lilac', '#a898ff', 'Orb, secondary light'], ['sand', '#eadcbc', 'Warm highlight, marks'], ['ember', '#ff8a5c', 'Badges, “now”, over limit'], ['mint', '#9fe7c8', 'Success'], ['live', '#5b9bff', 'Live right now (stream, remote)'], ['danger', '#ff6b6b', 'Destructive'], ['warning', '#ffb454', 'Caution']] as const;

function Swatch({ name, value, note }: { name: string; value: string; note: string }) {
  return (
    <div className="group overflow-hidden rounded-stat border-hair border-line">
      <div className="relative h-20" style={{ background: value }}>
        <CopyButton text={`var(--color-${name})`} label={`Copy var(--color-${name})`} className="absolute top-2 right-2 bg-black/30 text-white/80 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100" />
      </div>
      <div className="px-3 py-2.5">
        <div className="flex items-baseline justify-between gap-2"><span className="font-mono text-[12px] text-bright">{name}</span><span className="font-mono text-tiny text-dim uppercase">{value}</span></div>
        <div className="mt-0.5 truncate text-meta text-dim">{note}</div>
      </div>
    </div>
  );
}
const grid = 'mt-5 grid grid-cols-2 gap-3 @min-[700px]:grid-cols-4';

export default function ColorPage() {
  return (
    <Doc eyebrow="Foundations" title="Color" source="ui/styles/tokens.css"
      lead="Grey-green ink on near-black. Colour is light, and light is content: it marks the one thing that matters on a screen — Luna, the hero, “now”, the accent — never a whole surface.">
      <DocSection title="Surfaces" description="Stepped from the ground up. Solid surfaces for things that sit; translucent fills for things inside them.">
        <div className={grid}>{SURFACES.map(([n, v, d]) => <Swatch key={n} name={n} value={v} note={d} />)}</div>
      </DocSection>
      <DocSection title="Fills & hairlines" description="The only allowed white-on-dark steps. The dashboard had 437 hand-picked bg-white/[…] values; these four cover all of them.">
        <div className={grid}>{FILLS.map(([n, v, d]) => (
          <div key={n} className="overflow-hidden rounded-stat border-hair border-line">
            <div className="grid h-20 place-items-center bg-card"><div className="h-12 w-[70%] rounded-[12px]" style={n.startsWith('line') ? { border: `1px solid var(--color-${n})` } : { background: `var(--color-${n})` }} /></div>
            <div className="px-3 py-2.5"><div className="flex justify-between"><span className="font-mono text-[12px] text-bright">{n}</span><span className="font-mono text-tiny text-dim">white {v}</span></div><div className="mt-0.5 text-meta text-dim">{d}</div></div>
          </div>
        ))}</div>
      </DocSection>
      <DocSection title="Ink">
        <div className="mt-5 space-y-2">{INK.map(([n, v, d]) => (
          <div key={n} className="flex items-baseline gap-4 rounded-stat border-hair border-line px-4 py-3">
            <span className="w-16 font-mono text-[12px] text-dim">{n}</span>
            <span className="flex-1 truncate text-[22px] font-light tracking-[-.02em]" style={{ color: v }}>The quiet voice carries further.</span>
            <span className="hidden text-meta text-dim @min-[700px]:block">{d}</span>
          </div>
        ))}</div>
      </DocSection>
      <DocSection title="One colour per place" description={<p>Every place (tab) owns one signal colour. It shows up in exactly three spots: the light at the top of the page, the one hero figure, and the active tab. Set it with <code>place</code> on Page or <code>data-signal</code> on any element; inside, use <code>text-tab</code>, <code>bg-tab</code>, Button <code>tint</code>. All twelve share a similar lightness, so no place shouts.</p>}>
        <div className="mt-5 grid grid-cols-2 gap-2 @min-[640px]:grid-cols-3 @min-[900px]:grid-cols-4">
          {Object.entries(PLACES).map(([place, { signal }]) => (
            <div key={place} data-signal={signal} className="flex items-center gap-3 rounded-stat border-hair border-line-2 p-3">
              <span className="h-7 w-7 shrink-0 rounded-full bg-tab" />
              <span className="min-w-0"><span className="block text-body text-bright capitalize">{place}</span><span className="block font-mono text-tiny text-dim">{signal}</span></span>
              <span className="ml-auto display tabular text-title text-tab">2:41</span>
            </div>
          ))}
        </div>
      </DocSection>
      <DocSection title="Glow palette" description="Fixed meanings, used as light: dots, one status, a chart series. As flat fills only at ≤ 12% (bg-ember/10).">
        <div className={grid}>{GLOW.map(([n, v, d]) => <Swatch key={n} name={n} value={v} note={d} />)}</div>
      </DocSection>
      <DocSection title="Accent" description="--color-accent follows the theme (see Themes): focus rings, links, selection. It is not the place colour; a place colour is about where you are, the accent about what you can act on.">
        <div className="mt-5 flex flex-wrap gap-2">
          <div className="h-12 w-32 rounded-stat bg-accent" /><div className="h-12 w-32 rounded-stat bg-accent-deep" />
        </div>
      </DocSection>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'Tokens or var(--color-…) everywhere, also in SVG strokes and inline styles.', dont: 'Raw hex or Tailwind palettes (zinc-800, emerald-400) in components.' },
          { do: 'The place colour in three spots only: light, hero figure, active tab.', dont: 'Colour-coded icon tiles in every list row, gradient text, glowing buttons.' },
          { do: 'Tag/category colours from TAG_COLORS (ui/lib/tokens.ts).', dont: 'A fifth private copy of the glow palette.' },
        ]} />
        <Why><p>Near-black (#080909) instead of pure black keeps OLED smear away and gives shadows somewhere to go. The green tint in the greys is barely visible but makes the palette feel like a material rather than a default.</p></Why>
      </DocSection>
    </Doc>
  );
}
