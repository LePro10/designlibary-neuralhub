/**
 * Confirm before something that cannot be taken back. On phones a short
 * sheet with two thumb-sized buttons stacked (the safe one at the bottom,
 * nearest the thumb); on desktop a small dialog with the buttons in a row.
 *
 * Prefer undo (a toast with "Undo") over asking: confirm only what is
 * external or irreversible — sending, deleting for good, paying.
 */
import type { LucideIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button } from '../core/Button';
import { haptic } from '../../lib/haptics';
import { useLayoutMode } from '../../lib/surface';
import { Sheet } from './Sheet';

export function ConfirmSheet({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', destructive, Icon }: {
  open: boolean;
  onClose: () => void;
  /** May return a promise: the button shows busy until it settles, then the sheet closes. */
  onConfirm: () => void | Promise<void>;
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  Icon?: LucideIcon;
}) {
  const phone = useLayoutMode() === 'phone';
  const [busy, setBusy] = useState(false);
  const confirm = async () => {
    setBusy(true);
    try { await onConfirm(); haptic(destructive ? 'heavy' : 'success'); onClose(); }
    finally { setBusy(false); }
  };
  const ok = <Button block={phone} size={phone ? 'lg' : 'md'} variant={destructive ? 'danger' : 'primary'} Icon={Icon} busy={busy} onClick={confirm}>{confirmLabel}</Button>;
  const cancel = <Button block={phone} size={phone ? 'lg' : 'md'} variant="ghost" onClick={onClose}>{cancelLabel}</Button>;
  return (
    <Sheet open={open} onClose={onClose} title={title} snaps={[0.42]} size="sm" hideClose>
      {message && <div className="text-body leading-relaxed text-ink">{message}</div>}
      <div className={phone ? 'mt-6 flex flex-col gap-2.5' : 'mt-6 flex justify-end gap-2'}>
        {phone ? <>{ok}{cancel}</> : <>{cancel}{ok}</>}
      </div>
    </Sheet>
  );
}
