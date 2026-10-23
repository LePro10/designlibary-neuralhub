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
        items={ACCOUNTS.map((x) => ({ id: x.id, label: x.name, detail: x.mail, glyph: <Avatar name={x.name} color={x.color} size={26} />, checked: x.id === acc, onSelect: () => setAcc(x.id) }))}
        trigger={(open, isOpen) => (
          <button type="button" onClick={open} aria-expanded={isOpen} className="pressable flex h-8 items-center gap-1.5 rounded-full bg-fill-3 pr-2.5 pl-1 text-chip text-bright hover:bg-fill-4">
            <Avatar name={a.name} color={a.color} size={24} />{a.name}<ChevronDown size={13} strokeWidth={1.75} className={`text-dim transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
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
      <Menu title="Story" items={more} trigger={(open, isOpen) => <IconButton label="More" size="sm" active={isOpen} onClick={open}><MoreHorizontal size={16} /></IconButton>} />
    </div>
  );
}

export default function MenuPage() {
  return (
    <Doc eyebrow="Overlays" title="Pull-down menu" source="ui/components/overlays/Menu.tsx"
      lead="Sort, filter, more, switch account — every choice that would otherwise be a <select>. On phones and desktop alike it grows out of the button you tapped: a small translucent card, no sheet, no dimmed screen. Tap outside and it is gone.">
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
            desktop={<div className="surface rounded-stat bg-raised p-4"><Toolbar channel="page" /></div>}
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
          <p>A bottom sheet for five options moves half the screen to change one word. iOS apps open the menu where your thumb already is: the card grows from the trigger (spring 520/36 from 0.7), rows follow 18ms apart, and closing is quicker than opening (140ms) so it never lingers. Rows are 40px on phones, 32px with a pointer.</p>
          <p>Nothing dims. A transparent catcher takes the next tap outside, closes the menu and does nothing else — the same as on iOS, so you never trigger something behind it by accident.</p>
          <p>A fixed popover would float away from its trigger when the page scrolls, so scrolling or resizing closes it — like an OS menu. Focus lands on the checked entry (or the first), so arrows work at once, and returns to the trigger on close.</p>
          <p>Positions are computed in the surface's own coordinates, so menus open in the right place inside scaled previews and transformed app shells too.</p>
        </Why>
      </DocSection>

      <DocSection title="Props">
        <Props rows={[
          { name: 'trigger', type: '(open, isOpen) => ReactNode', description: 'Your button; call open() from it.' },
          { name: 'items', type: 'MenuEntry[]', description: 'label, Icon | glyph, detail, shortcut, checked + kind (radio | check), keepOpen, destructive, disabled, divider, section.' },
          { name: 'title', type: 'string', description: 'Accessible name of the menu.' },
          { name: 'align', type: "'start' | 'end'", default: "'end'", description: 'Which edge of the trigger the menu lines up with. It flips above when there is no room below.' },
          { name: 'width', type: 'number', default: '220', description: 'Preferred width, kept between 180px and the surface width − 24px.' },
          { name: 'block', type: 'boolean', description: 'Trigger fills its container and never outgrows it.' },
        ]} />
        <Usage code={`import { Menu } from '@/ui/components/overlays/Menu';
// Also exported: menuKeys(e, close) — OS-like keyboard handling; MenuItems + MENU_SURFACE — the look, for your own menus.`} />
      </DocSection>
      <Toaster channel="page" />
    </Doc>
  );
}
