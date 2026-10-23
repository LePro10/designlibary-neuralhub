/**
 * Lines that rise out of a mask, as if set: for page titles and the one
 * sentence a hero leads with. Pass lines as children of <RevealText.Line>,
 * or a plain string (one line). Replays when `replayKey` changes.
 */
import { motion } from 'motion/react';
import { Children, isValidElement, type ElementType, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { EASE } from '../../lib/motion';

export function RevealText({ children, as: Tag = 'div', delay = 0, stagger = 0.09, duration = 0.7, replayKey, className }: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  stagger?: number;
  duration?: number;
  replayKey?: unknown;
  className?: string;
}) {
  const lines = Children.toArray(children).map((c) => (isValidElement(c) && c.type === Line ? (c.props as { children: ReactNode }).children : c));
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={`${String(replayKey)}-${i}`} className="block overflow-hidden pb-[.08em] -mb-[.08em]">
          <motion.span className="block" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration, ease: EASE.outSoft, delay: delay + i * stagger }}>
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** One line of a RevealText. */
function Line({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn(className)}>{children}</span>;
}
RevealText.Line = Line;
