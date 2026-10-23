/**
 * Number ticker: each digit is a column 0–9 that rolls to its place on a
 * spring, like an odometer. Width never jumps (tabular figures, fixed digit
 * cells), so it can sit in a headline. Non-digits (separators, signs, units)
 * swap in place. Screen readers get the plain value.
 */
import { motion } from 'motion/react';
import { cn } from '../../lib/cn';
import { SPRING } from '../../lib/motion';

export function NumberTicker({ value, format = (v) => v.toLocaleString('en-US'), className, stagger = 0.03 }: {
  value: number;
  format?: (v: number) => string;
  className?: string;
  /** Seconds between columns, right to left. */
  stagger?: number;
}) {
  const text = format(value);
  const chars = [...text];
  return (
    <span className={cn('tabular relative inline-flex overflow-hidden leading-none', className)} aria-label={text} role="img">
      {chars.map((ch, i) => {
        const fromRight = chars.length - 1 - i;
        const d = ch.charCodeAt(0) - 48;
        if (d < 0 || d > 9) return <span key={`s${fromRight}`} aria-hidden="true">{ch}</span>;
        return (
          // The column stays in flow, so the cell is exactly one digit wide — letter-spacing included.
          <span key={`d${fromRight}`} aria-hidden="true" className="relative inline-block h-[1em] overflow-hidden">
            <motion.span className="flex flex-col" initial={false} animate={{ y: `${-d * 10}%` }} transition={{ ...SPRING.soft, delay: fromRight * stagger }}>
              {Array.from({ length: 10 }, (_, n) => <span key={n} className="block h-[1em] leading-none">{n}</span>)}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}
