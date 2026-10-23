import { useState } from 'react';
import { Archive, Copy, Forward, MailOpen, Pin, Reply, Trash2 } from 'lucide-react';
import { Avatar } from '@ui/components/core/Avatar';
import { ContextMenu } from '@ui/components/overlays/ContextMenu';
import type { MenuEntry } from '@ui/components/overlays/Menu';
import { toast, Toaster } from '@ui/components/overlays/Toast';
import { cn } from '@ui/lib/cn';
import { Demo } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Usage, Why } from '../../kit/Doc';
import { MAILS, PhoneScreen, Side } from './_shared';

function MailCard({ m }: { m: (typeof MAILS)[number] }) {
  return (
    <div className="card flex gap-3 !rounded-list p-3">
      <Avatar name={m.from} color={m.color} size={32} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className={cn('truncate text-body', m.unread ? 'text-bright' : 'text-ink')}>{m.from}</span>
          <span className="ml-auto shrink-0 text-meta text-dim">{m.time}</span>
        </div>
        <div className="truncate text-chip text-ink">{m.subject}</div>
        <div className="truncate text-detail text-dim">{m.preview}</div>
      </div>
    </div>
  );
}

function Mails({ channel }: { channel: string }) {
  const [list, setList] = useState(MAILS.slice(0, 4));
  const items = (m: (typeof MAILS)[number]): MenuEntry[] => [
    { label: 'Reply', Icon: Reply, onSelect: () => toast(`Reply to ${m.from}`, { channel }) },
    { label: 'Forward', Icon: Forward, onSelect: () => toast('Forward', { channel }) },
    { label: m.unread ? 'Mark as read' : 'Mark as unread', Icon: MailOpen, onSelect: () => toast('Marked', { channel }) },
    { label: 'Pin', Icon: Pin, onSelect: () => toast('Pinned', { channel }) },
    { label: 'Copy subject', Icon: Copy, onSelect: () => { void navigator.clipboard?.writeText(m.subject).catch(() => {}); toast('Copied', { channel }); } },
    { label: 'Archive', Icon: Archive, divider: true, onSelect: () => { setList((l) => l.filter((x) => x.id !== m.id)); toast('Archived', { channel, undo: () => setList(MAILS.slice(0, 4)) }); } },
    { label: 'Delete', Icon: Trash2, destructive: true, onSelect: () => { setList((l) => l.filter((x) => x.id !== m.id)); toast('Deleted', { channel, undo: () => setList(MAILS.slice(0, 4)) }); } },
  ];
  return (
    <div className="space-y-2.5">
      {list.map((m) => (
        <ContextMenu key={m.id} items={items(m)} onTap={() => toast(`Open “${m.subject}”`, { channel })}>
          <MailCard m={m} />
        </ContextMenu>
      ))}
    </div>
  );
}

export default function ContextMenuPage() {
  return (
    <Doc eyebrow="Overlays" title="Context menu" source="ui/components/overlays/ContextMenu.tsx"
      lead="Long-press on touch lifts the item above a blurred screen and shows its actions beside it, like iOS. Right-click with a mouse opens a plain menu at the pointer — no dimmed screen, like the OS. Same items, two manners.">
      <Demo title="Mail list" center={false} description="Desktop: right-click a card. Phone frame: press and hold (on a touch screen) — or right-click there too. A tap still opens the mail; a long-press never also fires it."
        code={`<ContextMenu
  items={[
    { label: 'Reply', Icon: Reply, onSelect: reply },
    { label: 'Archive', Icon: Archive, divider: true, onSelect: archive },
    { label: 'Delete', Icon: Trash2, destructive: true, onSelect: remove },
  ]}
  onTap={() => open(mail)}
>
  <MailCard mail={mail} />
</ContextMenu>`}>
        {() => (
          <Side
            desktop={<div className="max-w-[460px]"><Mails channel="page" /></div>}
            phone={<PhoneScreen title="Inbox" eyebrow="4 new"><div className="pt-2"><Mails channel="phone" /></div></PhoneScreen>}
          />
        )}
      </Demo>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'Use it as a shortcut — every action must also be reachable another way (a toolbar, a detail view).', dont: 'Hide the only way to delete behind a long-press nobody discovers.' },
          { do: 'On desktop, where actions can sit inline on hover, pass `disabled` and show them in the row.', dont: 'Put a context menu on text people want to select — or pass `selectable` so the mouse still selects.' },
        ]} />
        <Why>
          <p>The hold is 420ms and moving more than 8px cancels it — that was a scroll, not a press. A strong haptic marks the moment it opens. The click that follows a long-press is swallowed, so the item never also opens underneath its menu.</p>
          <p>The lifted copy is placed so it and the menu both fit on screen (menu below, or above when there is no room), and the whole thing is a layer: back gesture and Escape close it, focus starts on the first action and returns afterwards.</p>
        </Why>
      </DocSection>

      <DocSection title="Props">
        <Props rows={[
          { name: 'items', type: 'MenuEntry[]', description: 'Same entries as Menu (label, Icon, destructive, divider, disabled).' },
          { name: 'onTap', type: '() => void', description: 'The normal tap / click.' },
          { name: 'preview', type: 'ReactNode', description: 'Lift something richer than a copy of the item.' },
          { name: 'radius', type: 'number', default: '22', description: 'Corner radius of the lifted copy — match your item.' },
          { name: 'selectable', type: 'boolean', description: 'Keep mouse text selection (chat messages).' },
          { name: 'disabled', type: 'boolean', description: 'Render children only.' },
        ]} />
        <Usage code={`import { ContextMenu } from '@/ui/components/overlays/ContextMenu';`} />
      </DocSection>
      <Toaster channel="page" />
    </Doc>
  );
}
