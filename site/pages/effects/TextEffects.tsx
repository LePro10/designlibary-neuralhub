import { RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Shimmer } from '@ui/components/effects/Shimmer';
import { TextScramble } from '@ui/components/effects/TextScramble';
import { Button } from '@ui/components/core/Button';
import { Demo, range, select, text } from '../../kit/Demo';
import { Doc, DocSection, Grid, Rules, Tile, Usage, Why } from '../../kit/Doc';

const REPLY = 'You have 30 minutes before training. The physics summary fits: chapter 4 is short, and Luna already pulled your notes from Tuesday.';

function Stream({ speed }: { speed: number }) {
  const words = REPLY.split(' ');
  const [n, setN] = useState(0);
  const [run, setRun] = useState(0);
  useEffect(() => {
    setN(0);
    const t = window.setInterval(() => setN((x) => (x >= words.length ? x : x + 1)), speed);
    return () => window.clearInterval(t);
  }, [run, speed, words.length]);
  return (
    <div className="w-full max-w-[520px]">
      <p className="min-h-[78px] text-lead leading-relaxed text-ink">
        {words.slice(0, n).map((w, i) => <span key={`${run}-${i}`} className="word-in">{w} </span>)}
        {n < words.length && <span className="caret" />}
      </p>
      <Button size="xs" variant="ghost" Icon={RotateCcw} onClick={() => setRun((r) => r + 1)} className="mt-4">Replay</Button>
    </div>
  );
}

export default function TextEffectsPage() {
  const [code, setCode] = useState('NH-4821');
  return (
    <Doc eyebrow="Effects" title="Text effects" source={['ui/components/effects/Shimmer.tsx', 'ui/components/effects/TextScramble.tsx', 'ui/styles/effects.css']}
      lead="Text that tells you something is happening — without spinners. Every effect here moves only colour or transform, so a long stream stays cheap on a phone.">
      <Demo title="Shimmer" description="A working label: a bright copy sweeps across under a moving band; text stays put." controls={{ label: text('Searching your notes…'), speed: range(0.8, 3, 1.5, 0.1, 's'), size: select(['small', 'body', 'title'] as const, 'body') }}
        code={(v) => `<Shimmer speed={${v.speed}}>${v.label}</Shimmer>`}>
        {(v) => <Shimmer speed={v.speed} className={{ small: 'text-[13px]', body: 'text-body', title: 'text-title font-light' }[v.size]}>{v.label}</Shimmer>}
      </Demo>
      <Demo title="Streaming words" description="Each word arrives by colour (word-in), not blur — a blur would make every word its own GPU layer. The caret marks the live end." controls={{ interval: range(30, 200, 70, 10, 'ms') }}
        code={`{words.map((w, i) => <span key={i} className="word-in">{w} </span>)}\n{streaming && <span className="caret" />}`}>
        {(v) => <Stream speed={v.interval} />}
      </Demo>
      <DocSection title="Glow ink and decode">
        <Grid cols={2}>
          <Tile label=".text-glow — one hero word per screen"><span className="display text-[44px]">Light is <span className="text-glow">content</span>.</span></Tile>
          <Tile label="TextScramble — a value that changes meaning">
            <div className="flex flex-col items-center gap-3">
              <TextScramble text={code} className="font-mono text-title tracking-[.12em] text-bright" />
              <Button size="xs" variant="ghost" onClick={() => setCode(`NH-${Math.floor(1000 + Math.random() * 9000)}`)}>New code</Button>
            </div>
          </Tile>
        </Grid>
      </DocSection>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'Shimmer the label of what is running ("Searching mail…").', dont: 'Shimmer static headings — motion says "wait".' },
          { do: 'Decode for codes, statuses, a reveal.', dont: 'Decode body text — it makes reading impossible.' },
        ]} />
        <Why><p>The old shimmer swept a gradient across the text: the text repainted every frame as long as the assistant worked. Now a band and its text move in opposite directions with transforms — the text never repaints.</p></Why>
        <Usage code={`<Shimmer>Working…</Shimmer>\n<span className="word-in">{word} </span>\n<span className="caret" />\n<span className="text-glow">content</span>\n<TextScramble text={status} />`} />
      </DocSection>
    </Doc>
  );
}
