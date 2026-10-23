import { ArrowRight, Bot, Code2 } from 'lucide-react';
import { motion } from 'motion/react';
import { MeshGradient } from '@ui/components/effects/MeshGradient';
import { LogoMark } from '@ui/components/effects/Logo';
import { Button } from '@ui/components/core/Button';
import { AMBIENT } from '@ui/lib/tokens';
import { EASE } from '@ui/lib/motion';
import { GROUPS } from '../../registry';
import { go } from '../../router';

const PRINCIPLES = [
  ['Quiet dark', 'Near-black ground, grey-green ink, hairlines. Nothing shouts.'],
  ['Light is content', 'Colour appears as light — on Luna, the hero, “now”. One glow per screen.'],
  ['Physical motion', 'Springs you can grab and interrupt. Haptics on every choice.'],
  ['Phone first, desktop equal', 'Thumb reach, sheets, swipes — and a pointer-sized twin.'],
  ['States are features', 'Loading, empty, error, live: designed, not patched.'],
  ['Fast at rest', 'Loops on the compositor, decorations sleep when nobody looks.'],
] as const;

export default function Overview() {
  return (
    <div className="relative">
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 h-[620px]">
          <MeshGradient colors={[...AMBIENT.luna]} intensity={0.6} falloff={0.32} warp={0.35} grain={0} seed={3} speed={0.35} resolution={0.34} />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(8_9_9/.15),rgb(8_9_9/.55)_45%,rgb(8_9_9/.92)_80%,var(--color-bg))]" />
          <div className="grain-tile absolute inset-0 opacity-30 [mask-image:linear-gradient(180deg,#000_30%,transparent_92%)]" />
        </div>
        <div className="mx-auto max-w-[1040px] px-4 pt-14 pb-10 @min-[900px]:px-10 @min-[900px]:pt-24">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE.outSoft }}>
            <div className="group inline-flex"><LogoMark size={56} /></div>
            <div className="eyebrow mt-8">NeuralHub · Design library · v1</div>
            <h1 className="display mt-4 text-[46px] @min-[900px]:text-[84px]">Quiet dark.<br /><span className="text-glow">Light</span> as content.</h1>
            <p className="mt-6 max-w-[620px] text-lead text-ink">The design, motion and mobile craft of NeuralHub — extracted, cleaned up and made reusable. Copy-in React components, tokens and effects, with every decision explained so a person or an AI can build new products that feel the same.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" IconEnd={ArrowRight} sheen onClick={() => go('foundations/color')}>Explore foundations</Button>
              <Button size="lg" variant="glass" Icon={Bot} onClick={() => go('start/use-with-ai')}>Use it with Claude</Button>
              <Button size="lg" variant="quiet" Icon={Code2} href="https://github.com/LePro10/designlibary-neuralhub">Repository</Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-[1040px] px-4 pb-28 @min-[900px]:px-10">
        <section className="mt-6 grid gap-3 @min-[640px]:grid-cols-2 @min-[960px]:grid-cols-3">
          {PRINCIPLES.map(([t, d], i) => (
            <motion.div key={t} className="card p-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE.outSoft, delay: 0.15 + i * 0.05 }}>
              <div className="eyebrow">0{i + 1}</div>
              <h3 className="mt-2 text-title font-light tracking-[-.02em] text-bright">{t}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-dim">{d}</p>
            </motion.div>
          ))}
        </section>

        <section className="mt-16">
          <h2 className="eyebrow mb-4 px-1">Inside</h2>
          <div className="grid gap-3 @min-[640px]:grid-cols-2">
            {GROUPS.filter((g) => g.id !== 'start').map((g) => (
              <button key={g.id} type="button" onClick={() => go(`${g.id}/${g.pages[0].id}`)}
                className="pressable hoverable group card flex flex-col items-start p-5 text-left">
                <div className="flex w-full items-baseline justify-between">
                  <span className="text-title font-light tracking-[-.02em] text-bright">{g.title}</span>
                  <span className="font-mono text-tiny text-dim">{g.pages.length} {g.pages.length === 1 ? 'page' : 'pages'}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-[13px] text-dim">{g.pages.map((p) => p.title).join(' · ')}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-meta text-accent opacity-80 transition-[gap] group-hover:gap-2">Open <ArrowRight size={13} /></span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
