import { useState } from 'react';
import { LogOut, Trash2 } from 'lucide-react';
import { List, Row } from '@ui/components/core/List';
import { ConfirmButton } from '@ui/components/overlays/ConfirmButton';
import { bool, Demo, select } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Usage, Why } from '../../kit/Doc';
import { PhoneScreen, Side } from './_shared';

const DEVICES = [{ id: 'mac', name: 'MacBook Air', when: '2h ago' }, { id: 'ipad', name: 'iPad', when: 'Last week' }];

function Devices({ tone, undo, size }: { tone: 'danger' | 'neutral'; undo: boolean; size: 'sm' | 'md' }) {
  const [list, setList] = useState(DEVICES);
  const [gone, setGone] = useState<typeof DEVICES>([]);
  const remove = () => new Promise<void>((r) => setTimeout(() => { setGone(list.slice(-1)); setList((l) => l.slice(0, -1)); r(); }, 600));
  return (
    <div className="space-y-3">
      <List>
        <Row title="Pixel 9" detail="This phone" />
        {list.map((d) => <Row key={d.id} title={d.name} detail={d.when} />)}
      </List>
      <div className="flex flex-wrap items-center gap-2 px-1">
        {list.length > 0 ? (
          <ConfirmButton
            label={`Remove ${list[list.length - 1].name}`}
            confirmLabel="Tap again to remove"
            doneLabel="Removed"
            onConfirm={remove}
            onUndo={undo ? () => { setList((l) => [...l, ...gone]); setGone([]); } : undefined}
            Icon={Trash2}
            tone={tone}
            size={size}
          />
        ) : <button type="button" className="text-chip text-accent" onClick={() => setList(DEVICES)}>Reset demo</button>}
      </div>
    </div>
  );
}

export default function ConfirmButtonPage() {
  return (
    <Doc eyebrow="Overlays" title="Confirm button" source="ui/components/overlays/ConfirmButton.tsx"
      lead="Confirm inside the button itself. The first tap arms it — it widens and asks; the second tap acts; after three seconds untouched it quietly falls back. No dialog for something that is small and local.">
      <Demo title="Remove a device" center={false} controls={{ tone: select(['danger', 'neutral'] as const), size: select(['md', 'sm'] as const), undo: bool(true) }}
        code={(v) => `<ConfirmButton
  label="Remove MacBook"
  confirmLabel="Tap again to remove"
  doneLabel="Removed"
  onConfirm={() => api.removeDevice(id)}  // may return a promise${v.undo ? '\n  onUndo={() => api.restoreDevice(id)}' : ''}
  Icon={Trash2}${v.tone === 'neutral' ? "\n  tone=\"neutral\"" : ''}${v.size === 'sm' ? "\n  size=\"sm\"" : ''}
/>`}>
        {(v) => (
          <Side
            desktop={<div className="max-w-[420px]"><Devices tone={v.tone} undo={v.undo} size={v.size} /></div>}
            phone={<PhoneScreen title="Devices" eyebrow="Account" maxHeight={560}><Devices tone={v.tone} undo={v.undo} size={v.size} /></PhoneScreen>}
          />
        )}
      </Demo>

      <DocSection title="Where it fits">
        <div className="mt-5 max-w-[460px]">
          <List>
            <Row Icon={LogOut} title="Sign out on this device" trailing={<ConfirmButton size="sm" label="Sign out" confirmLabel="Sure?" onConfirm={() => {}} tone="neutral" />} />
            <Row Icon={Trash2} title="Clear search history" trailing={<ConfirmButton size="sm" label="Clear" confirmLabel="Clear all?" doneLabel="Cleared" onConfirm={() => {}} />} />
          </List>
        </div>
        <Rules items={[
          { do: 'Small, local, or undoable actions: remove a device, clear history, discard a draft.', dont: 'Sending to other people or paying — that is external and for good; ConfirmSheet.' },
          { do: 'Say exactly what the second tap does (“Tap again to remove”).', dont: 'Arm on hover or long-press — the first tap must be a deliberate one.' },
        ]} />
        <Why>
          <p>A dialog breaks the flow for a question the button can ask itself. The width follows on a spring (520/40) and the label swaps by a 160ms crossfade with a small rise, so you read one button changing its mind — not a new control appearing.</p>
          <p>It falls back on its own after three seconds, so an accidental first tap costs nothing. With <code>onUndo</code>, “Undo” stays next to it for four seconds after it ran.</p>
        </Why>
      </DocSection>

      <DocSection title="Props">
        <Props rows={[
          { name: 'label / confirmLabel / doneLabel', type: 'string', description: 'Idle text, armed question, short result.' },
          { name: 'onConfirm', type: '() => void | Promise<void>', description: 'Runs on the second tap; a promise shows busy until it settles.' },
          { name: 'onUndo', type: '() => void', description: 'Shows Undo next to the result for 4s.' },
          { name: 'tone', type: "'danger' | 'neutral'", default: "'danger'", description: 'Soft red, solid when armed — or bright.' },
          { name: 'size / timeout', type: "'sm' | 'md' / number", default: "'md' / 3000", description: '32 or 38px; how long it stays armed.' },
        ]} />
        <Usage code={`import { ConfirmButton } from '@/ui/components/overlays/ConfirmButton';`} />
      </DocSection>
    </Doc>
  );
}
