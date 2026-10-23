/**
 * Click menu for toolbars (sort, filter, "more", account switch).
 * Desktop: a compact OS-style popover at the trigger, no backdrop.
 * Phones: a bottom sheet with 56px rows — the same items, thumb-sized.
 * Never a native <select>: it looks foreign and cannot carry icons or detail.
 *
 * Keyboard like an OS menu: arrows, Home/End, first letter jumps, Tab and
 * Escape close, focus returns to the trigger. Scrolling the page or resizing
 * closes the popover (a fixed menu would otherwise float away from its button).
 */
import { AnimatePresence, motion } from 'motion/react';
import { Check, type LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';
import { haptic } from '../../lib/haptics';
import { useLayer } from '../../lib/layers';
import { useLayoutMode, usePortalTarget } from '../../lib/surface';
import { SNAPS } from '../../lib/tokens';
import { frameOf, toLocal, type Box } from './geometry';
import { Sheet } from './Sheet';

export interface MenuEntry {
  label: string;
  /** Unique key when two entries share a label. */
  id?: string;
  Icon?: LucideIcon;
  /** Something richer than an icon: avatar, colour dot, app icon. */
  glyph?: ReactNode;
  /** Second line (phone) / right-aligned hint (desktop popover). */
  detail?: string;
  /** Keyboard shortcut hint, desktop only ("⌘D"). */
  shortcut?: string;
  /** Radio-style selection; `kind: 'check'` for independent toggles. */
  checked?: boolean;
  kind?: 'radio' | 'check';
  destructive?: boolean;
  disabled?: boolean;
  onSelect: () => void;
  /** Starts a group with a hairline above. */
  divider?: boolean;
  /** Starts a group with a small label above. */
  section?: string;
  /** Keep the menu open after choosing (multi-select filters). */
  keepOpen?: boolean;
}

/** Arrow keys, Home/End and first letters inside a menu list — like an OS menu. */
export function menuKeys(e: React.KeyboardEvent<HTMLElement>, close: () => void) {
  const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]:not([disabled])')];
  if (!items.length) return;
  const i = items.indexOf(document.activeElement as HTMLButtonElement);
  const to = (n: number) => { e.preventDefault(); items[(n + items.length) % items.length]?.focus(); };
  if (e.key === 'ArrowDown') to(i + 1);
  else if (e.key === 'ArrowUp') to(i < 0 ? -1 : i - 1);
  else if (e.key === 'Home' || e.key === 'PageUp') to(0);
  else if (e.key === 'End' || e.key === 'PageDown') to(-1);
  else if (e.key === 'Tab') { e.preventDefault(); close(); }
  else if (e.key.length === 1 && /\S/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const k = e.key.toLowerCase();
    for (let n = 1; n <= items.length; n++) {
      const c = items[(i + n) % items.length];
      if (c.textContent?.trim().toLowerCase().startsWith(k)) { to((i + n) % items.length); break; }
    }
  }
}

export function Menu({ trigger, items, title, align = 'end', width = 232, block }: {
  /** Render the trigger; call `open()` from its onClick. */
  trigger: (open: () => void, isOpen: boolean) => ReactNode;
  items: MenuEntry[];
  /** Sheet title on phones. */
  title?: string;
  /** Popover edge aligned with the trigger. */
  align?: 'start' | 'end';
  width?: number;
  /** The trigger fills its container's width and never grows past it. */
  block?: boolean;
}) {
  const mode = useLayoutMode();
  const target = usePortalTarget();
  const ref = useRef<HTMLSpanElement>(null);
  const [at, setAt] = useState<Box | null>(null);
  const open = () => { haptic('select'); setAt(toLocal(ref.current!.getBoundingClientRect(), target)); };
  const close = useCallback(() => setAt(null), []);
  const choose = (e: MenuEntry) => { if (!e.keepOpen) close(); haptic('select'); e.onSelect(); };

  return (
    <span ref={ref} className={block ? 'relative flex w-full min-w-0' : 'relative inline-flex'}>
      {trigger(open, !!at)}
      {mode === 'desktop'
        ? <Popover at={at} align={align} width={width} items={items} onClose={close} onChoose={choose} target={target} />
        : (
          <Sheet open={!!at} onClose={close} title={title} snaps={[Math.min(SNAPS.tall[0], 0.22 + rowsHeight(items) / 900)]}>
            <SheetRows items={items} onChoose={choose} />
          </Sheet>
        )}
    </span>
  );
}

const rowsHeight = (items: MenuEntry[]) => items.length * 56 + items.filter((e) => e.section).length * 34;

