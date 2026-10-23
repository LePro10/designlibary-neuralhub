/**
 * Device preview: an iPhone-sized frame (390 × 844) scaled to fit. Inside,
 * fixed/absolute overlays stay in the frame (transform containing block),
 * safe areas are simulated, and <Surface> tells components they are on a phone.
 */
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Surface } from '@ui/lib/surface';
import { cn } from '@ui/lib/cn';

const W = 390, H = 844;

export function Phone({ children, maxHeight = 720, className, statusBar = true }: { children: ReactNode; maxHeight?: number; className?: string; statusBar?: boolean }) {
  const outer = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(maxHeight / (H + 24));
  useLayoutEffect(() => {
    const el = outer.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, maxHeight / (H + 24), e.contentRect.width / (W + 24))));
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxHeight]);
  return (
    // The frame is absolutely placed, so it never lends its 414px to the layout (grids would grow to fit it).
    <div ref={outer} className={cn('relative w-full min-w-0', className)} style={{ height: (H + 24) * scale }}>
      <div style={{ width: W + 24, height: H + 24, transform: `translateX(-50%) scale(${scale})`, transformOrigin: 'top center' }}
        className="absolute top-0 left-1/2 rounded-[64px] border border-white/10 bg-[linear-gradient(160deg,#2a2d2c,#121413_40%,#1c1f1e)] p-3 shadow-[0_40px_100px_-30px_rgb(0_0_0/.9),inset_0_1px_0_rgb(255_255_255/.12)]">
        <div
          ref={screen}
          className="relative h-full w-full overflow-hidden rounded-[52px] bg-bg [transform:translateZ(0)]"
          style={{ ['--safe-top' as string]: '50px', ['--safe-bottom' as string]: '22px', ['--tabbar-space' as string]: 'calc(88px + 22px)' } as CSSProperties}
        >
          <Surface portal={screen} mode="phone">{children}</Surface>
          {statusBar && (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-[300] flex h-[50px] items-center justify-between px-9 pt-1 text-[15px] font-semibold text-white">
              <span>9:41</span>
              <span className="absolute top-[11px] left-1/2 h-[34px] w-[122px] -translate-x-1/2 rounded-full bg-black" />
              <span className="flex items-center gap-1.5">
                <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
                <svg width="26" height="12" viewBox="0 0 26 12" fill="none"><rect x=".5" y=".5" width="22" height="11" rx="3.5" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor" /><rect x="24" y="4" width="1.5" height="4" rx=".75" fill="currentColor" opacity=".4" /></svg>
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute bottom-2 left-1/2 z-[300] h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-white/80" />
        </div>
      </div>
    </div>
  );
}
