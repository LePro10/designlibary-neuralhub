import { Bookmark, Check, Copy, Trash2, Upload, WifiOff } from 'lucide-react';
import { Button } from '@ui/components/core/Button';
import { toast, Toaster, TOAST_MAX, TOAST_MS } from '@ui/components/overlays/Toast';
import { Demo } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Usage, Why } from '../../kit/Doc';
import { PhoneScreen, Side } from './_shared';

function Triggers({ channel, block }: { channel: string; block?: boolean }) {
  const upload = () => {
    const t = toast.loading('Uploading 3 files…', { channel });
    window.setTimeout(() => t.update('Uploaded 3 files', { tone: 'success' }), 1800);
  };
  const cls = block ? 'grid gap-2' : 'flex flex-wrap gap-2';
  return (
    <div className={cls}>
      <Button variant="ghost" size="sm" Icon={Check} block={block} onClick={() => toast('Saved', { channel })}>Saved (tap twice)</Button>
      <Button variant="ghost" size="sm" Icon={Trash2} block={block} onClick={() => toast('Story deleted', { channel, undo: () => toast('Restored', { channel }) })}>Delete + Undo</Button>
      <Button variant="ghost" size="sm" Icon={Upload} block={block} onClick={upload}>Loading → done</Button>
      <Button variant="ghost" size="sm" Icon={WifiOff} block={block} onClick={() => toast.error('Could not reach the server. Your draft is kept and will be sent when you are back online.', { channel })}>Error, long</Button>
      <Button variant="ghost" size="sm" Icon={Bookmark} block={block} onClick={() => toast('Added to reading list', { channel, undo: () => {}, actionLabel: 'View' })}>Custom action</Button>
      <Button variant="ghost" size="sm" Icon={Copy} block={block} onClick={() => toast.success('Link copied', { channel })}>Success</Button>
    </div>
  );
}

export default function ToastPage() {
  return (
    <Doc eyebrow="Overlays" title="Toast" source="ui/components/overlays/Toast.tsx"
      lead="A glass pill above the tab bar that confirms what just happened — and offers Undo. Doing it and offering Undo beats asking “are you sure?” for everything reversible.">
      <Demo title="Try them" center={false}
        description={`Fire several quickly: at most ${TOAST_MAX} stand; the same text without Undo appears once and only stays longer; when it gets full, the oldest toast without Undo goes first. Each stays ${TOAST_MS / 1000}s (Undo a bit longer, errors 6s, loading until updated).`}
        code={`toast('Saved');
toast('Story deleted', { undo: () => restore(id) });
toast.success('Link copied');
toast.error('Could not reach the server…');

const t = toast.loading('Uploading 3 files…');
await upload();
t.update('Uploaded 3 files', { tone: 'success' });

// once per surface (inside your AppShell)
<Toaster />`}>
        {() => (
          <Side
            desktop={<Triggers channel="page" />}
            phone={<PhoneScreen title="Toasts" eyebrow="Above the tab bar" maxHeight={600}><div className="pt-2"><Triggers channel="phone" block /></div></PhoneScreen>}
          />
        )}
      </Demo>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'Past tense, two or three words: “Saved”, “Story deleted”, “Link copied”.', dont: '“Your changes have been successfully saved to the server!”' },
          { do: 'Undo for everything reversible — delete, archive, move, mark.', dont: 'A confirm dialog for an action that could simply be undone.' },
          { do: 'Errors say what happens next (“draft is kept, sent when online”).', dont: 'A toast as the only trace of an error that needs action — show it in place too.' },
        ]} />
        <Why>
          <p>The dashboard once dropped the oldest toast blindly — including a “Story deleted · Undo” whose deletion then ran without a way back, while a “Copied” next to it stayed. Now toasts without Undo always go first, and repeating the same message extends it instead of stacking identical pills.</p>
          <p><code>role="status"</code> makes screen readers announce the text without moving focus. The Toaster sits above <code>--tabbar-space</code>, so it is never hidden behind a floating tab bar, and channels let several surfaces (an app and its previews) each have their own.</p>
        </Why>
      </DocSection>

      <DocSection title="API">
        <Props rows={[
          { name: 'toast(text, opts?)', type: 'ToastHandle', description: 'opts: undo, actionLabel, tone, Icon, duration, channel. Returns { dismiss, update }.' },
          { name: 'toast.success / .error / .loading', type: 'ToastHandle', description: 'Tone shortcuts. Loading stays until updated or dismissed.' },
          { name: '<Toaster channel position />', type: "channel = 'main', 'bottom' | 'top'", description: 'Mount once per surface.' },
          { name: 'stackToasts(list, next, max)', type: 'pure', description: 'The stacking rule, exported for tests.' },
        ]} />
        <Usage code={`import { toast, Toaster } from '@/ui/components/overlays/Toast';`} />
      </DocSection>
      <Toaster channel="page" />
    </Doc>
  );
}
