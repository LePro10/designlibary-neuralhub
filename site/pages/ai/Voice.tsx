import { AnimatePresence, useMotionValue } from 'motion/react';
import { Mic, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AssistantOrb } from '@ui/components/ai/AssistantOrb';
import { VoiceOverlay, type VoiceState } from '@ui/components/ai/VoiceOverlay';
import { requestMic, Waveform } from '@ui/components/ai/Waveform';
import { Button } from '@ui/components/core/Button';
import { bool, Demo, range, select } from '../../kit/Demo';
import { Doc, DocSection, Grid, Props, Rules, Tile, Usage, Why } from '../../kit/Doc';
import { Phone } from '../../kit/Phone';

const SPEECH = 'You have thirty-four minutes before gym. Do the physics sheet first, tasks two and three — that is due tomorrow. On the way out, send Anna a one-liner about Saturday. The history reading can wait: the quiz moved to next week.';

export default function VoicePage() {
  return (
    <Doc eyebrow="AI & Chat" title="Voice" source={['ui/components/ai/AssistantOrb.tsx', 'ui/components/ai/Waveform.tsx', 'ui/components/ai/VoiceOverlay.tsx']}
      lead="The assistant’s presence is a small glass sphere with light swirling inside. Large, it is voice mode: it swells with the voice, its words light up as they are spoken.">
      <Demo title="Orb" minHeight={300} background="plain"
        controls={{ size: range(20, 200, 120, 4, 'px'), state: select(['idle', 'busy', 'rest'] as const), voice: bool(false) }}
        description="Try the accent swatches in the index — the orb follows the theme. Point at it: the highlight leans towards the cursor."
        code={(v) => `<AssistantOrb size={${v.size}} state="${v.state}"${v.voice ? ' level={voiceLevel}' : ''} />`}>
        {(v) => <OrbDemo size={v.size} state={v.state} voice={v.voice} />}
      </Demo>

      <DocSection title="Orb states" description="idle swirls slowly and pauses when the page is hidden or the device rests. busy swirls fast — the assistant is working. rest holds still until pointed at — use it inside glass.">
        <Grid cols={4}>
          <Tile label="20px · status (trace)"><AssistantOrb size={20} state="busy" /></Tile>
          <Tile label="32px · composer (rest)"><span className="orb-trigger"><AssistantOrb size={32} state="rest" /></span></Tile>
          <Tile label="56px · avatar"><AssistantOrb size={56} /></Tile>
          <Tile label="96px · empty chat"><AssistantOrb size={96} /></Tile>
        </Grid>
      </DocSection>

      <DocSection title="Waveform" description="Real microphone through a WebAudio analyser when allowed; a believable simulated voice otherwise. Bars move by scaleY written straight to the DOM — no React render per frame.">
        <Demo minHeight={180} controls={{ shape: select(['center', 'bottom'] as const), bars: range(12, 64, 36, 4), height: range(16, 64, 32, 4, 'px') }}
          code={(v) => `const stream = await requestMic(); // null → simulated\n<Waveform stream={stream} bars={${v.bars}} height={${v.height}} shape="${v.shape}" level={level} />`}>
          {(v) => <WaveDemo {...v} />}
        </Demo>
      </DocSection>

      <DocSection title="Voice mode" description="Full screen inside its container. Phrases light up karaoke-style as they are spoken; what was said dims, what comes is faint. 56px controls, hang-up is the only red.">
        <Demo minHeight={760} padded={false} controls={{ state: select(['listening', 'thinking', 'speaking', 'error'] as const, 'speaking'), muted: bool(false) }}
          code={(v) => `<AnimatePresence>\n  {voice && (\n    <VoiceOverlay\n      state="${v.state}"\n      transcript={answer}\n      spokenWords={wordsSpoken}${v.muted ? '\n      muted' : ''}\n      onMute={toggleMute}\n      onEnd={() => setVoice(false)}\n      level={level}\n    />\n  )}\n</AnimatePresence>`}>
          {(v) => <div className="w-full py-6"><Phone maxHeight={700}><VoiceDemo state={v.state} muted={v.muted} /></Phone></div>}
        </Demo>
      </DocSection>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'Tap on the orb interrupts while the assistant speaks or thinks.', dont: 'Make people find a small stop button mid-sentence.' },
          { do: 'Animate only transforms; keep blur on a static child layer.', dont: 'Put a blur filter on a moving layer — the loop leaves the compositor and the phone heats up.' },
          { do: 'Pause decorative swirls when hidden or at rest (.deko).', dont: 'Run three orbs at 60 fps on a page nobody is looking at.' },
        ]} />
        <Why><p>The orb is four stacked gradients: a radial base in the deep accent, a rotating conic swirl, a drifting warm blob and a specular highlight that follows the pointer. Only <code>transform</code> animates. The colours come from <code>--orb-*</code>, so every accent theme has its own orb.</p></Why>
      </DocSection>

      <DocSection title="API">
        <Usage code={`const level = useMotionValue(0);\n<Waveform stream={mic} level={level} />\n<AssistantOrb size={220} level={level} />`} />
        <Props rows={[
          { name: 'AssistantOrb', type: '{ size, state?: "idle" | "busy" | "rest", level?, label? }', description: 'level (0..1 MotionValue) swells it with the voice.' },
          { name: 'Waveform', type: '{ stream?, active?, bars?, height?, shape?, color?, level? }', description: 'Without stream: simulated. Writes loudness to level.' },
          { name: 'requestMic()', type: '() => Promise<MediaStream | null>', description: 'null when refused — fall back to the simulation.' },
          { name: 'VoiceOverlay', type: '{ state, transcript?, spokenWords?, heard?, muted?, onMute?, onEnd, onInterrupt?, onRetry?, level? }', description: 'state: connecting | listening | thinking | speaking | error.' },
        ]} />
      </DocSection>
    </Doc>
  );
}

