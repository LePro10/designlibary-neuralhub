import { Search } from 'lucide-react';
import { useState } from 'react';
import { Segmented } from '@ui/components/core/Segmented';
import { Switch } from '@ui/components/core/Switch';
import { Doc, DocSection, Rules, Usage, Why } from '../../kit/Doc';
import { Demo } from '../../kit/Demo';

const RADII = [['xs', 5, 'kbd, inline code'], ['chip', 6, 'tiny tiles'], ['tile', 8, 'icon tile in a row'], ['item', 9, 'item in a menu'], ['field', 10, 'inputs, search'], ['menu', 13, 'pull-down menus'], ['stat', 14, 'stat tiles'], ['list', 16, 'grouped lists'], ['card', 18, 'cards, bubbles'], ['dialog', 20, 'dialog, island'], ['sheet', 24, 'phone panel'], ['full', 9999, 'buttons, chips']] as const;
// Literal class names, so Tailwind sees them.
const RCLS: Record<string, string> = { xs: 'rounded-xs', chip: 'rounded-chip', tile: 'rounded-tile', item: 'rounded-item', field: 'rounded-field', menu: 'rounded-menu', stat: 'rounded-stat', list: 'rounded-list', card: 'rounded-card', dialog: 'rounded-dialog', sheet: 'rounded-sheet', full: 'rounded-full' };
const SHADOWS = [['edge', 'surface: lit top edge'], ['raise', 'raised: thumb, knob'], ['well', 'well: sunk field'], ['lit', 'primary bead'], ['lip', 'tinted fills'], ['key', 'keycap'], ['menu', 'pull-down menus'], ['float', 'glass bars'], ['dialog', 'dialog']] as const;

const LEVELS = [
  { n: '−1', name: 'Well', cls: 'well', note: 'Fields, tracks. Sunk: an inner shadow from the top, a rim that brightens on focus.' },
  { n: '0', name: 'Ground', cls: '', note: 'The page. Near-black, carries the place’s light.' },
  { n: '+1', name: 'Surface', cls: 'surface', note: 'Lists, cards, tiles. A touch brighter at the top, an edge lit from above — no drawn border.' },
  { n: '+2', name: 'Raised', cls: 'raised', note: 'Rests on a surface: segment thumb, switch knob, icon disc.' },
  { n: '+3', name: 'Float', cls: 'glass', note: 'Over everything: menus, tab bar, sidebar island, toasts. Glass + soft long shadow.' },
] as const;

