import { useState } from 'react';
import { Archive, ArrowDownUp, ChevronDown, Copy, Filter, FolderInput, MoreHorizontal, Pencil, Pin, Share2, Trash2 } from 'lucide-react';
import { Avatar } from '@ui/components/core/Avatar';
import { Button, IconButton } from '@ui/components/core/Button';
import { Menu, type MenuEntry } from '@ui/components/overlays/Menu';
import { toast, Toaster } from '@ui/components/overlays/Toast';
import { Demo } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Usage, Why } from '../../kit/Doc';
import { PhoneScreen, Side } from './_shared';

const SORTS = ['Newest first', 'Oldest first', 'Sender', 'Size'] as const;
const ACCOUNTS = [
  { id: 'me', name: 'Leandro', mail: 'leandro@neuralhub.dev', color: '#b9d3ff' },
  { id: 'school', name: 'School', mail: 'l.p@ksb.ch', color: '#eadcbc' },
  { id: 'luna', name: 'Luna', mail: 'luna@neuralhub.dev', color: '#a898ff' },
];

function Toolbar({ channel }: { channel: string }) {
  const [sort, setSort] = useState<(typeof SORTS)[number]>('Newest first');
  const [filters, setFilters] = useState({ unread: true, attachments: false, flagged: false });
  const [acc, setAcc] = useState('me');
  const a = ACCOUNTS.find((x) => x.id === acc)!;
  const more: MenuEntry[] = [
    { label: 'Rename', Icon: Pencil, shortcut: '⌘R', onSelect: () => toast('Rename', { channel }) },
    { label: 'Duplicate', Icon: Copy, shortcut: '⌘D', onSelect: () => toast('Duplicated', { channel }) },
    { label: 'Pin to top', Icon: Pin, onSelect: () => toast('Pinned', { channel }) },
    { label: 'Move to…', Icon: FolderInput, section: 'Organise', onSelect: () => toast('Move', { channel }) },
    { label: 'Archive', Icon: Archive, onSelect: () => toast('Archived', { channel, undo: () => {} }) },
    { label: 'Share…', Icon: Share2, disabled: true, onSelect: () => {} },
    { label: 'Delete', Icon: Trash2, destructive: true, divider: true, onSelect: () => toast('Deleted', { channel, undo: () => {} }) },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Menu title="Account" width={260} align="start"
        items={ACCOUNTS.map((x) => ({ id: x.id, label: x.name, detail: x.mail, glyph: <Avatar name={x.name} color={x.color} size={30} />, checked: x.id === acc, onSelect: () => setAcc(x.id) }))}
        trigger={(open, isOpen) => (
          <button type="button" onClick={open} aria-expanded={isOpen} className="pressable flex h-10 items-center gap-2 rounded-full border border-line bg-fill-2 pr-3 pl-1 text-chip text-bright hover:bg-fill-3">
            <Avatar name={a.name} color={a.color} size={30} />{a.name}<ChevronDown size={15} className="text-dim" />
          </button>
        )} />
      <Menu title="Sort by" align="start"
        items={SORTS.map((s) => ({ label: s, checked: s === sort, onSelect: () => setSort(s) }))}
        trigger={(open) => <Button variant="ghost" size="sm" Icon={ArrowDownUp} onClick={open}>{sort}</Button>} />
      <Menu title="Show only" align="start"
        items={([['unread', 'Unread'], ['attachments', 'With attachments'], ['flagged', 'Flagged']] as const).map(([k, l]) => ({
          label: l, kind: 'check' as const, checked: filters[k], keepOpen: true, onSelect: () => setFilters((f) => ({ ...f, [k]: !f[k] })),
        }))}
        trigger={(open) => <Button variant="ghost" size="sm" Icon={Filter} onClick={open}>Filter · {Object.values(filters).filter(Boolean).length}</Button>} />
      <Menu title="Story" items={more} trigger={(open, isOpen) => <IconButton label="More" active={isOpen} onClick={open}><MoreHorizontal size={18} /></IconButton>} />
    </div>
  );
}

export default function MenuPage() {
  return (
    <Doc eyebrow="Overlays" title="Menu" source="ui/components/overlays/Menu.tsx"
      lead="The click menu for toolbars: sort, filter, more, switch account. A compact OS-style popover on desktop; the same items as a sheet with thumb-sized rows on a phone. It replaces every native <select>.">
      <Demo title="Four kinds of menu" center={false} description="Account switch (rich rows with avatars), sort (radio), filter (checkboxes that keep the menu open), and “more” (icons, shortcuts, a section, a disabled and a destructive entry). Try the keyboard: arrows, Home/End, first letters, Escape."
        code={`<Menu
  title="Sort by"
  items={SORTS.map((s) => ({ label: s, checked: s === sort, onSelect: () => setSort(s) }))}
  trigger={(open) => <Button variant="ghost" size="sm" Icon={ArrowDownUp} onClick={open}>{sort}</Button>}
/>

// Multi-select filter: checkbox items that keep the menu open
{ label: 'Unread', kind: 'check', checked: f.unread, keepOpen: true, onSelect: toggleUnread }

// Rich rows (accounts): glyph + detail switch to two-line rows
{ label: 'School', detail: 'l.p@ksb.ch', glyph: <Avatar name="School" color="#eadcbc" />, checked, onSelect }`}>
        {() => (
          <Side
            desktop={<div className="rounded-stat border border-line bg-raised p-4"><Toolbar channel="page" /></div>}
            phone={<PhoneScreen title="Mail" eyebrow="Inbox"><div className="pt-2"><Toolbar channel="phone" /></div></PhoneScreen>}
          />
        )}
      </Demo>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'Show the current choice on the trigger (“Newest first”, “Filter · 2”).', dont: 'A bare “Sort” button — you have to open it to know the state.' },
          { do: 'Destructive last, after a divider, in danger red.', dont: 'Delete as the first entry where a slip of the thumb lands.' },
          { do: 'Disable what is impossible right now, keep it visible.', dont: 'Hide entries depending on state — the menu then changes shape under your hand.' },
        ]} />
        <Why>
          <p>On a phone a popover is a target too small for a thumb and too close to the edges. The same entries as 56px rows in a sheet are faster to hit and dismiss with the same back gesture as every other layer.</p>
          <p>A fixed popover would float away from its trigger when the page scrolls, so scrolling or resizing closes it — like an OS menu. Focus lands on the checked entry (or the first), so arrows work at once, and returns to the trigger on close.</p>
          <p>Positions are computed in the surface's own coordinates, so menus open in the right place inside scaled previews and transformed app shells too.</p>
        </Why>
      </DocSection>

      <DocSection title="Props">
        <Props rows={[
          { name: 'trigger', type: '(open, isOpen) => ReactNode', description: 'Your button; call open() from it.' },
          { name: 'items', type: 'MenuEntry[]', description: 'label, Icon | glyph, detail, shortcut, checked + kind (radio | check), keepOpen, destructive, disabled, divider, section.' },
          { name: 'title', type: 'string', description: 'Sheet title on phones.' },
          { name: 'align', type: "'start' | 'end'", default: "'end'", description: 'Which popover edge lines up with the trigger.' },
          { name: 'width', type: 'number', default: '232', description: 'Popover width.' },
          { name: 'block', type: 'boolean', description: 'Trigger fills its container and never outgrows it.' },
        ]} />
        <Usage code={`import { Menu } from '@/ui/components/overlays/Menu';
// Also exported: menuKeys(e, close) — the OS-like keyboard handling for your own menu lists.`} />
      </DocSection>
      <Toaster channel="page" />
    </Doc>
  );
}
