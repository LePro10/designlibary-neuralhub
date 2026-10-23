/** Shared bits for the overlay demos: a phone screen with a page and a toaster, and sample data. */
import type { ReactNode } from 'react';
import { Page } from '@ui/components/layout/Page';
import { Toaster } from '@ui/components/overlays/Toast';
import { Phone } from '../../kit/Phone';

export function PhoneScreen({ title, eyebrow, actions, children, channel = 'phone', maxHeight = 640, backLabel, onBack }: {
  title: string; eyebrow?: string; actions?: ReactNode; children: ReactNode; channel?: string; maxHeight?: number; backLabel?: string; onBack?: () => void;
}) {
  return (
    <Phone maxHeight={maxHeight}>
      <Page title={title} eyebrow={eyebrow} actions={actions} backLabel={backLabel} onBack={onBack} place="mail">{children}</Page>
      <Toaster channel={channel} />
    </Phone>
  );
}

/** Two columns on wide screens: the inline (desktop) version and the phone. */
export function Side({ desktop, phone }: { desktop: ReactNode; phone: ReactNode }) {
  return (
    // Its own container: the columns follow the space this demo really has, not the page's.
    <div className="@container w-full">
    <div className="grid w-full items-start gap-8 @min-[640px]:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
      <div className="min-w-0">
        <div className="eyebrow mb-3">With a pointer</div>
        {desktop}
      </div>
      <div className="min-w-0">
        <div className="eyebrow mb-3">In a phone frame</div>
        {phone}
      </div>
    </div>
    </div>
  );
}

export const MAILS = [
  { id: 'm1', from: 'Mara Lindqvist', color: '#a898ff', subject: 'Board review moved to Thursday', preview: 'Quick heads-up — we need the slides by Wednesday noon so…', time: '9:41', unread: true },
  { id: 'm2', from: 'Linear', color: '#5b9bff', subject: '3 issues assigned to you', preview: 'NH-212 Sheet snaps feel heavy on Android · NH-219…', time: '8:02', unread: true },
  { id: 'm3', from: 'Jonas Weber', color: '#9fe7c8', subject: 'Re: Gym plan for October', preview: 'Looks good. I would swap Thursday legs for a rest day.', time: 'Tue', unread: false },
  { id: 'm4', from: 'Kantonsschule', color: '#eadcbc', subject: 'Exam schedule — physics', preview: 'The physics exam takes place on 4 November in room B12.', time: 'Mon', unread: false },
  { id: 'm5', from: 'GitHub', color: '#c6c9c6', subject: '[designlibary] CI passed on main', preview: 'All checks have passed for commit 7f3a2c1.', time: 'Sun', unread: false },
];
