import { Play, RotateCcw, Square } from 'lucide-react';
import { useState } from 'react';
import { AssistantMessage, ChatDivider, MessageActions, UserBubble, type Feedback } from '@ui/components/ai/Message';
import { StreamingText } from '@ui/components/ai/StreamingText';
import { SourceCards } from '@ui/components/ai/Sources';
import { Button } from '@ui/components/core/Button';
import { bool, Demo, range } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Usage, Why } from '../../kit/Doc';
import { ANSWER, QUESTION, SOURCES } from './_content';
import { useFakeStream } from './_sim';

const LONG = `Here is the full lab protocol from Tuesday so you can check my numbers:\n\n1. Pendulum length 0.82 m, 20 swings, 36.4 s\n2. Length 0.64 m, 20 swings, 32.1 s\n3. Length 0.50 m, 20 swings, 28.5 s\n4. Length 0.36 m, 20 swings, 24.0 s\n5. Length 0.25 m, 20 swings, 20.1 s\n\nI think g comes out at 9.7 but the third row looks off. Also the teacher said we should plot T² against L instead of T against L — can you explain why that is better?`;

export default function MessagesPage() {
  const [fb, setFb] = useState<Feedback>(null);
  return (
    <Doc eyebrow="AI & Chat" title="Messages & streaming" source={['ui/components/ai/Message.tsx', 'ui/components/ai/StreamingText.tsx', 'ui/components/ai/stream.ts']}
      lead="The user speaks in a bubble; the assistant does not — its answer is text on the page, like a document. Words arrive by colour, one by one, and nothing above the caret ever moves.">
      <StreamDemo />

      <DocSection title="The conversation" description="Bubble with a tail on the right, answer without chrome on the left, a quiet action row under it. Long user messages fold with a fade and open on tap.">
        <Demo minHeight={520} center={false} code={`<UserBubble time="17:26">${QUESTION}</UserBubble>\n<AssistantMessage footer={<MessageActions text={answer} onRetry={retry} feedback={fb} onFeedback={setFb} meta="Smart · 2.1s" />}>\n  <StreamingText text={answer} sources={sources} />\n</AssistantMessage>`}>
          {() => (
            <div className="mx-auto w-full max-w-[640px] space-y-6">
              <ChatDivider>Today</ChatDivider>
              <UserBubble time="17:26">{QUESTION}</UserBubble>
              <AssistantMessage footer={<><SourceCards sources={SOURCES} /><MessageActions text={ANSWER} onRetry={() => {}} onSpeak={() => {}} feedback={fb} onFeedback={setFb} meta="Smart · 2.1s · 3 sources" /></>}>
                <StreamingText text={ANSWER} sources={SOURCES} />
              </AssistantMessage>
              <UserBubble>{LONG}</UserBubble>
            </div>
          )}
        </Demo>
      </DocSection>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'Let text only grow at the end. Lists, bold and citations render as they stream — no reflow when the message completes.', dont: 'Swap a streaming plain-text block for a rendered markdown block at the end — everything jumps once more.' },
          { do: 'Fade words in by colour (.word-in). It costs nothing on the GPU.', dont: 'Blur words in: every word becomes its own layer — on a phone that was ⅔ of the streaming cost.' },
          { do: 'Smooth bursts into a word-by-word flow (useSmoothText): calm with slow models, catching up fast with quick ones.', dont: 'Print chunks as they arrive — whole clauses pop in at once.' },
          { do: 'Keep meta (model, time, sources) in the action row: it is how people decide to trust an answer.', dont: 'Put the assistant’s answer in a bubble. It reads like a chat toy, and long answers get cramped.' },
        ]} />
        <Why>
          <p><code>useSmoothText</code> releases text so a backlog drains in about a quarter second but never slower than reading pace, always to the end of a word. Unclosed <code>**</code> or backticks are held back while streaming, so raw symbols never flash.</p>
          <p>Words are keyed by their global index: when the next burst arrives only the new words mount, so only they animate. Once <code>live</code> ends, the words collapse into plain text nodes — no visual change, fewer DOM nodes for long histories.</p>
        </Why>
      </DocSection>

      <DocSection title="API">
        <Usage code={`const [text, setText] = useState('');\n// append deltas from your stream: setText((t) => t + delta)\n\n<AssistantMessage\n  header={<AgentTrace steps={steps} working={working} />}\n  footer={<MessageActions text={text} onRetry={retry} meta="Smart · 2.1s" />}\n>\n  <StreamingText text={text} live={working} sources={sources} />\n</AssistantMessage>`} />
        <Props rows={[
          { name: 'StreamingText.text', type: 'string', description: 'The text so far — just keep appending.' },
          { name: 'StreamingText.live', type: 'boolean', default: 'false', description: 'Streaming: smooth, animate new words, show the caret.' },
          { name: 'StreamingText.sources', type: 'Source[]', description: '[n] in the text becomes a citation with a hover preview of sources[n-1].' },
          { name: 'StreamingText.smooth / caret', type: 'boolean', default: 'true', description: 'Turn off the smoothing buffer or the caret.' },
          { name: 'UserBubble.clip', type: 'number', default: '176', description: 'Height in px before a long message folds.' },
          { name: 'MessageActions', type: '{ text, onRetry, onSpeak, feedback, onFeedback, meta, extra }', description: 'Each action appears only if its handler is given.' },
        ]} />
      </DocSection>
    </Doc>
  );
}

function StreamDemo() {
  return (
    <Demo title="Streaming playground" minHeight={360} center={false}
      controls={{ speed: range(0.25, 3, 1, 0.25, '×'), smooth: bool(true), caret: bool(true), citations: bool(true) }}
      code={(v) => `<StreamingText text={text} live={streaming}${v.smooth ? '' : ' smooth={false}'}${v.caret ? '' : ' caret={false}'}${v.citations ? ' sources={sources}' : ''} />`}>
      {(v) => <Player key={v.speed} speed={v.speed} smooth={v.smooth} caret={v.caret} citations={v.citations} />}
    </Demo>
  );
}

function Player({ speed, smooth, caret, citations }: { speed: number; smooth: boolean; caret: boolean; citations: boolean }) {
  const s = useFakeStream(citations ? ANSWER : ANSWER.replace(/ \[\d\]/g, ''), { speed });
  return (
    <div className="mx-auto w-full max-w-[620px]">
      <div className="mb-5 flex items-center gap-2">
        {s.live ? <Button size="xs" variant="ghost" Icon={Square} onClick={s.stop}>Stop</Button> : <Button size="xs" variant="ghost" Icon={s.done ? RotateCcw : Play} onClick={s.play}>{s.done ? 'Replay' : 'Play'}</Button>}
        <span className="font-mono text-tiny text-faint tabular">{s.text.length} / {ANSWER.length} chars{s.live ? ' · live' : ''}</span>
      </div>
      <StreamingText text={s.text} live={s.live} smooth={smooth} caret={caret} sources={citations ? SOURCES : undefined} />
    </div>
  );
}
