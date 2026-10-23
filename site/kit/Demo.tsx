/**
 * Playground: a live preview, knobs, and the code for exactly what you see.
 *
 *   <Demo
 *     controls={{ variant: select(['primary', 'ghost'] as const), busy: bool(false) }}
 *     code={(v) => `<Button variant="${v.variant}" />`}
 *   >
 *     {(v) => <Button variant={v.variant} busy={v.busy}>Save</Button>}
 *   </Demo>
 */
import { Code2, Eye, RotateCcw } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Segmented } from '@ui/components/core/Segmented';
import { Switch } from '@ui/components/core/Switch';
import { Slider } from '@ui/components/core/Slider';
import { Chips } from '@ui/components/core/Chips';
import { cn } from '@ui/lib/cn';
import { Backdrop } from './Backdrop';
import { CodeBlock } from './Code';

export type Control =
  | { type: 'select'; options: readonly string[]; value: string; label?: string }
  | { type: 'bool'; value: boolean; label?: string }
  | { type: 'range'; min: number; max: number; step?: number; value: number; label?: string; unit?: string }
  | { type: 'text'; value: string; label?: string }
  | { type: 'color'; options: readonly string[]; value: string; label?: string };

type ValueOf<C> =
  C extends { type: 'select'; options: readonly (infer O)[] } ? O :
  C extends { type: 'color' } ? string :
  C extends { type: 'bool' } ? boolean :
  C extends { type: 'range' } ? number :
  string;
export type Values<C extends Record<string, Control>> = { [K in keyof C]: ValueOf<C[K]> };

/* Control builders — keep demo code short and typed. */
export const select = <const O extends readonly string[]>(options: O, value?: O[number], label?: string) => ({ type: 'select' as const, options, value: value ?? options[0], label });
export const bool = (value = false, label?: string) => ({ type: 'bool' as const, value, label });
export const range = (min: number, max: number, value: number, step = 1, unit?: string, label?: string) => ({ type: 'range' as const, min, max, value, step, unit, label });
export const text = (value: string, label?: string) => ({ type: 'text' as const, value, label });
export const colors = <const O extends readonly string[]>(options: O, value?: O[number], label?: string) => ({ type: 'color' as const, options, value: value ?? options[0], label });

export type Background = 'plain' | 'scene' | 'ambient' | 'grid' | 'checker' | 'none';

const initial = <C extends Record<string, Control>>(c: C) => Object.fromEntries(Object.entries(c).map(([k, v]) => [k, v.value])) as Values<C>;
const pretty = (k: string) => k.replace(/([A-Z])/g, ' $1').toLowerCase();

export function Demo<C extends Record<string, Control> = Record<string, never>>({ title, description, controls, code, children, background = 'plain', minHeight = 220, padded = true, center = true, className }: {
  title?: string;
  description?: ReactNode;
  controls?: C;
  code?: string | ((v: Values<C>) => string);
  children: (v: Values<C>) => ReactNode;
  background?: Background;
  minHeight?: number;
  padded?: boolean;
  center?: boolean;
  className?: string;
}) {
  const [v, setV] = useState<Values<C>>(() => initial(controls ?? ({} as C)));
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const entries = Object.entries(controls ?? {}) as [keyof C & string, Control][];
  const src = typeof code === 'function' ? code(v) : code;
  const set = (k: keyof C, val: unknown) => setV((o) => ({ ...o, [k]: val }));

  return (
    <div className={cn('@container my-6 overflow-hidden surface rounded-card', className)}>
      {(title || src) && (
        <div className="flex items-center gap-2 border-b-hair border-line py-1.5 pr-1.5 pl-3.5">
          <div className="min-w-0 flex-1">
            {title && <h3 className="truncate text-chip text-ink">{title}</h3>}
          </div>
          {entries.length > 0 && (
            <button type="button" aria-label="Reset controls" title="Reset" onClick={() => setV(initial(controls!))} className="pressable grid h-7 w-7 place-items-center rounded-full text-faint hover:bg-fill-3 hover:text-bright">
              <RotateCcw size={13} strokeWidth={1.75} />
            </button>
          )}
          {src && (
            <Segmented size="sm" value={view} onChange={setView} label="View"
              options={[{ value: 'preview', label: 'Preview', Icon: Eye }, { value: 'code', label: 'Code', Icon: Code2 }]} />
          )}
        </div>
      )}
      {description && <div className="border-b-hair border-line px-3.5 py-2.5 text-small leading-relaxed text-dim">{description}</div>}
      <div className={cn('grid', entries.length > 0 && '@min-[760px]:grid-cols-[minmax(0,1fr)_272px]')}>
        <div className="relative min-w-0">
          {view === 'preview' ? (
            <div className="relative isolate overflow-hidden" style={{ minHeight }}>
              {background !== 'none' && <Backdrop variant={background === 'plain' ? 'plain' : background} className="-z-10" />}
              <div className={cn('relative h-full', padded && 'p-6 @min-[760px]:p-10', center && 'flex min-h-[inherit] flex-wrap items-center justify-center gap-4')} style={{ minHeight }}>
                {children(v)}
              </div>
            </div>
          ) : (
            <div className="p-3"><CodeBlock code={src ?? ''} /></div>
          )}
        </div>
        {entries.length > 0 && (
          <div className="space-y-4 border-t-hair border-line bg-fill-1 p-4 @min-[760px]:border-t-0 @min-[760px]:border-l-hair">
            {entries.map(([k, c]) => (
              <div key={k}>
                {c.type !== 'bool' && <div className="mb-2 flex items-center justify-between"><span className="text-meta text-dim">{c.label ?? pretty(k)}</span>{c.type === 'range' && <span className="font-mono text-tiny text-faint tabular">{String(v[k])}{c.unit ?? ''}</span>}</div>}
                {c.type === 'select' && (c.options.length <= 3 && c.options.join('').length < 22
                  ? <Segmented size="sm" className="w-full" value={v[k] as string} onChange={(x) => set(k, x)} options={c.options.map((o) => ({ value: o, label: o }))} label={k} />
                  : <Chips nowrap={false} className="!mx-0 !flex-wrap !px-0" value={v[k] as string} onChange={(x) => set(k, x)} options={c.options.map((o) => ({ value: o, label: o }))} />)}
                {c.type === 'color' && (
                  <div className="flex flex-wrap gap-2">
                    {c.options.map((o) => (
                      <button key={o} type="button" aria-label={o} aria-pressed={v[k] === o} onClick={() => set(k, o)}
                        className={cn('h-7 w-7 rounded-full ring-offset-2 ring-offset-raised transition-shadow', v[k] === o && 'ring-2 ring-bright')} style={{ background: o.startsWith('--') ? `var(${o})` : o }} />
                    ))}
                  </div>
                )}
                {c.type === 'bool' && (
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-meta text-dim">{c.label ?? pretty(k)}</span>
                    <Switch size="sm" checked={v[k] as boolean} onChange={(x) => set(k, x)} label={c.label ?? k} />
                  </label>
                )}
                {c.type === 'range' && <Slider label={c.label ?? k} value={v[k] as number} min={c.min} max={c.max} step={c.step} onChange={(x) => set(k, x)} format={(x) => `${x}${c.unit ?? ''}`} />}
                {c.type === 'text' && <input value={v[k] as string} onChange={(e) => set(k, e.target.value)} className="h-8 w-full well rounded-field px-2.5 text-small text-bright outline-none focus:border-white/25" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
