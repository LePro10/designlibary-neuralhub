/**
 * Approval before an external or irreversible action (send a mail, pay,
 * delete for good). It states exactly what will happen, then two buttons.
 * Once decided, the card folds into one line — the decision stays visible,
 * the noise goes away.
 */
import { AnimatePresence, motion } from 'motion/react';
import { Check, ShieldCheck, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { haptic } from '../../lib/haptics';
import { EASE, SPRING } from '../../lib/motion';

export type Decision = 'approved' | 'denied' | null;

export function ConfirmCard({ title, detail, children, decision, onDecide, approveLabel = 'Allow', denyLabel = 'Deny', danger, className }: {
  title: string;
  detail?: ReactNode;
  /** Preview of what happens (recipient, amount, diff …). */
  children?: ReactNode;
  decision: Decision;
  onDecide: (d: Exclude<Decision, null>) => void;
  approveLabel?: string;
  denyLabel?: string;
  /** Destructive: the approve button turns red. */
  danger?: boolean;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {decision ? (
        <motion.div key="done" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: EASE.outSoft }}
          className={cn('flex items-center gap-2 overflow-hidden py-1 text-detail', className)}>
          <span className={cn('grid h-5 w-5 place-items-center rounded-full', decision === 'approved' ? 'bg-accent/15 text-accent' : 'bg-fill-3 text-dim')}>
            {decision === 'approved' ? <Check size={11} strokeWidth={2.6} /> : <X size={11} strokeWidth={2.6} />}
          </span>
          <span className="truncate text-dim"><span className="text-ink">{decision === 'approved' ? 'Allowed' : 'Denied'}:</span> {title}</span>
        </motion.div>
      ) : (
        <motion.div key="ask" initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.16 } }} transition={SPRING.pop}
          className={cn('card overflow-hidden !rounded-list', className)}>
          <div className="flex gap-3 px-4 pt-4">
            <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-full', danger ? 'bg-danger/10 text-danger' : 'bg-accent/10 text-accent')}><ShieldCheck size={18} strokeWidth={1.8} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-body leading-snug text-bright">{title}</p>
              {detail && <p className="mt-1 text-small leading-relaxed text-dim">{detail}</p>}
            </div>
          </div>
          {children && <div className="mx-4 mt-3 rounded-field border border-line bg-raised p-3 text-small text-ink">{children}</div>}
          <div className="flex justify-end gap-2 px-4 pt-3.5 pb-4">
            <button type="button" onClick={() => { haptic('select'); onDecide('denied'); }} className="pressable h-10 rounded-full border border-white/[.14] bg-fill-3 px-4 text-[14px] text-bright hover:bg-white/[.11]">{denyLabel}</button>
            <button type="button" onClick={() => { haptic('heavy'); onDecide('approved'); }}
              className={cn('pressable h-10 rounded-full px-4 text-[14px] font-medium', danger ? 'bg-danger text-white' : 'bg-bright text-bg shadow-glow')}>{approveLabel}</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
