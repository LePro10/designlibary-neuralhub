import { Brain, CalendarDays, Mail } from 'lucide-react';
import { Spotlight } from '@ui/components/effects/Spotlight';
import { Demo, range } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Usage, Why } from '../../kit/Doc';

const CARDS = [
  { Icon: Brain, title: 'Context, found', body: 'Luna searches your notes, mail and calendar before she asks.' },
  { Icon: CalendarDays, title: 'Plans that move', body: 'Missed a block? The week re-flows around it.' },
  { Icon: Mail, title: 'Inbox, sorted', body: 'Drafts wait for your OK; nothing leaves without it.' },
];

export default function SpotlightPage() {
  return (
    <Doc eyebrow="Effects" title="Spotlight" source="ui/components/effects/Spotlight.tsx"
      lead="A soft light follows the pointer across a card and catches its border where it passes. Good for a grid of features or choices on a landing page or an empty state — a quiet invitation to point at things.">
      <Demo title="Feature grid" controls={{ size: range(160, 520, 320, 10, 'px') }} minHeight={300} center={false}
        code={(v) => `<Spotlight size={${v.size}} className="card p-5">\n  …\n</Spotlight>`}>
        {(v) => (
          <div className="grid w-full gap-3 @min-[700px]:grid-cols-3">
            {CARDS.map(({ Icon, title, body }) => (
              <Spotlight key={title} size={v.size} className="card p-5">
                <span className="grid h-10 w-10 place-items-center rounded-tile border-hair border-line-2 bg-fill-2 text-bright"><Icon size={18} strokeWidth={1.7} /></span>
                <h3 className="mt-4 text-body text-bright">{title}</h3>
                <p className="mt-1 text-small leading-relaxed text-dim">{body}</p>
              </Spotlight>
            ))}
          </div>
        )}
      </Demo>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'Grids of equal cards, where pointing is exploring.', dont: 'Lists you work in every day — a light chasing the cursor gets tiring.' },
        ]} />
        <Why><p>The handler writes <code>--mx</code>/<code>--my</code> on the element; two pseudo-elements read them (one fills, one draws the border through a mask). React never re-renders while you move. On touch it lights while pressed.</p></Why>
      </DocSection>
      <DocSection title="Props">
        <Props rows={[
          { name: 'size', type: 'number', default: '320', description: 'Diameter of the light.' },
          { name: 'as', type: "'div' | 'section' | 'article' | 'li'", default: "'div'", description: 'Element.' },
        ]} />
        <Usage code={`<Spotlight className="card p-5">…</Spotlight>`} />
      </DocSection>
    </Doc>
  );
}
