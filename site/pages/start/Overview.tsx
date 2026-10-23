import { ArrowRight, ArrowUpRight, Bot } from 'lucide-react';
import { motion } from 'motion/react';
import { Ambient } from '@ui/components/effects/Ambient';
import { LogoMark } from '@ui/components/effects/Logo';
import { Button } from '@ui/components/core/Button';
import { EASE } from '@ui/lib/motion';
import { GROUPS } from '../../registry';
import { go } from '../../router';

const PRINCIPLES = [
  ['Quiet dark', 'Near-black ground, grey-green ink, hairlines, light type.'],
  ['One colour per place', 'Each tab owns a signal colour: in its light, its hero figure, its tab. Nowhere else.'],
  ['Physical motion', 'Springs you can interrupt, a haptic on every choice, nothing that wobbles.'],
  ['Phone first, desktop equal', 'Menus open from the button you tapped. The pointer gets the same features.'],
  ['States are features', 'Loading, empty, error and live are designed, not patched.'],
  ['Fast at rest', 'Light is a 1 KB SVG. Loops run on the compositor and sleep when unseen.'],
] as const;

const rise = (i: number) => ({ initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: EASE.outSoft, delay: 0.08 + i * 0.06 } });

export default function Overview() {
  return (
    <div className="relative">
      <section className="relative isolate overflow-hidden">
        <Ambient name="luna" height="560px" className="-z-10" />
        <div className="mx-auto max-w-[1000px] px-4 pt-14 pb-12 @min-[900px]:px-10 @min-[900px]:pt-24">
          <motion.div {...rise(0)} className="group inline-flex"><LogoMark size={36} /></motion.div>
          <motion.div {...rise(1)} className="eyebrow mt-7">NeuralHub · Design library · v2</motion.div>
          <div className="mt-3 overflow-hidden pb-1">
            <motion.h1 initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 0.7, ease: EASE.outSoft, delay: 0.1 }}
              className="display text-[40px] @min-[900px]:text-[68px]">Quiet dark.<br /><span className="text-dim">Light as content.</span></motion.h1>
          </div>
          <motion.p {...rise(3)} className="mt-5 max-w-[560px] text-lead text-ink">The design, motion and mobile craft of NeuralHub, made reusable. Copy-in React components and tokens, with every decision explained so a person or an AI can build new products that feel the same.</motion.p>
          <motion.div {...rise(4)} className="mt-7 flex flex-wrap gap-2">
            <Button size="lg" IconEnd={ArrowRight} onClick={() => go('foundations/color')}>Foundations</Button>
            <Button size="lg" variant="ghost" Icon={Bot} onClick={() => go('start/use-with-ai')}>Use it with Claude</Button>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-[1000px] px-4 pb-28 @min-[900px]:px-10">
        <section className="grid gap-px overflow-hidden rounded-card border-hair border-line-2 bg-line @min-[640px]:grid-cols-2 @min-[960px]:grid-cols-3">
          {PRINCIPLES.map(([t, d]) => (
            <div key={t} className="bg-bg p-5">
              <h3 className="text-body text-bright">{t}</h3>
              <p className="mt-1 text-small leading-relaxed text-dim">{d}</p>
            </div>
          ))}
        </section>

        <section className="mt-14">
          <h2 className="eyebrow mb-3 px-1">Inside</h2>
          <div className="list-rows overflow-hidden rounded-list border-hair border-line-2 bg-fill-1">
            {GROUPS.filter((g) => g.id !== 'start').map((g) => (
              <button key={g.id} type="button" onClick={() => go(`${g.id}/${g.pages[0].id}`)}
                className="group flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-fill-1">
                <span className="w-44 shrink-0 text-body text-bright">{g.title}</span>
                <span className="hidden min-w-0 flex-1 truncate text-small text-dim @min-[700px]:block">{g.pages.map((p) => p.title).join(' · ')}</span>
                <span className="ml-auto font-mono text-tiny text-faint">{g.pages.length}</span>
                <ArrowUpRight size={14} strokeWidth={1.75} className="text-faint transition-transform duration-300 ease-out-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-bright" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
