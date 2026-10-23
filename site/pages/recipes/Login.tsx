/**
 * Login recipe: the mark draws itself, the dot drops and squashes, fields rise
 * one after another. On success a curtain closes to black — where an intro
 * would take over. Ported from the dashboard login, rebuilt with motion.
 */
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Fingerprint, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@ui/components/core/Button';
import { Field, Input } from '@ui/components/core/Field';
import { Callout } from '@ui/components/core/Feedback';
import { MarkDefs, N_DOT, N_PATH } from '@ui/components/effects/Logo';
import { EASE } from '@ui/lib/motion';
import { haptic } from '@ui/lib/haptics';
import { Phone } from '../../kit/Phone';
import { Demo } from '../../kit/Demo';
import { Doc, DocSection, Rules, Why } from '../../kit/Doc';

export default function LoginRecipe() {
  return (
    <Doc eyebrow="Recipes" title="Sign in" lead="A first impression in 1.4 seconds: the mark draws in one stroke, the point of light falls into place, the form rises line by line. Wrong password? It shakes once and keeps what you typed.">
      <Demo padded={false} minHeight={760} description="Try any email and the password “wrong” for the error path; anything else signs in.">
        {() => <div className="grid w-full gap-8 py-6 @min-[1000px]:grid-cols-2"><Phone><Login /></Phone><div className="hidden @min-[1000px]:block"><div className="relative h-[720px] overflow-hidden rounded-card border border-line"><Login /></div></div></div>}
      </Demo>
      <DocSection title="Choreography">
        <ol className="mt-4 max-w-[680px] list-decimal space-y-1.5 pl-5 text-[14px] text-ink marker:text-dim">
          <li>0.20s — the “n” draws (pathLength, .95s, ease-in-out-draw)</li>
          <li>1.05s — the dot falls from above, squashes on landing (1.3 × .7), settles</li>
          <li>1.35s — the halo fades in under the dot</li>
          <li>from .4s — fields rise 14px, 80ms apart</li>
          <li>success — curtain to black (.38s), then the app's intro</li>
        </ol>
        <Rules items={[
          { do: 'Autofocus the email field only on desktop — on phones the keyboard would cover the animation.', dont: 'Clear the password on error without saying so. Keep the email; select the password.' },
        ]} />
        <Why><p>Reduced motion: everything is simply there. The animation is a welcome, not a gate — a tap anywhere skips it.</p></Why>
      </DocSection>
    </Doc>
  );
}

function Login() {
  const [run, setRun] = useState(0);
  const [mail, setMail] = useState('');
  const [pw, setPw] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'error' | 'done'>('idle');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setState('busy');
    window.setTimeout(() => { if (pw === 'wrong') { haptic('warning'); setState('error'); } else { haptic('success'); setState('done'); } }, 900);
  };
  const rise = (i: number) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: EASE.outSoft, delay: 0.4 + i * 0.08 } });
  return (
    <div key={run} className="relative grid h-full place-items-center overflow-hidden bg-bg px-6" style={{ paddingTop: 'var(--safe-top)' }}>
      <div className="absolute inset-x-0 top-0 h-[55%] bg-[radial-gradient(70%_60%_at_50%_0%,color-mix(in_oklab,var(--color-accent-deep)_22%,transparent),transparent_70%)]" />
      <form onSubmit={submit} className="relative w-full max-w-[340px]">
        <svg viewBox="0 0 48 48" className="mx-auto h-20 w-20 overflow-visible" aria-hidden="true">
          <MarkDefs id="login" />
          <motion.circle cx={N_DOT.cx} cy={N_DOT.cy} r="10" fill="url(#halologin)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.35, duration: 0.5 }} />
          <motion.path d={N_PATH} fill="none" stroke="url(#inklogin)" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 0.95, ease: EASE.inOutDraw }} />
          <motion.circle cx={N_DOT.cx} cy={N_DOT.cy} r={N_DOT.r} fill="#fff" style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
            initial={{ opacity: 0, y: -16, scaleX: 0.4, scaleY: 0.4 }}
            animate={{ opacity: [0, 1, 1, 1, 1], y: [-16, 0, 0, -1.6, 0], scaleX: [0.4, 0.9, 1.3, 0.96, 1], scaleY: [0.4, 1.12, 0.7, 1.05, 1] }}
            transition={{ delay: 1.05, duration: 0.65, times: [0, 0.55, 0.72, 0.86, 1], ease: EASE.bounceLand }} />
        </svg>
        <motion.h1 {...rise(0)} className="display mt-6 text-center text-[30px]">Welcome back</motion.h1>
        <motion.p {...rise(1)} className="mt-1.5 text-center text-[14px] text-dim">Sign in to NeuralHub</motion.p>
        <motion.div {...rise(2)} className="mt-8"><Field label="Email"><Input type="email" autoComplete="username" value={mail} onChange={(e) => setMail(e.target.value)} placeholder="you@example.com" /></Field></motion.div>
        <motion.div {...rise(3)} className="mt-4" animate={state === 'error' ? { opacity: 1, y: 0, x: [0, -8, 7, -5, 3, 0] } : { opacity: 1, y: 0 }}>
          <Field label="Password"><Input type="password" autoComplete="current-password" invalid={state === 'error'} value={pw} onChange={(e) => { setPw(e.target.value); if (state === 'error') setState('idle'); }} /></Field>
        </motion.div>
        <AnimatePresence>{state === 'error' && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><Callout tone="danger" className="mt-4">That password didn’t match. Your email is kept.</Callout></motion.div>}</AnimatePresence>
        <motion.div {...rise(4)} className="mt-6 space-y-2.5">
          <Button type="submit" block size="lg" busy={state === 'busy'} IconEnd={ArrowRight}>Sign in</Button>
          <Button block variant="ghost" Icon={Fingerprint}>Use a passkey</Button>
        </motion.div>
      </form>
      <AnimatePresence>
        {state === 'done' && (
          <motion.div className="absolute inset-0 z-10 grid place-items-center bg-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}>
            <Button variant="quiet" size="sm" Icon={RotateCcw} onClick={() => { setState('idle'); setPw(''); setRun((r) => r + 1); }}>Replay</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
