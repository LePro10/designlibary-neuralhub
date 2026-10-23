/**
 * Desktop navigation: a glass island that floats 8px off the window's edge,
 * with the page's light running underneath it (the twin of the phone's tab
 * bar). Collapsed it is a 60px rail of quiet icons.
 *
 * Peek: rest the pointer on it (hover intent, 120ms — passing by does
 * nothing) and it opens to 228px *over* the page; leave and it folds back.
 * Pin: ⌘\ or the button at its foot keeps it open, and the page makes room.
 *
 * The active item wears its place's colour and its highlight slides between
 * entries. Groups are labelled when open and become a short hairline when
 * collapsed. ⌘/Ctrl + 1–9 switch, ⌘K searches.
 */
import { motion } from 'motion/react';
import { PanelLeftClose, PanelLeftOpen, Search, type LucideIcon } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { haptic } from '../../lib/haptics';
import { MOD_KEY } from '../../lib/hooks';
import { SPRING } from '../../lib/motion';
import { useShell } from '../../lib/surface';
import { PLACES, type Place, type Signal } from '../../lib/tokens';

export interface SidebarItem<T extends string = string> {
  id: T;
  label: string;
  Icon: LucideIcon;
  /** Quiet dot; a string becomes its accessible description. */
  badge?: boolean | string;
  /** Items with the same group sit together under its label. */
  group?: string;
  /** Hairline above this item without a label (if you do not use `group`). */
  groupStart?: boolean;
  place?: Place;
  /** The place's signal colour: the active icon wears it. */
  signal?: Signal;
}

const RAIL = 60, OPEN = 228, INSET = 8;
const INTENT_IN = 120, INTENT_OUT = 240;

