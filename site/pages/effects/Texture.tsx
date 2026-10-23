import { bool, Demo } from '../../kit/Demo';
import { Doc, DocSection, Grid, Rules, Tile, Usage, Why } from '../../kit/Doc';

export default function TexturePage() {
  return (
    <Doc eyebrow="Effects" title="Texture" source="ui/styles/effects.css"
      lead="A little noise makes dark surfaces feel like material instead of a screen. All textures are static tiles, composited once — none of them animates.">
      <Demo title="Dither against banding" description="A long, dark, soft gradient on an 8-bit screen breaks into stripes. A 3.5% noise tile hides the steps without reading as texture. Toggle it and look at the dark tail."
        controls={{ dither: bool(true) }} background="none" padded={false} minHeight={260}
        code={(v) => `<div className="relative bg-[radial-gradient(…)]">\n  ${v.dither ? '<div className="dither absolute inset-0" />' : '{/* no dither */}'}\n</div>`}>
        {(v) => (
          <div className="relative h-[260px] w-full bg-[radial-gradient(120%_100%_at_30%_0%,#1b2a66,#0d1226_45%,#080909_80%)]">
            {v.dither && <div className="dither absolute inset-0" />}
          </div>
        )}
      </Demo>
      <DocSection title="The set">
        <Grid cols={3}>
          <Tile label=".grain — film grain over the app (desktop only)" className="!p-0"><div className="relative h-36 w-full bg-card"><div className="grain !absolute !opacity-[.12]" /></div></Tile>
          <Tile label=".grain-tile — static grain in heroes"><div className="relative h-24 w-full overflow-hidden rounded-[14px] bg-[linear-gradient(135deg,#1f38e0,#6a57e6_50%,#a8946c)]"><div className="grain-tile absolute inset-0 opacity-50" /></div></Tile>
          <Tile label=".dot-grid — canvases, whiteboards"><div className="dot-grid h-24 w-full rounded-[14px] border border-line bg-chrome" /></Tile>
          <Tile label=".hatched — blocked (danger by default)"><div className="hatched w-full rounded-list border px-4 py-3 text-chip text-bright">Waiting for review</div></Tile>
          <Tile label=".hatched with --hatch: warning"><div className="hatched w-full rounded-list border px-4 py-3 text-chip text-bright" style={{ ['--hatch' as string]: 'var(--color-warning)' }}>Over budget</div></Tile>
          <Tile label=".skeleton — the one loading shape"><div className="w-full space-y-2.5"><div className="skeleton h-3 w-[90%]" /><div className="skeleton h-3 w-[72%]" /><div className="skeleton h-3 w-[54%]" /></div></Tile>
        </Grid>
      </DocSection>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'Grain on desktop, dither everywhere a long dark gradient lives.', dont: 'Full-screen grain on phones — invisible at 3× DPR, but it costs a full-screen layer.' },
          { do: 'Hatching for "blocked", with the reason in text.', dont: 'Hatching as decoration.' },
        ]} />
        <Why><p>The grain is an SVG <code>feTurbulence</code> tile as a data URI: rasterised once, then just a texture. It hides under <code>@media (hover: none)</code>, where it would cost a full-screen layer for nothing.</p></Why>
        <Usage code={`<div className="grain" />                 // once, at the app root\n<div className="dither absolute inset-0" /> // over long dark gradients\n<li className="hatched rounded-list border">…</li>`} />
      </DocSection>
    </Doc>
  );
}
