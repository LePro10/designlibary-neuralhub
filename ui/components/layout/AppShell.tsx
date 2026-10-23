/**
 * App frame: sidebar on desktop, floating tab bar on phones, the page in
 * between. It owns the full height (h-dvh by default) and nothing else —
 * no content spacing (that is Page's job).
 *
 * The mode comes from the shell's own width, not the viewport, and is handed
 * to everything inside through <Surface>: sheets, menus and the tab-bar gap
 * (`--tabbar-space`) follow it. So the same shell works full-screen, in a
 * pane, or inside a device preview.
 */
import { useRef, type CSSProperties, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Surface, useWidthMode, type LayoutMode } from '../../lib/surface';

export function AppShell({ sidebar, tabbar, children, mode: forced, grain = true, className, style }: {
  sidebar?: ReactNode;
  tabbar?: ReactNode;
  children: ReactNode;
  /** Force a mode (previews); otherwise measured. */
  mode?: LayoutMode;
  /** Film grain over everything (desktop pointer devices only). */
  grain?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const measured = useWidthMode(ref);
  const mode = forced ?? measured ?? 'phone';
  const phone = mode === 'phone';
  return (
    <div
      ref={ref}
      data-mode={mode}
      className={cn('relative flex h-dvh w-full overflow-hidden bg-bg [transform:translateZ(0)]', className)}
      style={{ ['--tabbar-space' as string]: phone && tabbar ? 'calc(88px + var(--safe-bottom))' : '0px', ...style }}
    >
      <Surface portal={ref} mode={mode}>
        {!phone && sidebar}
        <main className="relative min-w-0 flex-1">{children}</main>
        {phone && tabbar}
        {grain && !phone && <div className="grain !absolute" aria-hidden="true" />}
      </Surface>
    </div>
  );
}
