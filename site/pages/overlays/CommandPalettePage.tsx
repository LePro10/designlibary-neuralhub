import { useMemo, useState } from 'react';
import { Calendar, FileText, Inbox, LayoutGrid, Moon, Plus, Search, Settings, Sparkles, Timer, Upload } from 'lucide-react';
import { Avatar } from '@ui/components/core/Avatar';
import { Button } from '@ui/components/core/Button';
import { Kbd } from '@ui/components/core/Feedback';
import { CommandPalette, useCommandShortcut, type CommandGroup } from '@ui/components/overlays/CommandPalette';
import { toast, Toaster } from '@ui/components/overlays/Toast';
import { MOD_KEY } from '@ui/lib/hooks';
import { Demo } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Usage, Why } from '../../kit/Doc';
import { PhoneScreen, Side } from './_shared';

function useGroups(channel: string): CommandGroup[] {
  return useMemo(() => {
    const say = (t: string) => () => toast(t, { channel });
    return [
      { label: 'Go to', items: [
        { id: 'inbox', label: 'Inbox', Icon: Inbox, shortcut: `${MOD_KEY}1`, onSelect: say('Inbox') },
        { id: 'cal', label: 'Calendar', Icon: Calendar, shortcut: `${MOD_KEY}2`, onSelect: say('Calendar') },
        { id: 'plan', label: 'Plan board', Icon: LayoutGrid, keywords: 'kanban stories', shortcut: `${MOD_KEY}3`, onSelect: say('Plan') },
        { id: 'settings', label: 'Settings', Icon: Settings, keywords: 'preferences account', onSelect: say('Settings') },
      ] },
      { label: 'Actions', items: [
        { id: 'new', label: 'New story', Icon: Plus, shortcut: `${MOD_KEY}N`, onSelect: say('New story') },
        { id: 'up', label: 'Upload files', Icon: Upload, onSelect: say('Upload') },
        { id: 'focus', label: 'Start a 25-minute focus block', Icon: Timer, keywords: 'pomodoro', onSelect: say('Focus started') },
        { id: 'dark', label: 'Toggle rest mode', Icon: Moon, onSelect: say('Rest mode') },
      ] },
      { label: 'People', items: [
        { id: 'mara', label: 'Mara Lindqvist', detail: 'mara@studio.se', glyph: <Avatar name="Mara Lindqvist" color="#a898ff" size={22} />, onSelect: say('Mara') },
        { id: 'jonas', label: 'Jonas Weber', detail: 'Gym buddy', glyph: <Avatar name="Jonas Weber" color="#9fe7c8" size={22} />, onSelect: say('Jonas') },
      ] },
      { label: 'Files', items: [
        { id: 'f1', label: 'Physics worksheet 7.pdf', detail: 'School / Physics', Icon: FileText, onSelect: say('Opened worksheet') },
        { id: 'f2', label: 'Board review slides.key', detail: 'Work', Icon: FileText, onSelect: say('Opened slides') },
      ] },
    ];
  }, [channel]);
}

function Palette({ channel, phone }: { channel: string; phone?: boolean }) {
  const [open, setOpen] = useState(false);
  const groups = useGroups(channel);
  useCommandShortcut(() => { if (!phone) setOpen((o) => !o); });
  const recent = [groups[1].items[2], groups[3].items[0]];
  const trigger = phone
    ? <button type="button" onClick={() => setOpen(true)} className="flex h-11 w-full items-center gap-2.5 rounded-field border border-line bg-fill-2 px-3.5 text-left text-input text-dim"><Search size={17} />Search</button>
    : <Button variant="ghost" Icon={Search} onClick={() => setOpen(true)}>Search or jump to… <Kbd className="ml-1">{MOD_KEY}K</Kbd></Button>;
  return (
    <>
      {trigger}
      <CommandPalette open={open} onClose={() => setOpen(false)} groups={groups} recent={recent}
        empty={(q) => (
          <div className="space-y-3">
            <p className="text-[13.5px] text-dim">Nothing for “{q}”.</p>
            <Button size="sm" variant="ghost" Icon={Sparkles} onClick={() => { setOpen(false); toast(`Asked Luna: ${q}`, { channel }); }}>Ask Luna instead</Button>
          </div>
        )} />
    </>
  );
}

export default function CommandPalettePage() {
  return (
    <Doc eyebrow="Overlays" title="Command palette" source="ui/components/overlays/CommandPalette.tsx"
      lead="One field that reaches everything — places, actions, people, files. Keyboard first, forgiving matching, the matched letters lit in the accent. A glass panel at eye level on desktop; full screen with Cancel in reach on a phone.">
      <Demo title="Palette" center={false}
        description={<>Press <Kbd>{MOD_KEY}K</Kbd> anywhere on this page. Type “nst” (→ New story) or “pomo” (keywords match too). Escape clears the field first, then closes.</>}
        code={`const [open, setOpen] = useState(false);
useCommandShortcut(() => setOpen((o) => !o)); // ⌘K / Ctrl+K

<CommandPalette
  open={open}
  onClose={() => setOpen(false)}
  recent={recentCommands}
  groups={[
    { label: 'Go to', items: [{ id: 'inbox', label: 'Inbox', Icon: Inbox, shortcut: '⌘1', onSelect: goInbox }] },
    { label: 'Actions', items: [{ id: 'focus', label: 'Start focus block', Icon: Timer, keywords: 'pomodoro', onSelect: focus }] },
  ]}
  empty={(q) => <Button onClick={() => ask(q)}>Ask Luna instead</Button>}
/>`}>
        {() => (
          <Side
            desktop={<Palette channel="page" />}
            phone={<PhoneScreen title="Home" eyebrow="Thursday 23"><div className="pt-2"><Palette channel="phone" phone /></div></PhoneScreen>}
          />
        )}
      </Demo>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'Every entry does something on Enter — a place, an action, a record. The empty state offers a way on (ask, create).', dont: '“No results.” and a dead end.' },
          { do: 'Put synonyms in `keywords` (“pomodoro” finds the focus timer).', dont: 'Rely on people typing your exact label.' },
        ]} />
        <Why>
          <p>The mouse only highlights where it actually moved — a list scrolling under a resting pointer must not steal the arrow-key selection. The active row is a shared-layout highlight that glides between entries.</p>
          <p>Matching is a forgiving subsequence: direct substrings first, then letters at word starts weigh more than letters in the middle. Labels outrank details and keywords.</p>
          <p>The panel sits high (12% from the top), where the eye already is after pressing ⌘K, and stays the same height while you type, so results do not jump around under the cursor.</p>
        </Why>
      </DocSection>

      <DocSection title="Props">
        <Props rows={[
          { name: 'open / onClose', type: 'boolean / () => void', description: 'Controlled. Back gesture and Escape close.' },
          { name: 'groups', type: 'CommandGroup[]', description: '{ label, items: Command[] }. Command: id, label, detail, Icon | glyph, shortcut, keywords, onSelect.' },
          { name: 'recent', type: 'Command[]', description: 'Shown first while the field is empty.' },
          { name: 'empty', type: '(query) => ReactNode', description: 'What to offer when nothing matches.' },
          { name: 'useCommandShortcut(toggle)', type: 'hook', description: 'Binds ⌘K / Ctrl+K.' },
          { name: 'fuzzyMatch(q, text)', type: 'pure', description: 'The scoring, exported for your own lists.' },
        ]} />
        <Usage code={`import { CommandPalette, useCommandShortcut } from '@/ui/components/overlays/CommandPalette';`} />
      </DocSection>
      <Toaster channel="page" />
    </Doc>
  );
}

