import { Mic } from 'lucide-react';
import { useState } from 'react';
import { VoiceOrb } from '@ui/components/effects/VoiceOrb';
import { ParticleOrb, type OrbMood } from '@ui/components/effects/ParticleOrb';
import { Button } from '@ui/components/core/Button';
import { Segmented } from '@ui/components/core/Segmented';
import { bool, Demo, range, select } from '../../kit/Demo';
import { Doc, DocSection, Grid, Props, Rules, Tile, Why } from '../../kit/Doc';

export default function OrbsPage() {
  return (
    <Doc eyebrow="Effects" title="Orbs" source={['ui/components/effects/VoiceOrb.tsx', 'ui/components/effects/ParticleOrb.tsx']}
      lead="Two ways to show that something is listening. The voice orb is a glass bead with light swirling inside — small, it is a button; large, it is the voice mode. The particle orb is a sphere of points that breathes, bands while thinking and ripples while speaking. Both take their colours from the accent theme.">
      <Demo title="Voice orb" controls={{ size: range(24, 200, 120, 4, 'px'), busy: bool(false), speed: range(2, 14, 7, 0.5, 's'), backdrop: select(['plain', 'ambient'] as const) }}
        background="none" minHeight={300}
        code={(v) => `<VoiceOrb size={${v.size}}${v.busy ? ' busy' : ''}${v.speed !== 7 ? ` speed={${v.speed}}` : ''} />`}>
        {(v) => (
          <>
            <div className={v.backdrop === 'ambient' ? 'absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,color-mix(in_oklab,var(--color-accent-deep)_35%,transparent),transparent_70%)]' : 'absolute inset-0 bg-bg'} />
            <VoiceOrb size={v.size} busy={v.busy} speed={v.speed} className="relative" />
          </>
        )}
      </Demo>

      <DocSection title="Voice orb as a button" description="Inside glass (a composer) the orb rests in its first pose and only swirls while you point at it — a moving orb under a backdrop blur makes the blur recompute every frame.">
        <Grid cols={3}>
          <Tile label="In a composer pill (at rest)">
            <div className="glass flex h-12 w-full max-w-[260px] items-center gap-2 rounded-full pr-1.5 pl-4 text-chip text-dim">
              <span className="flex-1">Ask anything…</span>
              <button type="button" aria-label="Voice mode" className="orb-trigger grid h-9 w-9 place-items-center rounded-full"><VoiceOrb size={30} atRest /></button>
            </div>
          </Tile>
          <Tile label="Listening (busy)"><VoiceOrb size={64} busy /></Tile>
          <Tile label="Next to a mic button">
            <div className="flex items-center gap-3"><VoiceOrb size={44} /><Button variant="ghost" size="sm" Icon={Mic}>Talk</Button></div>
          </Tile>
        </Grid>
      </DocSection>

      <ParticleDemo />

      <DocSection title="Rules">
        <Rules items={[
          { do: 'One orb per screen — it is the assistant\'s face.', dont: 'An orb as a loading spinner in lists; use Spinner or Shimmer there.' },
          { do: 'Let state show in motion: idle breathes, thinking bands, speaking ripples per word.', dont: 'Keep the particle orb running offscreen — it pauses itself; don\'t fight that.' },
        ]} />
        <Why>
          <p><strong>Voice orb:</strong> layered gradients; only transforms animate, and each moving layer carries its blur on a static child — Chrome will not run a transform animation on the compositor when the same element has a filter.</p>
          <p><strong>Particle orb:</strong> every particle's motion is closed-form, so the simulation lives in the vertex shader — a frame is a few uniforms and one draw call (Canvas2D drew ~1400 paths per frame on the CPU). Idle it caps at 30 fps; offscreen, hidden, paused or in rest mode it stops. Without WebGL it falls back to a still glowing sphere.</p>
        </Why>
      </DocSection>

      <DocSection title="Props">
        <Props rows={[
          { name: 'VoiceOrb size', type: 'number', description: 'Diameter in px.' },
          { name: 'busy', type: 'boolean', description: 'Fast swirl (listening, thinking).' },
          { name: 'level', type: 'MotionValue<number>', description: '0–1 live voice level; swells the orb.' },
          { name: 'atRest', type: 'boolean', description: 'Paused until an ancestor .orb-trigger is hovered/focused.' },
          { name: 'ParticleOrb mood', type: "'idle' | 'thinking' | 'speaking'", default: "'idle'", description: 'Motion state; transitions are eased.' },
          { name: 'pulse', type: 'number', description: 'Bump per streamed word (0–1) for a ripple.' },
          { name: 'colors', type: 'string[4]', default: 'theme', description: 'Cap, belly, accents. CSS colours or var(--…).' },
          { name: 'density', type: 'number', default: '1400', description: 'Particle budget (scaled down on small canvases).' },
        ]} />
      </DocSection>
    </Doc>
  );
}

function ParticleDemo() {
  const [mood, setMood] = useState<OrbMood>('idle');
  const [pulse, setPulse] = useState(0);
  return (
    <Demo title="Particle orb" description="Point at it to push the particles. Switch the mood, or send a word pulse." controls={{ density: range(300, 2400, 1400, 100), interactive: bool(true) }}
      background="ambient" minHeight={380}
      code={(v) => `<ParticleOrb mood="${mood}" pulse={pulse} density={${v.density}}${v.interactive ? '' : ' interactive={false}'} className="h-72 w-72" />`}>
      {(v) => (
        <div className="flex flex-col items-center gap-4">
          <ParticleOrb key={v.density} mood={mood} pulse={pulse} density={v.density} interactive={v.interactive} className="h-64 w-64" />
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Segmented size="sm" value={mood} onChange={setMood} label="Mood" options={[{ value: 'idle', label: 'idle' }, { value: 'thinking', label: 'thinking' }, { value: 'speaking', label: 'speaking' }]} />
            <Button size="xs" variant="ghost" onClick={() => setPulse(Math.random() * 0.4 + 0.6)}>Word pulse</Button>
          </div>
        </div>
      )}
    </Demo>
  );
}
