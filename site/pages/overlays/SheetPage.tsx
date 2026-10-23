import { useState } from 'react';
import { CalendarClock, MapPin, Paperclip, Send, Trash2 } from 'lucide-react';
import { Button } from '@ui/components/core/Button';
import { Field, Input, TextArea } from '@ui/components/core/Field';
import { List, Row } from '@ui/components/core/List';
import { Switch } from '@ui/components/core/Switch';
import { Sheet } from '@ui/components/overlays/Sheet';
import { ConfirmSheet } from '@ui/components/overlays/ConfirmSheet';
import { toast, Toaster } from '@ui/components/overlays/Toast';
import { SNAPS } from '@ui/lib/tokens';
import { bool, Demo, select, text } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Usage, Why } from '../../kit/Doc';
import { PhoneScreen, Side } from './_shared';

type SnapName = keyof typeof SNAPS;

function SheetBody({ long, form }: { long: boolean; form: boolean }) {
  const [remind, setRemind] = useState(true);
  if (form) {
    return (
      <div className="space-y-4">
        <Field label="Title"><Input placeholder="Team sync" defaultValue="Design review" /></Field>
        <Field label="Notes" hint="Tap a field: the panel fits itself above the keyboard."><TextArea placeholder="Agenda…" /></Field>
        <List>
          <Row Icon={CalendarClock} title="Thursday, 14:00" detail="45 minutes" onClick={() => {}} />
          <Row Icon={MapPin} title="Room B12" onClick={() => {}} />
          <Row Icon={CalendarClock} title="Remind me" trailing={<Switch checked={remind} onChange={setRemind} label="Remind me" />} />
        </List>
      </div>
    );
  }
  return (
    <div className="space-y-3 text-body leading-relaxed text-ink">
      <p>Drag the handle down or flick: the panel follows your finger and the backdrop lightens with it.</p>
      <p>Short content drags the whole panel; long content scrolls first and only the handle drags.</p>
      {long && Array.from({ length: 14 }, (_, i) => (
        <div key={i} className="card !rounded-stat px-3.5 py-2.5">
          <div className="text-bright">Attachment {i + 1}</div>
          <div className="text-detail text-dim">PDF · {(i + 2) * 132} KB</div>
        </div>
      ))}
    </div>
  );
}

