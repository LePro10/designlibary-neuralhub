/**
 * Grouped list (iOS settings style) and its row. Icons are quiet monochrome
 * tiles, so a list reads as text first; colour only for danger or selection.
 */
import { ChevronRight, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/** A card of rows with hairlines between them; optional eyebrow `label` above and `footer` note below. */
export function List({ children, label, action, footer, className }: { children: ReactNode; label?: string; action?: ReactNode; footer?: ReactNode; className?: string }) {
  return (
    <div className={className}>
      {(label || action) && (
        <div className="mb-3 flex items-end justify-between px-1">
          {label && <h3 className="eyebrow">{label}</h3>}
          {action}
        </div>
      )}
      <div className="card divide-y divide-line overflow-hidden !rounded-list">{children}</div>
      {footer && <p className="mt-2.5 px-4 text-detail text-dim">{footer}</p>}
    </div>
  );
}

export interface RowProps {
  Icon?: LucideIcon;
  /** Anything instead of an icon: an avatar, an app icon, a colour dot. */
  leading?: ReactNode;
  title: ReactNode;
  detail?: ReactNode;
  /** Right-aligned value in dim ("On", "3", "English"). */
  value?: ReactNode;
  /** Replaces the chevron (a Switch, a Check, a Pill). */
  trailing?: ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  selected?: boolean;
  /** Two-line titles instead of truncation. */
  wrap?: boolean;
}

export function Row({ Icon, leading, title, detail, value, trailing, onClick, href, danger, selected, wrap }: RowProps) {
  const interactive = !!(onClick || href);
  const Tag = href ? 'a' : onClick ? 'button' : 'div';
  return (
    <Tag
      {...(href ? { href } : {})}
      type={Tag === 'button' ? 'button' : undefined}
      onClick={onClick}
      aria-current={selected || undefined}
      className={cn(
        'flex min-h-[54px] w-full items-center gap-3.5 px-4 py-2.5 text-left',
        interactive && 'hoverable transition-colors active:bg-fill-2',
        selected && '!bg-fill-3',
      )}
    >
      {(Icon || leading) && (
        leading ?? (
          <span className={cn(
            'grid h-8 w-8 shrink-0 place-items-center rounded-tile border transition-colors',
            danger ? 'border-danger/20 bg-danger/10 text-danger' : selected ? 'border-white/[.14] bg-white/[.1] text-bright' : 'border-white/[.06] bg-fill-2 text-ink',
          )}>
            {Icon && <Icon size={16} strokeWidth={1.7} />}
          </span>
        )
      )}
      <span className="min-w-0 flex-1">
        <span className={cn('block text-body leading-snug', !wrap && 'truncate', danger ? 'text-danger' : 'text-bright')}>{title}</span>
        {detail && <span className={cn('mt-0.5 block text-detail text-dim', !wrap && 'truncate')}>{detail}</span>}
      </span>
      {value !== undefined && <span className="shrink-0 text-[14px] text-dim">{value}</span>}
      {trailing}
      {interactive && !trailing && <ChevronRight size={17} className="text-faint" />}
    </Tag>
  );
}
