import { Play } from 'lucide-react';
import { useState } from 'react';
import { LogoMark, Wordmark } from '@ui/components/effects/Logo';
import { LogoIntro } from '@ui/components/effects/LogoIntro';
import { LogoLoader } from '@ui/components/effects/LogoLoader';
import { Demo, bool, range } from '../../kit/Demo';
import { Button } from '@ui/components/core/Button';
import { Doc, DocSection, Grid, Props, Rules, Tile, Usage, Why } from '../../kit/Doc';

export default function LogoPage() {
  const [run, setRun] = useState(0);
  const [playing, setPlaying] = useState(false);
  return (
    <Doc eyebrow="Effects" title="Logo & intro" source={['ui/components/effects/Logo.tsx', 'ui/components/effects/LogoLoader.tsx', 'ui/components/effects/LogoIntro.tsx']}
      lead="The mark is one monoline stroke and a point of light. The right leg stops short and the dot completes it; the stroke brightens towards the dot because the dot is the only light. At rest nothing moves — point at it and the dot hops once.">
      <DocSection title="Mark" description="Hover (or focus) any of them.">
        <Grid cols={4}>
          {[20, 28, 44, 72].map((s) => (
            <Tile key={s} label={`${s}px`}><button type="button" className="group grid place-items-center p-2" aria-label={`Logo ${s}px`}><LogoMark size={s} /></button></Tile>
          ))}
        </Grid>
        <Grid cols={2}>
          <Tile label="Mark + wordmark (sidebar header)"><button type="button" className="group flex items-center gap-3"><LogoMark size={26} /><Wordmark /></button></Tile>
          <Tile label="Halo follows the accent theme"><span className="flex items-center gap-6"><LogoMark size={40} /><span className="text-meta text-dim">Switch the accent in the index</span></span></Tile>
        </Grid>
      </DocSection>

      <DocSection title="The mark at work" description="Where the app is busy for you (header, thinking, sync), the mark itself works: a short light runs along the stroke while the dot breathes. Calmer and more specific than a glowing orb.">
        <Demo controls={{ size: range(16, 96, 48, 4, 'px'), speed: range(0.8, 3, 1.6, 0.1, 's'), active: bool(true) }} minHeight={200}
          code={(v) => `<LogoLoader size={${v.size}}${v.speed !== 1.6 ? ` speed={${v.speed}}` : ''}${v.active ? '' : ' active={false}'} />`}>
          {(v) => (
            <div className="flex items-center gap-10">
              <LogoLoader size={v.size} speed={v.speed} active={v.active} className="text-bright" />
              <span className="flex items-center gap-2 text-small text-dim"><LogoLoader size={16} speed={v.speed} active={v.active} className="text-ink" />{v.active ? 'Reading your mail…' : 'Done'}</span>
            </div>
          )}
        </Demo>
      </DocSection>

      <DocSection title="Start intro — “point of light”" description="≈ 2.3 s, once per session. A point breathes, draws the mark in one stroke, drops onto its place with a squash, and sends a wave that opens the product. Tap or press any key to skip; reduced motion gets a short cross-fade.">
        <div className="relative isolate mt-5 h-[420px] overflow-hidden rounded-card border-hair border-line-2 bg-bg">
          <div className="absolute inset-0 grid place-items-center p-8 text-center">
            <div>
              <div className="eyebrow">Behind the plate</div>
              <p className="display mt-2 text-display">Good evening, Leandro</p>
              <Button className="mt-6" size="sm" variant="ghost" Icon={Play} onClick={() => { setRun((r) => r + 1); setPlaying(true); }}>{playing ? 'Restart' : 'Play intro'}</Button>
            </div>
          </div>
          {playing && <LogoIntro key={run} size="min(30vmin, 150px)" onDone={() => setPlaying(false)} />}
        </div>
      </DocSection>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'One reaction on hover, played to the end even if the pointer leaves.', dont: 'Idle loops on the resting logo. Only LogoLoader moves, and only while work runs.' },
          { do: 'Gate the intro before first paint (a class on <html>), once per session.', dont: 'Show it on every navigation, or without a skip.' },
        ]} />
        <Why>
          <p>The hop is a Web Animation on HTML layers (transform/opacity), started on <code>pointerenter</code> and never interrupted, so leaving mid-hop never makes it jump. The intro moves the pen along an <code>offset-path</code>; only the stroke's dash offset runs on the main thread, once. The geometry (viewBox 48) is shared by mark, intro, favicon and app icon.</p>
        </Why>
      </DocSection>
      <DocSection title="Props">
        <Props rows={[
          { name: 'LogoMark size', type: 'number', default: '24', description: 'px. The hop triggers on the closest .group ancestor.' },
          { name: 'LogoLoader size / speed / active', type: 'number / number / boolean', default: '24 / 1.6 / true', description: 'Draws in currentColor. Inactive = the resting mark.' },
          { name: 'LogoIntro onDone', type: '() => void', description: 'Unmount it here (and remember "seen" for the session).' },
          { name: 'fullscreen', type: 'boolean', description: 'Fixed over the viewport instead of its parent.' },
          { name: 'flyTo', type: '() => HTMLElement | null', description: 'Logo in the chrome the mark flies into at the end.' },
          { name: 'word', type: 'string', default: "'NeuralHub'", description: 'Spaced mono word under the mark.' },
        ]} />
        <Usage code={`const [intro, setIntro] = useState(() => !sessionStorage.getItem('intro'));\n{intro && <LogoIntro fullscreen flyTo={() => document.querySelector('[data-logo-anchor]')}\n  onDone={() => { sessionStorage.setItem('intro', '1'); setIntro(false); }} />}`} />
      </DocSection>
    </Doc>
  );
}
