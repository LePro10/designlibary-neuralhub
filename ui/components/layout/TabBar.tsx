/**
 * Floating liquid-glass tab bar (phones).
 *
 * The lens is a glass capsule you can grab and slide across the tabs; it
 * snaps on release with the finger's velocity. Under the lens the icons are
 * re-drawn bright and slightly magnified — the refraction trick, without an
 * SVG displacement filter (which is Chromium-only and pixelated). The bright
 * copy is counter-scaled against the lens' squash & stretch, and the icon
 * below fades while the lens covers it, so the two never read as a double image.
 *
 * Each tab may carry its place's signal colour: the icon under the lens is
 * drawn in that colour and the lens picks up a faint tint of it, so the bar
 * says where you are without a single coloured surface.
 *
 * Everything that moves is a motion value; dragging never re-renders React.
 * Pass `position` to drive the lens from a swipeable pager (float tab index).
 */
import { animate, motion, useMotionValue, useSpring, useTransform, useVelocity, type MotionValue } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import { haptic } from '../../lib/haptics';
import { useKeyboardOpen } from '../../lib/hooks';
import { SPRING } from '../../lib/motion';
import type { Signal } from '../../lib/tokens';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  Icon: LucideIcon;
  /** Quiet "needs you" dot; a string becomes its accessible description. */
  badge?: boolean | string;
  /** A launcher (e.g. "More"): tapping calls `onLaunch` instead of switching. */
  launcher?: boolean;
  /** The place's signal colour. */
  signal?: Signal;
}

