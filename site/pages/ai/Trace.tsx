import { CalendarDays, Mail, RotateCcw, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AgentTrace, StatusLine } from '@ui/components/ai/AgentTrace';
import { ThinkingIndicator } from '@ui/components/ai/Thinking';
import { ToolCallCard, type ToolState } from '@ui/components/ai/ToolCallCard';
import { Button } from '@ui/components/core/Button';
import { bool, Demo, range, select } from '../../kit/Demo';
import { Doc, DocSection, Grid, Props, Rules, Tile, Usage, Why } from '../../kit/Doc';
import { RUN } from './_content';
import { useScriptedRun } from './_sim';

export default function TracePage() {
  return (
    <Doc eyebrow="AI & Chat" title="Agent trace & tools" source={['ui/components/ai/AgentTrace.tsx', 'ui/components/ai/ToolCallCard.tsx', 'ui/components/ai/Thinking.tsx']}
      lead="Show what the assistant is doing — from real events, never from a fake progress bar. Collapsed by default, one line that tells the truth; a tap opens the full timeline.">
      <Demo title="A real run, replayed" minHeight={340} center={false}
        description="The script emits the same events a model would: thinking deltas, a status line, tools starting and finishing in parallel. The header follows them; each label holds ≥ 650 ms so fast models don’t flicker."
        controls={{ speed: range(0.5, 2, 1, 0.25, '×'), thoughts: bool(true), expanded: bool(false) }}
        code={(v) => `<AgentTrace steps={steps} working={working}${v.thoughts ? ' thinking={thoughts} isThinking={thinkingNow}' : ''} seconds={elapsed}${v.expanded ? ' defaultOpen' : ''} />`}>
        {(v) => <Run key={`${v.speed}-${v.expanded}`} speed={v.speed} thoughts={v.thoughts} expanded={v.expanded} />}
      </Demo>

      <DocSection title="Status line" description="Just the header — for a chat header, a voice screen, a notification row.">
        <Demo minHeight={140}>{() => <StatusDemo />}</Demo>
      </DocSection>

      <DocSection title="Thinking indicators" description="Pick by what you know. The mark at work for the assistant itself (default); a label when you know what is happening; dots when you only know that something is; pulse while waiting for a signal from elsewhere.">
        <Grid cols={3}>
          <Tile label="mark — the assistant works (default)"><ThinkingIndicator label="Working" /></Tile>
          <Tile label="shimmer — a known step"><ThinkingIndicator variant="shimmer" label="Reading your calendar" /></Tile>
          <Tile label="dots — something is happening"><ThinkingIndicator variant="dots" /></Tile>
          <Tile label="pulse — waiting for a signal"><div data-signal="periwinkle"><ThinkingIndicator variant="pulse" label="Waiting for phone" /></div></Tile>
          <Tile label="orb — only where the orb is the face"><ThinkingIndicator variant="orb" label="Listening" /></Tile>
        </Grid>
      </DocSection>

      <DocSection title="Tool call card" description="For tools that matter to the user (sending, booking, changing data) — a first-class event: announced, live while running, result inline, errors in plain words with Retry.">
        <Demo minHeight={300}
          controls={{ state: select(['announce', 'running', 'done', 'error'] as const, 'running'), cycle: bool(false) }}
          code={(v) => `<ToolCallCard\n  name="Search calendar"\n  Icon={CalendarDays}\n  state="${v.state}"\n  input="free evenings · next 7 days"\n  status="Reading 3 of 12 events"\n  result={<FreeSlots />}\n  ms={1240}\n  onRetry={retry}\n/>`}>
          {(v) => <ToolDemo state={v.state} cycle={v.cycle} />}
        </Demo>
      </DocSection>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'Derive every label from an event: tool started, tool finished, status emitted.', dont: 'Rotate “Analyzing… Synthesizing… Almost there…” on a timer. People notice, and then they stop believing any status.' },
          { do: 'Keep the trace collapsed while working — one honest line. Open it on tap.', dont: 'Stream a log of every tool call into the answer area. The answer moves down every second.' },
          { do: 'Give fast tools no card — a timeline row is enough. Cards are for actions with consequences.', dont: 'Show a spinner with no words for anything longer than a second.' },
          { do: 'On Stop, end running steps as “Stopped” and keep what was done.', dont: 'Throw away the partial answer when the user stops.' },
        ]} />
        <Why>
          <p>Status lines change as fast as the model calls tools — on quick models every 100 ms. <code>useStable</code> holds each label for at least 650 ms while working and shows the final state at once. Thoughts linger 900 ms after the last thinking delta, so the window doesn’t snap shut between two tool calls.</p>
          <p>Label swaps use a 2px blur on a single short text: cheap. Everything that changes height animates height, so the answer below never jumps. The mark at work replaces the glowing orb in the trace: it says “Luna” without adding a second source of light to the screen.</p>
        </Why>
      </DocSection>

      <DocSection title="API">
        <Usage code={`// steps come from your event stream\nconst steps: TraceStep[] = [\n  { id: 's1', kind: 'status', label: 'Checking what is due', state: 'done' },\n  { id: 'cal', label: 'Calendar', detail: 'today 17:00–19:00', Icon: CalendarDays, state: 'running' },\n];\n\n<AgentTrace steps={steps} working thinking={thoughts} isThinking={lastDeltaWasThinking} seconds={elapsed} />`} />
        <Props rows={[
          { name: 'steps', type: 'TraceStep[]', description: '{ id, kind?: "tool" | "status", label, detail?, Icon?, state: "running" | "done" | "error" | "waiting", ms? }' },
          { name: 'working', type: 'boolean', description: 'The run is active (mark at work + shimmer). Off: summary “Used 3 tools · 4.2s”.' },
          { name: 'thinking / isThinking', type: 'string / boolean', description: 'Reasoning text, and whether the latest delta was reasoning (shows the live window).' },
          { name: 'stopped', type: 'boolean', description: 'Ended by the user — header says “Stopped”.' },
          { name: 'traceLabel()', type: 'fn', description: 'The header logic, exported for status bars elsewhere.' },
        ]} />
      </DocSection>
    </Doc>
  );
}