export default function SheetPage() {
  const [confirm, setConfirm] = useState(false);
  const [confirmPhone, setConfirmPhone] = useState(false);
  return (
    <Doc eyebrow="Overlays" title="Panel" source={['ui/components/overlays/Sheet.tsx', 'ui/components/overlays/ConfirmSheet.tsx']}
      lead="For long tasks only — writing a mail, editing a profile, picking files. On phones a full-height panel slides up; on desktop it is a light, centred dialog. Small choices never get one: they are a pull-down menu, an inline picker or a confirm button.">
      <Demo
        title="Playground"
        center={false}
        controls={{
          snaps: select(['full', 'tall', 'half', 'peek'] as const, 'full'),
          content: select(['form', 'long', 'short'] as const),
          title: text('New event'),
          glass: bool(false),
          footer: bool(true),
        }}
        code={(v) => `const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Open</Button>
<Sheet
  open={open}
  onClose={() => setOpen(false)}
  title="${v.title}"${v.snaps === 'full' ? '' : `\n  snaps={SNAPS.${v.snaps}}`}${v.glass ? '\n  glass' : ''}${v.footer ? `\n  footer={<Button block onClick={save}>Save</Button>}` : ''}
>
  …
</Sheet>`}
      >
        {(v) => <Playground snaps={v.snaps} content={v.content} title={v.title} glass={v.glass} footer={v.footer} />}
      </Demo>

      <DocSection title="Confirm the irreversible" description="ConfirmSheet is for what is external and for good: sending to other people, paying, deleting forever. On a phone the buttons stack, the safe one nearest the thumb; on desktop they sit in a row. Everything reversible gets a toast with Undo; small local things a ConfirmButton.">
        <Demo center={false} code={`<ConfirmSheet
  open={open}
  onClose={() => setOpen(false)}
  title="Delete 12 files?"
  message="They skip the trash. This cannot be undone."
  confirmLabel="Delete forever"
  destructive
  Icon={Trash2}
  onConfirm={() => api.deleteForever(ids)} // may return a promise: busy until done
/>`}>
          {() => (
            <Side
              desktop={<><Button variant="danger" Icon={Trash2} onClick={() => setConfirm(true)}>Delete forever…</Button>
                <ConfirmSheet open={confirm} onClose={() => setConfirm(false)} title="Delete 12 files?" message="They skip the trash. This cannot be undone." confirmLabel="Delete forever" destructive Icon={Trash2}
                  onConfirm={() => new Promise<void>((r) => setTimeout(r, 900)).then(() => { toast.success('12 files deleted', { channel: 'page' }); })} /></>}
              phone={
                <PhoneScreen title="Files" maxHeight={560}>
                  <div className="pt-4"><Button variant="danger" block Icon={Trash2} onClick={() => setConfirmPhone(true)}>Delete forever…</Button></div>
                  <ConfirmSheet open={confirmPhone} onClose={() => setConfirmPhone(false)} title="Delete 12 files?" message="They skip the trash. This cannot be undone." confirmLabel="Delete forever" destructive Icon={Trash2}
                    onConfirm={() => new Promise<void>((r) => setTimeout(r, 900)).then(() => { toast.success('12 files deleted', { channel: 'phone' }); })} />
                </PhoneScreen>
              }
            />
          )}
        </Demo>
      </DocSection>

      <DocSection title="Heights" description="Full height is the default — a panel is for a task that deserves the screen. The other presets remain for the rare half-height case (a map pin, a preview).">
        <Props rows={[
          { name: 'SNAPS.full', type: '[.94]', default: 'default', description: 'One stop, full height: compose, edit, pick files.' },
          { name: 'SNAPS.tall', type: '[.86, .94]', description: 'Long content that should open nearly full.' },
          { name: 'SNAPS.half', type: '[.62, .94]', description: 'A preview that can be pulled up.' },
          { name: 'SNAPS.peek', type: '[.45, .94]', description: 'A quick look (details of a pin on a map).' },
        ]} />
      </DocSection>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'Put the primary action in `footer` — it stays above the home indicator and visible at every snap.', dont: 'A Save button at the end of long content, below the fold of the first snap.' },
          { do: 'Choices → pull-down Menu, values → InlinePicker, confirmations → ConfirmButton.', dont: 'A half-height sheet to pick one of five options — half the screen moves to change one word.' },
          { do: 'Nest one level at most (a file picker over a composer).', dont: 'Panels three deep — use a Stack inside one panel instead.' },
        ]} />
        <Why>
          <p><strong>Compositor transitions.</strong> Opening and closing are a spring sampled once at 120 Hz and handed to the browser as Web Animations on the sheet and its backdrop. The content can render, fetch and re-layout while it slides — the motion does not stutter. A finger landing mid-flight takes over exactly where the sheet is.</p>
          <p><strong>Back gesture & focus.</strong> Every open sheet is a layer: Android back and browser back close the top one, Escape too. Tab stays inside, and on close focus returns to the button that opened it.</p>
          <p><strong>Keyboard.</strong> When the on-screen keyboard opens, the sheet fills exactly the visible area above it — otherwise the title and the first field slide off the top. A field under the sheet is blurred on open so the keyboard does not stay up behind it.</p>
          <p><strong>Lower snaps.</strong> The sheet is as tall as its top snap; at a lower snap, an inner padding keeps the footer and the end of the content at the visible edge — they were unreachable before.</p>
        </Why>
      </DocSection>

      <DocSection title="Props">
        <Props rows={[
          { name: 'open / onClose', type: 'boolean / () => void', description: 'Controlled. onClose runs for backdrop, flick, back gesture, Escape, close button.' },
          { name: 'title / eyebrow', type: 'string', description: 'Light display title (22px) and a small label above it.' },
          { name: 'snaps', type: 'readonly number[]', default: 'SNAPS.full', description: 'Fractions of the surface height; the first is where it opens.' },
          { name: 'footer', type: 'ReactNode', description: 'Pinned under the content, above the safe area.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Desktop dialog width: 380 / 500 / 1000px.' },
          { name: 'glass', type: 'boolean', description: 'Translucent glass surface (over photos, maps, video).' },
          { name: 'hideClose', type: 'boolean', description: 'No round close button (sheets with their own Cancel).' },
        ]} />
        <Usage code={`import { Sheet } from '@/ui/components/overlays/Sheet';
import { SNAPS } from '@/ui/lib/tokens';

<Sheet open={open} onClose={close} title="New event"
  footer={<Button block size="lg" onClick={save}>Save</Button>}>
  <Field label="Title"><Input /></Field>
</Sheet>`} />
      </DocSection>
      <Toaster channel="page" />
    </Doc>
  );
}

function Playground({ snaps, content, title, glass, footer }: { snaps: SnapName; content: 'short' | 'long' | 'form'; title: string; glass: boolean; footer: boolean }) {
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
  const foot = (close: () => void, channel: string) => footer ? (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
      <Button variant="ghost" size="lg" Icon={Paperclip} onClick={() => toast('Attach is a demo', { channel })}>Attach</Button>
      <Button block size="lg" Icon={Send} onClick={() => { close(); toast.success('Sent', { channel }); }}>Send</Button>
    </div>
  ) : undefined;
  const sheet = (open: boolean, close: () => void, channel: string) => (
    <Sheet open={open} onClose={close} title={title} eyebrow="Calendar" snaps={SNAPS[snaps]} glass={glass} footer={foot(close, channel)}>
      <SheetBody long={content === 'long'} form={content === 'form'} />
    </Sheet>
  );
  return (
    <Side
      desktop={<>
        <Button onClick={() => setA(true)}>Open panel</Button>
        <p className="mt-3 max-w-[340px] text-small text-dim">On a wide window this opens as a dialog. Make the window narrow and the same button opens a full-height panel.</p>
        {sheet(a, () => setA(false), 'page')}
      </>}
      phone={
        <PhoneScreen title="Inbox" eyebrow="Thursday">
          <div className="space-y-3 pt-2">
            <Button block onClick={() => setB(true)}>Open panel</Button>
            {Array.from({ length: 6 }, (_, i) => <div key={i} className="card h-14 !rounded-stat" />)}
          </div>
          {sheet(b, () => setB(false), 'phone')}
        </PhoneScreen>
      }
    />
  );
}

