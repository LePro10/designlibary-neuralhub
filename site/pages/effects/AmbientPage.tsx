import { Ambient } from '@ui/components/effects/Ambient';
import { MeshGradient } from '@ui/components/effects/MeshGradient';
import { AMBIENT, type AmbientName } from '@ui/lib/tokens';
import { bool, Demo, range, select } from '../../kit/Demo';
import { Doc, DocSection, Grid, Props, Rules, Usage, Why } from '../../kit/Doc';

const NAMES = Object.keys(AMBIENT) as AmbientName[];

export default function AmbientPage() {
  return (
    <Doc eyebrow="Effects" title="Ambient light" source={['ui/components/effects/Ambient.tsx', 'ui/components/effects/MeshGradient.tsx', 'ui/lib/tokens.ts (AMBIENT)']}
      lead="Every place has its own light: a soft mesh gradient behind the top of the page that sinks into the black and fades as you scroll. Pushed levels keep their parent's light, so going one level down still feels like the same place.">
      <Demo title="Page top" controls={{ palette: select(NAMES, 'home'), seed: range(1, 60, 7, 1), intensity: range(0.2, 0.9, 0.55, 0.05), grain: bool(true) }}
        background="none" padded={false} center={false} minHeight={380}
        code={(v) => `<Page title="Today" ambient="${v.palette}" ambientSeed={${v.seed}}>…</Page>\n// or standalone\n<Ambient name="${v.palette}" seed={${v.seed}} intensity={${v.intensity}}${v.grain ? '' : ' grain={false}'} />`}>
        {(v) => (
          <div className="relative h-[380px] w-full overflow-hidden bg-bg">
            <Ambient name={v.palette} seed={v.seed} intensity={v.intensity} grain={v.grain} height="100%" />
            <div className="relative p-6 @min-[700px]:p-10">
              <div className="eyebrow">Thursday, 23 October</div>
              <h3 className="display mt-2 text-display @min-[700px]:text-display-lg">Good evening</h3>
              <p className="mt-3 max-w-[420px] text-body text-ink">Two blocks left today. The exam is in 6 days — Luna moved the summary to 18:30.</p>
            </div>
          </div>
        )}
      </Demo>

      <DocSection title="Palettes" description={<p>Five stops each — dark, three mid-tones, dark. Mid-tones only: the light tints the dark, it never washes out text. From <code>AMBIENT</code> in <code>ui/lib/tokens.ts</code>.</p>}>
        <Grid cols={4}>
          {NAMES.map((n) => (
            <div key={n} className="overflow-hidden rounded-stat border border-line">
              <div className="relative h-24"><MeshGradient colors={[...AMBIENT[n]]} intensity={0.6} falloff={0.32} warp={0.35} grain={0} seed={5} resolution={0.3} /></div>
              <div className="flex items-center justify-between border-t border-line px-3 py-2">
                <span className="font-mono text-meta text-ink">{n}</span>
                <span className="flex gap-0.5">{AMBIENT[n].slice(1, 4).map((c) => <i key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />)}</span>
              </div>
            </div>
          ))}
        </Grid>
      </DocSection>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'One palette per place (tab, section), reused by every level inside it.', dont: 'Bright, saturated stops — the light must stay below the text.' },
          { do: 'Fix the seed when the page opens (title hash).', dont: 'Re-seed on every keystroke of a title — the whole background would reshuffle.' },
        ]} />
        <Why>
          <p>It is a still image. A slow drift at 12–30 fps was half of a resting page's GPU load and nobody missed it. One shared WebGL context draws the pose into a tiny buffer (~1/80 of the pixels at 3× DPR), copies it to a 2D canvas, and is done. Long dark ramps band on 8-bit screens, so the shader dithers half a level and a static dither tile covers the tail.</p>
        </Why>
      </DocSection>

      <DocSection title="Props">
        <Props rows={[
          { name: 'name', type: 'AmbientName', default: "'home'", description: 'Named palette.' },
          { name: 'colors', type: 'string[5]', description: 'Custom stops (dark → mid → dark).' },
          { name: 'scrollY', type: 'MotionValue<number>', description: 'Fades out over the first 360px of scroll.' },
          { name: 'seed', type: 'number', default: '1', description: 'Composition of the same colours.' },
          { name: 'intensity', type: 'number', default: '0.55', description: 'Spread of the light.' },
        ]} />
        <Usage code={`const { scrollY } = useScroll({ container: ref });\n<Ambient name="luna" scrollY={scrollY} seed={7} />`} />
      </DocSection>
    </Doc>
  );
}
