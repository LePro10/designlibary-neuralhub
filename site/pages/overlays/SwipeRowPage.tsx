import { useState } from 'react';
import { Archive, BellOff, Flag, MailOpen } from 'lucide-react';
import { Avatar } from '@ui/components/core/Avatar';
import { SwipeRow } from '@ui/components/overlays/SwipeRow';
import { toast, Toaster } from '@ui/components/overlays/Toast';
import { cn } from '@ui/lib/cn';
import { bool, Demo } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Usage, Why } from '../../kit/Doc';
import { MAILS, PhoneScreen, Side } from './_shared';

function Inbox({ channel, leading, fullSwipe }: { channel: string; leading: boolean; fullSwipe: boolean }) {
  const [list, setList] = useState(MAILS);
  const [read, setRead] = useState<Record<string, boolean>>({});
  const drop = (id: string, verb: string) => {
    const before = list;
    setList((l) => l.filter((m) => m.id !== id));
    toast(verb, { channel, undo: () => setList(before) });
  };
  return (
    <div className="list-rows overflow-hidden rounded-list border-hair border-line-2 bg-fill-1">
      {list.map((m) => {
        const unread = m.unread && !read[m.id];
        return (
          <SwipeRow key={m.id} fullSwipe={fullSwipe}
            leading={leading ? { label: unread ? 'Read' : 'Unread', Icon: MailOpen, tone: 'accent', onAction: () => setRead((r) => ({ ...r, [m.id]: unread })) } : undefined}
            trailing={[
              { label: 'Mute', Icon: BellOff, tone: 'neutral', onAction: () => toast('Muted', { channel }) },
              { label: 'Flag', Icon: Flag, tone: 'warning', onAction: () => toast('Flagged', { channel }) },
              { label: 'Archive', Icon: Archive, tone: 'danger', onAction: () => drop(m.id, 'Archived') },
            ]}>
            <button type="button" onClick={() => toast(`Open “${m.subject}”`, { channel })} className="flex w-full gap-3 px-3.5 py-2.5 text-left">
              <span className="relative">
                <Avatar name={m.from} color={m.color} size={32} />
                {unread && <i className="absolute top-0 -left-1 h-2 w-2 rounded-full bg-tab ring-2 ring-bg" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className={cn('truncate text-body', unread ? 'text-bright' : 'text-ink')}>{m.from}</span>
                  <span className="ml-auto shrink-0 text-meta text-dim">{m.time}</span>
                </span>
                <span className="block truncate text-chip text-ink">{m.subject}</span>
                <span className="block truncate text-detail text-dim">{m.preview}</span>
              </span>
            </button>
          </SwipeRow>
        );
      })}
      {list.length === 0 && <div className="px-4 py-10 text-center text-chip text-dim">Inbox zero.</div>}
    </div>
  );
}

export default function SwipeRowPage() {
  return (
    <Doc eyebrow="Gestures" title="Swipe row" source="ui/components/overlays/SwipeRow.tsx"
      lead="iOS Mail-style actions on a list row: swipe left for the trailing actions, all the way for the last one; swipe right for one leading action. Vertical scrolling stays fully native.">
      <Demo title="Inbox" center={false}
        controls={{ leading: bool(true, 'leading action'), fullSwipe: bool(true, 'full swipe') }}
        description="Drag a row sideways (mouse works too). Pass the threshold and feel the haptic; release to archive. Only one row stays open at a time; tapping an open row closes it."
        code={(v) => `<SwipeRow${v.fullSwipe ? '' : ' fullSwipe={false}'}${v.leading ? `
  leading={{ label: 'Read', Icon: MailOpen, tone: 'accent', onAction: markRead }}` : ''}
  trailing={[
    { label: 'Mute', Icon: BellOff, tone: 'neutral', onAction: mute },
    { label: 'Flag', Icon: Flag, tone: 'warning', onAction: flag },
    { label: 'Archive', Icon: Archive, tone: 'danger', onAction: archive }, // full swipe runs this
  ]}
>
  <MailRow mail={mail} />
</SwipeRow>`}>
        {(v) => (
          <Side
            desktop={<div className="max-w-[460px]"><Inbox channel="page" leading={v.leading} fullSwipe={v.fullSwipe} /></div>}
            phone={<PhoneScreen title="Inbox" eyebrow="Swipe a row"><div className="pt-2"><Inbox channel="phone" leading={v.leading} fullSwipe={v.fullSwipe} /></div></PhoneScreen>}
          />
        )}
      </Demo>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'The destructive action is the outermost one — that is what a full swipe runs. Pair it with an Undo toast.', dont: 'More than three trailing actions — the row becomes a toolbar.' },
          { do: 'Offer the same actions in a context menu or detail view; swipes are a shortcut.', dont: 'Swipe rows inside something that pages sideways without `data-no-swipe` (the row sets it for you).' },
        ]} />
        <Why>
          <p>It is pointer-driven instead of a motion drag on purpose: the axis locks after 8px, vertical wins hand the gesture straight back to native scrolling, so lists never feel sticky.</p>
          <p>A right swipe on a closed row without a leading action is not taken — it belongs to the page (swipe-back in a Stack, a pager). While a row owns a drag it sets <code>swipeState.active</code>, which the Stack checks so the two never fight.</p>
          <p>The coloured actions exist only while the row is moved; at rest they would bleed through the anti-aliased rounded corner of the card as a thin red line.</p>
        </Why>
      </DocSection>

      <DocSection title="Props">
        <Props rows={[
          { name: 'trailing', type: 'SwipeAction[]', description: 'Revealed from the right, 76px each. The last runs on full swipe.' },
          { name: 'leading', type: 'SwipeAction', description: 'One action from the left (read/unread, pin).' },
          { name: 'fullSwipe', type: 'boolean', default: 'true', description: 'Swiping past 60% runs the outermost action.' },
          { name: 'SwipeAction.tone', type: "'neutral' | 'accent' | 'success' | 'warning' | 'danger'", default: "'neutral'", description: 'Colour of the action.' },
        ]} />
        <Usage code={`import { SwipeRow } from '@/ui/components/overlays/SwipeRow';`} />
      </DocSection>
      <Toaster channel="page" />
    </Doc>
  );
}
