import { CalendarDays, CheckSquare, ChevronLeft, FolderOpen, Hourglass, LayoutGrid, ListChecks, MessageCircle, PenSquare } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { AgentTrace } from '@ui/components/ai/AgentTrace';
import { ChangePills, type Change } from '@ui/components/ai/ChangePill';
import { Composer, ComposerDock } from '@ui/components/ai/Composer';
import { AssistantMessage, ChatDivider, MessageActions, UserBubble, type Feedback } from '@ui/components/ai/Message';
import { ModelPill } from '@ui/components/ai/ModelPill';
import { SourceCards } from '@ui/components/ai/Sources';
import { StreamingText } from '@ui/components/ai/StreamingText';
import { TabBar } from '@ui/components/layout/TabBar';
import { Surface } from '@ui/lib/surface';
import { cn } from '@ui/lib/cn';
import { bool, Demo, select } from '../../kit/Demo';
import { Doc, DocSection, Rules, Why } from '../../kit/Doc';
import { Phone } from '../../kit/Phone';
import { ANSWER, MODELS, QUESTION, RUN, SOURCES } from './_content';
import { useFakeStream, useScriptedRun } from './_sim';

export default function ChatScreenPage() {
  return (
    <Doc eyebrow="AI & Chat · Recipe" title="Chat screen" source="site/pages/ai/ChatScreen.tsx"
      lead="Everything together: a floating header, the conversation as a document, an honest trace, a streamed answer with sources and undoable changes, and the composer docked above the tab bar. Type a follow-up — it runs again.">
      <Demo title="Phone" minHeight={780} padded={false} controls={{ tabbar: bool(true) }} code={USAGE}>
        {(v) => <div className="w-full py-8"><Phone maxHeight={740}><ChatScreen tabbar={v.tabbar} /></Phone></div>}
      </Demo>

      <DocSection title="Desktop" description="Same screen in a wide pane: the column caps at 720px, the composer centres under it, no tab bar.">
        <Demo minHeight={720} padded={false} controls={{ width: select(['pane', 'full'] as const, 'full') }}>
          {(v) => (
            <div className={cn('mx-auto my-6 h-[680px] w-full overflow-hidden rounded-card border border-line-2 bg-bg [transform:translateZ(0)]', v.width === 'pane' ? 'max-w-[560px]' : 'max-w-[1000px]')}
              style={{ ['--tabbar-space' as string]: '0px', ['--safe-top' as string]: '0px', ['--safe-bottom' as string]: '0px' } as CSSProperties}>
              <Surface mode={v.width === 'pane' ? 'phone' : 'desktop'}><ChatScreen tabbar={false} /></Surface>
            </div>
          )}
        </Demo>
      </DocSection>

      <DocSection title="How it is put together">
        <Rules items={[
          { do: 'One scroller for the conversation; header and composer float above it, the content fades under both.', dont: 'Give the header a solid bar and a hairline — it cuts the screen in two.' },
          { do: 'Pad the scroller bottom by the dock height, so the last line can scroll above the composer.', dont: 'Let the last answer hide under the composer or the tab bar.' },
          { do: 'Stick to the bottom while streaming unless the user scrolled up to read.', dont: 'Yank the view down on every token while someone reads further up.' },
        ]} />
        <Why><p>This screen is a recipe, not a component: chats differ too much in data and routing. It lives in <code>site/pages/ai/ChatScreen.tsx</code> — copy it as a starting point and wire <code>onSend</code>, the trace events and the stream to your backend.</p></Why>
      </DocSection>
    </Doc>
  );
}

const USAGE = `<div className="relative h-full">
  <ChatHeader />                       {/* floating, fades content under it */}
  <div className="scroller h-full" style={{ paddingBottom: 'calc(var(--tabbar-space) + 96px)' }}>
    <UserBubble>{question}</UserBubble>
    <AssistantMessage
      header={<AgentTrace steps={steps} working={working} thinking={thoughts} isThinking={isThinking} />}
      footer={<><SourceCards sources={sources} /><ChangePills changes={changes} onUndo={undo} /><MessageActions text={answer} /></>}
    >
      <StreamingText text={answer} live={streaming} sources={sources} />
    </AssistantMessage>
  </div>
  <ComposerDock><Composer onSend={ask} busy={working} onStop={stop} onVoice={openVoice} /></ComposerDock>
  <TabBar items={tabs} value="luna" onChange={go} />
</div>`;

