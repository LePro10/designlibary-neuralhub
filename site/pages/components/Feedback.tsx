import { FolderOpen, RotateCw, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Callout, Empty, Kbd, Skeleton, SkeletonRow, SkeletonText, Spinner, StatusDot } from '@ui/components/core/Feedback';
import { Button } from '@ui/components/core/Button';
import { List } from '@ui/components/core/List';
import type { Tone } from '@ui/components/core/Chips';
import { Shimmer } from '@ui/components/effects/Shimmer';
import { bool, Demo, select } from '../../kit/Demo';
import { Doc, DocSection, Grid, Rules, Tile, Why } from '../../kit/Doc';

export default function FeedbackPage() {
  return (
    <Doc eyebrow="Components" title="States" source="ui/components/core/Feedback.tsx"
      lead="Loading, empty, error and live are part of the feature, not an afterthought. The dashboard had five skeleton styles and six spinner speeds; here there is one of each, plus a shimmer for “working”.">
      <DocSection title="Loading" description="Skeletons mirror the final shape so nothing jumps when data lands. The sweep is a transform — no repaint, and it pauses in rest mode.">
        <Demo controls={{ state: select(['loading', 'loaded'] as const) }} center={false} code={`{loading ? <SkeletonRow /> : <Row … />}\n<SkeletonText lines={3} />`}>
          {(v) => <LoadDemo loaded={v.state === 'loaded'} />}
        </Demo>
        <Grid cols={3}>
          <Tile label="Spinner — inline, short waits"><div className="flex items-center gap-4"><Spinner size={14} /><Spinner /><Spinner size={22} /></div></Tile>
          <Tile label="Shimmer — something is working"><Shimmer>Searching your mail…</Shimmer></Tile>
          <Tile label="Skeleton blocks"><div className="w-full space-y-2"><Skeleton className="h-24 !rounded-stat" /><div className="flex gap-2"><Skeleton className="h-8 flex-1 !rounded-full" /><Skeleton className="h-8 w-16 !rounded-full" /></div></div></Tile>
        </Grid>
      </DocSection>

      <DocSection title="Empty" description="An icon, one sentence, one detail, one way forward.">
        <Demo controls={{ action: bool(true), card: bool(true) }} code={`<Empty Icon={FolderOpen} title="No files yet" detail="Drop files here or upload from your phone." action={<Button size="sm">Upload</Button>} />`}>
          {(v) => <div className="w-full max-w-[460px]"><Empty bare={!v.card} Icon={FolderOpen} title="No files yet" detail="Drop files here or upload from your phone." action={v.action ? <Button size="sm" variant="ghost">Upload</Button> : undefined} /></div>}
        </Demo>
      </DocSection>

      <DocSection title="Callouts" description="Errors keep what you typed and offer the next step. Tones match the pills.">
        <Demo controls={{ tone: select(['danger', 'warning', 'success', 'accent', 'neutral'] as const), action: bool(true) }} center={false}
          code={(v) => `<Callout tone="${v.tone}" title="…"${v.action ? ' action={<Button size="xs" variant="ghost">Retry</Button>}' : ''}>…</Callout>`}>
          {(v) => <div className="mx-auto max-w-[520px]"><Callout tone={v.tone as Tone} title={TEXT[v.tone][0]} action={v.action ? <Button size="xs" variant="ghost" Icon={RotateCw}>Retry</Button> : undefined}>{TEXT[v.tone][1]}</Callout></div>}
        </Demo>
      </DocSection>

      <DocSection title="Status dots" description="Quiet by default; glow when it matters; pulse when it is happening right now.">
        <Grid cols={4}>
          <Tile label="success · glow"><StatusDot tone="success" glow /></Tile>
          <Tile label="ember · glow"><StatusDot tone="ember" glow /></Tile>
          <Tile label="live · pulse"><StatusDot tone="live" pulse /></Tile>
          <Tile label="neutral"><StatusDot tone="neutral" /></Tile>
        </Grid>
      </DocSection>

      <DocSection title="Offline" description="A whole-screen state (from the dashboard's offline overlay): the light dims, the logo's dot breathes while reconnecting, one big button.">
        <Demo center={false} padded={false} minHeight={360}>{() => <OfflineDemo />}</Demo>
      </DocSection>

      <DocSection title="Keyboard hints"><Grid cols={4}><Tile label="Kbd"><div className="flex gap-1"><Kbd>⌘</Kbd><Kbd>K</Kbd></div></Tile></Grid></DocSection>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'Delay a loading indicator ~400ms; fast loads should not flash.', dont: 'Show “3 open tasks” as placeholder data. Real data or a description.' },
          { do: 'Errors say what happened and what to do, with Retry.', dont: 'Swallow an error and leave stale data looking fresh.' },
        ]} />
        <Why><p>“No success message without verified effect” — a toast or a mint dot only after the server confirmed. Optimistic UI is fine, but it rolls back visibly when the call fails.</p></Why>
      </DocSection>
    </Doc>
  );
}

const TEXT: Record<string, [string, string]> = {
  danger: ['Couldn’t send', 'Your draft is saved. Check the connection and try again.'],
  warning: ['82% of this week’s limit', 'Luna switches to the smaller model at 100%.'],
  success: ['Synced', 'All 3 calendars are up to date.'],
  accent: ['Tip', 'Long-press a message to copy, retry or branch from it.'],
  neutral: ['Read only', 'This folder is shared with you.'],
};

function LoadDemo({ loaded }: { loaded: boolean }) {
  return (
    <div className="mx-auto grid w-full max-w-[620px] gap-4 @min-[640px]:grid-cols-2">
      <List>{loaded ? ['Biology — cells', 'History essay', 'Gym plan'].map((t) => <div key={t} className="fade-in flex items-center gap-3.5 px-4 py-3"><span className="h-8 w-8 rounded-tile border border-white/[.06] bg-fill-2" /><div><div className="text-body text-bright">{t}</div><div className="text-detail text-dim">Edited today</div></div></div>) : <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>}</List>
      <div className="card p-4">{loaded ? <p className="fade-in text-[14px] leading-relaxed text-ink">Cells are the basic unit of life. Every organism is made of one or more of them, and all cells come from existing cells.</p> : <SkeletonText lines={4} />}</div>
    </div>
  );
}

function OfflineDemo() {
  const [n, setN] = useState(5);
  useEffect(() => { const t = setInterval(() => setN((x) => (x <= 1 ? 5 : x - 1)), 1000); return () => clearInterval(t); }, []);
  return (
    <div className="relative grid min-h-[360px] place-items-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_30%_0%,rgb(31_56_224/.22),transparent_70%),radial-gradient(50%_40%_at_80%_10%,rgb(106_87_230/.18),transparent_70%)] saturate-[.4]" />
      <div className="relative flex w-full max-w-[320px] flex-col items-center px-6 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-fill-2 text-dim"><Wifi size={24} strokeWidth={1.6} /></span>
        <h3 className="display mt-5 text-[30px]">You’re offline</h3>
        <p className="mt-2 text-[14px] text-dim">Everything you typed is kept. We reconnect on our own.</p>
        <Button block size="lg" className="mt-6">Try again</Button>
        <p className="eyebrow mt-4 tabular">Retrying in {n}s</p>
      </div>
    </div>
  );
}
