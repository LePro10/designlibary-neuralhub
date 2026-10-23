/**
 * iOS-style context menu. Touch: a long-press (420ms) lifts the item above a
 * blurred, dimmed backdrop and shows its actions next to it. Mouse: right-click
 * opens a plain OS-like menu at the pointer — no dimmed screen.
 *
 * A long-press never also fires the item's tap, moving the finger more than
 * 8px cancels it (that was a scroll), and the back gesture / Escape close it.
 */
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';
import { haptic } from '../../lib/haptics';
import { useLayer } from '../../lib/layers';
import { SPRING } from '../../lib/motion';
import { usePortalTarget } from '../../lib/surface';
import { frameOf, pointToLocal, toLocal, type Box } from './geometry';
import { menuKeys, type MenuEntry } from './Menu';

interface Props {
  items: MenuEntry[];
  children: ReactNode;
  /** The normal tap/click action of the item. */
  onTap?: () => void;
  className?: string;
  /** Shown lifted instead of a clone of the children (a richer preview). */
  preview?: ReactNode;
  /** Keep text selectable with a mouse (chat messages); touch still long-presses. */
  selectable?: boolean;
  /** Just the children, no menu (e.g. desktop shows the actions inline). */
  disabled?: boolean;
  /** Corner radius of the lifted clone (match the item). */
  radius?: number;
}

const HOLD_MS = 420;

export function ContextMenu({ items, children, onTap, className, preview, selectable, disabled, radius = 22 }: Props) {
  const target = usePortalTarget();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<null | { rect: Box; at?: { x: number; y: number } }>(null);
  const timer = useRef(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const fired = useRef(false);
  const close = () => setOpen(null);
  useLayer(!!open, close);

  const openAt = (at?: { x: number; y: number }) => {
    if (!ref.current) return;
    fired.current = true;
    haptic('heavy');
    setOpen({ rect: toLocal(ref.current.getBoundingClientRect(), target), at: at && pointToLocal(at.x, at.y, target) });
  };

  if (disabled) return <div className={className} onClick={onTap}>{children}</div>;

  return (
    <>
      <div
        ref={ref}
        className={cn(selectable ? 'touch-noselect' : 'select-none [-webkit-touch-callout:none]', className)}
        onPointerDown={(e) => {
          fired.current = false;
          if (e.pointerType === 'mouse') return;
          start.current = { x: e.clientX, y: e.clientY };
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => openAt(), HOLD_MS);
        }}
        onPointerMove={(e) => {
          const s = start.current;
          if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 8) { window.clearTimeout(timer.current); start.current = null; }
        }}
        onPointerUp={() => { window.clearTimeout(timer.current); start.current = null; }}
        onPointerCancel={() => { window.clearTimeout(timer.current); start.current = null; }}
        onContextMenu={(e) => {
          e.preventDefault();
          if (fired.current) return;
          const touch = (e.nativeEvent as PointerEvent).pointerType === 'touch';
          openAt(touch ? undefined : { x: e.clientX, y: e.clientY });
        }}
        onClickCapture={(e) => { if (fired.current) { e.stopPropagation(); e.preventDefault(); fired.current = false; } }}
        onClick={onTap}
      >
        {children}
      </div>
      {createPortal(
        <AnimatePresence>
          {open && <Overlay key="m" state={open} items={items} onClose={close} target={target} radius={radius}>{preview ?? children}</Overlay>}
        </AnimatePresence>,
        target,
      )}
    </>
  );
}

function Overlay({ state, items, onClose, children, target, radius }: { state: { rect: Box; at?: { x: number; y: number } }; items: MenuEntry[]; onClose: () => void; children: ReactNode; target: HTMLElement; radius: number }) {
  const { rect, at } = state;
  const list = useRef<HTMLUListElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const before = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const menu = list.current;
    const f = requestAnimationFrame(() => list.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus({ preventScroll: true }));
    const gone = () => closeRef.current();
    window.addEventListener('resize', gone);
    return () => {
      cancelAnimationFrame(f);
      window.removeEventListener('resize', gone);
      const now = document.activeElement;
      if ((!now || now === document.body || menu?.contains(now)) && before?.isConnected) before.focus({ preventScroll: true });
    };
  }, []);

  const { w: vw, h: vh } = frameOf(target);
  const menuH = items.length * (at ? 34 : 44) + items.filter((e) => e.divider).length * 9 + 12;
  const menuW = at ? 210 : 240;
  // Keep the lifted item on screen and leave room for the menu below (or above).
  const lift = Math.min(rect.height, vh * 0.4);
  let top = Math.max(60, Math.min(rect.top, vh - lift - menuH - 40));
  const below = top + lift + 10 + menuH < vh - 20;
  if (!below) top = Math.max(60, rect.top);
  const menuTop = at ? Math.min(at.y, vh - menuH - 16) : below ? top + lift + 10 : top - menuH - 10;
  const menuLeft = at ? Math.min(at.x, vw - menuW - 16) : Math.min(Math.max(16, rect.left), vw - menuW - 16);

  return (
    <div className="fixed inset-0 z-[var(--z-context)]" onContextMenu={(e) => e.preventDefault()}>
      <motion.div
        className={at ? 'absolute inset-0' : 'absolute inset-0 bg-black/45 backdrop-blur-xl'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      {!at && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute overflow-hidden"
          style={{ left: rect.left, width: rect.width, height: lift, borderRadius: radius }}
          initial={{ top: rect.top, scale: 1 }}
          animate={{ top, scale: 1.03 }}
          exit={{ top: rect.top, scale: 1, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 460, damping: 32 }}
        >
          <div className="bg-card shadow-dialog" style={{ borderRadius: radius }}>{children}</div>
        </motion.div>
      )}
      <motion.ul
        ref={list}
        role="menu"
        onKeyDown={(e) => menuKeys(e, onClose)}
        className={cn('absolute overflow-hidden border border-line-2 bg-[#1b1d1c]/95 shadow-dialog backdrop-blur-2xl', at ? 'rounded-field p-1' : 'rounded-stat p-1.5')}
        style={{ top: menuTop, left: menuLeft, width: menuW, transformOrigin: below || at ? 'top left' : 'bottom left' }}
        initial={{ opacity: 0, scale: at ? 0.92 : 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.14 } }}
        transition={{ ...SPRING.pop, stiffness: 520, damping: 34 }}
      >
        {items.map((e, i) => (
          <li key={`${e.id ?? e.label}-${i}`} role="none">
            {e.divider && <div className="mx-2 my-1 h-px bg-line" />}
            <button
              type="button"
              role="menuitem"
              disabled={e.disabled}
              onClick={() => { onClose(); e.onSelect(); }}
              className={cn(
                'flex w-full items-center justify-between gap-3 outline-none transition-colors hover:bg-fill-2 focus-visible:bg-fill-2 active:bg-white/[.1] disabled:opacity-40',
                at ? 'h-[34px] rounded-[10px] px-2.5 text-chip' : 'h-11 rounded-[12px] px-3 text-body',
                e.destructive ? 'text-danger' : 'text-bright',
              )}
            >
              <span className="truncate">{e.label}</span>
              {e.Icon && <e.Icon size={at ? 15 : 17} strokeWidth={1.8} />}
            </button>
          </li>
        ))}
      </motion.ul>
    </div>
  );
}