const TABS = [
  { id: 'luna', label: 'Luna', Icon: MessageCircle },
  { id: 'plan', label: 'Plan', Icon: ListChecks, badge: true },
  { id: 'files', label: 'Files', Icon: FolderOpen },
  { id: 'screen', label: 'Screen', Icon: Hourglass },
  { id: 'more', label: 'More', Icon: LayoutGrid },
];

interface Turn { q: string; key: number }

function ChatScreen({ tabbar }: { tabbar: boolean }) {
  const [turns, setTurns] = useState<Turn[]>([{ q: QUESTION, key: 0 }]);
  const [model, setModel] = useState('smart');
  const [tab, setTab] = useState('luna');
  const scroller = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  return (
    <div className="@container relative h-full bg-bg">
      {/* Floating header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20" style={{ paddingTop: 'var(--safe-top)' }}>
        {scrolled && <div className="top-fade top-fade-solid fade-in" />}
        <div className="relative mx-auto flex h-[56px] max-w-[760px] items-center gap-2 px-3">
          <button type="button" aria-label="Chats" className="pointer-events-auto pressable grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-fill-2"><ChevronLeft size={22} strokeWidth={1.8} /></button>
          <div className="pointer-events-auto min-w-0 flex-1"><ModelPill models={MODELS} value={model} onChange={setModel} /></div>
          <button type="button" aria-label="New chat" className="pointer-events-auto pressable grid h-10 w-10 place-items-center rounded-full border border-white/[.12] bg-fill-3 text-bright"><PenSquare size={17} /></button>
        </div>
      </div>

      <div ref={scroller} onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)} className="scroller page-scroll h-full"
        style={{ paddingTop: 'calc(var(--safe-top) + 64px)', paddingBottom: 'calc(var(--tabbar-space) + 110px)' }}>
        <div className="mx-auto max-w-[720px] space-y-6 px-4">
          <ChatDivider>Today · 17:26</ChatDivider>
          {turns.map((t, i) => <TurnView key={t.key} q={t.q} scroller={scroller} first={i === 0} />)}
        </div>
      </div>

      <ComposerDock>
        <Composer placeholder="Ask Luna" onVoice={() => {}} onSend={(text) => { if (!text) return false; setTurns((ts) => [...ts, { q: text, key: ts.length }]); }} />
      </ComposerDock>
      {tabbar && <TabBar items={TABS} value={tab} onChange={setTab} />}
    </div>
  );
}

function TurnView({ q, scroller, first }: { q: string; scroller: React.RefObject<HTMLDivElement | null>; first: boolean }) {
  const run = useScriptedRun(RUN, { speed: first ? 1 : 1.6 });
  const stream = useFakeStream(ANSWER, { autoplay: false, speed: 1.3 });
  const [fb, setFb] = useState<Feedback>(null);
  const [changes, setChanges] = useState<Change[]>([
    { id: 'a', label: 'Blocked 17:25 – 17:55', Icon: CalendarDays },
    { id: 'b', label: 'History reading → tomorrow', Icon: CheckSquare },
  ]);
  const stickRef = useRef(true);
  // The answer starts streaming when the run emits it.
  useEffect(() => { if (run.answer) stream.play(); }, [run.answer]); // eslint-disable-line react-hooks/exhaustive-deps
  // Stay at the bottom while content grows — unless the reader scrolled up.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => { stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [scroller]);
  useEffect(() => { const el = scroller.current; if (el && stickRef.current) el.scrollTop = el.scrollHeight; });

  const working = run.working || stream.live;
  const done = !working && stream.done;
  return (
    <>
      <UserBubble animate={!first}>{q}</UserBubble>
      <AssistantMessage
        header={<AgentTrace steps={run.steps} working={run.working} thinking={run.thinking} isThinking={run.isThinking} seconds={run.seconds} />}
        footer={done ? (
          <>
            <SourceCards sources={SOURCES} />
            <ChangePills changes={changes} onUndo={(id) => setChanges((c) => c.map((x) => (x.id === id ? { ...x, undone: true } : x)))} onRedo={(id) => setChanges((c) => c.map((x) => (x.id === id ? { ...x, undone: false } : x)))} />
            <MessageActions text={ANSWER} onRetry={() => { run.play(); }} feedback={fb} onFeedback={setFb} meta="Smart · 3 sources" />
          </>
        ) : undefined}
      >
        {(run.answer || stream.text) && <StreamingText text={stream.text} live={stream.live} sources={SOURCES} />}
      </AssistantMessage>
    </>
  );
}
