/**
 * "Working" indicators, quietest first. Use the one that matches what you
 * actually know: a label if you know what is happening (shimmer), dots if
 * you only know *that* something is happening, the orb for the assistant itself.
 */
import { motion } from 'motion/react';
import { cn } from '../../lib/cn';
import { Shimmer } from '../effects/Shimmer';
import { AssistantOrb } from './AssistantOrb';

export type ThinkingVariant = 'shimmer' | 'dots' | 'orb' | 'pulse';

export function ThinkingIndicator({ variant = 'shimmer', label = 'Thinking', className }: { variant?: ThinkingVariant; label?: string; className?: string }) {
  const text = `${label.replace(/[.…]+$/, '')}…`;
  if (variant === 'dots') {
    return (
      <span role="status" aria-label={text} className={cn('inline-flex h-6 items-center gap-1', className)}>
        {[0, 1, 2].map((i) => (
          <motion.i key={i} className="h-1.5 w-1.5 rounded-full bg-dim"
            animate={{ y: [0, -4, 0], opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.14 }} />
        ))}
      </span>
    );
  }
  if (variant === 'orb') {
    return (
      <span role="status" className={cn('inline-flex items-center gap-2.5 text-chip', className)}>
        <AssistantOrb size={20} state="busy" />
        <Shimmer>{text}</Shimmer>
      </span>
    );
  }
  if (variant === 'pulse') {
    return (
      <span role="status" className={cn('inline-flex items-center gap-2.5 text-chip text-dim', className)}>
        <span className="relative grid h-5 w-5 place-items-center">
          <motion.i className="absolute inset-0 rounded-full border border-accent/50" animate={{ scale: [0.6, 1.4], opacity: [0.8, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }} />
          <i className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]" />
        </span>
        {text}
      </span>
    );
  }
  return <span role="status" className={cn('text-chip font-medium', className)}><Shimmer>{text}</Shimmer></span>;
}
