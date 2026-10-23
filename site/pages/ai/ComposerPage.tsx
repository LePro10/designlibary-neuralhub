import { useEffect, useState } from 'react';
import { Composer, SendButton, type Attachment } from '@ui/components/ai/Composer';
import { UserBubble } from '@ui/components/ai/Message';
import { bool, Demo, select, text } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Usage, Why } from '../../kit/Doc';

export default function ComposerPage() {
  return (
    <Doc eyebrow="AI & Chat" title="Composer" source="ui/components/ai/Composer.tsx"
      lead="A slim glass pill — 44px on phones, 40 on desktop — that grows to five lines. The button on the right says what will happen: talk, send, or stop. When a reply starts, the arrow flies up and out, a stop square scales in, and a thin ring runs around it until the answer is done.">
      <Demo title="Playground" minHeight={360} background="ambient" center={false}
        controls={{ busy: bool(false), progress: bool(false), voice: bool(true), attachments: bool(true), compact: bool(false), placeholder: text('Ask anything'), width: select(['phone', 'wide'] as const, 'wide') }}
        code={(v) => `<Composer\n  onSend={(text, files) => send(text, files)}\n  placeholder="${v.placeholder}"${v.busy ? '\n  busy\n  onStop={stop}' : ''}${v.voice ? '\n  onVoice={openVoice}' : ''}${v.compact ? '\n  compact' : ''}${!v.attachments && !v.compact ? '\n  attachments={false}' : ''}\n/>`}>
        {(v) => <Playground {...v} />}
      </Demo>

      <DocSection title="Send ⇄ stop" description="Empty: a quiet mic and the resting orb. Something typed or attached: a 32px send button. A reply starts: the arrow flies up and out (220 ms), the stop square scales in on a spring, and a thin ring runs around the button — indeterminate, or real progress if you pass it. When the reply ends the arrow comes back from below. You can always type a follow-up during a reply; the button only becomes stop while there is nothing to send.">
        <Demo minHeight={180} code={`<SendButton mode={streaming ? 'stop' : 'send'} busy={streaming} progress={p} onClick={…} />`}>{() => <MorphDemo />}</Demo>
        <div className="mt-3 grid gap-2 @min-[700px]:grid-cols-3">
          <State label="Empty — talk or dictate"><Composer onSend={() => false} onVoice={() => {}} attachments={false} /></State>
          <State label="Typed — send"><Composer onSend={() => false} defaultValue="Plan tonight around gym" attachments={false} /></State>
          <State label="Streaming — stop"><Composer onSend={() => false} busy onStop={() => {}} attachments={false} /></State>
        </div>
      </DocSection>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'Enter sends only with a real keyboard (fine pointer). On phones Enter is a new line; the button sends.', dont: 'Send on Enter on a phone — people lose half-written messages.' },
          { do: 'Paste a long text or a screenshot: it becomes a card / tile, removable before sending.', dont: 'Dump 3,000 pasted lines into the field — the composer becomes the whole screen.' },
          { do: 'Keep the composer above the tab bar, and drop that gap when the keyboard is up (ComposerDock).', dont: 'Pin it with a guessed padding — it hides under the tab bar on one phone and floats on another.' },
          { do: 'Leave typing open while a reply streams; let follow-ups queue.', dont: 'Disable the field while the assistant answers.' },
        ]} />
        <Why>
          <p>The 24px orb sits inside a backdrop-blurred pill. While it moves, the browser recomputes the pill’s blur every frame — that was two thirds of the chat’s idle GPU load. So in the composer the orb <em>rests</em> in its first pose and only swirls while you point at it (<code>state="rest"</code>).</p>
          <p>Send reads text and files from refs: a second click on the fading send button would otherwise see the old text and send it twice.</p>
        </Why>
      </DocSection>

      <DocSection title="API">
        <Usage code={`<ComposerDock>\n  <Composer\n    onSend={(text, attachments) => ask(text, attachments)}\n    busy={streaming}\n    onStop={abort}\n    onVoice={() => setVoice(true)}\n  />\n</ComposerDock>`} />
        <Props rows={[
          { name: 'onSend', type: '(text, attachments) => void | false', description: 'Return false to refuse; text and files stay.' },
          { name: 'busy / onStop', type: 'boolean / () => void', description: 'Reply streaming; shows Stop with a running ring while the field is empty.' },
          { name: 'progress', type: 'number (0–1)', description: 'Real progress of the reply, if known: the ring fills instead of spinning.' },
          { name: 'onVoice', type: '() => void', description: 'Shows the voice orb button.' },
          { name: 'compact', type: 'boolean', description: 'Hero variant: no attachments, a faint fill instead of glass.' },
          { name: 'attachments / dictation', type: 'boolean', default: 'true', description: 'Turn off files or browser dictation.' },
          { name: 'maxRows', type: 'number', default: '5', description: 'Grows up to this many lines, then scrolls.' },
          { name: 'ref', type: 'ComposerHandle', description: 'focus(), setText(t), addFiles(files).' },
          { name: 'ComposerDock', type: 'wrapper', description: 'Bottom dock: above the tab bar, 8px above the keyboard, fades content underneath.' },
          { name: 'SendButton', type: '{ mode, busy?, progress?, onClick }', description: 'The morphing button on its own, for custom inputs.' },
        ]} />
      </DocSection>
    </Doc>
  );
}

