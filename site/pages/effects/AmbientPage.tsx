import { Ambient, type AmbientMotion } from '@ui/components/effects/Ambient';
import { AMBIENT, AMBIENT_POSE, PLACES, type AmbientName, type Place } from '@ui/lib/tokens';
import { Demo, colors, range, select } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Usage, Why } from '../../kit/Doc';

const PLACE_NAMES = Object.keys(PLACES) as Place[];
const NAMES = Object.keys(AMBIENT) as AmbientName[];
const TITLE: Partial<Record<Place, [string, string]>> = {
  home: ['Friday 24', 'Two things left today.'], luna: ['Luna', 'How can I help, Leandro?'], plan: ['Plan', 'Physics first, history after.'],
  files: ['Files', '1.2 GB free of 50.'], screen: ['Screen time', '2:41 h, below your limit.'], mail: ['Mail', 'One needs an answer.'],
  calendar: ['Calendar', 'Training at 17:30.'], progress: ['Progress', '14 workouts this month.'], account: ['Account', 'Signed in on 3 devices.'],
  notes: ['Notes', '12 pages edited this week.'], tools: ['Tools', 'Run something locally.'], browser: ['Browser', 'Luna is reading 2 tabs.'],
};

export default function AmbientPage() {
  return (
    <Doc eyebrow="Effects" title="Light" source={['ui/components/effects/Ambient.tsx', 'ui/lib/tokens.ts (AMBIENT, AMBIENT_POSE, PLACES)']}
      lead="Every place has its own light: two or three soft colours at the top of the page that sink into the black and fade as you scroll. It is a 1 KB inline SVG. No shader, no image, no grain.">
      <Demo title="A place" controls={{ place: select(PLACE_NAMES, 'plan'), motion: select(['still', 'breathe', 'drift'] as const), intensity: range(0.3, 1, 1, 0.05) }}
        background="none" padded={false} center={false} minHeight={380}
        code={(v) => `<Page title="${TITLE[v.place]?.[0]}" place="${v.place}"${v.motion !== 'still' ? ` ambientMotion="${v.motion}"` : ''}>…</Page>\n\n// or on its own\n<Ambient name="${PLACES[v.place].ambient}"${v.intensity < 1 ? ` intensity={${v.intensity}}` : ''}${v.motion !== 'still' ? ` motion="${v.motion}"` : ''} />`}>
        {(v) => (
          <div data-signal={PLACES[v.place].signal} className="relative h-[380px] w-full overflow-hidden bg-bg">
            <Ambient name={PLACES[v.place].ambient} intensity={v.intensity} motion={v.motion as AmbientMotion} height="100%" />
            <div className="relative p-6 @min-[700px]:p-10">
              <div className="eyebrow">{v.place}</div>
              <h3 className="display mt-2 text-display @min-[700px]:text-display-lg">{TITLE[v.place]?.[0]}</h3>
              <p className="mt-2 max-w-[420px] text-body text-ink">{TITLE[v.place]?.[1]}</p>
              <div className="mt-6 inline-flex items-baseline gap-1.5"><span className="tabular text-hero font-light tracking-[-.03em] text-tab">81</span><span className="text-meta text-dim">% of the week</span></div>
            </div>
          </div>
        )}
      </Demo>

      <DocSection title="Every place" description="The same composition, each place in its own colours. The signal colour (the dot) is what the place uses for its one hero figure and its tab.">
        <div className="mt-5 grid grid-cols-2 gap-2 @min-[640px]:grid-cols-3 @min-[960px]:grid-cols-4">
          {PLACE_NAMES.map((p) => (
            <div key={p} className="overflow-hidden rounded-stat border-hair border-line-2">
              <div className="relative h-28 bg-bg"><Ambient name={PLACES[p].ambient} height="100%" /></div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-meta text-ink">{p}</span>
                <span className="flex items-center gap-1.5 font-mono text-tiny text-faint">{PLACES[p].signal}<i className="h-1.5 w-1.5 rounded-full" style={{ background: `var(--color-signal-${PLACES[p].signal})` }} /></span>
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection title="Your own palette" description="Five stops: dark, three mid-tones, dark. Mid-tones only — the light tints the dark, it never washes out text.">
        <Demo controls={{ base: select(NAMES, 'luna', 'start from'), a: colors(['#1f38e0', '#146a4b', '#9a3a16', '#3a2fd0', '#2a4f8f'] as const, '#1f38e0', 'light 1'), b: colors(['#6a57e6', '#4c9477', '#d0703c', '#7a5ce0', '#3e8f7c'] as const, '#6a57e6', 'light 2'), c: colors(['#a8946c', '#c9844f', '#7b66e8', '#b0806a', '#5a63c9'] as const, '#a8946c', 'light 3') }}
          background="none" padded={false} center={false} minHeight={260}
          code={(v) => `<Ambient colors={['${AMBIENT[v.base][0]}', '${v.a}', '${v.b}', '${v.c}', '${AMBIENT[v.base][4]}']} />`}>
          {(v) => (
            <div className="relative h-[260px] w-full overflow-hidden bg-bg">
              <Ambient colors={[AMBIENT[v.base][0], v.a, v.b, v.c, AMBIENT[v.base][4]]} height="100%" />
            </div>
          )}
        </Demo>
      </DocSection>

      <DocSection title="Why an SVG">
        <Why>
          <p>The dashboard drew this light with a WebGL mesh-gradient shader on every page, posed by a seed from the title, with film grain on top. It looked good but cost a GPU context per page, the pose changed with every rename, and the grain read as pixel noise on phones.</p>
          <p>Now it is five radial gradients and one fade in an inline SVG. The lights sit where the shader put them (<code>AMBIENT_POSE</code>, the shader's own centres for the pose that gathers light at the top) and fall off like its Gaussian (<code>exp(−4.2·d²)</code>, sampled into six stops). Side by side with the shader the colours and composition match. It weighs about 1 KB, renders sharp at any size and costs nothing at runtime.</p>
        </Why>
        <div className="mt-4 scroll-x rounded-stat border-hair border-line-2 p-4">
          <table className="w-full min-w-[420px] text-left font-mono text-tiny text-dim">
            <thead><tr>{['light', 'x', 'y', 'role'].map((h) => <th key={h} className="pb-2 font-normal text-faint">{h}</th>)}</tr></thead>
            <tbody>{AMBIENT_POSE.map(([x, y], i) => <tr key={i}><td className="py-0.5 text-ink">{i}</td><td>{x.toFixed(3)}</td><td>{y.toFixed(3)}</td><td>{i === 0 || i === 4 ? 'dark — shapes the falloff' : 'colour'}</td></tr>)}</tbody>
          </table>
        </div>
        <Rules items={[
          { do: 'One light per place, set once via `place` on the Page.', dont: 'Light on cards or inside lists. It belongs behind the top of a page.' },
          { do: 'Motion only if the screen is otherwise calm: "breathe" moves the whole SVG by transform.', dont: 'Grain or noise on top. It reads as pixels on phones.' },
        ]} />
      </DocSection>

      <DocSection title="Props">
        <Props rows={[
          { name: 'name', type: 'AmbientName', default: "'home'", description: 'A palette from AMBIENT.' },
          { name: 'colors', type: 'string[5]', description: 'Your own five stops (overrides name).' },
          { name: 'scrollY', type: 'MotionValue<number>', description: 'The page scroll; the light fades out over 360px. Page passes it.' },
          { name: 'intensity', type: 'number', default: '1', description: 'Strength of the coloured lights.' },
          { name: 'motion', type: "'still' | 'breathe' | 'drift'", default: "'still'", description: 'Whole-SVG transform loop; pauses in rest mode.' },
          { name: 'height', type: 'string', default: "'min(60dvh, 520px)'", description: 'How far down the light reaches.' },
        ]} />
        <Usage code={`<Page title="Plan" place="plan">…</Page>        // light + signal colour\n<Ambient name="plan" scrollY={scrollY} />        // standalone`} />
      </DocSection>
    </Doc>
  );
}
