/**
 * Voice mode: the orb fills the screen's heart, a status word sits under it,
 * and while the assistant speaks its words run like karaoke — the current
 * phrase lit (accent tint + hairline ring), what was said dims, what comes is
 * faint. Big 56px controls at the bottom; hang-up is the only red.
 *
 * Render it inside a positioned container (it is `absolute inset-0`) and
 * wrap it in <AnimatePresence> to fade in/out. The orb swells with `level`.
 */
import { motion, useMotionValue, type MotionValue } from 'motion/react';
import { Mic, MicOff, RotateCw, X } from 'lucide-react';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { cn } from '../../lib/cn';
import { haptic } from '../../lib/haptics';
import { SPRING } from '../../lib/motion';
import { Shimmer } from '../effects/Shimmer';
import { AssistantOrb } from './AssistantOrb';

export type VoiceState = 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error';

const STATUS: Record<VoiceState, string> = { connecting: 'Connecting', listening: 'Listening', thinking: 'Thinking', speaking: 'Speaking', error: 'Connection lost' };

/** Splits speech into phrases at punctuation, keeping word counts for highlighting. */
function phrases(text: string) {
  const parts = text.match(/[^.!?,;:—]+[.!?,;:—]*\s*/g) ?? [text];
  let w = 0;
  return parts.map((p) => { const n = p.trim().split(/\s+/).filter(Boolean).length; const start = w; w += n; return { text: p, start, end: w }; });
}

export function VoiceOverlay({ state, transcript = '', spokenWords = 0, heard, muted, onMute, onEnd, onInterrupt, onRetry, level, label = 'Voice', className }: {
  state: VoiceState;
  /** What the assistant says (full text of the current answer). */
  transcript?: string;
  /** How many words of `transcript` have been spoken — drives the highlight. */
  spokenWords?: number;
  /** What the mic heard from the user (interim). */
  heard?: string;
  muted?: boolean;
  onMute?: () => void;
  onEnd: () => void;
  /** Tap the orb while it speaks/thinks. */
  onInterrupt?: () => void;
  onRetry?: () => void;
  level?: MotionValue<number>;
  label?: string;
  className?: string;
}) {
  const fallback = useMotionValue(0);
  const list = useMemo(() => phrases(transcript), [transcript]);
  const current = list.findIndex((p) => spokenWords < p.end);
  const box = useRef<HTMLDivElement>(null);
  const lit = useRef<HTMLSpanElement>(null);
  // Keep the lit phrase in the middle of the window.
  useLayoutEffect(() => {
    const b = box.current, l = lit.current;
    if (b && l) b.scrollTo({ top: l.offsetTop - b.clientHeight / 2 + l.offsetHeight / 2, behavior: 'smooth' });
  }, [current]);
  const speaking = state === 'speaking' && !!transcript;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className={cn('absolute inset-0 z-30 flex flex-col items-center bg-bg', className)}
      style={{ paddingTop: 'calc(var(--safe-top) + 16px)', paddingBottom: 'calc(var(--safe-bottom) + 28px)' }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_40%,color-mix(in_oklab,var(--orb-1)_18%,transparent),transparent_70%)]" />
      <div className="relative flex w-full max-w-[760px] items-center justify-between px-5">
        <span className="eyebrow">{label}</span>
        {state !== 'connecting' && state !== 'error' && <span className="text-meta text-dim">{speaking ? 'Talk or tap to interrupt' : 'Just talk'}</span>}
      </div>

      <div className="relative flex min-h-0 w-full max-w-[640px] flex-1 flex-col items-center justify-center px-6">
        <motion.button type="button" aria-label={speaking || state === 'thinking' ? 'Interrupt' : 'Assistant'}
          onClick={() => { if (speaking || state === 'thinking') { haptic('select'); onInterrupt?.(); } }}
          className="rounded-full outline-offset-8" initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: 1, opacity: state === 'error' ? 0.5 : 1 }} transition={SPRING.bouncy} whileTap={{ scale: 0.94 }}>
          <AssistantOrb size={220} state={state === 'thinking' || state === 'connecting' ? 'busy' : 'idle'} level={level ?? fallback} className="!h-[min(58vw,220px)] !w-[min(58vw,220px)]" />
        </motion.button>

        <div className="mt-10 flex h-[148px] w-full flex-col items-center text-center">
          {state === 'thinking' || state === 'connecting'
            ? <Shimmer className="text-meta tracking-[.14em] uppercase">{STATUS[state]}</Shimmer>
            : <span className={cn('text-meta tracking-[.14em] uppercase', state === 'error' ? 'text-danger' : 'text-dim')}>{muted && state === 'listening' ? 'Muted' : STATUS[state]}</span>}
          {speaking ? (
            <div ref={box} className="fade-y scroller relative mt-3 w-full flex-1 text-title leading-[1.45] font-light @min-[700px]:text-[22px]">
              <p className="py-[1.2em]">
                {list.map((p, i) => (
                  <span key={i} ref={i === current ? lit : undefined}
                    className={cn('transition-colors duration-300', i < current ? 'text-ink/55' : i === current ? 'rounded-md bg-accent/[.14] px-1 text-bright ring-1 ring-accent/20 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]' : 'text-faint')}>
                    {p.text}
                  </span>
                ))}
              </p>
            </div>
          ) : (
            <p className="mt-3 line-clamp-3 text-title leading-[1.4] font-light text-bright">
              {state === 'error' ? <span className="text-input text-ink/80">Can’t reach the voice service. Check your connection and try again.</span>
                : muted ? <span className="text-faint">Microphone is off.</span>
                : heard ? <span className="text-ink/80">{heard}</span>
                : state === 'listening' ? <span className="text-faint">Go ahead, I’m listening.</span> : null}
            </p>
          )}
        </div>
      </div>

      <div className="relative flex items-center gap-4">
        {state === 'error'
          ? <Round label="Try again" onClick={() => onRetry?.()}><RotateCw size={21} strokeWidth={1.7} /></Round>
          : onMute && <Round label={muted ? 'Unmute' : 'Mute'} active={muted} disabled={state === 'connecting'} onClick={onMute}>{muted ? <MicOff size={22} strokeWidth={1.7} /> : <Mic size={22} strokeWidth={1.7} />}</Round>}
        <button type="button" aria-label="End voice mode" onClick={() => { haptic('heavy'); onEnd(); }} className="pressable grid h-14 w-14 place-items-center rounded-full bg-danger/90 text-white hover:bg-danger">
          <X size={24} strokeWidth={1.8} />
        </button>
      </div>
    </motion.div>
  );
}

function Round({ label, active, disabled, onClick, children }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} aria-pressed={active} disabled={disabled} onClick={() => { haptic('select'); onClick(); }}
      className={cn('pressable grid h-14 w-14 place-items-center rounded-full border transition-colors disabled:opacity-40', active ? 'border-white/20 bg-bright text-bg' : 'border-white/10 bg-fill-3 text-bright hover:bg-white/[.12]')}>
      {children}
    </button>
  );
}