function OrbDemo({ size, state, voice }: { size: number; state: 'idle' | 'busy' | 'rest'; voice: boolean }) {
  const level = useMotionValue(0);
  return (
    <div className="flex flex-col items-center gap-6">
      <span className={state === 'rest' ? 'orb-trigger' : undefined}><AssistantOrb size={size} state={state} level={voice ? level : undefined} /></span>
      {voice && <Waveform level={level} bars={24} height={20} />}
    </div>
  );
}

function WaveDemo({ shape, bars, height }: { shape: 'center' | 'bottom'; bars: number; height: number }) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [asked, setAsked] = useState(false);
  useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream]);
  return (
    <div className="flex w-full max-w-[420px] flex-col items-center gap-5">
      <Waveform stream={stream} shape={shape} bars={bars} height={height} />
      <Button size="xs" variant="ghost" Icon={stream ? Play : Mic} onClick={async () => { if (stream) { stream.getTracks().forEach((t) => t.stop()); setStream(null); } else { setAsked(true); setStream(await requestMic()); } }}>
        {stream ? 'Back to simulation' : 'Use my microphone'}
      </Button>
      {asked && !stream && <p className="text-meta text-dim">No microphone access — showing the simulation.</p>}
    </div>
  );
}

function VoiceDemo({ state, muted: m }: { state: VoiceState; muted: boolean }) {
  const [muted, setMuted] = useState(m);
  const [open, setOpen] = useState(true);
  const [words, setWords] = useState(0);
  const total = SPEECH.split(/\s+/).length;
  const level = useMotionValue(0);
  useEffect(() => setMuted(m), [m]);
  useEffect(() => {
    if (state !== 'speaking') return;
    setWords(0);
    const t = window.setInterval(() => setWords((w) => (w >= total + 6 ? 0 : w + 1)), 260);
    return () => window.clearInterval(t);
  }, [state, total]);
  useEffect(() => {
    if (state !== 'speaking') { level.set(0); return; }
    let raf = 0; const t0 = performance.now();
    const f = (now: number) => { const t = (now - t0) / 1000; level.set(Math.max(0, Math.sin(t * 7) * Math.sin(t * 2.3)) * 0.8); raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [state, level]);
  return (
    <div className="relative h-full">
      {!open && <div className="grid h-full place-items-center"><Button variant="ghost" onClick={() => setOpen(true)}>Start voice</Button></div>}
      <AnimatePresence>
        {open && <VoiceOverlay key="v" state={state} transcript={SPEECH} spokenWords={words} heard={state === 'listening' ? 'What can I still do before training…' : undefined} muted={muted} onMute={() => setMuted(!muted)} onEnd={() => setOpen(false)} onInterrupt={() => setWords(0)} level={level} />}
      </AnimatePresence>
    </div>
  );
}
