/**
 * The one look of every small menu (pull-down, context menu): a translucent
 * glass card, 13px corners, a hairline rim, rows that are 40px on phones and
 * 32px with a pointer. Labels left, icons right (as iOS does), a check column
 * on the left when the menu holds choices, tiny dim section labels, hairline
 * dividers, destructive rows in red.
 *
 * Items arrive with an 18ms stagger after the card has started to grow.
 */
import { motion, type Variants } from 'motion/react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { MenuEntry } from './Menu';

/** Glass of small menus. Translucent enough to read what is behind it, never so much that text fights it. */
export const MENU_SURFACE =
  'rounded-menu border-hair border-white/[.1] bg-[rgb(30_32_31/.74)] p-1 shadow-menu backdrop-blur-[20px] backdrop-saturate-[160%]';

const list: Variants = { show: { transition: { staggerChildren: 0.018, delayChildren: 0.03 } } };
const row: Variants = {
  hide: { opacity: 0, y: -3 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
};

/** Approximate height of a list, for placing it above or below its trigger. */
export function menuHeight(items: MenuEntry[], touch: boolean) {
  const rich = items.some((e) => e.glyph && e.detail);
  const rowH = rich ? (touch ? 52 : 44) : touch ? 40 : 32;
  return items.length * rowH + items.filter((e) => e.divider && !e.section).length * 9 + items.filter((e) => e.section).length * 24 + 8;
}

export function MenuItems({ items, touch, onChoose, animate = true }: {
  items: MenuEntry[];
  /** Finger-sized rows. */
  touch: boolean;
  onChoose: (e: MenuEntry) => void;
  animate?: boolean;
}) {
  const choices = items.some((e) => e.checked !== undefined);
  const rich = items.some((e) => e.glyph && e.detail);
  return (
    <motion.div variants={list} initial={animate ? 'hide' : false} animate="show">
      {items.map((e, i) => (
        <motion.div key={`${e.id ?? e.label}-${i}`} variants={row} role="none">
          {e.divider && !e.section && i > 0 && <div className="mx-2.5 my-1 h-[var(--hair)] bg-white/[.1]" />}
          {e.section && <div className={cn('px-2.5 pb-1 text-tiny text-faint', i > 0 ? 'mt-1 border-t-hair border-white/[.08] pt-2' : 'pt-1.5')}>{e.section}</div>}
          <button
            type="button"
            disabled={e.disabled}
            role={e.checked === undefined ? 'menuitem' : e.kind === 'check' ? 'menuitemcheckbox' : 'menuitemradio'}
            aria-checked={e.checked}
            onClick={() => onChoose(e)}
            className={cn(
              'flex w-full items-center gap-2 rounded-[9px] px-2.5 text-left text-chip outline-none transition-colors duration-100',
              'hover:bg-white/[.08] focus-visible:bg-white/[.08] active:bg-white/[.12] disabled:opacity-35',
              rich ? (touch ? 'min-h-[52px] py-1.5' : 'min-h-11 py-1') : touch ? 'h-10' : 'h-8',
              e.destructive ? 'text-danger' : 'text-bright',
            )}
          >
            {choices && (
              <span className="grid w-4 shrink-0 place-items-center text-bright">
                {e.checked && <Check size={13} strokeWidth={2.4} />}
              </span>
            )}
            {e.glyph && <span className="shrink-0">{e.glyph}</span>}
            {rich ? (
              <span className="min-w-0 flex-1">
                <span className="block truncate">{e.label}</span>
                {e.detail && <span className="block truncate text-meta text-dim">{e.detail}</span>}
              </span>
            ) : (
              <>
                <span className="min-w-0 flex-1 truncate">{e.label}</span>
                {e.detail && <span className="max-w-[45%] truncate text-meta text-dim">{e.detail}</span>}
              </>
            )}
            {!touch && e.shortcut && <kbd className="font-mono text-tiny text-faint">{e.shortcut}</kbd>}
            {e.Icon && <e.Icon size={15} strokeWidth={1.7} className={cn('shrink-0', e.destructive ? '' : 'text-ink')} />}
          </button>
        </motion.div>
      ))}
    </motion.div>
  );
}
