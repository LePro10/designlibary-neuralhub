/**
 * Buttons. Always pill-shaped; one main action per view gets `primary`
 * (solid bright + a soft accent glow), everything else is quieter.
 *
 *  primary  solid bright, accent glow — the one action that matters
 *  solid    solid bright, no glow — main action in a toolbar
 *  glass    translucent with specular rim — over images, ambient light, video
 *  ghost    hairline + fill — secondary
 *  quiet    text only — tertiary, inline
 *  danger   tinted red — destructive
 *
 * `busy` locks the button and swaps the icon for a spinner, so a second
 * click can't slip through. `type` defaults to "button": inside a form a
 * bare <button> would submit it.
 */
import { Loader2, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type ButtonVariant = 'primary' | 'solid' | 'glass' | 'ghost' | 'quiet' | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-bright text-bg shadow-glow hover:bg-white',
  solid: 'bg-bright text-bg hover:bg-white',
  glass: 'glass-lens text-bright backdrop-blur-md hover:brightness-125',
  ghost: 'border border-white/[.14] bg-fill-3 text-bright hover:border-white/[.2] hover:bg-white/[.11]',
  quiet: 'text-ink hover:text-bright hover:bg-fill-2',
  danger: 'border border-danger/25 bg-danger/15 text-danger hover:bg-danger/20',
};

const SIZE: Record<ButtonSize, string> = {
  xs: 'h-8 px-3.5 text-meta gap-1.5',
  sm: 'h-10 px-4 text-chip gap-2',
  md: 'h-11 px-5 text-button gap-2',
  lg: 'h-[52px] px-6 text-[15.5px] gap-2.5',
};
const ICON: Record<ButtonSize, number> = { xs: 14, sm: 16, md: 17, lg: 18 };

export interface ButtonProps {
  children?: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  Icon?: LucideIcon;
  /** Icon after the label (arrows, chevrons). */
  IconEnd?: LucideIcon;
  /** Gloss band sweeps across on hover. */
  sheen?: boolean;
  block?: boolean;
  busy?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  /** Renders an <a>. */
  href?: string;
  className?: string;
  'aria-label'?: string;
}

export function Button({ children, onClick, variant = 'primary', size = 'md', Icon, IconEnd, sheen, block, busy, disabled, type = 'button', href, className, ...rest }: ButtonProps) {
  const cls = cn(
    'pressable relative inline-flex select-none items-center justify-center whitespace-nowrap rounded-full font-medium',
    'disabled:pointer-events-none aria-disabled:pointer-events-none',
    disabled && !busy && 'opacity-45',
    VARIANT[variant], SIZE[size], sheen && 'sheen', block ? 'w-full' : 'shrink-0', className,
  );
  const s = ICON[size];
  const inner = (
    <>
      {busy ? <Loader2 size={s} strokeWidth={1.9} className="animate-spin" /> : Icon && <Icon size={s} strokeWidth={1.9} />}
      {children}
      {IconEnd && <IconEnd size={s} strokeWidth={1.9} className="-mr-1" />}
    </>
  );
  if (href) return <a href={href} className={cls} aria-disabled={disabled || undefined} {...rest}>{inner}</a>;
  return <button type={type} onClick={onClick} disabled={disabled || busy} aria-busy={busy || undefined} className={cls} {...rest}>{inner}</button>;
}

export type IconButtonVariant = 'fill' | 'glass' | 'ghost' | 'solid' | 'danger';

/**
 * Round icon button. Every size keeps a ≥ 44px touch target: `sm` (32px)
 * draws small but its hit area extends past the edge.
 */
export function IconButton({ label, children, onClick, variant = 'fill', size = 'md', active, className, type = 'button' }: {
  label: string; children: ReactNode; onClick?: () => void; variant?: IconButtonVariant; size?: 'sm' | 'md' | 'lg'; active?: boolean; className?: string; type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'pressable relative grid shrink-0 place-items-center rounded-full transition-colors',
        size === 'sm' && 'h-8 w-8 after:absolute after:-inset-1.5 after:content-[""]',
        size === 'md' && 'h-10 w-10',
        size === 'lg' && 'h-14 w-14',
        active ? 'bg-bright text-bg' : {
          fill: 'border border-white/[.12] bg-fill-3 text-bright shadow-rim hover:border-white/[.18] hover:bg-white/[.13]',
          glass: 'glass-lens text-bright hover:brightness-125',
          ghost: 'text-ink hover:bg-fill-2 hover:text-bright',
          solid: 'bg-bright text-bg hover:bg-white',
          danger: 'bg-danger/90 text-white hover:bg-danger',
        }[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}