export function TabBar<T extends string>({ items, value, onChange, onLaunch, position, floating = true, className }: {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  onLaunch?: (id: T) => void;
  position?: MotionValue<number>;
  /** Fixed to the bottom of its surface (default) or in flow. */
  floating?: boolean;
  className?: string;
}) {
  const n = items.length;
  const index = Math.max(0, items.findIndex((t) => t.id === value));
  const own = useMotionValue(index);
  const lens = position ?? own;
  const keyboard = useKeyboardOpen();
  const barRef = useRef<HTMLDivElement>(null);
  const [cell, setCell] = useState(0);

  useLayoutEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCell((el.clientWidth - 12) / n));
    ro.observe(el);
    return () => ro.disconnect();
  }, [n]);

  // Follow the value when it changes from outside (unless a pager drives the lens).
  useEffect(() => { if (!position) animate(own, index, SPRING.snap); }, [index, own, position]);

  const x = useTransform(lens, (p) => 6 + p * cell);
  const innerX = useTransform(x, (v) => -v);
  // Liquid feel: the lens swells while held and stretches with speed.
  const press = useSpring(0, { stiffness: 600, damping: 30 });
  const speed = useVelocity(lens);
  const stretch = useSpring(useTransform(speed, (v) => Math.min(Math.abs(v) * 0.035, 0.22)), { stiffness: 500, damping: 40 });
  const scaleX = useTransform(() => 1 + press.get() * 0.1 + stretch.get());
  const scaleY = useTransform(() => 1 + press.get() * 0.16 - stretch.get() * 0.35);
  const invX = useTransform(scaleX, (v) => 1 / v);
  const invY = useTransform(scaleY, (v) => 1 / v);
  const innerOrigin = useTransform(x, (v) => `${v + cell / 2}px 50%`);

  const gesture = useRef<{ id: number; x0: number; p0: number; moved: boolean; idx: number } | null>(null);
  const indexAt = (clientX: number) => {
    const r = barRef.current!.getBoundingClientRect();
    return Math.max(0, Math.min(n - 1, Math.floor((clientX - r.left - 6) / cell)));
  };
  const pick = (i: number) => {
    const t = items[i];
    if (t.launcher) { animate(lens, index, SPRING.snap); onLaunch?.(t.id); }
    else if (t.id !== value) onChange(t.id);
  };

  const down = (e: React.PointerEvent) => {
    if (e.button !== 0 || !cell) return;
    barRef.current!.setPointerCapture(e.pointerId);
    const idx = indexAt(e.clientX);
    gesture.current = { id: e.pointerId, x0: e.clientX, p0: idx, moved: false, idx };
    // The lens slides under the finger on touch-down, like iOS.
    animate(lens, idx, SPRING.snap);
    press.set(1);
  };
  const move = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x0;
    if (!g.moved && Math.abs(dx) < 6) return;
    if (!g.moved) { g.moved = true; lens.stop(); }
    const raw = g.p0 + dx / cell;
    const max = n - 1;
    const p = raw < 0 ? raw * 0.25 : raw > max ? max + (raw - max) * 0.25 : raw; // rubber band
    const before = Math.round(lens.get());
    lens.set(p);
    if (Math.round(p) !== before) haptic('tick');
  };
  const end = (e: React.PointerEvent, cancelled = false) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    gesture.current = null;
    press.set(0);
    if (cancelled) { animate(lens, index, SPRING.snap); return; }
    const target = g.moved ? Math.max(0, Math.min(n - 1, Math.round(lens.get()))) : g.idx;
    haptic('select');
    // Velocity carries into the spring; it never skips a tab.
    if (!items[target].launcher) animate(lens, target, { ...SPRING.snap, velocity: speed.get() });
    pick(target);
  };

  const row = (bright: boolean) => items.map((t, i) => <Cell key={t.id} item={t} i={i} active={i === index} bright={bright} cell={cell} lens={lens} />);
  const activeSignal = items[index]?.signal;

  return (
    <motion.nav
      aria-label="Main"
      className={cn(floating ? 'absolute inset-x-0 bottom-0' : 'relative', 'z-[var(--z-tabbar)] px-3', className)}
      style={{ paddingBottom: 'max(10px, var(--safe-bottom))' }}
      initial={false}
      animate={{ y: keyboard ? 120 : 0, opacity: keyboard ? 0 : 1 }}
      transition={SPRING.snap}
    >
      {/* Content scrolling past fades to black instead of peeking out below the bar. */}
      {floating && <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[calc(100%+28px)] bg-[linear-gradient(180deg,rgb(8_9_9/0),rgb(8_9_9/.72)_45%,rgb(8_9_9/.94))]" />}
      <div
        ref={barRef}
        role="tablist"
        data-signal={activeSignal}
        className="glass relative mx-auto h-[58px] max-w-[400px] touch-none select-none rounded-full px-1.5"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={(e) => end(e)}
        onPointerCancel={(e) => end(e, true)}
        onKeyDown={(e) => {
          const go = (i: number) => { e.preventDefault(); haptic('select'); pick(i); requestAnimationFrame(() => barRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[i]?.focus()); };
          if (e.key === 'ArrowRight' && index < n - 1) go(index + 1);
          else if (e.key === 'ArrowLeft' && index > 0) go(index - 1);
          else if (e.key === 'Home') go(0);
          else if (e.key === 'End') go(n - 1);
          else if (e.key === 'Enter' || e.key === ' ') { const i = [...(barRef.current?.querySelectorAll('[role="tab"]') ?? [])].indexOf(document.activeElement as Element); if (i >= 0) go(i); }
        }}
      >
        <div className="flex h-full">{row(false)}</div>
        {cell > 0 && (
          <motion.div aria-hidden="true" className="pointer-events-none absolute top-[4px] bottom-[4px] left-0 rounded-full" style={{ x, width: cell, scaleX, scaleY }}>
            <div className="glass-lens absolute inset-0 rounded-full" />
            {/* A faint wash of the place's colour inside the glass. */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(90%_70%_at_50%_120%,color-mix(in_oklab,var(--color-tab)_22%,transparent),transparent_70%)] transition-[background] duration-500" />
            <motion.div className="absolute inset-0 rounded-full" style={{
              opacity: press,
              background: 'radial-gradient(120% 90% at 30% 0%, rgb(255 255 255 / .24), transparent 55%), radial-gradient(80% 60% at 80% 110%, color-mix(in oklab, var(--color-tab) 30%, transparent), transparent 70%)',
            }} />
            {/* Refraction: the same row, bright and magnified, clipped to the lens. */}
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <motion.div className="absolute top-[-4px] bottom-[-4px] left-0 flex" style={{ x: innerX, scaleX: invX, scaleY: invY, transformOrigin: innerOrigin, width: cell * n + 12, paddingLeft: 6 }}>
                {row(true)}
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}

function Cell({ item, i, active, bright, cell, lens }: { item: TabItem; i: number; active: boolean; bright: boolean; cell: number; lens: MotionValue<number> }) {
  // Base row only: hidden right under the lens, back to full as the lens moves away.
  const opacity = useTransform(lens, (p) => (bright || !cell ? 1 : Math.min(1, Math.max(0, Math.abs(p - i) * 2.4 - 0.35))));
  const { Icon, label, badge, signal } = item;
  // Under the lens the active icon wears its place's colour; the rest are bright white.
  const brightColor = signal && active ? `var(--color-signal-${signal})` : '#fff';
  return (
    <motion.div
      role={bright ? undefined : 'tab'}
      aria-selected={bright ? undefined : active}
      aria-label={bright ? undefined : label}
      aria-description={bright || typeof badge !== 'string' ? undefined : badge}
      tabIndex={bright ? -1 : active ? 0 : -1}
      className="flex h-full shrink-0 flex-col items-center justify-center gap-[3px] outline-offset-[-4px] transition-colors duration-300"
      style={{ width: cell || undefined, flex: cell ? undefined : 1, color: bright ? brightColor : active ? 'var(--color-bright)' : 'var(--color-dim)', opacity }}
    >
      <span className="relative">
        <Icon size={20} strokeWidth={bright ? 1.9 : 1.6} style={bright ? { transform: 'scale(1.06)' } : undefined} />
        {badge && <i aria-hidden="true" className="absolute -top-px -right-0.5 h-1.5 w-1.5 rounded-full bg-ember ring-[1.5px] ring-popover" />}
      </span>
      <span className="text-[9.5px] leading-none tracking-[.01em]" style={bright ? { transform: 'scale(1.04)' } : undefined}>{label}</span>
    </motion.div>
  );
}
