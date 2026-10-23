/**
 * Desktop navigation: a slim 76px rail that opens to 232px over the content
 * on hover or keyboard focus — the page never reflows. The active item
 * carries a sliding highlight (shared layout). ⌘/Ctrl + 1–9 switch.
 */
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { Fragment, useEffect, useId, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { MOD_KEY } from '../../lib/hooks';
import { SPRING } from '../../lib/motion';
import type { Signal } from '../../lib/tokens';

export interface SidebarItem<T extends string = string> {
  id: T;
  label: string;
  Icon: LucideIcon;
  /** Quiet dot; a string becomes its accessible description. */
  badge?: boolean | string;
  /** Draws a hairline above this item (start of a group). */
  groupStart?: boolean;
  /** The place's signal colour: the active icon wears it. */
  signal?: Signal;
}

export function Sidebar<T extends string>({ items, value, onChange, brand, footer, search, shortcuts = true, className }: {
  items: SidebarItem<T>[];
  value: T;
  onChange: (id: T) => void;
  /** Collapsed mark + expanded wordmark: `{ mark, word }`. */
  brand?: { mark: ReactNode; word?: ReactNode; onClick?: () => void };
  /** Bottom slot (account). Gets `open` to fade its text. */
  footer?: (open: boolean) => ReactNode;
  /** Shows a search entry that calls this. */
  search?: () => void;
  shortcuts?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  useEffect(() => {
    if (!shortcuts) return;
    const key = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
      if (search && e.key.toLowerCase() === 'k') { e.preventDefault(); search(); return; }
      const i = Number(e.key) - 1;
      if (i >= 0 && i < Math.min(9, items.length)) { e.preventDefault(); onChange(items[i].id); }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [items, onChange, search, shortcuts]);

  const fadeText = 'whitespace-nowrap transition-opacity duration-300';
  return (
    <div className={cn('relative z-[var(--z-sidebar)] w-[64px] shrink-0', className)}>
      <motion.nav
        aria-label="Main"
        onHoverStart={() => setOpen(true)}
        onHoverEnd={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}
        className="absolute inset-y-0 left-0 flex flex-col overflow-hidden border-r-hair border-line bg-chrome/[.97] px-2.5 pt-5 pb-4"
        animate={{ width: open ? 220 : 64, boxShadow: open ? '24px 0 60px -20px rgb(0 0 0 / .7)' : '0 0 0 0 rgb(0 0 0 / 0)' }}
        transition={SPRING.sheet}
      >
        {brand && (
          <button type="button" onClick={brand.onClick} className="group mb-5 flex h-9 items-center gap-3 px-[12px]" aria-label="Home">
            <span className="block">{brand.mark}</span>
            {brand.word && <span className={fadeText} style={{ opacity: open ? 1 : 0 }}>{brand.word}</span>}
          </button>
        )}
        {search && (
          <button type="button" onClick={search} aria-keyshortcuts="Control+K Meta+K"
            className="mb-2.5 flex h-9 w-full items-center gap-3 rounded-field bg-fill-2 px-[12px] text-chip text-dim transition-colors hover:bg-fill-3 hover:text-ink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="shrink-0"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <span className={fadeText} style={{ opacity: open ? 1 : 0 }}>Search</span>
            <kbd className={cn('ml-auto font-mono text-[10px] text-faint', fadeText)} style={{ opacity: open ? 1 : 0 }}>{MOD_KEY}K</kbd>
          </button>
        )}
        <ul className="flex flex-col gap-0.5">
          {items.map((it, i) => {
            const active = it.id === value;
            return (
              <Fragment key={it.id}>
                <li className={it.groupStart ? 'mt-2.5 border-t-hair border-line pt-2.5' : ''}>
                  <button type="button" onClick={() => onChange(it.id)} aria-current={active ? 'page' : undefined} aria-label={it.label}
                    aria-description={typeof it.badge === 'string' ? it.badge : undefined}
                    className={cn('relative flex h-9 w-full items-center gap-3 rounded-field px-[12px] text-chip transition-colors', active ? 'text-bright' : 'text-dim hover:text-ink')}>
                    {active && <motion.span layoutId={`side-${id}`} className="absolute inset-0 rounded-field bg-fill-3" transition={SPRING.snap} />}
                    <span className="relative" style={active && it.signal ? { color: `var(--color-signal-${it.signal})` } : undefined}>
                      <it.Icon size={18} strokeWidth={active ? 1.8 : 1.6} />
                      {it.badge && <i className="absolute -top-0.5 -right-1 h-[7px] w-[7px] rounded-full bg-ember ring-2 ring-chrome" />}
                    </span>
                    <span className={cn('relative', fadeText)} style={{ opacity: open ? 1 : 0 }}>{it.label}</span>
                    {shortcuts && i < 9 && <kbd className={cn('relative ml-auto font-mono text-[10px] text-faint', fadeText)} style={{ opacity: open ? 1 : 0 }}>{MOD_KEY}{i + 1}</kbd>}
                  </button>
                </li>
              </Fragment>
            );
          })}
        </ul>
        {footer && <div className="mt-auto">{footer(open)}</div>}
      </motion.nav>
    </div>
  );
}
