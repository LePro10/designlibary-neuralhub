import { Doc, DocSection, Rules, Why } from '../../kit/Doc';

const RADII = [['chip', 6, 'tiny tiles, kbd'], ['tile', 8, 'icon tile in a row'], ['field', 10, 'inputs, search, code'], ['menu', 13, 'pull-down menus'], ['stat', 14, 'stat tiles'], ['list', 16, 'grouped lists, bubbles'], ['card', 18, '.card'], ['dialog', 20, 'desktop dialog'], ['sheet', 22, 'full-height panel'], ['full', 9999, 'buttons, chips, pills']] as const;
const SHADOWS = [['menu', 'pull-down menus'], ['float', 'glass bars'], ['fab', 'floating buttons'], ['sheet', 'panel'], ['dialog', 'dialog'], ['rim', 'inset top highlight']] as const;

export default function ShapePage() {
  return (
    <Doc eyebrow="Foundations" title="Shape & depth" source="ui/styles/tokens.css"
      lead="Small, continuous corners named by what wears them, and edges drawn as hairlines: one device pixel on retina screens (border-hair). Only floating things cast a shadow.">
      <DocSection title="Radius">
        <div className="mt-5 grid grid-cols-3 gap-3 @min-[700px]:grid-cols-5">
          {RADII.map(([n, r, d]) => (
            <div key={n} className="flex flex-col items-center gap-2.5 rounded-stat border-hair border-line bg-fill-1 p-4">
              <div className="h-16 w-full border-hair border-line-2 bg-fill-3" style={{ borderRadius: r === 9999 ? 9999 : r }} />
              <div className="text-center"><div className="font-mono text-[12px] text-bright">rounded-{n}</div><div className="text-tiny text-dim">{r === 9999 ? '∞' : `${r}px`} · {d}</div></div>
            </div>
          ))}
        </div>
      </DocSection>
      <DocSection title="Surfaces" description="Three recipes cover everything that is not the page.">
        <div className="mt-5 grid gap-4 @min-[700px]:grid-cols-3">
          <div className="card p-5"><div className="eyebrow mb-2">.card</div><p className="text-[13px] text-ink">Whisper gradient top→bottom, 7% hairline, 4% top rim. Sits on the page.</p></div>
          <div className="relative overflow-hidden rounded-card"><div className="absolute inset-0 bg-[radial-gradient(70%_80%_at_20%_0%,var(--color-accent-deep),transparent_70%)] opacity-60" /><div className="glass relative m-3 rounded-[18px] p-4"><div className="eyebrow mb-2">.glass</div><p className="text-[13px] text-ink">Blur + saturation, top highlight, float shadow. Floats over content.</p></div></div>
          <div className="rim rounded-card bg-card-2 p-5"><div className="eyebrow mb-2">.rim</div><p className="text-[13px] text-ink">Non-uniform edge: brightest at the top, where light hits real glass.</p></div>
        </div>
      </DocSection>
      <DocSection title="Shadows">
        <div className="mt-5 grid grid-cols-2 gap-6 @min-[700px]:grid-cols-3">
          {SHADOWS.map(([n, d]) => <div key={n} className="rounded-stat bg-card-2 p-5" style={{ boxShadow: `var(--shadow-${n})` }}><div className="font-mono text-[12px] text-bright">shadow-{n}</div><div className="text-meta text-dim">{d}</div></div>)}
        </div>
      </DocSection>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'Nested corners: inner radius = outer radius − padding.', dont: '!rounded-[18px] on a .card to make it look different — pick the right recipe.' },
          { do: 'Light from the top-left, everywhere: rims, gloss, avatars, lens.', dont: 'Hard drop shadows with offsets; dark UIs need long, soft, low shadows.' },
        ]} />
        <Why><p>The dashboard counted 19 different arbitrary radii and 198 overrides. Naming radii by role makes the right choice the easy one — and an AI implementing a new screen cannot guess wrong.</p></Why>
      </DocSection>
    </Doc>
  );
}
