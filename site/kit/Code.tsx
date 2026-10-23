import { Check, Copy } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { highlight } from 'sugar-high';
import { cn } from '@ui/lib/cn';
import { haptic } from '@ui/lib/haptics';

/** Copies text; the icon morphs to a check for 1.4s. */
export function CopyButton({ text, label = 'Copy code', className }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={async () => { try { await navigator.clipboard.writeText(text); } catch { /* insecure context */ } haptic('success'); setDone(true); window.setTimeout(() => setDone(false), 1400); }}
      className={cn('pressable grid h-7 w-7 place-items-center rounded-full text-faint transition-colors hover:bg-fill-3 hover:text-bright', className)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={done ? 'y' : 'n'} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.15 }}>
          {done ? <Check size={15} className="text-mint" /> : <Copy size={15} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function CodeBlock({ code, lang = 'tsx', className, title }: { code: string; lang?: string; className?: string; title?: string }) {
  const html = useMemo(() => highlight(code.trim()), [code]);
  return (
    <div className={cn('relative overflow-hidden surface rounded-stat bg-raised', className)}>
      <div className="flex h-8 items-center justify-between border-b-hair border-line pr-0.5 pl-3">
        <span className="font-mono text-tiny text-faint">{title ?? lang}</span>
        <CopyButton text={code.trim()} />
      </div>
      <pre className="sh scroll-x scroller-subtle p-3.5 font-mono text-[12px] leading-[1.7] text-ink"><code dangerouslySetInnerHTML={{ __html: html }} /></pre>
    </div>
  );
}

/** Inline code. */
export const C = ({ children }: { children: React.ReactNode }) => <code className="inline-code">{children}</code>;
