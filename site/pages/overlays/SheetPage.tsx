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
        <Field label="Notes" hint="Tap a field: the sheet pulls itself up above the keyboard."><TextArea placeholder="Agenda…" /></Field>
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
      <p>Drag the handle: the sheet snaps to its stops, a flick down closes it, and the backdrop darkens with the height.</p>
      <p>Short content drags the whole sheet; long content scrolls first and only the handle drags.</p>
      {long && Array.from({ length: 14 }, (_, i) => (
        <div key={i} className="card !rounded-stat px-4 py-3">
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
    <Doc eyebrow="Overlays" title="Sheet" source={['ui/components/overlays/Sheet.tsx', 'ui/components/overlays/ConfirmSheet.tsx']}
      lead="One component, two shapes: a bottom sheet with snap points on phones, a centred dialog on desktop. It knows which one from its surface — so the same sheet is a drawer inside a phone preview and a dialog in a wide app.">
      <Demo
        title="Playground"
        center={false}
        controls={{
          snaps: select(['peek', 'half', 'tall', 'full'] as const, 'half'),
          content: select(['short', 'long', 'form'] as const),
          title: text('Details'),
          glass: bool(false),
          footer: bool(true),
        }}
        code={(v) => `const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Open</Button>
<Sheet
  open={open}
  onClose={() => setOpen(false)}
  title="${v.title}"
  snaps={SNAPS.${v.snaps}}${v.glass ? '\n  glass' : ''}${v.footer ? `\n  footer={<Button block onClick={save}>Save</Button>}` : ''}
>
  …
</Sheet>`}
      >
        {(v) => <Playground snaps={v.snaps} content={v.content} title={v.title} glass={v.glass} footer={v.footer} />}
      </Demo>

      <DocSection title="Confirm before the irreversible" description="ConfirmSheet is the one confirmation pattern. On a phone the buttons stack, the safe one nearest the thumb; on desktop they sit in a row, confirm on the right. Use it for sending, paying, deleting for good — anything reversible gets a toast with Undo instead.">
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

      <DocSection title="Snap presets" description="The dashboard had 27 different snap arrays. Four presets cover them; pass your own only with a reason.">
        <Props rows={[
          { name: 'SNAPS.peek', type: '[.45, .94]', description: 'A quick look that can be pulled up (preview, details of a pin on a map).' },
          { name: 'SNAPS.half', type: '[.62, .94]', default: 'default', description: 'Most sheets: forms, pickers, settings.' },
          { name: 'SNAPS.tall', type: '[.86, .94]', description: 'Long content that should open nearly full (history, editors).' },
          { name: 'SNAPS.full', type: '[.94]', description: 'One stop, full height (compose mail, file picker).' },
        ]} />
      </DocSection>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'Put the primary action in `footer` — it stays above the home indicator and visible at every snap.', dont: 'A Save button at the end of long content, below the fold of the first snap.' },
          { do: 'Use Menu for choices. A sheet with a list of options is what Menu already is on a phone.', dont: 'A native <select> inside a sheet: it opens a second, foreign picker on top.' },
          { do: 'Nest one level at most (a picker over a composer).', dont: 'Sheets three deep — use a Stack inside one sheet instead.' },
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
          { name: 'title / eyebrow', type: 'string', description: 'Display title (26px light) and mono label above it.' },
          { name: 'snaps', type: 'readonly number[]', default: 'SNAPS.half', description: 'Fractions of the surface height; the first is where it opens.' },
          { name: 'footer', type: 'ReactNode', description: 'Pinned under the content, above the safe area.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Desktop dialog width: 420 / 540 / 1040px.' },
          { name: 'glass', type: 'boolean', description: 'Translucent glass surface (over photos, maps, video).' },
          { name: 'hideClose', type: 'boolean', description: 'No round close button (sheets with their own Cancel).' },
        ]} />
        <Usage code={`import { Sheet } from '@/ui/components/overlays/Sheet';
import { SNAPS } from '@/ui/lib/tokens';

<Sheet open={open} onClose={close} title="New event" snaps={SNAPS.half}
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
    <Sheet open={open} onClose={close} title={title} eyebrow="Sheet" snaps={SNAPS[snaps]} glass={glass} footer={foot(close, channel)}>
      <SheetBody long={content === 'long'} form={content === 'form'} />
    </Sheet>
  );
  return (
    <Side
      desktop={<>
        <Button onClick={() => setA(true)}>Open sheet</Button>
        <p className="mt-3 max-w-[340px] text-[13px] text-dim">On a wide window this opens as a dialog. Make the window narrow and the same button opens a drawer.</p>
        {sheet(a, () => setA(false), 'page')}
      </>}
      phone={
        <PhoneScreen title="Inbox" eyebrow="Thursday">
          <div className="space-y-3 pt-2">
            <Button block onClick={() => setB(true)}>Open sheet</Button>
            {Array.from({ length: 6 }, (_, i) => <div key={i} className="card h-16 !rounded-stat" />)}
          </div>
          {sheet(b, () => setB(false), 'phone')}
        </PhoneScreen>
      }
    />
  );
}

