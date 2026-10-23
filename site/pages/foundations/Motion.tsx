import { motion, useAnimate } from 'motion/react';
import { Play } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SPRING, springPoints, TICK, type SpringName } from '@ui/lib/motion';
import { Segmented } from '@ui/components/core/Segmented';
import { Button } from '@ui/components/core/Button';
import { Doc, DocSection, Rules, Usage, Why } from '../../kit/Doc';

const USE: Record<SpringName, string> = {
  snap: 'Indicators following a choice: segmented pill, lens, active row',
  toggle: 'Tiny, quick parts: switch thumb, slider thumb',
  sheet: 'Panels, sheets, expanders, page stacks — no overshoot',
  pop: 'Things appearing with a little life: bubbles, cards, menus',
  soft: 'Staggered lists and tiles',
  grow: 'Data: bars and rings — slower, so the eye reads the change',
  bouncy: 'One hero entrance per screen: orb, big number',
};
const NAMES = Object.keys(SPRING) as SpringName[];

export default function MotionPage() {
  return (
    <Doc eyebrow="Foundations" title="Motion" source="ui/lib/motion.ts"
      lead="Motion explains, it never decorates for its own sake. Springs for anything a finger can touch, so it can be interrupted and keeps its velocity; easings for things that just arrive. The dashboard grew fourteen hand-typed spring pairs — they collapse into seven names.">
      <DocSection title="Springs"><SpringLab /></DocSection>
      <DocSection title="Easings" description="CSS tokens and EASE arrays share the same curves.">
        <EaseLab />
      </DocSection>
      <DocSection title="Performance contract">
        <ul className="mt-4 max-w-[720px] list-disc space-y-2 pl-5 text-[14px] leading-relaxed text-ink marker:text-dim">
          <li>Loops animate only <code className="inline-code">transform</code> and <code className="inline-code">opacity</code> — compositor, no repaint.</li>
          <li>A blur never sits on an element that moves; blur a static inner layer instead.</li>
          <li>Decorative loops carry <code className="inline-code">.deko</code>: they pause in rest mode (<code className="inline-code">html.rest</code>), on hidden pages (<code className="inline-code">[inert]</code>) and with reduced motion.</li>
          <li>Transitions that must not stutter while React renders (sheets, stack pushes) use <code className="inline-code">springPoints()</code> → Web Animations with linear easing: the spring runs on the compositor.</li>
          <li>Canvas loops cap at 30fps when idle and stop off-screen (IntersectionObserver) and in background tabs.</li>
          <li>Streaming text fades words in by colour, not blur — a blur makes every word its own layer.</li>
        </ul>
        <Usage title="Compositor spring" code={`import { SPRING, springPoints, TICK } from './ui/lib/motion';\n\nconst pts = springPoints(from, to, SPRING.sheet, velocity);\nel.animate(pts.map((y) => ({ transform: \`translateY(\${y}px)\` })), {\n  duration: (pts.length - 1) * TICK, easing: 'linear', fill: 'forwards',\n});`} />
        <Rules items={[
          { do: 'Ask prefersReducedMotion() before any JS animation and jump to the end.', dont: 'Rely on the CSS reduced-motion rule for springs — it does not reach them.' },
          { do: 'Stagger lists with rise(i): 50ms steps, capped at 8 items.', dont: 'Animate layout properties (height, top) in a loop.' },
        ]} />
        <Why><p>Measured on the dashboard: a slowly drifting mesh gradient cost half of a resting page's GPU time; the 32px composer orb spinning under a backdrop blur cost two thirds of Luna's idle load. Both now rest. Beauty that drains the battery is not beauty.</p></Why>
      </DocSection>
    </Doc>
  );
}

function SpringLab() {
  const [name, setName] = useState<SpringName>('pop');
  const [scope, animate] = useAnimate();
  const pts = useMemo(() => springPoints(0, 1, SPRING[name]), [name]);
  const max = Math.max(1.05, ...pts);
  const W = 520, H = 160;
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${(i / (pts.length - 1)) * W},${H - (p / max) * (H - 16) - 8}`).join(' ');
  const play = async () => {
    const w = (scope.current as HTMLElement | null)?.clientWidth ?? 300;
    await animate('.ball', { x: 0 }, { duration: 0 });
    animate('.ball', { x: w - 56 }, SPRING[name]);
  };
  return (
    <div className="@container mt-5 card p-5">
      <Segmented scroll size="sm" value={name} onChange={setName} options={NAMES.map((n) => ({ value: n, label: n }))} />
      <div className="mt-5 grid gap-5 @min-[700px]:grid-cols-[1fr_220px]">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-[160px] w-full overflow-visible" preserveAspectRatio="none">
          <line x1="0" x2={W} y1={H - (1 / max) * (H - 16) - 8} y2={H - (1 / max) * (H - 16) - 8} stroke="var(--color-line-2)" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
          <motion.path key={name} d={d} fill="none" stroke="var(--color-accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
        </svg>
        <div className="space-y-1.5 font-mono text-[12px]">
          <div className="text-bright">SPRING.{name}</div>
          <div className="text-dim">stiffness {SPRING[name].stiffness}</div>
          <div className="text-dim">damping {SPRING[name].damping}</div>
          <div className="text-dim">settles ≈ {Math.round(pts.length * TICK)}ms</div>
          <div className="text-dim">overshoot {Math.max(0, Math.round((Math.max(...pts) - 1) * 100))}%</div>
          <p className="pt-2 font-sans text-meta text-ink">{USE[name]}</p>
        </div>
      </div>
      <div ref={scope} className="relative mt-5 h-14 rounded-full bg-fill-1">
        <div className="ball absolute top-1 left-1 h-12 w-12 rounded-full bg-bright shadow-glow" />
      </div>
      <Button className="mt-4" size="sm" variant="ghost" Icon={Play} onClick={play}>Play</Button>
    </div>
  );
}

const EASES = [['out-soft', 'cubic-bezier(.22,1,.36,1)', 'Default: everything that arrives'], ['in-out-draw', 'cubic-bezier(.65,0,.35,1)', 'Strokes drawing, curtains'], ['pf', 'cubic-bezier(.77,0,.18,1)', 'Big page-level moves'], ['bounce-land', 'cubic-bezier(.3,0,.3,1)', 'Hops and drops']] as const;
function EaseLab() {
  const [k, setK] = useState(0);
  return (
    <div className="mt-5 card space-y-3 p-5">
      {EASES.map(([n, c, d]) => (
        <div key={n} className="grid grid-cols-[110px_1fr] items-center gap-4 @min-[700px]:grid-cols-[130px_1fr_220px]">
          <span className="font-mono text-[12px] text-bright">ease-{n}</span>
          <div className="relative h-8 rounded-full bg-fill-1"><span key={k} className="absolute top-1 left-1 h-6 w-6 rounded-full bg-accent" style={{ animation: `ease-demo 1.2s ${c} both` }} /></div>
          <span className="hidden text-meta text-dim @min-[700px]:block">{d}</span>
        </div>
      ))}
      <style>{'@keyframes ease-demo { from { left: 4px } to { left: calc(100% - 28px) } }'}</style>
      <Button size="sm" variant="ghost" Icon={Play} onClick={() => setK((x) => x + 1)}>Replay</Button>
    </div>
  );
}
