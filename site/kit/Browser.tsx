/** Desktop preview: a browser window at a fixed size, scaled to fit, with <Surface mode="desktop">. */
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Surface } from '@ui/lib/surface';

export function Browser({ children, width = 1280, height = 800, url = 'app.neuralhub.dev' }: { children: ReactNode; width?: number; height?: number; url?: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
  useLayoutEffect(() => {
    const el = outer.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, e.contentRect.width / width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  const H = height + 40;
  return (
    <div ref={outer} className="relative w-full min-w-0" style={{ height: H * scale }}>
      <div style={{ width, height: H, transform: `scale(${scale})`, transformOrigin: 'top left' }} className="absolute top-0 left-0 overflow-hidden rounded-[14px] border border-white/10 bg-chrome shadow-[0_40px_100px_-30px_rgb(0_0_0/.9)]">
        <div className="flex h-10 items-center gap-2 border-b-hair border-line px-4">
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => <i key={c} className="h-3 w-3 rounded-full opacity-80" style={{ background: c }} />)}
          <div className="mx-auto flex h-6 w-[360px] items-center justify-center rounded-[7px] bg-fill-2 font-mono text-[11px] text-dim">{url}</div>
        </div>
        <div ref={screen} className="relative overflow-hidden bg-bg [transform:translateZ(0)]" style={{ height, ['--safe-top' as string]: '0px', ['--safe-bottom' as string]: '0px', ['--tabbar-space' as string]: '0px' } as CSSProperties}>
          <Surface portal={screen} mode="desktop">{children}</Surface>
        </div>
      </div>
    </div>
  );
}
