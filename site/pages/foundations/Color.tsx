import { CopyButton } from '../../kit/Code';
import { Doc, DocSection, Rules, Why } from '../../kit/Doc';

const SURFACES = [
  ['bg', '#080909', 'Page ground'], ['chrome', '#0b0c0c', 'Sidebar, canvases'], ['raised', '#0e100f', 'Inset wells, code'],
  ['sheet', '#111312', 'Sheets, dialogs'], ['card', '#121413', 'Solid cards'], ['popover', '#161817', 'Menus, toasts'],
  ['card-2', '#181a19', 'Raised step'], ['card-3', '#202321', 'Highest step'],
] as const;
const FILLS = [['fill-1', '3%', 'Field at rest, track'], ['fill-2', '5%', 'Hover, quiet tile'], ['fill-3', '8%', 'Icon button, bubble'], ['fill-4', '12%', 'Switch off, strong chip'], ['line', '7%', 'Hairline'], ['line-2', '12%', 'Emphasised hairline']] as const;
const INK = [['bright', '#eef1ee', 'Titles, primary text'], ['ink', '#c6c9c6', 'Body text'], ['dim', '#7d847f', 'Secondary, inactive icons'], ['faint', '#4a504c', 'Hints, chevrons']] as const;
const GLOW = [['ice', '#b9d3ff', 'Default accent: focus, links, selection'], ['azure', '#3b5bff', 'Deep accent, Luna, switch on'], ['lilac', '#a898ff', 'Second voice in gradients'], ['sand', '#eadcbc', 'Warm highlight, marks'], ['ember', '#ff8a5c', 'Badges, “now”, over limit'], ['mint', '#9fe7c8', 'Success'], ['live', '#5b9bff', 'Live right now (stream, remote)'], ['danger', '#ff6b6b', 'Destructive'], ['warning', '#ffb454', 'Caution']] as const;

function Swatch({ name, value, note }: { name: string; value: string; note: string }) {
  return (
    <div className="group overflow-hidden rounded-stat border border-line">
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
          <div key={n} className="overflow-hidden rounded-stat border border-line">
            <div className="grid h-20 place-items-center bg-card"><div className="h-12 w-[70%] rounded-[12px]" style={n.startsWith('line') ? { border: `1px solid var(--color-${n})` } : { background: `var(--color-${n})` }} /></div>
            <div className="px-3 py-2.5"><div className="flex justify-between"><span className="font-mono text-[12px] text-bright">{n}</span><span className="font-mono text-tiny text-dim">white {v}</span></div><div className="mt-0.5 text-meta text-dim">{d}</div></div>
          </div>
        ))}</div>
      </DocSection>
      <DocSection title="Ink">
        <div className="mt-5 space-y-2">{INK.map(([n, v, d]) => (
          <div key={n} className="flex items-baseline gap-4 rounded-stat border border-line px-4 py-3">
            <span className="w-16 font-mono text-[12px] text-dim">{n}</span>
            <span className="flex-1 truncate text-[22px] font-light tracking-[-.02em]" style={{ color: v }}>The quiet voice carries further.</span>
            <span className="hidden text-meta text-dim @min-[700px]:block">{d}</span>
          </div>
        ))}</div>
      </DocSection>
      <DocSection title="Glow palette" description="Used as light: in gradients, glows, dots, one hero number. As flat fills only at ≤ 15% (bg-ember/10).">
        <div className={grid}>{GLOW.map(([n, v, d]) => <Swatch key={n} name={n} value={v} note={d} />)}</div>
        <div className="mt-5 h-16 rounded-stat" style={{ background: 'linear-gradient(90deg, var(--color-accent), var(--color-lilac) 55%, var(--color-sand))' }} />
        <p className="mt-2 text-meta text-dim">The signature ramp — accent → lilac → sand — for progress, rings and one word of display text (.text-glow).</p>
      </DocSection>
      <DocSection title="Accent" description="--color-accent and --color-accent-deep follow the theme (see Themes). Use them instead of a fixed glow colour whenever the colour means “the app's accent”.">
        <div className="mt-5 flex flex-wrap gap-3">
          <div className="h-16 w-40 rounded-stat bg-accent" /><div className="h-16 w-40 rounded-stat bg-accent-deep" /><div className="h-16 w-40 rounded-stat shadow-glow bg-bright" />
        </div>
      </DocSection>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'Tokens or var(--color-…) everywhere, also in SVG strokes and inline styles.', dont: 'Raw hex or Tailwind palettes (zinc-800, emerald-400) in components.' },
          { do: 'One glowing thing per screen.', dont: 'Colour-coded icon tiles in every list row.' },
          { do: 'Tag/category colours from TAG_COLORS (ui/lib/tokens.ts).', dont: 'A fifth private copy of the glow palette.' },
        ]} />
        <Why><p>Near-black (#080909) instead of pure black keeps OLED smear away and gives shadows somewhere to go. The green tint in the greys is barely visible but makes the palette feel like a material rather than a default.</p></Why>
      </DocSection>
    </Doc>
  );
}
