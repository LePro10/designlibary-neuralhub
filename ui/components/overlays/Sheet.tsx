/**
 * Panel for long tasks — writing a mail, editing a profile, picking files.
 * Phones: a full-height panel that slides up (drag the handle or flick down
 * to dismiss); desktop: a light centred dialog.
 *
 * Not for small choices: a choice is a pull-down `Menu`, a value is an
 * `InlinePicker`, a confirmation is a `ConfirmButton`. Half-height snaps
 * still work (`snaps={SNAPS.half}`), but the default is the full panel.
 *
 * Gestures adapted from 21st.dev "Magnetic Drawer" (animbits): snap maths,
 * plus back gesture, Escape, focus return, keyboard awareness, and short
 * content that drags the whole panel.
 *
 * Smoothness: opening and closing run on the compositor — the spring is
 * sampled once (springPoints) and handed over as Web Animations on the sheet
 * and its backdrop, so a heavy React render or data arriving mid-transition
 * cannot make it stutter. Dragging stays in JS (it follows the finger); a
 * finger landing mid-transition takes over from where the sheet is.
 *
 * Phone vs. desktop comes from the surrounding <Surface> (AppShell, device
 * preview) — not the viewport — and the sheet portals into that surface.
 */
import { AnimatePresence, animate, motion, useMotionValue, useTransform, usePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';
import { useFocusTrap } from '../../lib/focus-trap';
import { haptic } from '../../lib/haptics';
import { useLayer } from '../../lib/layers';
import { SPRING, TICK, pointAt, prefersReducedMotion, springPoints } from '../../lib/motion';
import { surfaceHeight, useLayoutMode, usePortalTarget } from '../../lib/surface';
import { SNAPS } from '../../lib/tokens';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  eyebrow?: string;
  /** Fractions of the surface height; the first is where it opens. Default: full (0.94). Presets in `SNAPS`. */
  snaps?: readonly number[];
  children: ReactNode;
  /** Pinned under the content (primary action). Stays above the home indicator. */
  footer?: ReactNode;
  /** Desktop dialog width. */
  size?: 'sm' | 'md' | 'lg';
  /** Translucent glass instead of the solid sheet colour (over photos, maps, video). */
  glass?: boolean;
  /** Hide the round close button (sheets with their own Cancel/Done). */
  hideClose?: boolean;
  /** Extra classes on the content scroller. */
  bodyClassName?: string;
}

type Inner = SheetProps & { boxRef: RefObject<HTMLDivElement | null>; target: HTMLElement };

/** Opening: settles without overshoot. Closing: a little faster. */
const OPEN = SPRING.sheet;
const SHUT = { ...SPRING.sheet, stiffness: 520 };

export function Sheet(props: SheetProps) {
  const mode = useLayoutMode();
  const target = usePortalTarget();
  const { open, onClose } = props;
  // Back gesture and Escape close only the topmost layer.
  useLayer(open, onClose);
  // Tab stays inside; on close, focus returns to whatever opened it.
  const boxRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open, boxRef);
  return createPortal(
    <AnimatePresence>
      {open && (mode === 'desktop'
        ? <Dialog key="d" {...props} boxRef={boxRef} target={target} />
        : <Drawer key="m" {...props} boxRef={boxRef} target={target} />)}
    </AnimatePresence>,
    target,
  );
}

