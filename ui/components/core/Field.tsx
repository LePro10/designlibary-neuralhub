/**
 * Inputs. 16px text on phones (iOS/Android never zoom in), 14.5px on desktop.
 * Fields are 48px tall on phones, 44px on desktop; radius `field` (14px).
 */
import { Search as SearchIcon, X as XIcon } from 'lucide-react';
import { useLayoutEffect, useRef, type ReactNode, type Ref, type TextareaHTMLAttributes, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

/** The input recipe — use on any <input> that is not one of the components below. */
export const inputClass =
  'h-12 w-full rounded-field border border-line bg-fill-2 px-3.5 text-input text-bright outline-none transition-colors placeholder:text-dim ' +
  'focus:border-line-2 focus:bg-fill-3 aria-invalid:border-danger/50 min-[900px]:h-11 min-[900px]:text-button';

/** Labelled field: mono eyebrow label, the control, an optional hint or error. */
export function Field({ label, hint, error, children, className }: { label: string; hint?: ReactNode; error?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="eyebrow mb-2 block px-1">{label}</span>
      {children}
      {error ? <span role="alert" className="mt-1.5 block px-1 text-meta text-danger">{error}</span>
        : hint && <span className="mt-1.5 block px-1 text-meta text-dim">{hint}</span>}
    </label>
  );
}

export function Input({ className, invalid, ref, ...props }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} aria-invalid={invalid || undefined} className={cn(inputClass, className)} {...props} />;
}

/** Grows with its content up to `maxRows`, then scrolls. */
export function TextArea({ className, maxRows = 8, value, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { maxRows?: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    const line = parseFloat(getComputedStyle(el).lineHeight) || 22;
    el.style.height = `${Math.min(el.scrollHeight, line * maxRows + 24)}px`;
  }, [value, maxRows]);
  return <textarea ref={ref} value={value} rows={3} className={cn(inputClass, 'h-auto min-h-[96px] resize-none py-3 leading-relaxed', className)} {...props} />;
}

export function SearchField({ value, onChange, placeholder = 'Search', autoFocus, inputRef, hint, className }: {
  value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean; inputRef?: Ref<HTMLInputElement>;
  /** Small hint at the right while empty (e.g. the shortcut), desktop only. */
  hint?: string;
  className?: string;
}) {
  return (
    <label className={cn('flex h-11 items-center gap-2.5 rounded-field border border-line bg-fill-2 px-3.5 transition-colors focus-within:border-line-2 focus-within:bg-fill-3', className)}>
      <SearchIcon size={17} className="text-dim" />
      <input
        ref={inputRef}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Escape' && value) { e.preventDefault(); onChange(''); } }}
        placeholder={placeholder}
        enterKeyHint="search"
        className="min-w-0 flex-1 bg-transparent text-input text-bright outline-none placeholder:text-dim min-[900px]:text-button"
      />
      {!value && hint && <kbd className="hidden rounded-[6px] border border-line px-1.5 font-mono text-tiny text-faint min-[900px]:block">{hint}</kbd>}
      {value && <button type="button" aria-label="Clear search" onClick={() => onChange('')} className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-ink"><XIcon size={13} /></button>}
    </label>
  );
}
