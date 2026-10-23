import { Bell, Pause, Play, SkipForward } from 'lucide-react';
import { GlassPanel, LiquidGlass } from '@ui/components/effects/Glass';
import { IconButton } from '@ui/components/core/Button';
import { Backdrop } from '../../kit/Backdrop';
import { bool, Demo, range, select } from '../../kit/Demo';
import { Doc, DocSection, Grid, Props, Rules, Usage, Why } from '../../kit/Doc';

const LEVELS = ['subtle', 'default', 'strong', 'clear'] as const;

export default function GlassPage() {
  return (
    <Doc eyebrow="Effects" title="Glass" source={['ui/components/effects/Glass.tsx', 'ui/styles/effects.css (.glass, .glass-lens, .rim)']}
      lead="Glass is for things that float over content — the tab bar, toolbars, a player, a toast. It is never a page surface. Four levels tune it to what lies behind; the rim is brightest at the top, because that is where light hits a real glass edge.">
      <Demo
        title="Liquid glass card"
        description="Move the pointer over the card: it tilts a little towards you and a specular highlight follows. On touch it stays flat."
        controls={{ level: select(LEVELS, 'default'), tilt: range(0, 14, 6, 1, '°'), shine: range(0, 1, 0.5, 0.05), radius: range(12, 40, 28, 2, 'px'), backdrop: select(['scene', 'ambient'] as const) }}
        background="none"
        minHeight={360}
        code={(v) => `<LiquidGlass level="${v.level}" tilt={${v.tilt}} shine={${v.shine}} radius={${v.radius}}>\n  <NowPlaying />\n</LiquidGlass>`}
      >
        {(v) => (
          <>
            <Backdrop variant={v.backdrop} />
            <LiquidGlass level={v.level} tilt={v.tilt} shine={v.shine} radius={v.radius} className="relative w-full max-w-[340px]">
              <div className="flex items-center gap-4 p-4">
                <div className="h-16 w-16 shrink-0 rounded-stat bg-[conic-gradient(from_200deg,#3b5bff,#a898ff,#ff8a5c,#3b5bff)] shadow-[0_8px_24px_-8px_rgb(0_0_0/.6)]" />
                <div className="min-w-0 flex-1">
                  <div className="eyebrow !text-white/60">Now playing</div>
                  <div className="mt-1 truncate text-body text-bright">Light is content</div>
                  <div className="truncate text-meta text-white/60">NeuralHub · 3:41</div>
                </div>
              </div>
              <div className="mx-4 h-1 overflow-hidden rounded-full bg-white/15"><div className="h-full w-[38%] rounded-full bg-white/80" /></div>
              <div className="flex items-center justify-center gap-3 p-3">
                <IconButton variant="ghost" label="Play"><Play size={18} /></IconButton>
                <IconButton variant="glass" size="lg" label="Pause"><Pause size={22} /></IconButton>
                <IconButton variant="ghost" label="Next"><SkipForward size={18} /></IconButton>
              </div>
            </LiquidGlass>
          </>
        )}
      </Demo>

      <DocSection title="Levels" description={<p>Set globally with <code>data-glass</code> on <code>&lt;html&gt;</code>, or per panel with <code>level</code>. Each level only changes four variables: fill, blur, saturation, rim.</p>}>
        <Grid cols={2}>
          {LEVELS.map((l) => (
            <div key={l} className="relative h-44 overflow-hidden surface rounded-stat">
              <Backdrop variant="scene" />
              <GlassPanel level={l} className="absolute inset-x-5 bottom-5 flex items-center gap-3 !rounded-list p-3.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-bright"><Bell size={17} /></span>
                <span className="min-w-0 flex-1"><span className="block text-chip text-bright">{l}</span><span className="block truncate text-meta text-white/60">{({ subtle: 'busy backgrounds, low-end phones', default: 'the dashboard', strong: 'more blur, more colour', clear: 'liquid, see-through' } as const)[l]}</span></span>
              </GlassPanel>
            </div>
          ))}
        </Grid>
      </DocSection>

      <DocSection title="The three glass recipes" description="Use the classes directly when a component is overkill.">
        <Grid cols={3}>
          {[
            { cls: 'glass', label: '.glass — floating chrome', round: 'rounded-list' },
            { cls: 'glass-lens', label: '.glass-lens — the tab-bar lens', round: 'rounded-full' },
            { cls: 'glass rim', label: '.glass + .rim — light from the top', round: 'rounded-list' },
          ].map((r) => (
            <div key={r.cls} className="overflow-hidden surface rounded-stat">
              <div className="relative grid h-40 place-items-center"><Backdrop variant="ambient" /><div className={`relative h-16 w-40 ${r.round} ${r.cls}`} /></div>
              <div className="border-t border-line px-3.5 py-2 font-mono text-meta text-dim">{r.label}</div>
            </div>
          ))}
        </Grid>
      </DocSection>

      <Demo title="Rim on / off" controls={{ rim: bool(true) }} background="ambient" minHeight={220} code={(v) => `<GlassPanel rim={${v.rim}}>…</GlassPanel>`}>
        {(v) => <GlassPanel rim={v.rim} className="h-28 w-64" ><span className="sr-only">Panel</span></GlassPanel>}
      </Demo>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'Glass over light, images, video, or content scrolling underneath.', dont: 'Glass on flat black — it reads as a grey box. Use .card there.' },
          { do: 'One blur layer per region. Nested glass multiplies the GPU cost and muddies text.', dont: 'Blur on an element that moves every frame (the blur is recomputed per frame).' },
        ]} />
        <Why>
          <p>Real refraction needs an SVG displacement filter, which only Chromium renders and which looks pixelated without super-sampling. The library fakes it the cheap way: blur + saturation for the body, a top-bright rim, an inner bevel and a specular highlight. The tab bar adds a magnified bright copy of the icons under its lens — that reads as refraction without a filter.</p>
        </Why>
      </DocSection>

      <DocSection title="Props">
        <Props rows={[
          { name: 'level', type: "'subtle' | 'default' | 'strong' | 'clear'", default: 'theme', description: 'Glass recipe for this panel.' },
          { name: 'rim', type: 'boolean', default: 'true', description: 'GlassPanel: top-bright border.' },
          { name: 'tilt', type: 'number', default: '6', description: 'LiquidGlass: max tilt in degrees.' },
          { name: 'shine', type: 'number', default: '0.5', description: 'LiquidGlass: specular strength 0–1.' },
        ]} />
        <Usage code={`<html data-glass="strong">      // whole app\n<GlassPanel level="clear">…</GlassPanel>  // one panel\n<div className="glass rim rounded-full">…</div>`} />
      </DocSection>
    </Doc>
  );
}
