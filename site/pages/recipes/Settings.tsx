/**
 * Settings recipe: grouped lists, a pull-down menu instead of a <select>,
 * values that open inline under their row, editing in place, swipe to remove
 * with undo, and a confirm inside the button. Not a single sheet — the same
 * with thumb and pointer.
 */
import { AArrowUp, Bell, Laptop, LogOut, Moon, Palette, Smartphone, Sparkles, Trash2, UserRound } from 'lucide-react';
import { useState } from 'react';
import { AppShell } from '@ui/components/layout/AppShell';
import { Page, Section } from '@ui/components/layout/Page';
import { TabBar } from '@ui/components/layout/TabBar';
import { List, Row } from '@ui/components/core/List';
import { Switch } from '@ui/components/core/Switch';
import { Button } from '@ui/components/core/Button';
import { Input } from '@ui/components/core/Field';
import { Avatar } from '@ui/components/core/Avatar';
import { Pill } from '@ui/components/core/Chips';
import { Menu } from '@ui/components/overlays/Menu';
import { Disclosure, InlinePicker } from '@ui/components/overlays/Disclosure';
import { ConfirmButton } from '@ui/components/overlays/ConfirmButton';
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
    <Doc eyebrow="Recipes" title="Settings" lead="The most ordinary screen, done with care: lists that read as text, a pull-down instead of a system dropdown, values that open under their row, editing in place, swipe to remove with Undo — and not one sheet.">
      <Demo padded={false} minHeight={760} description="Tap your name to edit it in place. Change the accent from the pull-down — this subtree re-themes live. Open “Focus until”. Swipe a device left. Sign out asks inside its own button.">
        {() => <div className="w-full py-6"><Phone><SettingsApp mode="phone" /></Phone></div>}
      </Demo>
      <Demo padded={false} minHeight={420}>{() => <div className="w-full p-4 @min-[760px]:p-8"><Browser><SettingsApp mode="desktop" /></Browser></div>}</Demo>
      <DocSection title="Decisions">
        <Rules items={[
          { do: 'A choice (accent): pull-down from the row. A value (time, size): inline under the row.', dont: 'A sheet that covers half the screen to change one word.' },
          { do: 'Reversible (remove a device): do it, toast with Undo. Small and local (sign out): confirm in the button.', dont: 'A dialog for something an Undo or a second tap can handle.' },
        ]} />
      </DocSection>
    </Doc>
  );
}

const DEVICES = [{ id: 'p', name: 'Pixel 9', detail: 'This phone · now', Icon: Smartphone }, { id: 'm', name: 'MacBook Air', detail: 'Zurich · 2h ago', Icon: Laptop }, { id: 'i', name: 'iPad', detail: 'Home · last week', Icon: Laptop }];

const FOCUS = ['16:00', '17:30', '18:00', '20:00', 'Tomorrow'] as const;
const SIZES = [{ value: 's', label: 'Small' }, { value: 'm', label: 'Default' }, { value: 'l', label: 'Large' }] as const;

function SettingsApp({ mode }: { mode: 'phone' | 'desktop' }) {
  const [tab, setTab] = useState(TABS[4].id);
  const [accent, setAccent] = useState<Accent>('ice');
  const [notify, setNotify] = useState(true);
  const [focus, setFocus] = useState<(typeof FOCUS)[number]>('18:00');
  const [size, setSize] = useState<(typeof SIZES)[number]['value']>('m');
  const [devices, setDevices] = useState(DEVICES);
  const [name, setName] = useState('Leandro Probst');
  const [draft, setDraft] = useState(name);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const channel = `settings-${mode}`;

  const remove = (id: string) => {
    const before = devices;
    setDevices((d) => d.filter((x) => x.id !== id));
    toast(`${before.find((d) => d.id === id)?.name} removed`, { undo: () => setDevices(before), channel });
  };
  const save = () => { setSaving(true); window.setTimeout(() => { setName(draft.trim() || name); setSaving(false); setEditing(false); toast.success('Name saved', { channel }); }, 600); };
  const label = (a: string) => a[0].toUpperCase() + a.slice(1);

  return (
    <div data-accent={accent} className="h-full">
      <AppShell mode={mode} className="!h-full" tabbar={<TabBar items={TABS} value={tab} onChange={setTab} />}>
        <Page title="Account" place="account">
          <List>
            <div className="flex items-center gap-3 px-3.5 py-3">
              <Avatar name={name} size={44} color="var(--color-accent)" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-title font-light tracking-[-.02em] text-bright">{name}</span>
                <span className="block truncate text-detail text-dim">leandro@example.com</span>
              </span>
              <Pill tone="accent" Icon={Sparkles} size="sm">Pro</Pill>
            </div>
            <Disclosure Icon={UserRound} title="Name" value={editing ? undefined : 'Edit'} open={editing} onOpenChange={(o) => { setEditing(o); if (o) setDraft(name); }}>
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); save(); }}>
                <Input value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Name" className="min-w-0 flex-1" autoComplete="name" />
                <Button type="submit" size="md" busy={saving} disabled={draft.trim() === name}>Save</Button>
              </form>
            </Disclosure>
          </List>
          <Section label="Appearance">
            <List>
              <Menu title="Accent" align="end" width={200} block
                items={ACCENTS.map((a) => ({ label: label(a), kind: 'radio' as const, checked: a === accent, glyph: <i className="block h-3 w-3 rounded-full" style={{ background: 'var(--color-accent)' }} data-accent={a} />, onSelect: () => setAccent(a) }))}
                trigger={(open) => <Row Icon={Palette} title="Accent" value={label(accent)} onClick={open} />} />
              <InlinePicker Icon={AArrowUp} title="Text size" value={size} onChange={setSize} options={[...SIZES]} />
            </List>
          </Section>
          <Section label="Notifications">
            <List footer="Luna stays quiet until then, except for alarms.">
              <Row Icon={Bell} title="Notifications" detail="Mail, Luna, reminders" trailing={<Switch checked={notify} onChange={setNotify} label="Notifications" />} />
              <InlinePicker Icon={Moon} title="Focus until" value={focus} onChange={setFocus} options={FOCUS.map((f) => ({ value: f, label: f }))} />
            </List>
          </Section>
          <Section label="Devices">
            <List footer="Swipe left to remove a device.">
              {devices.map((d) => (
                <SwipeRow key={d.id} trailing={d.id === 'p' ? [] : [{ label: 'Remove', Icon: Trash2, tone: 'danger', onAction: () => remove(d.id) }]}>
                  <Row Icon={d.Icon} title={d.name} detail={d.detail} trailing={d.id === 'p' ? <Pill tone="success" size="sm" dot>here</Pill> : undefined} />
                </SwipeRow>
              ))}
            </List>
          </Section>
          <Section label="Session">
            <List>
              <Row Icon={LogOut} title="Sign out everywhere" detail="All devices sign in again"
                trailing={<ConfirmButton size="sm" label="Sign out" confirmLabel="Sign out all?" doneLabel="Signed out" onConfirm={() => new Promise<void>((r) => window.setTimeout(r, 600))} />} />
            </List>
          </Section>
        </Page>
        <Toaster channel={channel} />
      </AppShell>
    </div>
  );
}
