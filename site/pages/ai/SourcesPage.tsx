import { Citation, SourceCards, SourceStack } from '@ui/components/ai/Sources';
import { StreamingText } from '@ui/components/ai/StreamingText';
import { Demo } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Usage, Why } from '../../kit/Doc';
import { ANSWER, SOURCES } from './_content';

export default function SourcesPage() {
  return (
    <Doc eyebrow="AI & Chat" title="Sources & citations" source="ui/components/ai/Sources.tsx"
      lead="An answer people can check is an answer people trust. Number the claim where it is made, show the source on hover, list the sources under the answer.">
      <Demo title="Inline citations" minHeight={300} center={false} code={`<StreamingText text={answer} sources={sources} />\n// or by hand:\n<Citation n={1} source={sources[0]} />`}
        description="Hover or focus a number. [n] in streamed text becomes a citation automatically.">
        {() => <div className="mx-auto max-w-[620px] pt-16"><StreamingText text={ANSWER} sources={SOURCES} /></div>}
      </Demo>
      <DocSection title="Source cards" description="Under the answer, numbered like the citations. Letter tiles in the source’s colour instead of favicons: no requests, nothing to break, still recognisable.">
        <Demo minHeight={160} code={`<SourceCards sources={sources} />`}>{() => <div className="w-full max-w-[660px]"><SourceCards sources={[...SOURCES, { title: 'Wave equation — derivation', where: 'en.wikipedia.org', href: 'https://en.wikipedia.org/wiki/Wave_equation' }]} /></div>}</Demo>
      </DocSection>
      <DocSection title="Compact" description="For collapsed answers and chat history.">
        <Demo minHeight={120} code={`<SourceStack sources={sources} onClick={open} />`}>{() => <><SourceStack sources={SOURCES} /><span className="text-body text-ink">Due tomorrow<Citation n={1} source={SOURCES[0]} /></span></>}</Demo>
      </DocSection>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'Cite where the claim is made, not in a block at the end only.', dont: 'Show sources that were searched but not used — it looks thorough and is noise.' },
          { do: 'Say where a source lives (“Mail · Anna”, “Files · School”) — personal sources need that more than web ones.', dont: 'Hide uncertainty. If a date could not be confirmed, say so in the text.' },
        ]} />
        <Why><p>The tooltip is pure CSS positioning inside the citation — no portal, no measuring — so it works inside streaming text without layout work per word.</p></Why>
      </DocSection>
      <DocSection title="API">
        <Usage code={`interface Source { title: string; where: string; href?: string; snippet?: string; kind?: 'web' | 'file' | 'mail'; color?: string }`} />
        <Props rows={[
          { name: 'Citation', type: '{ n, source? }', description: 'Numbered chip; link if source.href.' },
          { name: 'SourceCards', type: '{ sources }', description: 'Row of cards, scrolls sideways on phones.' },
          { name: 'SourceStack', type: '{ sources, onClick? }', description: 'Stacked icons + “3 sources”.' },
          { name: 'SourceIcon', type: '{ source, size? }', description: 'Letter / kind tile in the source colour.' },
        ]} />
      </DocSection>
    </Doc>
  );
}
