/**
 * The first screen of a chat: the orb, a greeting with the name in dim, and
 * (optionally) suggestions. Shrinks on short screens (landscape phones,
 * keyboard open) so the composer never covers it.
 */
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { SPRING } from '../../lib/motion';
import { AssistantOrb } from './AssistantOrb';

export function EmptyChatHero({ name, greeting = 'How can I help', orb, children, className }: {
  name?: string; greeting?: string;
  /** Replace the orb (e.g. a particle sphere). */
  orb?: ReactNode;
  /** Suggestions under the greeting. */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center text-center', className)}>
      <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING.bouncy} className="relative">
        <div aria-hidden="true" className="absolute inset-[-40%] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--orb-1)_30%,transparent),transparent_65%)]" />
        {orb ?? <AssistantOrb size={96} className="[@media(max-height:700px)]:!h-16 [@media(max-height:700px)]:!w-16" />}
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        className="display mt-7 text-[30px] @min-[700px]:text-[44px] [@media(max-height:700px)]:mt-4 [@media(max-height:700px)]:text-headline">
        {greeting}{name ? <>, <span className="text-dim">{name}</span></> : null}?
      </motion.h1>
      {children && <div className="mt-8 w-full max-w-[560px]">{children}</div>}
    </div>
  );
}
