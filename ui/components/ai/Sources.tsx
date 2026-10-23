/**
 * Sources make an answer checkable. Inline, a numbered citation sits where a
 * claim is made (hover/focus shows the source); under the answer, a row of
 * source cards. Favicons are drawn as a letter tile in the source's colour —
 * no network request, nothing to break.
 */
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, FileText, Globe, Mail, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/cn';
import { SPRING } from '../../lib/motion';

export interface Source {
  title: string;
  /** Domain or place ("wikipedia.org", "Mail · Anna", "Files / Notes"). */
  where: string;
  href?: string;
  snippet?: string;
  kind?: 'web' | 'file' | 'mail';
  /** Tile colour; derived from `where` if omitted. */
  color?: string;
}

const KIND_ICON: Record<NonNullable<Source['kind']>, LucideIcon> = { web: Globe, file: FileText, mail: Mail };
const HUES = ['#b9d3ff', '#a898ff', '#9fe7c8', '#eadcbc', '#ff8a5c', '#5b9bff'];
const hueOf = (s: string) => HUES[[...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % HUES.length];

export function SourceIcon({ source, size = 18 }: { source: Source; size?: number }) {
  const c = source.color ?? hueOf(source.where);
  const Icon = source.kind && source.kind !== 'web' ? KIND_ICON[source.kind] : null;
  return (
    <span className="grid shrink-0 place-items-center rounded-[6px] font-medium text-bg" style={{ width: size, height: size, fontSize: size * 0.55, background: `radial-gradient(120% 120% at 25% 15%, rgb(255 255 255 / .5), transparent 45%), ${c}` }}>
      {Icon ? <Icon size={size * 0.6} strokeWidth={2.2} /> : source.where.replace(/^www\./, '')[0]?.toUpperCase()}
    </span>
  );
}

/** Inline citation: a small numbered chip. Hover or focus shows the source. */
export function Citation({ n, source }: { n: number; source?: Source }) {
  const [open, setOpen] = useState(false);
  const Tag = source?.href ? 'a' : 'span';
  return (
    <span className="relative inline-block align-baseline" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Tag
        {...(source?.href ? { href: source.href, target: '_blank', rel: 'noreferrer' } : { tabIndex: 0 })}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label={source ? `Source ${n}: ${source.title}` : `Source ${n}`}
        className="mx-[1px] inline-grid h-[17px] min-w-[17px] -translate-y-[1px] place-items-center rounded-[6px] bg-fill-3 px-1 align-middle font-mono text-[10px] text-ink no-underline transition-colors hover:bg-accent/20 hover:text-bright"
      >
        {n}
      </Tag>
      <AnimatePresence>
        {open && source && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 2, transition: { duration: 0.12 } }}
            transition={SPRING.pop}
            className="glass pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-30 block w-[260px] -translate-x-1/2 rounded-field p-3 text-left"
          >
            <span className="flex items-center gap-2"><SourceIcon source={source} size={16} /><span className="truncate text-meta text-dim">{source.where}</span></span>
            <span className="mt-1.5 block text-small leading-snug text-bright">{source.title}</span>
            {source.snippet && <span className="mt-1 line-clamp-3 block text-meta leading-relaxed text-dim">{source.snippet}</span>}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/** A row of source cards under an answer; scrolls sideways, numbered like the inline citations. */
export function SourceCards({ sources, className }: { sources: Source[]; className?: string }) {
  return (
    <div data-no-swipe className={cn('rail -mx-4 gap-2 px-4', className)}>
      {sources.map((s, i) => {
        const Tag = s.href ? 'a' : 'div';
        return (
          <motion.div key={s.title + i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING.soft, delay: Math.min(i, 6) * 0.05 }} className="shrink-0">
            <Tag {...(s.href ? { href: s.href, target: '_blank', rel: 'noreferrer' } : {})}
              className="pressable group flex h-[92px] w-[208px] flex-col justify-between rounded-stat border border-line bg-fill-1 p-3 transition-colors hover:border-line-2 hover:bg-fill-2">
              <span className="line-clamp-2 text-small leading-snug text-bright">{s.title}</span>
              <span className="flex items-center gap-2">
                <SourceIcon source={s} size={16} />
                <span className="min-w-0 flex-1 truncate text-meta text-dim">{s.where}</span>
                <span className="font-mono text-[10px] text-faint">{i + 1}</span>
                {s.href && <ArrowUpRight size={13} className="text-faint transition-colors group-hover:text-bright" />}
              </span>
            </Tag>
          </motion.div>
        );
      })}
    </div>
  );
}

/** Compact "3 sources" pill with stacked icons — for collapsed answers and history. */
export function SourceStack({ sources, onClick }: { sources: Source[]; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="pressable inline-flex h-8 items-center gap-2 rounded-full border border-line bg-fill-1 pr-3 pl-1.5 text-meta text-ink hover:bg-fill-2">
      <span className="flex">{sources.slice(0, 3).map((s, i) => <span key={i} className={cn('rounded-[7px] ring-2 ring-bg', i && '-ml-1.5')}><SourceIcon source={s} size={18} /></span>)}</span>
      {sources.length} source{sources.length === 1 ? '' : 's'}
    </button>
  );
}
