/**
 * Starting points for an empty chat. Suggestions are real next steps from
 * the user's context ("Plan tonight around gym"), never generic prompts.
 * Two layouts: a 2-column grid of cards (desktop hero) and a sideways rail
 * of chips (phones, above the composer). Both stagger in.
 */
import { motion } from 'motion/react';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';
import { haptic } from '../../lib/haptics';
import { SPRING } from '../../lib/motion';

export interface Suggestion { title: string; detail?: string; Icon?: LucideIcon; prompt?: string }

export function SuggestionGrid({ items, onPick, layout = 'grid', delay = 0.15, className }: {
  items: Suggestion[]; onPick: (s: Suggestion) => void; layout?: 'grid' | 'rail'; delay?: number; className?: string;
}) {
  if (layout === 'rail') {
    return (
      <div data-no-swipe className={cn('rail -mx-4 gap-2 px-4', className)}>
        {items.map((s, i) => (
          <motion.button key={s.title} type="button" onClick={() => { haptic('select'); onPick(s); }}
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SPRING.soft, delay: delay + i * 0.05 }}
            className="pressable flex h-10 shrink-0 items-center gap-2 rounded-full border border-line bg-fill-2 px-4 text-chip whitespace-nowrap text-ink hover:bg-fill-3 hover:text-bright">
            {s.Icon && <s.Icon size={15} strokeWidth={1.7} className="text-dim" />}
            {s.title}
          </motion.button>
        ))}
      </div>
    );
  }
  return (
    <div className={cn('grid grid-cols-1 gap-2 @min-[480px]:grid-cols-2', className)}>
      {items.map((s, i) => (
        <motion.button key={s.title} type="button" onClick={() => { haptic('select'); onPick(s); }}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING.soft, delay: delay + i * 0.06 }}
          className="pressable group relative flex min-h-[72px] items-start gap-3 rounded-stat border border-line bg-fill-1 p-3.5 text-left transition-colors hover:border-line-2 hover:bg-fill-2">
          {s.Icon && <span className="grid h-8 w-8 shrink-0 place-items-center rounded-tile border border-white/[.06] bg-fill-2 text-ink transition-colors group-hover:text-accent"><s.Icon size={16} strokeWidth={1.7} /></span>}
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] leading-snug text-bright">{s.title}</span>
            {s.detail && <span className="mt-0.5 block text-meta leading-snug text-dim">{s.detail}</span>}
          </span>
          <ArrowUpRight size={15} className="shrink-0 text-faint opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
        </motion.button>
      ))}
    </div>
  );
}
