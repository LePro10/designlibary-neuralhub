/**
 * Segmented control with a sliding pill. `md` is a page's main switcher
 * (bright pill, dark text); `sm` is the quiet secondary one (no fill, so it
 * never competes). `scroll` lets many options scroll sideways on phones.
 */
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { useId } from 'react';
import { cn } from '../../lib/cn';
import { haptic } from '../../lib/haptics';
import { SPRING } from '../../lib/motion';

export interface SegmentedOption<T extends string> { value: T; label: string; Icon?: LucideIcon; }

export function Segmented<T extends string>({ value, options, onChange, size = 'md', scroll, className, label }: {
  value: T; options: SegmentedOption<T>[]; onChange: (v: T) => void; size?: 'sm' | 'md'; scroll?: boolean; className?: string; label?: string;
}) {
  const id = useId();
  const sm = size === 'sm';
  const track = (
    <div role="tablist" aria-label={label} className={cn('relative flex rounded-full', sm ? 'bg-fill-2 p-0.5' : 'border border-line bg-fill-1 p-1', scroll && 'w-max min-w-full', !scroll && className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => { if (!active) { haptic('select'); onChange(o.value); } }}
            className={cn(
              'relative z-10 flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium transition-colors duration-300',
              sm ? 'h-7 px-3 text-meta' : 'h-8 px-3.5 text-small',
              active ? (sm ? 'text-bright' : 'text-bg') : 'text-dim hover:text-ink',
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className={cn('absolute inset-0 -z-10 rounded-full', sm ? 'bg-fill-4 shadow-[inset_0_1px_0_rgb(255_255_255/.08)]' : 'bg-bright')}
                transition={SPRING.snap}
              />
            )}
            {o.Icon && <o.Icon size={sm ? 13 : 14} strokeWidth={1.9} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
  if (!scroll) return track;
  return <div data-no-swipe className={cn('scroll-x -mx-4 px-4', className)}>{track}</div>;
}
