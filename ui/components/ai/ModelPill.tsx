/**
 * Which model answers this chat. A quiet pill in the chat header; opens a
 * small inline list. A warning dot appears when the chosen model is
 * unavailable and a fallback is answering — the user should know.
 */
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import { haptic } from '../../lib/haptics';
import { useLayer } from '../../lib/layers';
import { SPRING } from '../../lib/motion';

export interface ModelOption { id: string; label: string; detail?: string; badge?: string; disabled?: boolean }

export function ModelPill({ models, value, onChange, fallback, align = 'left', className }: {
  models: ModelOption[]; value: string; onChange: (id: string) => void;
  /** Label of the model actually answering, when it differs (shows the warning dot). */
  fallback?: string;
  align?: 'left' | 'right';
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const current = models.find((m) => m.id === value);
  useLayer(open, () => setOpen(false));
  useEffect(() => {
    if (!open) return;
    const off = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    window.addEventListener('pointerdown', off);
    return () => window.removeEventListener('pointerdown', off);
  }, [open]);
  return (
    <div ref={box} className={cn('relative inline-block', className)}>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}
        className="pressable relative flex h-9 max-w-[44vw] items-center gap-1.5 rounded-full border border-line bg-fill-2 pr-2.5 pl-3 text-chip text-ink hover:bg-fill-3 hover:text-bright">
        <Sparkles size={13} className="shrink-0 text-accent" />
        <span className="truncate">{fallback ?? current?.label ?? 'Model'}</span>
        <ChevronDown size={14} className="shrink-0 text-faint transition-transform duration-300" style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
        {fallback && <i title={`${current?.label} unavailable — ${fallback} is answering`} className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg bg-warning" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div role="listbox" aria-label="Model" initial={{ opacity: 0, y: -4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.12 } }} transition={SPRING.pop}
            className={cn('glass absolute top-[calc(100%+6px)] z-[var(--z-popover)] w-[260px] rounded-stat p-1.5', align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left')}>
            {fallback && <p className="mx-2 mt-1 mb-2 rounded-[10px] bg-warning/10 px-2.5 py-2 text-meta leading-snug text-warning">{current?.label} is unavailable — {fallback} answers for now.</p>}
            {models.map((m) => (
              <button key={m.id} type="button" role="option" aria-selected={m.id === value} disabled={m.disabled}
                onClick={() => { haptic('select'); onChange(m.id); setOpen(false); }}
                className="flex min-h-11 w-full items-center gap-3 rounded-[12px] px-2.5 py-2 text-left hover:bg-fill-3 disabled:opacity-40">
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-[14px] text-bright">{m.label}{m.badge && <span className="rounded-full bg-accent/15 px-1.5 text-[10px] text-accent">{m.badge}</span>}</span>
                  {m.detail && <span className="mt-0.5 block truncate text-meta text-dim">{m.detail}</span>}
                </span>
                {m.id === value && <Check size={15} className="text-bright" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
