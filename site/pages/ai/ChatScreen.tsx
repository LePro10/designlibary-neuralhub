import { AnimatePresence, motion } from 'motion/react';
import { CalendarDays, CheckSquare, ChevronLeft, FolderOpen, Hourglass, ListChecks, Mail, MessageCircle, PenSquare, StickyNote, TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { AgentTrace } from '@ui/components/ai/AgentTrace';
import { ChangePills, type Change } from '@ui/components/ai/ChangePill';
import { Composer, ComposerDock } from '@ui/components/ai/Composer';
import { AssistantMessage, ChatDivider, MessageActions, UserBubble, type Feedback } from '@ui/components/ai/Message';
import { ModelPill } from '@ui/components/ai/ModelPill';
import { SourceCards } from '@ui/components/ai/Sources';
import { StreamingText } from '@ui/components/ai/StreamingText';
import { TabBar, type TabItem } from '@ui/components/layout/TabBar';
import { IconButton } from '@ui/components/core/Button';
import { LogoLoader } from '@ui/components/effects/LogoLoader';
import { SPRING } from '@ui/lib/motion';
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
      lead="Everything together: a floating header where the mark works while Luna does, the conversation as a document, an honest trace, a streamed answer with sources and undoable changes, and the composer docked above the tab bar. Send a follow-up, or stop a reply mid-way.">
      <Demo title="Phone" minHeight={780} padded={false} controls={{ tabbar: bool(true) }} code={USAGE}>
        {(v) => <div className="w-full py-8"><Phone maxHeight={740}><ChatScreen tabbar={v.tabbar} /></Phone></div>}
      </Demo>

      <DocSection title="Desktop" description="Same screen in a wide pane: the column caps at 720px, the composer centres under it, no tab bar.">
        <Demo minHeight={720} padded={false} controls={{ width: select(['pane', 'full'] as const, 'full') }} background="plain">
          {(v) => (
            <div className={cn('mx-auto my-6 h-[680px] w-full overflow-hidden surface rounded-card bg-bg [transform:translateZ(0)]', v.width === 'pane' ? 'max-w-[560px]' : 'max-w-[1000px]')}
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
        <Why><p>While Luna works, the composer's send button turns into stop with a thin running ring, and the header's new-chat button gives way to the mark at work — two quiet signals in the two places your eyes already are. Nothing else on the screen moves.</p><p>This screen is a recipe, not a component: chats differ too much in data and routing. It lives in <code>site/pages/ai/ChatScreen.tsx</code> — copy it as a starting point and wire <code>onSend</code>, the trace events and the stream to your backend.</p></Why>
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
  <ComposerDock><Composer onSend={ask} busy={working} onStop={stop} onVoice={openVoice} /></ComposerDock>  {/* send ⇄ stop morph */}
  <TabBar items={tabs} value="luna" onChange={go} />
</div>`;

const TABS: TabItem[] = [
  { id: 'luna', label: 'Luna', Icon: MessageCircle, signal: 'periwinkle' },
  { id: 'plan', label: 'Plan', Icon: ListChecks, badge: true, signal: 'amber' },
  { id: 'files', label: 'Files', Icon: FolderOpen, signal: 'teal' },
  { id: 'screen', label: 'Screen', Icon: Hourglass, signal: 'coral' },
];
const MORE_TABS: TabItem[] = [
  { id: 'mail', label: 'Mail', Icon: Mail, place: 'mail' },
  { id: 'notes', label: 'Notes', Icon: StickyNote, place: 'notes' },
  { id: 'progress', label: 'Progress', Icon: TrendingUp, place: 'progress' },
];

interface Turn { q: string; key: number }

function ChatScreen({ tabbar }: { tabbar: boolean }) {
  const [turns, setTurns] = useState<Turn[]>([{ q: QUESTION, key: 0 }]);
  const [model, setModel] = useState('smart');
  const [tab, setTab] = useState('luna');
  const [busy, setBusy] = useState(false);
  const stopRef = useRef<() => void>(() => {});
  const scroller = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const last = turns.length - 1;
  return (
    <div data-signal="periwinkle" className="@container relative h-full bg-bg">
      {/* Floating header: no bar, no hairline — content fades under it once scrolled. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20" style={{ paddingTop: 'var(--safe-top)' }}>
        <AnimatePresence>{scrolled && <motion.div key="fade" className="top-fade top-fade-solid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} />}</AnimatePresence>
        <div className="relative mx-auto flex h-[52px] max-w-[720px] items-center gap-1 px-2.5">
          <span className="pointer-events-auto"><IconButton variant="ghost" label="Chats"><ChevronLeft size={19} strokeWidth={1.75} /></IconButton></span>
          <div className="pointer-events-auto flex min-w-0 flex-1 items-center justify-center gap-2">
            <ModelPill models={MODELS} value={model} onChange={setModel} align="center" />
          </div>
          {/* Same width as the back button, so the pill stays centred; the mark works while Luna does. */}
          <div className="pointer-events-auto flex w-9 justify-end">
            <AnimatePresence mode="popLayout" initial={false}>
              {busy ? (
                <motion.span key="busy" className="grid h-9 w-9 place-items-center text-ink" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.12 } }} transition={SPRING.pop}>
                  <LogoLoader size={18} label="Luna is working" />
                </motion.span>
              ) : (
                <motion.span key="new" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.12 } }} transition={SPRING.pop}>
                  <IconButton label="New chat"><PenSquare size={15} strokeWidth={1.7} /></IconButton>
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div ref={scroller} onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)} className="scroller page-scroll h-full"
        style={{ paddingTop: 'calc(var(--safe-top) + 56px)', paddingBottom: 'calc(var(--tabbar-space) + 92px)' }}>
        <div className="mx-auto max-w-[680px] space-y-5 px-4">
          <ChatDivider>Today · 17:26</ChatDivider>
          {turns.map((t, i) => (
            <TurnView key={t.key} q={t.q} scroller={scroller} first={i === 0}
              onWorking={i === last ? setBusy : undefined} stopRef={i === last ? stopRef : undefined} />
          ))}
        </div>
      </div>

      <ComposerDock>
        <Composer placeholder="Ask Luna" onVoice={() => {}} busy={busy} onStop={() => stopRef.current()}
          onSend={(text) => { if (!text) return false; setTurns((ts) => [...ts, { q: text, key: ts.length }]); }} />
      </ComposerDock>
      {tabbar && <TabBar items={TABS} more={MORE_TABS} value={tab} onChange={setTab} />}
    </div>
  );
}

function TurnView({ q, scroller, first, onWorking, stopRef }: {
  q: string; scroller: React.RefObject<HTMLDivElement | null>; first: boolean;
  onWorking?: (w: boolean) => void; stopRef?: React.RefObject<() => void>;
}) {
  const run = useScriptedRun(RUN, { speed: first ? 1 : 1.6 });
  const stream = useFakeStream(ANSWER, { autoplay: false, speed: 1.3 });
  const [fb, setFb] = useState<Feedback>(null);
  const [stopped, setStopped] = useState(false);
  const [changes, setChanges] = useState<Change[]>([
    { id: 'a', label: 'Blocked 17:25 – 17:55', Icon: CalendarDays },
    { id: 'b', label: 'History reading → tomorrow', Icon: CheckSquare },
  ]);
  const stickRef = useRef(true);
  // The answer starts streaming when the run emits it.
  useEffect(() => { if (run.answer && !stopped) stream.play(); }, [run.answer]); // eslint-disable-line react-hooks/exhaustive-deps
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
  useEffect(() => { onWorking?.(working); }, [working, onWorking]);
  useEffect(() => {
    if (!stopRef) return;
    stopRef.current = () => { setStopped(true); run.stop(); stream.stop(); };
  }); // eslint-disable-line react-hooks/exhaustive-deps
  const done = !working && (stream.done || stopped);
  return (
    <>
      <UserBubble animate={!first}>{q}</UserBubble>
      <AssistantMessage
        header={<AgentTrace steps={run.steps} working={run.working} thinking={run.thinking} isThinking={run.isThinking} seconds={run.seconds} stopped={stopped && !stream.text} />}
        footer={done && !stopped ? (
          <>
            <SourceCards sources={SOURCES} />
            <ChangePills changes={changes} onUndo={(id) => setChanges((c) => c.map((x) => (x.id === id ? { ...x, undone: true } : x)))} onRedo={(id) => setChanges((c) => c.map((x) => (x.id === id ? { ...x, undone: false } : x)))} />
            <MessageActions text={ANSWER} onRetry={() => { setStopped(false); run.play(); }} feedback={fb} onFeedback={setFb} meta="Smart · 3 sources" />
          </>
        ) : done && stopped ? <MessageActions text={stream.text} onRetry={() => { setStopped(false); run.play(); }} meta="Stopped" /> : undefined}
      >
        {(run.answer || stream.text) && <StreamingText text={stream.text} live={stream.live} sources={SOURCES} />}
      </AssistantMessage>
    </>
  );
}
