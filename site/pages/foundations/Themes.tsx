import { Bell, Send, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ACCENTS, GLASS_LEVELS, type Accent, type GlassLevel } from '@ui/lib/tokens';
import { Button, IconButton } from '@ui/components/core/Button';
import { Switch, Check } from '@ui/components/core/Switch';
import { Segmented } from '@ui/components/core/Segmented';
import { Slider } from '@ui/components/core/Slider';
import { Pill } from '@ui/components/core/Chips';
import { Shimmer } from '@ui/components/effects/Shimmer';
import { LogoMark } from '@ui/components/effects/Logo';
import { Backdrop } from '../../kit/Backdrop';
import { Doc, DocSection, Usage, Why } from '../../kit/Doc';

export default function ThemesPage() {
  return (
    <Doc eyebrow="Foundations" title="Themes" source={['ui/styles/tokens.css', 'ui/lib/tokens.ts']}
      lead="Dark stays dark. What changes is the light: six accent sets recolour focus rings, links, switches, glows, the voice orb and the light border together; four glass levels tune how much the world behind shows through. Set them on <html> — or on any subtree.">
      <DocSection title="Accents side by side" description="Each card below is its own subtree with data-accent — the same components, six lights.">
        <div className="mt-5 grid gap-3 @min-[700px]:grid-cols-2 @min-[1000px]:grid-cols-3">
          {ACCENTS.map((a) => <AccentCard key={a} accent={a} />)}
        </div>
      </DocSection>
      <DocSection title="Glass levels" description="subtle for busy backgrounds and low-end phones · default (the dashboard) · strong for more colour · clear for the liquid look.">
        <div className="mt-5 grid grid-cols-2 gap-3 @min-[900px]:grid-cols-4">
          {GLASS_LEVELS.map((g) => <GlassCard key={g} level={g} />)}
        </div>
      </DocSection>
      <DocSection title="Usage">
        <Usage code={`<html data-accent="ice" data-glass="default">   <!-- defaults -->\n\n// at runtime\nimport { setTheme } from './ui/lib/tokens';\nsetTheme({ accent: 'mint', glass: 'strong' });\n\n// a subtree\n<section data-accent="ember">…</section>`} />
        <Why><p>Themes only touch light. Surfaces, ink and spacing never change — that is what keeps every accent recognisably the same product. A light theme was deliberately left out: the system's depth comes from light on dark, and inverting it would need a second set of every shadow and glow.</p></Why>
      </DocSection>
    </Doc>
  );
}

function AccentCard({ accent }: { accent: Accent }) {
  const [on, setOn] = useState(true);
  const [seg, setSeg] = useState('a');
  const [v, setV] = useState(60);
  return (
    <div data-accent={accent} className="card relative overflow-hidden p-5">
      <div className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-accent-deep opacity-25 blur-3xl" />
      <div className="relative flex items-center justify-between">
        <span className="flex items-center gap-2.5"><LogoMark size={22} /><span className="font-mono text-[12px] text-bright">{accent}</span></span>
        <span className="voice-orb is-busy deko h-8 w-8"><i className="voice-orb-swirl"><i /></i><i className="voice-orb-blob"><i /></i><i className="voice-orb-shine" /></span>
      </div>
      <div className="relative mt-5 flex flex-wrap items-center gap-2.5">
        <Button size="sm" Icon={Send}>Send</Button>
        <IconButton size="sm" label="Bell"><Bell size={15} /></IconButton>
        <Switch size="sm" checked={on} onChange={setOn} label="On" />
        <Check checked label="Done" color="var(--color-accent)" />
        <Pill tone="accent" Icon={Sparkles}>Luna</Pill>
      </div>
      <div className="relative mt-4"><Segmented size="sm" value={seg} onChange={setSeg} options={[{ value: 'a', label: 'Today' }, { value: 'b', label: 'Week' }]} /></div>
      <div className="relative mt-2"><Slider label="Level" value={v} onChange={setV} bubble={false} /></div>
      <p className="relative mt-1 text-[13px] text-dim"><Shimmer color="var(--color-accent)">Thinking about your week…</Shimmer> <a className="text-accent underline decoration-accent/40 underline-offset-2" href="#/foundations/themes">a link</a></p>
    </div>
  );
}

function GlassCard({ level }: { level: GlassLevel }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (ref.current) ref.current.dataset.glass = level; }, [level]);
  return (
    <div ref={ref} className="relative h-48 overflow-hidden rounded-card border-hair border-line">
      <Backdrop variant="scene" />
      <div className="glass absolute inset-x-3 bottom-3 rounded-dialog p-3.5">
        <div className="font-mono text-[12px] text-bright">{level}</div>
        <div className="text-meta text-ink">The world behind, softened.</div>
      </div>
    </div>
  );
}