function SheetRows({ items, onChoose }: { items: MenuEntry[]; onChoose: (e: MenuEntry) => void }) {
  // Split into groups at dividers/sections: each group is its own card.
  const groups: { label?: string; items: MenuEntry[] }[] = [];
  for (const e of items) {
    if (!groups.length || e.divider || e.section) groups.push({ label: e.section, items: [] });
    groups[groups.length - 1].items.push(e);
  }
  return (
    <div role="menu" className="space-y-4">
      {groups.map((g, gi) => (
        <div key={gi}>
          {g.label && <div className="eyebrow mb-2 px-1">{g.label}</div>}
          <div className="card divide-y divide-line overflow-hidden !rounded-list">
            {g.items.map((e) => (
              <button key={e.id ?? e.label} type="button" disabled={e.disabled}
                role={e.checked === undefined ? 'menuitem' : e.kind === 'check' ? 'menuitemcheckbox' : 'menuitemradio'}
                aria-checked={e.checked}
                onClick={() => onChoose(e)}
                className={cn('flex min-h-[56px] w-full items-center gap-3.5 px-4 py-2 text-left transition-colors active:bg-fill-2 disabled:opacity-40', e.checked && 'bg-fill-1', e.destructive ? 'text-danger' : 'text-bright')}>
                {e.glyph ?? (e.Icon && (
                  <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-tile border', e.destructive ? 'border-danger/20 bg-danger/10' : 'border-white/[.06] bg-fill-2 text-ink')}>
                    <e.Icon size={16} strokeWidth={1.7} />
                  </span>
                ))}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15.5px]">{e.label}</span>
                  {e.detail && <span className="block truncate text-detail text-dim">{e.detail}</span>}
                </span>
                {e.checked !== undefined && (e.kind === 'check'
                  ? <span className={cn('grid h-6 w-6 place-items-center rounded-[7px] border-[1.5px] transition-colors', e.checked ? 'border-transparent bg-bright text-bg' : 'border-white/25')}>{e.checked && <Check size={14} strokeWidth={2.8} />}</span>
                  : e.checked && <span className="grid h-6 w-6 place-items-center rounded-full bg-bright text-bg"><Check size={14} strokeWidth={2.8} /></span>)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Popover({ at, align, width, items, onClose, onChoose, target }: { at: Box | null; align: 'start' | 'end'; width: number; items: MenuEntry[]; onClose: () => void; onChoose: (e: MenuEntry) => void; target: HTMLElement }) {
  const box = useRef<HTMLDivElement>(null);
  useLayer(!!at, onClose);
  useEffect(() => {
    if (!at) return;
    const before = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const menu = box.current;
    const down = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) onClose(); };
    const scroll = (e: Event) => { if (!box.current?.contains(e.target as Node)) onClose(); };
    const t = window.setTimeout(() => window.addEventListener('pointerdown', down), 0);
    // Focus into the menu: the checked entry, else the first — arrows work at once.
    const f = requestAnimationFrame(() => {
      const el = box.current;
      (el?.querySelector<HTMLElement>('[aria-checked="true"]') ?? el?.querySelector<HTMLElement>('[role^="menuitem"]'))?.focus({ preventScroll: true });
    });
    window.addEventListener('resize', onClose);
    window.addEventListener('scroll', scroll, true);
    return () => {
      window.clearTimeout(t); cancelAnimationFrame(f);
      window.removeEventListener('pointerdown', down); window.removeEventListener('resize', onClose); window.removeEventListener('scroll', scroll, true);
      const now = document.activeElement;
      if ((!now || now === document.body || menu?.contains(now)) && before?.isConnected) before.focus({ preventScroll: true });
    };
  }, [at, onClose]);

  const frame = frameOf(target);
  const rich = items.some((e) => e.glyph);
  const h = items.length * (rich ? 52 : 34) + items.filter((e) => e.divider).length * 9 + items.filter((e) => e.section).length * 26 + 8;
  const left = at ? Math.max(8, Math.min(frame.w - width - 8, align === 'end' ? at.right - width : at.left)) : 0;
  const below = at ? at.bottom + 6 + h < frame.h - 8 || at.top < h + 14 : true;

  return createPortal(
    <AnimatePresence>
      {at && (
        <motion.div
          ref={box}
          role="menu"
          onKeyDown={(e) => menuKeys(e, onClose)}
          initial={{ opacity: 0, scale: 0.96, y: below ? -4 : 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
          transition={{ type: 'spring', stiffness: 600, damping: 38 }}
          className="scroller fixed z-[var(--z-popover)] rounded-field border border-line-2 bg-popover/95 p-1 shadow-float backdrop-blur-xl"
          style={{
            left, width,
            maxHeight: below ? frame.h - at.bottom - 14 : at.top - 14,
            ...(below ? { top: at.bottom + 6 } : { bottom: frame.h - at.top + 6 }),
            transformOrigin: `${align === 'end' ? 'right' : 'left'} ${below ? 'top' : 'bottom'}`,
          }}
        >
          {items.map((e) => (
            <div key={e.id ?? e.label}>
              {e.divider && !e.section && <div className="mx-2 my-1 h-px bg-line" />}
              {e.section && <div className="eyebrow px-2.5 pt-2.5 pb-1">{e.section}</div>}
              <button
                type="button"
                disabled={e.disabled}
                role={e.checked === undefined ? 'menuitem' : e.kind === 'check' ? 'menuitemcheckbox' : 'menuitemradio'}
                aria-checked={e.checked}
                onClick={() => onChoose(e)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-[9px] px-2.5 text-left text-chip outline-none transition-colors hover:bg-white/[.07] focus-visible:bg-white/[.07] disabled:opacity-40',
                  rich ? 'min-h-[52px] py-1.5' : 'h-[34px]',
                  e.destructive ? 'text-danger' : 'text-ink hover:text-bright focus-visible:text-bright',
                )}
              >
                {e.kind === 'check'
                  ? <span className={cn('grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border', e.checked ? 'border-transparent bg-bright text-bg' : 'border-white/25')}>{e.checked && <Check size={11} strokeWidth={3} />}</span>
                  : e.glyph ? <span className="shrink-0">{e.glyph}</span> : e.Icon && <e.Icon size={15} strokeWidth={1.7} className={e.destructive ? '' : 'text-dim'} />}
                {rich ? (
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] text-bright">{e.label}</span>
                    {e.detail && <span className="block truncate text-meta text-dim">{e.detail}</span>}
                  </span>
                ) : (
                  <>
                    <span className="min-w-0 flex-1 truncate">{e.label}</span>
                    {e.detail && <span className="max-w-[45%] truncate text-meta text-dim">{e.detail}</span>}
                    {e.shortcut && <kbd className="font-mono text-tiny text-faint">{e.shortcut}</kbd>}
                  </>
                )}
                {e.checked && e.kind !== 'check' && <Check size={14} className="text-accent" />}
              </button>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>,
    target,
  );
}