function State({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="surface rounded-stat p-3"><div className="mb-2.5 text-meta text-dim">{label}</div>{children}</div>;
}

function Playground({ busy, progress, voice, attachments, compact, placeholder, width }: { busy: boolean; progress: boolean; voice: boolean; attachments: boolean; compact: boolean; placeholder: string; width: string }) {
  const [sent, setSent] = useState<{ text: string; files: Attachment[] }[]>([]);
  const [stopped, setStopped] = useState(false);
  const [p, setP] = useState(0);
  useEffect(() => setStopped(false), [busy]);
  useEffect(() => {
    if (!busy || !progress) return;
    setP(0);
    const t = window.setInterval(() => setP((x) => (x >= 1 ? 0 : x + 0.05)), 160);
    return () => window.clearInterval(t);
  }, [busy, progress]);
  return (
    <div className={width === 'phone' ? 'mx-auto w-full max-w-[390px]' : 'mx-auto w-full max-w-[680px]'}>
      <div className="mb-4 flex min-h-[120px] flex-col justify-end gap-3">
        {sent.length === 0 && <p className="text-center text-small text-faint">Type, paste a screenshot, drop a file — then send.</p>}
        {sent.slice(-2).map((m, i) => (
          <UserBubble key={sent.length - 2 + i} attachments={m.files.length ? <span className="rounded-full bg-fill-3 px-2.5 py-1 text-meta text-dim">{m.files.length} attachment{m.files.length > 1 ? 's' : ''}</span> : undefined}>{m.text || '—'}</UserBubble>
        ))}
      </div>
      <Composer placeholder={placeholder} busy={busy && !stopped} progress={progress ? p : undefined} onStop={() => setStopped(true)} onVoice={voice ? () => {} : undefined} compact={compact} attachments={attachments && !compact}
        onSend={(t, f) => { setSent((s) => [...s, { text: t, files: f }]); }} />
    </div>
  );
}

/** Plays the morph on a loop: send → (reply 2.6 s, ring fills) → send again. Tap to drive it yourself. */
function MorphDemo() {
  const [busy, setBusy] = useState(false);
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!busy) { const t = window.setTimeout(() => setBusy(true), 1400); return () => window.clearTimeout(t); }
    setP(0);
    const start = performance.now();
    const t = window.setInterval(() => { const x = (performance.now() - start) / 2600; setP(Math.min(1, x)); if (x >= 1) setBusy(false); }, 50);
    return () => window.clearInterval(t);
  }, [busy]);
  return (
    <div className="flex items-center gap-10">
      <div className="flex flex-col items-center gap-3"><SendButton mode={busy ? 'stop' : 'send'} busy={busy} progress={p} onClick={() => setBusy((b) => !b)} /><span className="text-meta text-dim">progress</span></div>
      <div className="flex flex-col items-center gap-3"><SendButton mode={busy ? 'stop' : 'send'} busy={busy} onClick={() => setBusy((b) => !b)} /><span className="text-meta text-dim">indeterminate</span></div>
    </div>
  );
}
