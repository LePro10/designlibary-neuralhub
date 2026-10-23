import { useEffect, useState } from 'react';
import { Composer, type Attachment } from '@ui/components/ai/Composer';
import { UserBubble } from '@ui/components/ai/Message';
import { bool, Demo, select, text } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Usage, Why } from '../../kit/Doc';

export default function ComposerPage() {
  return (
    <Doc eyebrow="AI & Chat" title="Composer" source="ui/components/ai/Composer.tsx"
      lead="A glass pill that grows to five lines. The button on the right says what will happen: talk, send, or stop — it morphs as your intent changes.">
      <Demo title="Playground" minHeight={360} background="ambient" center={false}
        controls={{ busy: bool(false), voice: bool(true), attachments: bool(true), compact: bool(false), placeholder: text('Ask anything'), width: select(['phone', 'wide'] as const, 'wide') }}
        code={(v) => `<Composer\n  onSend={(text, files) => send(text, files)}\n  placeholder="${v.placeholder}"${v.busy ? '\n  busy\n  onStop={stop}' : ''}${v.voice ? '\n  onVoice={openVoice}' : ''}${v.compact ? '\n  compact' : ''}${!v.attachments && !v.compact ? '\n  attachments={false}' : ''}\n/>`}>
        {(v) => <Playground {...v} />}
      </Demo>

      <DocSection title="The morphing button" description="Empty: voice orb and mic. Something typed or attached: send (bright, with the accent glow). A reply streaming and the field empty: stop, with a slow accent arc so it reads as “running”. You can always type a follow-up during a reply — the button only becomes stop while there is nothing to send.">
        <div className="mt-5 grid gap-3 @min-[700px]:grid-cols-3">
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
          <p>The 32px orb sits inside a backdrop-blurred pill. While it moves, the browser recomputes the pill’s blur every frame — that was two thirds of the chat’s idle GPU load. So in the composer the orb <em>rests</em> in its first pose and only swirls while you point at it (<code>state="rest"</code>).</p>
          <p>Send reads text and files from refs: a second click on the fading send button would otherwise see the old text and send it twice.</p>
        </Why>
      </DocSection>

      <DocSection title="API">
        <Usage code={`<ComposerDock>\n  <Composer\n    onSend={(text, attachments) => ask(text, attachments)}\n    busy={streaming}\n    onStop={abort}\n    onVoice={() => setVoice(true)}\n  />\n</ComposerDock>`} />
        <Props rows={[
          { name: 'onSend', type: '(text, attachments) => void | false', description: 'Return false to refuse; text and files stay.' },
          { name: 'busy / onStop', type: 'boolean / () => void', description: 'Reply streaming; shows Stop while the field is empty.' },
          { name: 'onVoice', type: '() => void', description: 'Shows the voice orb button.' },
          { name: 'compact', type: 'boolean', description: 'Hero variant: no attachments, darker fill instead of glass.' },
          { name: 'attachments / dictation', type: 'boolean', default: 'true', description: 'Turn off files or browser dictation.' },
          { name: 'maxRows', type: 'number', default: '5', description: 'Grows up to this many lines, then scrolls.' },
          { name: 'ref', type: 'ComposerHandle', description: 'focus(), setText(t), addFiles(files).' },
          { name: 'ComposerDock', type: 'wrapper', description: 'Bottom dock: above the tab bar, 10px above the keyboard, fades content underneath.' },
        ]} />
      </DocSection>
    </Doc>
  );
}

function State({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="rounded-stat border border-line bg-fill-1 p-3"><div className="eyebrow mb-3">{label}</div>{children}</div>;
}

function Playground({ busy, voice, attachments, compact, placeholder, width }: { busy: boolean; voice: boolean; attachments: boolean; compact: boolean; placeholder: string; width: string }) {
  const [sent, setSent] = useState<{ text: string; files: Attachment[] }[]>([]);
  const [stopped, setStopped] = useState(false);
  useEffect(() => setStopped(false), [busy]);
  return (
    <div className={width === 'phone' ? 'mx-auto w-full max-w-[390px]' : 'mx-auto w-full max-w-[680px]'}>
      <div className="mb-4 flex min-h-[120px] flex-col justify-end gap-3">
        {sent.length === 0 && <p className="text-center text-[13px] text-dim">Type, paste a screenshot, drop a file — then send.</p>}
        {sent.slice(-2).map((m, i) => (
          <UserBubble key={sent.length - 2 + i} attachments={m.files.length ? <span className="rounded-full bg-fill-3 px-2.5 py-1 text-meta text-dim">{m.files.length} attachment{m.files.length > 1 ? 's' : ''}</span> : undefined}>{m.text || '—'}</UserBubble>
        ))}
      </div>
      <Composer placeholder={placeholder} busy={busy && !stopped} onStop={() => setStopped(true)} onVoice={voice ? () => {} : undefined} compact={compact} attachments={attachments && !compact}
        onSend={(t, f) => { setSent((s) => [...s, { text: t, files: f }]); }} />
    </div>
  );
}
