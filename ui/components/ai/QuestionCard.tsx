/**
 * When the assistant needs a decision, it asks with options instead of a wall
 * of text. One or several questions (a small wizard with step dots), single
 * or multiple choice — radio vs. checkbox is told apart by shape (circle vs.
 * rounded square) — and always a way out: "Something else…" opens free text.
 */
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Check, MessageCircleQuestion, PenLine, SendHorizontal } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/cn';
import { haptic } from '../../lib/haptics';
import { useFinePointer } from '../../lib/hooks';
import { SPRING } from '../../lib/motion';

export interface Question {
  /** Short heading ("Time", "Scope"). */
  short?: string;
  question: string;
  options: string[];
  multiple?: boolean;
  /** Allow free text (default true). */
  free?: boolean;
}
export interface Answer { picked: string[]; text?: string }

export function QuestionCard({ questions, onSubmit, onSkip, title = 'Needs your answer', className }: {
  questions: Question[]; onSubmit: (answers: Answer[]) => void; onSkip?: () => void; title?: string; className?: string;
}) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [picked, setPicked] = useState<string[][]>(() => questions.map(() => []));
  const [free, setFree] = useState<string[]>(() => questions.map(() => ''));
  const [freeOpen, setFreeOpen] = useState<boolean[]>(() => questions.map(() => false));
  const fine = useFinePointer();
  const q = questions[step];
  const lastStep = step === questions.length - 1;
  const answered = (i: number) => picked[i].length > 0 || !!free[i].trim();
  const go = (i: number) => { setDir(i > step ? 1 : -1); setStep(i); };
  const submit = () => { haptic('heavy'); onSubmit(questions.map((_, i) => ({ picked: picked[i], text: free[i].trim() || undefined }))); };

  const toggle = (o: string) => {
    haptic('select');
    setPicked((p) => p.map((v, i) => (i !== step ? v : q.multiple ? (v.includes(o) ? v.filter((x) => x !== o) : [...v, o]) : [o])));
    // Single choice in a wizard moves on by itself — one tap per question.
    if (!q.multiple && !lastStep) window.setTimeout(() => go(step + 1), 220);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={SPRING.pop}
      className={cn('card overflow-hidden !rounded-list !border-accent/25', className)}>
      <div className="flex items-center gap-2 px-4 pt-3.5 text-meta text-dim">
        <MessageCircleQuestion size={14} className="text-accent" />
        <span className="flex-1 truncate">{q.short ?? title}</span>
        {questions.length > 1 && (
          <span className="flex gap-1.5" aria-label={`Question ${step + 1} of ${questions.length}`}>
            {questions.map((_, i) => (
              <button key={i} type="button" onClick={() => go(i)} aria-label={`Question ${i + 1}`}
                className={cn('relative h-1.5 rounded-full transition-all duration-300 after:absolute after:-inset-2 after:content-[""]', i === step ? 'w-5 bg-accent' : answered(i) ? 'w-1.5 bg-accent/50' : 'w-1.5 bg-white/20')} />
            ))}
          </span>
        )}
      </div>
      <AnimatePresence mode="wait" initial={false} custom={dir}>
        <motion.div key={step} custom={dir} initial={{ opacity: 0, x: 14 * dir }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 * dir }} transition={{ duration: 0.18 }} className="px-4 pt-2 pb-1">
          <p className="text-[15.5px] leading-snug text-bright">{q.question}</p>
          {q.multiple && <p className="mt-0.5 text-meta text-dim">Pick any</p>}
          <div className="mt-3 flex flex-col gap-2">
            {q.options.map((o) => {
              const on = picked[step].includes(o);
              return (
                <button key={o} type="button" onClick={() => toggle(o)} aria-pressed={on}
                  className={cn('flex min-h-12 w-full items-center gap-3 rounded-field border px-3.5 py-2.5 text-left text-button transition-colors active:scale-[.99]',
                    on ? 'border-accent/60 bg-accent/[.12] text-bright' : 'border-line-2 bg-fill-1 text-ink hover:bg-fill-2')}>
                  <span className={cn('grid h-5 w-5 shrink-0 place-items-center border transition-colors', q.multiple ? 'rounded-[6px]' : 'rounded-full', on ? 'border-accent bg-accent text-bg' : 'border-white/25')}>
                    <AnimatePresence>{on && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={SPRING.toggle}><Check size={12} strokeWidth={3} /></motion.span>}</AnimatePresence>
                  </span>
                  <span className="min-w-0 flex-1">{o}</span>
                </button>
              );
            })}
            {q.free !== false && (freeOpen[step] ? (
              <textarea autoFocus rows={2} value={free[step]} placeholder="Your own answer"
                onChange={(e) => setFree((x) => x.map((v, i) => (i === step ? e.target.value : v)))}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && fine) { e.preventDefault(); if (lastStep) submit(); else go(step + 1); } }}
                className="w-full resize-none rounded-field border border-line-2 bg-fill-2 px-3.5 py-2.5 text-input text-bright outline-none placeholder:text-dim focus:border-accent/40 min-[900px]:text-body" />
            ) : (
              <button type="button" onClick={() => setFreeOpen((x) => x.map((v, i) => (i === step ? true : v)))} className="flex min-h-11 items-center gap-2 rounded-field px-3.5 text-chip text-dim hover:bg-fill-1 hover:text-ink">
                <PenLine size={14} />Something else…
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center gap-2 px-4 pt-2 pb-3.5">
        {step > 0
          ? <button type="button" onClick={() => go(step - 1)} aria-label="Previous question" className="grid h-10 w-10 place-items-center rounded-full text-dim hover:bg-fill-2 hover:text-ink"><ArrowLeft size={16} /></button>
          : onSkip && <button type="button" onClick={onSkip} className="h-10 rounded-full px-3 text-chip text-dim hover:bg-fill-2 hover:text-ink">Skip</button>}
        <span className="flex-1" />
        {lastStep
          ? <button type="button" disabled={!questions.some((_, i) => answered(i))} onClick={submit} className="pressable flex h-10 items-center gap-2 rounded-full bg-bright px-4 text-[14px] font-medium text-bg disabled:opacity-40"><SendHorizontal size={15} />Send</button>
          : <button type="button" onClick={() => go(step + 1)} className="pressable h-10 rounded-full bg-white/[.1] px-4 text-[14px] text-bright hover:bg-white/[.14]">Next</button>}
      </div>
    </motion.div>
  );
}