export default function ShapePage() {
  return (
    <Doc eyebrow="Foundations" title="Shape & depth" source={['ui/styles/tokens.css', 'ui/styles/effects.css']}
      lead="Continuous corners named by what wears them, nested concentrically. Depth comes from light, not lines: five levels, each lit from above, and a border only where two things meet.">
      <DocSection title="Continuous corners" description="Where the browser can draw a superellipse (corner-shape), every tokened corner becomes one — the curve starts earlier and eases in, like iOS — and radii grow by 1.3 so it reads the same size. Elsewhere the same tokens draw ordinary round corners.">
        <Demo minHeight={260} code={`/* automatic: every rounded-{token}, .card, .surface */\n<html data-corners="round">  /* opt out */`}>
          {() => <CornerCompare />}
        </Demo>
      </DocSection>

      <DocSection title="Radius" description="Named by role. The number is the base; continuous corners scale it.">
        <div className="mt-5 grid grid-cols-3 gap-2 @min-[700px]:grid-cols-6">
          {RADII.map(([n, r, d]) => (
            <div key={n} className="surface flex flex-col items-center gap-2.5 rounded-stat p-3">
              <div className={`h-12 w-full bg-fill-3 shadow-edge ${RCLS[n]}`} />
              <div className="text-center"><div className="font-mono text-meta text-bright">{n}</div><div className="text-tiny text-dim">{r === 9999 ? '∞' : `${r}px`} · {d}</div></div>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection title="Concentric" description="A corner inside a corner shares its centre: inner radius = outer radius − the gap between them. That is why the item token exists — a menu (13) with 4px padding holds items of 9.">
        <div className="mt-5 grid gap-3 @min-[700px]:grid-cols-2">
          <Nest ok />
          <Nest />
        </div>
      </DocSection>

      <DocSection title="Depth: five levels" description="Every level is told apart by light. The edge is brightest at the top, where light from above would hit it, and fades round the sides.">
        <div className="mt-5 surface overflow-hidden rounded-card">
          <div className="list-rows">
            {LEVELS.map((l) => (
              <div key={l.n} className="flex items-center gap-4 px-4 py-3.5">
                <span className="w-7 shrink-0 font-mono text-meta text-faint">{l.n}</span>
                <div className={`grid h-11 w-20 shrink-0 place-items-center rounded-field text-tiny text-dim ${l.cls}`}>{l.cls ? `.${l.cls}` : 'bg'}</div>
                <div className="min-w-0"><div className="text-body text-bright">{l.name}</div><p className="text-small text-dim">{l.note}</p></div>
              </div>
            ))}
          </div>
        </div>
        <Demo title="All five at once" background="ambient" minHeight={320}>
          {() => <Stack />}
        </Demo>
        <Usage code={`<div className="surface rounded-list">…</div>      // +1
<input className="well rounded-field" />           // −1
<span className="raised rounded-full" />           // +2
<div className="glass rounded-menu shadow-menu" />  // +3
<button className="bg-bright shadow-lit" />        // the one bright bead`} />
      </DocSection>

      <DocSection title="Shadows">
        <div className="mt-5 grid grid-cols-2 gap-4 @min-[700px]:grid-cols-3">
          {SHADOWS.map(([n, d]) => (
            <div key={n} className={`rounded-stat p-4 ${n === 'lit' ? 'bg-bright' : n === 'well' ? 'bg-fill-1' : 'bg-card-2'}`} style={{ boxShadow: `var(--shadow-${n})` }}>
              <div className={`font-mono text-meta ${n === 'lit' ? 'text-bg' : 'text-bright'}`}>shadow-{n}</div>
              <div className={`text-tiny ${n === 'lit' ? 'text-bg/60' : 'text-dim'}`}>{d}</div>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'A surface for anything that groups content (.surface / .card).', dont: 'border border-white/10 around every box — a wireframe, not a product.' },
          { do: 'Hairlines only where two things meet: list separators, a table rule.', dont: 'A border and a shadow and a fill on the same card.' },
          { do: 'Nested corners concentric: inner = outer − gap.', dont: 'The same radius inside and out — the inner one looks swollen.' },
          { do: 'One bright bead (shadow-lit) per view: the primary action.', dont: 'Glow and coloured shadows to make something important.' },
        ]} />
        <Why>
          <p>A dark UI drawn with outlines reads as a wireframe; one drawn with light reads as material. Light from above is a single, consistent idea — rims, wells, beads, the lens and avatars all follow it, so nothing has to be decided per component.</p>
          <p>The dashboard counted 19 arbitrary radii and 198 overrides. Naming radii by role, and deriving inner ones, makes the right choice the easy one — for a person and for an AI.</p>
        </Why>
      </DocSection>
    </Doc>
  );
}

function CornerCompare() {
  return (
    <div className="grid w-full max-w-[560px] grid-cols-2 gap-6">
      {(['round', 'superellipse(1.4)'] as const).map((c, i) => (
        <div key={c} className="flex flex-col items-center gap-3">
          <div className="aspect-[4/3] w-full bg-fill-3 shadow-edge" style={{ borderRadius: i ? 36 : 28, cornerShape: c } as React.CSSProperties} />
          <div className="text-center"><div className="text-chip text-bright">{i ? 'Continuous' : 'Round'}</div><div className="text-tiny text-dim">{i ? 'superellipse(1.4), radius × 1.3' : 'circular arc'}</div></div>
        </div>
      ))}
    </div>
  );
}

function Nest({ ok }: { ok?: boolean }) {
  return (
    <div className="surface flex flex-col items-center gap-3 rounded-stat p-6">
      <div className="glass w-full max-w-[220px] rounded-menu p-1 shadow-menu">
        {['Rename', 'Duplicate', 'Move to…'].map((t, i) => (
          <div key={t} className={`flex h-9 items-center px-2.5 text-chip ${i === 0 ? 'bg-fill-3 text-bright' : 'text-ink'} ${ok ? 'rounded-item' : 'rounded-menu'}`}>{t}</div>
        ))}
      </div>
      <div className={`text-meta ${ok ? 'text-mint' : 'text-danger'}`}>{ok ? 'item 9 in menu 13 + 4px — concentric' : 'item 13 in menu 13 — swollen'}</div>
    </div>
  );
}

function Stack() {
  const [seg, setSeg] = useState('day');
  const [on, setOn] = useState(true);
  return (
    <div className="relative w-full max-w-[420px]">
      <div className="surface rounded-list p-3">
        <div className="well flex h-10 items-center gap-2 rounded-field px-3 text-small text-faint"><Search size={14} strokeWidth={1.75} />Search</div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <Segmented size="sm" value={seg} onChange={setSeg} label="Range" options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]} />
          <Switch checked={on} onChange={setOn} label="Live" />
        </div>
      </div>
      <div className="glass absolute -right-6 -bottom-16 w-[180px] rounded-menu p-1 shadow-menu @max-[520px]:right-0">
        {['Float', 'over everything'].map((t, i) => <div key={t} className={`flex h-8 items-center rounded-item px-2.5 text-chip ${i ? 'text-dim' : 'bg-fill-3 text-bright'}`}>{t}</div>)}
      </div>
    </div>
  );
}
