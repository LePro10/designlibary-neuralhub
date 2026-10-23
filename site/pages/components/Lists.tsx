import { Bell, ChevronRight, Globe, KeyRound, LogOut, Mail, Moon, Palette, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { List, Row } from '@ui/components/core/List';
import { Switch } from '@ui/components/core/Switch';
import { Pill } from '@ui/components/core/Chips';
import { Avatar } from '@ui/components/core/Avatar';
import { bool, Demo } from '../../kit/Demo';
import { Doc, DocSection, Grid, Rules, Tile, Why } from '../../kit/Doc';

export default function ListsPage() {
  return (
    <Doc eyebrow="Components" title="Lists & Rows" source="ui/components/core/List.tsx"
      lead="The grouped list is the workhorse: a card with hairlines, 54px rows, quiet monochrome icon tiles. It reads as text first — colour is reserved for danger and selection.">
      <Demo title="Settings group" controls={{ icons: bool(true), details: bool(true), footer: bool(true) }} center={false}
        code={(v) => `<List label="Account"${v.footer ? ' footer="…"' : ''}>\n  <Row${v.icons ? ' Icon={Bell}' : ''} title="Notifications"${v.details ? ' detail="Mail, Luna, reminders"' : ''} onClick={open} />\n  <Row title="Dark mode" trailing={<Switch … />} />\n  <Row Icon={LogOut} title="Sign out" danger onClick={signOut} />\n</List>`}>
        {(v) => <ListDemo {...v} />}
      </Demo>
      <DocSection title="Leading slots" description="Anything can lead a row: a tile icon, an avatar, an app icon, a colour dot.">
        <Grid cols={2}>
          <Tile><div className="w-full"><List>
            <Row leading={<Avatar name="Mia Keller" color="#a898ff" />} title="Mia Keller" detail="Can we move training to 6?" value="09:12" onClick={() => {}} />
            <Row leading={<Avatar name="Jonas Weber" color="#9fe7c8" />} title="Jonas Weber" detail="Slides are in the folder" value="Tue" onClick={() => {}} />
          </List></div></Tile>
          <Tile><div className="w-full"><List>
            <Row leading={<i className="h-2.5 w-2.5 rounded-full bg-accent" />} title="School" value="12" />
            <Row leading={<i className="h-2.5 w-2.5 rounded-full bg-ember" />} title="Gym" value="4" trailing={<Pill tone="ember" size="sm">today</Pill>} />
            <Row leading={<i className="h-2.5 w-2.5 rounded-full bg-mint" />} title="Reading" value="7" selected />
          </List></div></Tile>
        </Grid>
      </DocSection>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'A chevron means “opens something”. Rows without onClick have none.', dont: 'Colourful icon tiles in settings — the list turns into a rainbow and stops reading.' },
          { do: 'Put the current value right-aligned in dim (“English”, “On”).', dont: 'Build a fourth “Group” wrapper — the dashboard had it copied in four files; List has label + footer.' },
        ]} />
        <Why><p>Rows are <code>button</code> when clickable, <code>a</code> with <code>href</code>, otherwise a plain <code>div</code> — so a row inside a form never submits it and screen readers announce the right thing.</p></Why>
      </DocSection>
    </Doc>
  );
}
function ListDemo({ icons, details, footer }: { icons: boolean; details: boolean; footer: boolean }) {
  const [dark, setDark] = useState(true);
  const I = <T,>(x: T) => (icons ? x : undefined);
  return (
    <div className="mx-auto w-full max-w-[460px] space-y-7">
      <List label="Account" footer={footer ? 'Changes sync to all your devices.' : undefined}>
        <Row Icon={I(Bell)} title="Notifications" detail={details ? 'Mail, Luna, reminders' : undefined} onClick={() => {}} />
        <Row Icon={I(Palette)} title="Appearance" value="Ice" onClick={() => {}} />
        <Row Icon={I(Moon)} title="Dark mode" trailing={<Switch checked={dark} onChange={setDark} label="Dark mode" />} />
        <Row Icon={I(Globe)} title="Language" value="English" onClick={() => {}} />
      </List>
      <List label="Security">
        <Row Icon={I(KeyRound)} title="Passkeys" detail={details ? '2 devices' : undefined} onClick={() => {}} />
        <Row Icon={I(Smartphone)} title="Phone" detail={details ? 'Pixel 9 · connected' : undefined} trailing={<Pill tone="success" size="sm" dot>live</Pill>} />
        <Row Icon={I(Mail)} title="Recovery email" value="l…@gmail.com" trailing={<ChevronRight size={17} className="text-faint" />} />
        <Row Icon={I(LogOut)} title="Sign out" danger onClick={() => {}} />
      </List>
    </div>
  );
}