export function Sidebar<T extends string>({ items, value, onChange, brand, footer, search, shortcuts = true, pinned: pinnedProp, onPinnedChange, className }: {
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
  /** Kept open, with the page making room. Uncontrolled if left out. */
  pinned?: boolean;
  onPinnedChange?: (v: boolean) => void;
  className?: string;
}) {
  const [ownPin, setOwnPin] = useState(false);
  const pinned = pinnedProp ?? ownPin;
  const setPinned = (v: boolean) => { setOwnPin(v); onPinnedChange?.(v); };
  const [peek, setPeek] = useState(false);
  const open = pinned || peek;
  const id = useId();
  const shell = useShell();
  const timer = useRef(0);

  // Tell the shell how much room the page has to leave (only a pinned island takes room).
  useLayoutEffect(() => { shell?.setSidebarSpace(INSET * 2 + (pinned ? OPEN : RAIL)); }, [pinned, shell]);
  useLayoutEffect(() => () => shell?.setSidebarSpace(0), [shell]);

  const intend = (v: boolean) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPeek(v), v ? INTENT_IN : INTENT_OUT);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!shortcuts) return;
    const key = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
      if (search && e.key.toLowerCase() === 'k') { e.preventDefault(); search(); return; }
      if (e.key === '\\') { e.preventDefault(); setPinned(!pinned); setPeek(false); return; }
      const i = Number(e.key) - 1;
      if (i >= 0 && i < Math.min(9, items.length)) { e.preventDefault(); onChange(items[i].id); }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }); // re-bound each render: cheap, and never stale

  const fade = 'whitespace-nowrap transition-opacity duration-200';
  const show = { opacity: open ? 1 : 0, transitionDelay: open ? '60ms' : '0ms' };
  return (
    <div className={cn('absolute inset-y-0 left-0 z-[var(--z-sidebar)]', className)} style={{ padding: INSET }}>
      <motion.nav
        aria-label="Main"
        onPointerEnter={(e) => { if (e.pointerType === 'mouse') intend(true); }}
        onPointerLeave={(e) => { if (e.pointerType === 'mouse') intend(false); }}
        onFocus={() => { window.clearTimeout(timer.current); setPeek(true); }}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setPeek(false); }}
        className="glass flex h-full flex-col overflow-hidden rounded-dialog p-2"
        initial={false}
        animate={{ width: open ? OPEN : RAIL }}
        // A peeking island floats over the page; a pinned one sits in its place.
        style={{ boxShadow: peek && !pinned ? 'var(--shadow-dialog), inset 0 1px 0 var(--glass-hi)' : undefined }}
        transition={SPRING.sheet}
      >
        {brand && (
          <button type="button" onClick={brand.onClick} className="group mb-3 flex h-10 shrink-0 items-center gap-3 rounded-field px-[11px]" aria-label="Home">
            <span className="block">{brand.mark}</span>
            {brand.word && <span className={fade} style={show}>{brand.word}</span>}
          </button>
        )}
        {search && (
          <button type="button" onClick={search} aria-keyshortcuts="Control+K Meta+K"
            className="mb-2 flex h-9 w-full shrink-0 items-center gap-3 rounded-field bg-fill-2 px-[13px] text-chip text-dim shadow-edge transition-colors hover:bg-fill-3 hover:text-ink">
            <Search size={16} strokeWidth={1.6} className="shrink-0" />
            <span className={fade} style={show}>Search</span>
            <kbd className={cn('ml-auto font-mono text-tiny text-faint', fade)} style={show}>{MOD_KEY}K</kbd>
          </button>
        )}
        <ul className="scroller -mx-2 flex min-h-0 flex-1 flex-col px-2">
          {items.map((it, i) => {
            const active = it.id === value;
            const sig = it.signal ?? (it.place ? PLACES[it.place].signal : undefined);
            const head = it.group !== undefined ? (i === 0 || items[i - 1].group !== it.group ? it.group : null) : it.groupStart ? '' : null;
            return (
              <li key={it.id}>
                {head !== null && i > 0 && (
                  // Open: the group's name. Collapsed: a short hairline. Same height, so nothing jumps.
                  <div className="relative mt-1.5 h-6" aria-hidden={!head || undefined}>
                    <span className="absolute top-1/2 left-[15px] h-[var(--hair)] w-[14px] bg-line-2 transition-opacity duration-200" style={{ opacity: open && head ? 0 : 1 }} />
                    {head && <span className={cn('absolute top-1/2 left-[13px] -translate-y-1/2 text-tiny text-faint', fade)} style={show}>{head}</span>}
                  </div>
                )}
                <button type="button" onClick={() => { haptic('select'); onChange(it.id); }} aria-current={active ? 'page' : undefined} aria-label={it.label}
                  aria-description={typeof it.badge === 'string' ? it.badge : undefined}
                  className={cn('group relative flex h-9 w-full items-center gap-3 rounded-field px-[13px] text-chip transition-colors duration-200', active ? 'text-bright' : 'text-dim hover:bg-fill-1 hover:text-ink')}>
                  {active && <motion.span layoutId={`side-${id}`} className="absolute inset-0 rounded-field bg-white/[.075] shadow-edge" transition={SPRING.snap} />}
                  <span className="relative transition-colors duration-300" style={active && sig ? { color: `var(--color-signal-${sig})` } : undefined}>
                    <it.Icon size={18} strokeWidth={active ? 1.8 : 1.6} />
                    {it.badge && <i className="absolute -top-0.5 -right-1 h-1.5 w-1.5 rounded-full bg-ember ring-[1.5px] ring-chrome" />}
                  </span>
                  <span className={cn('relative', fade)} style={show}>{it.label}</span>
                  {shortcuts && i < 9 && <kbd className={cn('relative ml-auto font-mono text-tiny text-faint opacity-0 transition-opacity', open && 'group-hover:opacity-100')}>{MOD_KEY}{i + 1}</kbd>}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-2 flex shrink-0 flex-col gap-1">
          {footer?.(open)}
          <button type="button" onClick={() => { setPinned(!pinned); setPeek(false); }} aria-pressed={pinned} aria-keyshortcuts="Control+\ Meta+\"
            aria-label={pinned ? 'Collapse sidebar' : 'Keep sidebar open'}
            className="flex h-9 w-full items-center gap-3 rounded-field px-[13px] text-chip text-faint transition-colors hover:bg-fill-1 hover:text-ink">
            {pinned ? <PanelLeftClose size={17} strokeWidth={1.6} className="shrink-0" /> : <PanelLeftOpen size={17} strokeWidth={1.6} className="shrink-0" />}
            <span className={fade} style={show}>{pinned ? 'Collapse' : 'Keep open'}</span>
            <kbd className={cn('ml-auto font-mono text-tiny', fade)} style={show}>{MOD_KEY}\</kbd>
          </button>
        </div>
      </motion.nav>
    </div>
  );
}
