/**
 * Switch (spring thumb that stretches while pressed) and Check (round check
 * that draws its tick). The check is a radio, a checkbox (`square`) or
 * tri-state (`indeterminate`, for "some selected").
 */
import { motion } from 'motion/react';
import { cn } from '../../lib/cn';
import { haptic } from '../../lib/haptics';
import { SPRING } from '../../lib/motion';

export function Switch({ checked, onChange, label, size = 'md', disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; size?: 'sm' | 'md'; disabled?: boolean }) {
  const sm = size === 'sm';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => { e.stopPropagation(); haptic('select'); onChange(!checked); }}
      className={cn(
        'relative shrink-0 rounded-full p-[3px] transition-colors duration-300 disabled:opacity-40',
        sm ? 'h-6 w-10' : 'h-[30px] w-[50px]',
        checked ? 'bg-accent-deep' : 'bg-fill-4',
      )}
    >
      <motion.span
        className={cn('block rounded-full bg-white shadow-[0_2px_6px_rgb(0_0_0/.35)]', sm ? 'h-[18px] w-[18px]' : 'h-6 w-6')}
        animate={{ x: checked ? (sm ? 16 : 20) : 0 }}
        whileTap={{ scaleX: 1.2 }}
        transition={SPRING.toggle}
      />
    </button>
  );
}

export function Check({ checked, onChange, label, color, square, indeterminate, display }: {
  checked: boolean; onChange?: (v: boolean) => void; label: string;
  /** Fill colour when checked (default bright). */
  color?: string;
  square?: boolean;
  indeterminate?: boolean;
  /** Visual only, inside another button (a whole row is the target). */
  display?: boolean;
}) {
  const Tag = display ? 'span' : 'button';
  const on = checked || indeterminate;
  return (
    <Tag
      type={display ? undefined : 'button'}
      role={display ? undefined : 'checkbox'}
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={display ? undefined : label}
      aria-hidden={display || undefined}
      onClick={display ? undefined : (e: React.MouseEvent) => { e.stopPropagation(); haptic(checked ? 'tick' : 'select'); onChange?.(!checked); }}
      // 40px target around a 22px mark; the negative margin keeps the layout at 22px.
      className={cn('grid shrink-0 place-items-center', display ? 'h-[22px] w-[22px]' : '-m-[9px] h-10 w-10')}
    >
      <span
        className={cn('grid h-[22px] w-[22px] place-items-center border-[1.5px] transition-colors duration-200', square ? 'rounded-[7px]' : 'rounded-full', on ? 'border-transparent' : 'border-white/25')}
        style={{ background: on ? color ?? 'var(--color-bright)' : undefined }}
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="#080909" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
          {indeterminate
            ? <motion.path d="M6.5 12h11" initial={false} animate={{ pathLength: 1 }} />
            : <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={false} animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }} transition={{ duration: 0.25 }} />}
        </svg>
      </span>
    </Tag>
  );
}
