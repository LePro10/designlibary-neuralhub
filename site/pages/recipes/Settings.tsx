/**
 * Settings recipe: grouped lists, a menu instead of a <select>, a sheet to edit,
 * swipe to remove with undo, a confirm sheet for sign-out. Everything works the
 * same with thumb and pointer.
 */
import { Bell, Check, LogOut, Laptop, Palette, Smartphone, Sparkles, Trash2, UserRound } from 'lucide-react';
import { useState } from 'react';
import { AppShell } from '@ui/components/layout/AppShell';
import { Page, Section } from '@ui/components/layout/Page';
import { TabBar } from '@ui/components/layout/TabBar';
import { List, Row } from '@ui/components/core/List';
import { Switch } from '@ui/components/core/Switch';
import { Button } from '@ui/components/core/Button';
import { Field, Input } from '@ui/components/core/Field';
import { Avatar } from '@ui/components/core/Avatar';
import { Pill } from '@ui/components/core/Chips';
import { Menu } from '@ui/components/overlays/Menu';
import { Sheet } from '@ui/components/overlays/Sheet';
import { ConfirmSheet } from '@ui/components/overlays/ConfirmSheet';
import { SwipeRow } from '@ui/components/overlays/SwipeRow';
import { Toaster, toast } from '@ui/components/overlays/Toast';
import { ACCENTS, type Accent } from '@ui/lib/tokens';
import { Phone } from '../../kit/Phone';
import { Browser } from '../../kit/Browser';
import { Demo } from '../../kit/Demo';
import { Doc, DocSection, Rules } from '../../kit/Doc';
import { TABS } from '../navigation/demoApp';

export default function SettingsRecipe() {
  return (
    <Doc eyebrow="Recipes" title="Settings" lead="The most ordinary screen, done with care: lists that read as text, a menu instead of a system dropdown, a sheet to edit, swipe to remove with undo, and a confirmation only where it is irreversible.">
      <Demo padded={false} minHeight={760} description="Swipe a device left to remove it (undo in the toast). Change the accent — this subtree re-themes live. Edit the profile in a sheet.">
        {() => <div className="w-full py-6"><Phone><SettingsApp mode="phone" /></Phone></div>}
      </Demo>
      <Demo padded={false} minHeight={420}>{() => <div className="w-full p-4 @min-[760px]:p-8"><Browser><SettingsApp mode="desktop" /></Browser></div>}</Demo>
      <DocSection title="Decisions">
        <Rules items={[
          { do: 'Reversible (remove a device): do it, toast with Undo.', dont: 'A confirm dialog for something an Undo can fix.' },
          { do: 'Irreversible or external (sign out everywhere): ConfirmSheet, destructive tone.', dont: 'A <select> for the accent — on phones the OS picker breaks the sheet flow.' },
        ]} />
      </DocSection>
    </Doc>
  );
}

const DEVICES = [{ id: 'p', name: 'Pixel 9', detail: 'This phone · now', Icon: Smartphone }, { id: 'm', name: 'MacBook Air', detail: 'Zurich · 2h ago', Icon: Laptop }, { id: 'i', name: 'iPad', detail: 'Home · last week', Icon: Laptop }];

function SettingsApp({ mode }: { mode: 'phone' | 'desktop' }) {
  const [tab, setTab] = useState(TABS[4].id);
  const [accent, setAccent] = useState<Accent>('ice');
  const [notify, setNotify] = useState(true);
  const [focus, setFocus] = useState(false);
  const [devices, setDevices] = useState(DEVICES);
  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [name, setName] = useState('Leandro Probst');
  const [draft, setDraft] = useState(name);
  const [saving, setSaving] = useState(false);

  const remove = (id: string) => {
    const before = devices;
    setDevices((d) => d.filter((x) => x.id !== id));
    toast(`${before.find((d) => d.id === id)?.name} removed`, { undo: () => setDevices(before) });
  };
  const save = () => { setSaving(true); window.setTimeout(() => { setName(draft); setSaving(false); setEdit(false); toast.success('Profile saved'); }, 700); };

  return (
    <div data-accent={accent} className="h-full">
      <AppShell mode={mode} className="!h-full" tabbar={<TabBar items={TABS} value={tab} onChange={setTab} />}>
        <Page title="Account" ambient="account">
          <button type="button" onClick={() => { setDraft(name); setEdit(true); }} className="pressable hoverable card flex w-full items-center gap-4 p-4 text-left">
            <Avatar name={name} size={56} color="var(--color-accent)" />
            <span className="min-w-0 flex-1"><span className="block truncate text-title font-light tracking-[-.02em] text-bright">{name}</span><span className="block text-detail text-dim">l…@gmail.com · Edit profile</span></span>
            <Pill tone="accent" Icon={Sparkles} size="sm">Pro</Pill>
          </button>
          <Section label="Appearance">
            <List>
              <Menu title="Accent" align="end" items={ACCENTS.map((a) => ({ label: a[0].toUpperCase() + a.slice(1), kind: 'radio' as const, checked: a === accent, glyph: <i className="h-3.5 w-3.5 rounded-full" style={{ background: `var(--color-accent)` }} data-accent={a} />, onSelect: () => setAccent(a) }))}
                trigger={(open) => <Row Icon={Palette} title="Accent" value={accent[0].toUpperCase() + accent.slice(1)} onClick={open} />} />
              <Row Icon={Bell} title="Notifications" detail="Mail, Luna, reminders" trailing={<Switch checked={notify} onChange={setNotify} label="Notifications" />} />
              <Row Icon={Check} title="Focus mode" detail="Mute until 18:00" trailing={<Switch checked={focus} onChange={setFocus} label="Focus mode" />} />
            </List>
          </Section>
          <Section label="Devices">
            <List footer="Swipe left to remove a device.">
              {devices.map((d) => (
                <SwipeRow key={d.id} trailing={[{ label: 'Remove', Icon: Trash2, tone: 'danger', onAction: () => remove(d.id) }]}>
                  <Row Icon={d.Icon} title={d.name} detail={d.detail} trailing={d.id === 'p' ? <Pill tone="success" size="sm" dot>here</Pill> : undefined} />
                </SwipeRow>
              ))}
            </List>
          </Section>
          <Section label="Session">
            <List><Row Icon={LogOut} title="Sign out everywhere" danger onClick={() => setConfirm(true)} /></List>
          </Section>
        </Page>
        <Sheet open={edit} onClose={() => setEdit(false)} title="Edit profile" eyebrow="Account"
          footer={<Button block busy={saving} onClick={save}>Save</Button>}>
          <div className="space-y-4 pb-2">
            <div className="flex justify-center py-2"><Avatar name={draft || '?'} size={72} color="var(--color-accent)" /></div>
            <Field label="Name"><Input value={draft} onChange={(e) => setDraft(e.target.value)} /></Field>
            <Field label="Email" hint="Used for sign-in only."><Input type="email" defaultValue="leandro@example.com" /></Field>
          </div>
        </Sheet>
        <ConfirmSheet open={confirm} onClose={() => setConfirm(false)} destructive Icon={UserRound} title="Sign out everywhere?" message="All devices need to sign in again. Drafts stay on each device."
          confirmLabel="Sign out" onConfirm={() => new Promise<void>((r) => window.setTimeout(() => { r(); toast('Signed out on 3 devices'); }, 600))} />
        <Toaster />
      </AppShell>
    </div>
  );
}