function Run({ speed, thoughts, expanded }: { speed: number; thoughts: boolean; expanded: boolean }) {
  const r = useScriptedRun(RUN, { speed });
  return (
    <div className="mx-auto w-full max-w-[620px]">
      <div className="mb-5 flex items-center gap-2">
        {r.working ? <Button size="xs" variant="ghost" Icon={Square} onClick={r.stop}>Stop</Button> : <Button size="xs" variant="ghost" Icon={RotateCcw} onClick={r.play}>Replay</Button>}
      </div>
      <AgentTrace steps={r.steps} working={r.working} thinking={thoughts ? r.thinking : undefined} isThinking={r.isThinking} seconds={r.seconds} stopped={!r.working && !r.answer} defaultOpen={expanded} />
      {r.answer && <p className="fade-in text-body leading-relaxed text-ink">You have <strong className="font-medium text-bright">34 minutes</strong> until gym — enough for one focused block…</p>}
    </div>
  );
}

function StatusDemo() {
  const labels = ['Checking what is due', 'Searching mail from Anna', 'Reading the school portal', 'Done — 3 things found'];
  const [i, setI] = useState(0);
  useEffect(() => { const t = window.setInterval(() => setI((x) => (x + 1) % labels.length), 1400); return () => window.clearInterval(t); }, [labels.length]);
  return <StatusLine label={labels[i]} working={i < labels.length - 1} />;
}

const CYCLE: ToolState[] = ['announce', 'running', 'done', 'error'];
function ToolDemo({ state, cycle }: { state: ToolState; cycle: boolean }) {
  const [k, setK] = useState(0);
  useEffect(() => { if (!cycle) return; const t = window.setInterval(() => setK((x) => x + 1), 2200); return () => window.clearInterval(t); }, [cycle]);
  const s = cycle ? CYCLE[k % 4] : state;
  return (
    <div className="w-full max-w-[460px] space-y-3">
      <ToolCallCard name="Search calendar" Icon={CalendarDays} state={s} input="free evenings · next 7 days" status="Reading 3 of 12 events" ms={1240}
        error="Calendar didn’t answer in 10s" onRetry={() => setK((x) => x + 1)}
        result={<div className="space-y-1.5">{[['Tue', '19:00 – 21:30'], ['Thu', '18:30 – 22:00'], ['Sun', 'all evening']].map(([d, t]) => <div key={d} className="flex justify-between"><span className="text-dim">{d}</span><span className="tabular text-bright">{t}</span></div>)}</div>} />
      <ToolCallCard name="Draft reply to Anna" Icon={Mail} state="done" input="re: Saturday? · 2 lines" ms={640} defaultOpen={false} result={<p>“Yes, I’m in for Saturday — see you at 2!”</p>} />
    </div>
  );
}
