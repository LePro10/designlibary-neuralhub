import { Doc, DocSection, Prose } from '../../kit/Doc';

/** Kept verbatim with the analysis of the dashboard (2026-10): counts are from a scan of ui/tabs/**. */
const ROWS: [string, string, string][] = [
  ['Springs', '14 hand-typed stiffness/damping pairs; the shared presets went unused', '7 named springs (snap, toggle, sheet, pop, soft, grow, bouncy) chosen by what moves'],
  ['Type sizes', '754 arbitrary text-[Npx], 16 different values', '15-step scale as tokens: text-body, text-meta, text-display …'],
  ['Radii', '198 overrides, 19 arbitrary values; .card fought with !rounded-[18px]', 'Radii named by role: rounded-field, -list, -card, -sheet …'],
  ['Fills', '437 bg-/border-white/[…] steps in pages', 'fill-1…4 and line / line-2'],
  ['Raw colours', '100 hex + 64 rgba in pages; ice typed 18×; glow palette copied 5×', 'Tokens + var(--color-…); TAG_COLORS, GLOW, AMBIENT as one list each'],
  ['Warning token', 'text-warn / bg-warn used but not defined', '--color-warning, used by Pill, Callout, StatusDot'],
  ['Live blue', '#5b9bff typed 10×, no token', '--color-live'],
  ['Buttons', '20 !h-… overrides, 28 hand-made pills', '4 sizes, 6 variants incl. glass; IconButton sizes with 44px hit area'],
  ['Pills / dots / groups', '3 pill, 3 status-dot, 4 Group copies', 'Pill (7 tones), StatusDot, List with label + footer'],
  ['Progress', '7 bar implementations, 4 rings (two with colliding gradient ids)', 'One Meter, one Ring (useId gradients) — see Data'],
  ['Skeletons & spinners', '5 skeleton styles, 6 spinner speeds', 'One .skeleton (transform sweep), one .spinner'],
  ['Sheet snaps', '27 distinct snaps arrays', 'SNAPS presets: peek, half, tall, full'],
  ['Error banners', 'Radius 14 or 16, tint 10 or 15%, ad hoc', 'Callout with tones'],
  ['Phone vs desktop', 'Viewport media queries (157× min-[900px])', 'AppShell measures its own width → <Surface>; container queries inside pages'],
  ['Touch targets', '32px and smaller in toolbars, day arrows, message actions', 'sm IconButton draws 32 but hits 44; Check has a 40px target'],
  ['Haptics', 'Two APIs (tick/select/heavy vs “tap”)', 'One haptic() with a pluggable native driver'],
  ['Safe areas', 'var(--safe-*) in tabs, raw env() elsewhere', 'Only var(--safe-*), defined once'],
  ['Glass', 'Ad-hoc backdrop-blur-xl next to .glass', '.glass with four themeable levels, .glass-lens, .rim'],
  ['Themes', 'Ice only; mint as a dead legacy accent', '6 accent sets incl. orb + light-border colours, per subtree'],
];

const V2: [string, string][] = [
  ['Type', 'One step smaller across the scale (body 15 → 14.5, display 32 → 28), medium = weight 460, no semibold or bold.'],
  ['Edges', 'Hairlines (0.5px on retina) instead of 1px borders; shadows only on floating things.'],
  ['Radii', 'Smaller: card 24 → 18, list 22 → 16, field 14 → 10; new menu radius 13.'],
  ['Colour', 'Each place owns a signal colour (PLACES): its light, its hero figure, its active tab. Gradient text and glowing buttons removed.'],
  ['Light', 'Ambient light is an inline SVG (≈1 KB) with the old composition and colours — no WebGL, no seed, no grain.'],
  ['Phone overlays', 'Menus pull down from their trigger; choices expand inline; confirmations happen in the button; panels only for long tasks.'],
  ['Motion', 'Shorter, no wobble, faster exits; titles rise out of a mask; numbers roll; the logo works instead of a glowing orb.'],
];

export default function Refinements() {
  return (
    <Doc eyebrow="Start" title="What changed" lead="The dashboard's look was kept; its drift was not. A scan of every tab produced this list — each line is a place where the same intent had been typed many different ways.">
      <div className="scroll-x rounded-stat border-hair border-line">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead><tr className="border-b-hair border-line">{['Area', 'In the dashboard', 'In the library'].map((h) => <th key={h} className="px-4 py-3 font-normal"><span className="eyebrow">{h}</span></th>)}</tr></thead>
          <tbody>
            {ROWS.map(([a, b, c]) => (
              <tr key={a} className="border-b-hair border-line align-top last:border-0">
                <td className="px-4 py-3 text-bright">{a}</td>
                <td className="px-4 py-3 text-dim">{b}</td>
                <td className="px-4 py-3 text-ink">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DocSection title="Round 2: lighter" description="After the first version: less weight everywhere, one colour per place, lighter overlays on phones.">
        <div className="scroll-x mt-5 rounded-stat border-hair border-line-2">
          <table className="w-full min-w-[640px] text-left text-small">
            <tbody>
              {V2.map(([a, b]) => (
                <tr key={a} className="border-b-hair border-line align-top last:border-0">
                  <td className="w-48 px-4 py-2.5 text-bright">{a}</td>
                  <td className="px-4 py-2.5 text-ink">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>
      <DocSection title="Kept on purpose">
        <Prose>
          <p>The near-black ground and grey-green ink, DM Sans light with mono eyebrows, the liquid tab bar, the frosted title fade, the voice orb, the “now” light border, sheets on the compositor, the overlay stack with back gesture and focus return, haptics on every choice, and the performance discipline (decorations rest, loops stay on the compositor).</p>
          <p>None of this was re-designed — only made consistent, themeable and portable.</p>
        </Prose>
      </DocSection>
    </Doc>
  );
}
