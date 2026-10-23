import { Doc, DocSection, Rules, Why } from '../../kit/Doc';

const SCALE = [
  ['hero', '64', 'Big numbers', 'display tabular'], ['display-lg', '52', 'Page title, desktop', 'display'], ['display', '32', 'Page title, phone', 'display'],
  ['headline', '26', 'Sheet title', 'display'], ['title', '20', 'Stat value, card title', 'font-light tracking-[-.02em] text-bright'], ['lead', '17', 'Intro copy', 'text-ink'],
  ['input', '16', 'Fields on phones', 'text-bright'], ['body', '15', 'Row titles, copy', 'text-bright'], ['button', '14.5', 'Buttons, desktop fields', 'font-medium text-bright'],
  ['chip', '13.5', 'Chips, menu items', 'text-ink'], ['small', '13', 'Secondary copy', 'text-ink'], ['detail', '12.5', 'Row detail, footnotes', 'text-dim'],
  ['meta', '12', 'Timestamps, counts', 'text-dim'], ['tiny', '10.5', 'Tab labels, kbd, axes', 'text-dim'], ['micro', '9.5', 'Eyebrow (mono, caps)', 'eyebrow'],
] as const;

export default function TypographyPage() {
  return (
    <Doc eyebrow="Foundations" title="Typography" source="ui/styles/tokens.css"
      lead="Two voices. DM Sans — light and tight for display, regular for reading. IBM Plex Mono — tiny, uppercase, wide-spaced labels: the “index” voice. Fifteen sizes, each with a job; the dashboard had sixteen arbitrary ones and 754 overrides.">
      <DocSection title="Display & index">
        <div className="mt-6 card overflow-hidden p-6 @min-[700px]:p-10">
          <div className="eyebrow">Friday · week 43</div>
          <h3 className="display mt-3 text-[44px] @min-[700px]:text-display-lg">Good evening, <span className="text-dim">Leandro</span></h3>
          <p className="mt-4 max-w-[520px] text-lead text-ink">Two things left today. The biology test is tomorrow at eight — you have <span className="text-bright">40 minutes</span> before training.</p>
        </div>
      </DocSection>
      <DocSection title="Scale" description="Use the token class: text-body, text-meta, text-display … Line heights come with it.">
        <div className="mt-5 divide-y divide-line rounded-stat border border-line">
          {SCALE.map(([n, px, use, cls]) => (
            <div key={n} className="flex items-center gap-4 px-4 py-3">
              <span className="w-24 shrink-0 font-mono text-[11.5px] text-dim">{n}<span className="block text-faint">{px}px</span></span>
              <span className={`min-w-0 flex-1 truncate ${cls}`} style={{ fontSize: `var(--text-${n})` }}>{n === 'micro' ? 'Section label' : n === 'hero' ? '7:48' : 'Calm and precise'}</span>
              <span className="hidden w-44 shrink-0 text-right text-meta text-dim @min-[700px]:block">{use}</span>
            </div>
          ))}
        </div>
      </DocSection>
      <DocSection title="Numbers">
        <div className="mt-5 grid gap-3 @min-[700px]:grid-cols-2">
          <div className="card p-5"><div className="eyebrow mb-2">tabular</div><div className="tabular display text-[40px]">11:11<br />08:47</div></div>
          <div className="card p-5"><div className="eyebrow mb-2">proportional — avoid in counters</div><div className="display text-[40px]">11:11<br />08:47</div></div>
        </div>
      </DocSection>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'display for titles: weight 300, tracking −0.045em, line-height 1.02.', dont: 'Bold titles. Hierarchy comes from size and light, not weight.' },
          { do: 'eyebrow (mono, 9.5px, .18em, caps) for section labels.', dont: 'A third font, or eyebrows longer than four words.' },
          { do: 'tabular on every number that updates (timers, counters, prices).', dont: 'text-[13.5px] in a page — use the scale.' },
        ]} />
        <Why><p>The pairing comes from the portfolio: light grotesk headlines feel quiet and expensive; the mono labels add the precision of an instrument. Load DM Sans Variable (wght axis) and IBM Plex Mono 400/500 — e.g. @fontsource-variable/dm-sans and @fontsource/ibm-plex-mono.</p></Why>
      </DocSection>
    </Doc>
  );
}
