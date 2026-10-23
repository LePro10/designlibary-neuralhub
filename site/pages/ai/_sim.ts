/**
 * Fake model streams for the showcase: bursty chunks like a real network
 * (1–6 words per burst, uneven gaps), plus a scripted agent run that emits
 * the same events a real one would (status, tool start/finish, thinking).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TraceStep } from '@ui/components/ai/AgentTrace';

export function useFakeStream(full: string, { speed = 1, autoplay = true }: { speed?: number; autoplay?: boolean } = {}) {
  const [text, setText] = useState('');
  const [live, setLive] = useState(false);
  const timer = useRef<number | null>(null);
  const pos = useRef(0);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const stop = useCallback(() => { if (timer.current) window.clearTimeout(timer.current); timer.current = null; setLive(false); }, []);
  const tick = useCallback(() => {
    if (pos.current >= full.length) { timer.current = null; setLive(false); return; }
    // A burst of 1–6 words.
    let end = pos.current;
    const words = 1 + Math.floor(Math.random() * 6);
    for (let w = 0; w < words && end < full.length; w++) { const nx = full.indexOf(' ', end + 1); end = nx < 0 ? full.length : nx; }
    pos.current = end;
    setText(full.slice(0, end));
    timer.current = window.setTimeout(tick, (40 + Math.random() * 160) / speedRef.current);
  }, [full]);
  const play = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    pos.current = 0; setText(''); setLive(true);
    timer.current = window.setTimeout(tick, 450 / speedRef.current);
  }, [tick]);
  useEffect(() => { if (autoplay) play(); return () => { if (timer.current) window.clearTimeout(timer.current); }; }, [play, autoplay]);
  return { text, live, play, stop, done: !live && text.length >= full.length };
}

export interface RunEvent { at: number; do: (s: RunState) => RunState }
export interface RunState { steps: TraceStep[]; thinking: string; isThinking: boolean; working: boolean; answer: boolean; seconds: number }

const initialRun: RunState = { steps: [], thinking: '', isThinking: false, working: true, answer: false, seconds: 0 };

/** Plays a script of timed events (ms from start) into a trace state. */
export function useScriptedRun(script: RunEvent[], { speed = 1, autoplay = true }: { speed?: number; autoplay?: boolean } = {}) {
  const [state, setState] = useState<RunState>({ ...initialRun, working: false });
  const timers = useRef<number[]>([]);
  const clear = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = []; };
  const play = useCallback(() => {
    clear();
    setState(initialRun);
    const start = performance.now();
    for (const ev of script) {
      timers.current.push(window.setTimeout(() => setState((s) => ({ ...ev.do(s), seconds: (performance.now() - start) / 1000 })), ev.at / speed));
    }
  }, [script, speed]);
  const stop = useCallback(() => { clear(); setState((s) => ({ ...s, working: false, isThinking: false, steps: s.steps.map((x) => (x.state === 'running' ? { ...x, state: 'error' as const, detail: 'Stopped' } : x)) })); }, []);
  useEffect(() => { if (autoplay) play(); return clear; }, [play, autoplay]);
  return { ...state, play, stop };
}

/** Helpers to write scripts tersely. */
export const ev = {
  think: (at: number, text: string): RunEvent => ({ at, do: (s) => ({ ...s, isThinking: true, thinking: s.thinking + text }) }),
  status: (at: number, id: string, label: string): RunEvent => ({ at, do: (s) => ({ ...s, isThinking: false, steps: [...s.steps, { id, kind: 'status', label, state: 'done' }] }) }),
  start: (at: number, step: Omit<TraceStep, 'state'>): RunEvent => ({ at, do: (s) => ({ ...s, isThinking: false, steps: [...s.steps, { ...step, state: 'running' }] }) }),
  finish: (at: number, id: string, patch: Partial<TraceStep> = {}): RunEvent => ({ at, do: (s) => ({ ...s, steps: s.steps.map((x) => (x.id === id ? { ...x, state: 'done', ...patch } : x)) }) }),
  fail: (at: number, id: string, detail: string): RunEvent => ({ at, do: (s) => ({ ...s, steps: s.steps.map((x) => (x.id === id ? { ...x, state: 'error', detail } : x)) }) }),
  answer: (at: number): RunEvent => ({ at, do: (s) => ({ ...s, isThinking: false, answer: true }) }),
  end: (at: number): RunEvent => ({ at, do: (s) => ({ ...s, working: false, isThinking: false }) }),
};