function Header({ title, eyebrow, onClose, hideClose }: { title?: string; eyebrow?: string; onClose: () => void; hideClose?: boolean }) {
  if (!title && !eyebrow && hideClose) return null;
  return (
    <div className="flex items-start justify-between gap-4 px-5 pb-3">
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
        {title && <h2 className="display truncate text-headline">{title}</h2>}
      </div>
      {!hideClose && (
        <button type="button" onClick={onClose} onPointerDown={(e) => e.stopPropagation()} aria-label="Close"
          className="pressable relative grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-fill-3 text-ink hover:bg-fill-4 hover:text-bright after:absolute after:-inset-[7px] after:content-['']">
          <X size={15} strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}

const surfaceCls = (glass?: boolean) => glass
  ? 'glass !shadow-sheet'
  : 'border-line-2 bg-sheet shadow-sheet';

function Drawer({ onClose, title, eyebrow, snaps = SNAPS.full, children, footer, boxRef, target, glass, hideClose, bodyClassName }: Inner) {
  const vh = surfaceHeight(target);
  const height = Math.round(vh * snaps[snaps.length - 1]);
  const yFor = (snap: number) => height - vh * snap;
  const y = useMotionValue(height);
  const opened = yFor(snaps[0]);
  const dim = (v: number) => Math.min(1, Math.max(0, (height - v) / (height - opened || 1)));
  const backdrop = useTransform(y, dim);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [contentDrags, setContentDrags] = useState(false);
  /*
   * The sheet is as tall as its highest snap; at a lower snap its bottom part
   * sits below the edge. This inner padding keeps the footer and the end of
   * the content at the visible edge. It follows the snap, not every pixel.
   */
  const [hidden, setHidden] = useState(() => Math.max(0, Math.round(opened)));
  const drag = useRef<{ id: number; y0: number; s0: number; v: number; ly: number; lt: number; on: boolean } | null>(null);
  const [isPresent, safeToRemove] = usePresence();

  // The running compositor transition; `halt` hands the sheet back to `y` where it stands.
  const run = useRef<{ halt: () => number } | null>(null);
  const glide = (to: number, spring: { stiffness: number; damping: number }, v0 = 0) => {
    run.current?.halt();
    y.stop();
    const pts = prefersReducedMotion() ? [y.get(), to] : springPoints(y.get(), to, spring, v0);
    const opt: KeyframeAnimationOptions = { duration: Math.max(1, (pts.length - 1) * TICK), easing: 'linear', fill: 'forwards' };
    const anims = [
      sheetRef.current?.animate(pts.map((v) => ({ transform: `translateY(${v}px)` })), opt),
      backRef.current?.animate(pts.map((v) => ({ opacity: dim(v) })), opt),
    ].filter((a): a is Animation => !!a);
    let active = true;
    const handBack = (v: number) => {
      if (!active) return v;
      active = false;
      // Inline styles first, so no frame shows the old position before `y` renders.
      for (const a of anims) { try { a.commitStyles(); } catch { /* unmounted */ } a.cancel(); }
      if (run.current === entry) run.current = null;
      y.jump(v);
      return v;
    };
    const entry = { halt: () => handBack(pointAt(pts, Number(anims[0]?.currentTime ?? 0)).x) };
    run.current = entry;
    return (anims[0]?.finished ?? Promise.resolve()).then(() => { handBack(to); }, () => {});
  };

  useLayoutEffect(() => {
    glide(opened, OPEN);
    return () => { run.current?.halt(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Short content drags the whole sheet, long content scrolls. Re-measured whenever it changes size.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setContentDrags(el.scrollHeight <= el.clientHeight + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    for (const c of Array.from(el.children)) ro.observe(c);
    const mo = new MutationObserver(() => { for (const c of Array.from(el.children)) ro.observe(c); check(); });
    mo.observe(el, { childList: true });
    return () => { ro.disconnect(); mo.disconnect(); };
  }, []);

  /*
   * Keyboard: when it opens, the visible area shrinks. The sheet then fills
   * exactly the area above it, fully pulled up — otherwise its title and
   * first field would slide out of view at the top.
   */
  const [kb, setKb] = useState<{ h: number; bottom: number } | null>(null);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv || target !== document.body) return;
    const check = () => {
      const bottom = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
      const open = vv.height < vh * 0.8;
      setKb((old) => {
        if (!open) return old ? null : old;
        const next = { h: Math.round(vv.height), bottom };
        return old && old.h === next.h && old.bottom === next.bottom ? old : next;
      });
    };
    check();
    vv.addEventListener('resize', check);
    vv.addEventListener('scroll', check);
    return () => { vv.removeEventListener('resize', check); vv.removeEventListener('scroll', check); };
  }, [vh, target]);

  // A field under the sheet would otherwise keep focus and the keyboard open.
  useEffect(() => {
    const a = document.activeElement as HTMLElement | null;
    if (a && a !== document.body && !sheetRef.current?.contains(a) && a.matches('input, textarea, [contenteditable="true"]')) a.blur();
  }, []);
  useEffect(() => {
    if (!kb || !isPresent) return;
    run.current?.halt();
    setHidden(0);
    animate(y, 0, OPEN);
  }, [kb, isPresent, y]);

  // Closing: AnimatePresence waits until the sheet has slid out on the compositor.
  useEffect(() => {
    if (isPresent) return;
    let done = false;
    glide(height, SHUT).then(() => { done = true; safeToRemove(); });
    return () => { if (!done) run.current?.halt(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresent]);

  const down = (e: React.PointerEvent) => {
    if (e.button !== 0 || !isPresent) return;
    // Portaled sheets above this one bubble their events here too.
    if (!sheetRef.current?.contains(e.target as Node)) return;
    run.current?.halt();
    drag.current = { id: e.pointerId, y0: e.clientY, s0: y.get(), v: 0, ly: e.clientY, lt: e.timeStamp, on: false };
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    // Capture only once it is a real drag, so taps on buttons inside still click.
    if (!d.on) {
      if (Math.abs(e.clientY - d.y0) < 6) return;
      d.on = true;
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    }
    const dt = Math.max(1, e.timeStamp - d.lt);
    d.v = d.v * 0.5 + ((e.clientY - d.ly) / dt) * 1000 * 0.5;
    d.ly = e.clientY; d.lt = e.timeStamp;
    const next = d.s0 + (e.clientY - d.y0);
    y.set(next < 0 ? next * 0.15 : next); // rubber band above the top snap
  };
  const up = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.on) return;
    const shown = (height - y.get()) / vh;
    if (d.v > 700 || shown < snaps[0] * 0.55) { onClose(); return; }
    let best = snaps[0];
    for (const s of snaps) if (Math.abs(shown - s) < Math.abs(shown - best)) best = s;
    if (d.v < -500) best = snaps.find((s) => s > shown + 0.02) ?? best;
    if (d.v > 500) best = [...snaps].reverse().find((s) => s < shown - 0.02) ?? best;
    haptic('tick');
    setHidden(Math.max(0, Math.round(yFor(best))));
    animate(y, yFor(best), { ...OPEN, velocity: d.v });
  };
  const handlers = { onPointerDown: down, onPointerMove: move, onPointerUp: up, onPointerCancel: up };

  return (
    <>
      <motion.div ref={backRef} className="fixed inset-0 z-[var(--z-sheet)] bg-black/50 will-change-[opacity]" style={{ opacity: backdrop }} onClick={onClose} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn('fixed inset-x-0 bottom-0 z-[81] flex flex-col rounded-t-sheet border-t-hair outline-none will-change-transform', surfaceCls(glass))}
        ref={(n: HTMLDivElement | null) => { sheetRef.current = n; boxRef.current = n; }}
        style={{ y, height: kb ? Math.min(height, kb.h - 8) : height, bottom: kb?.bottom ?? 0, paddingBottom: hidden }}
      >
        <div className="shrink-0 cursor-grab touch-none pt-2 select-none active:cursor-grabbing" {...handlers}>
          <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-white/[.18]" />
          <Header title={title} eyebrow={eyebrow} onClose={onClose} hideClose={hideClose} />
        </div>
        <div
          ref={scrollRef}
          className={cn('scroller page-scroll min-h-0 flex-1 px-5', bodyClassName)}
          // Room for the home indicator even when the WebView reports no safe area.
          style={{ paddingBottom: footer ? 24 : 'max(32px, calc(16px + var(--safe-bottom)))', ...(contentDrags ? { touchAction: 'none' } : {}) }}
          {...(contentDrags ? handlers : {})}
        >
          {children}
        </div>
        {footer && <div className="shrink-0 border-t-hair border-line px-5 pt-3" style={{ paddingBottom: 'max(14px, var(--safe-bottom))' }}>{footer}</div>}
      </motion.div>
    </>
  );
}

const DIALOG_W = { sm: 'max-w-[380px]', md: 'max-w-[500px]', lg: 'max-w-[1000px]' } as const;

function Dialog({ onClose, title, eyebrow, children, footer, size = 'md', boxRef, glass, hideClose, bodyClassName }: Inner) {
  return (
    <div className="fixed inset-0 z-[var(--z-sheet)] flex items-center justify-center p-6">
      <motion.div className="absolute inset-0 bg-black/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.14 } }} onClick={onClose} />
      <motion.div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn('relative flex max-h-[86%] w-full flex-col rounded-dialog border-hair pt-4 outline-none', DIALOG_W[size], glass ? 'glass' : 'border-line-2 bg-sheet shadow-dialog')}
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 4, transition: { duration: 0.14 } }}
        transition={OPEN}
      >
        <Header title={title} eyebrow={eyebrow} onClose={onClose} hideClose={hideClose} />
        <div className={cn('scroller min-h-0 flex-1 px-5 pb-6', bodyClassName)}>{children}</div>
        {footer && <div className="shrink-0 border-t-hair border-line px-5 py-3">{footer}</div>}
      </motion.div>
    </div>
  );
}
