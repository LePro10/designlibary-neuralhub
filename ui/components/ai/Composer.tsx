/**
 * The assistant's input: a glass pill that grows to five lines.
 *
 * - The right-hand button morphs with intent: voice orb + mic when empty,
 *   send (bright, with glow) once there is something to send, stop while a
 *   reply streams and the field is empty. Typing stays open during a reply.
 * - Attachments are preview tiles: images as thumbnails, other files as small
 *   cards; very long pasted text becomes a card instead of a wall of text.
 *   Files arrive by picker, paste (screenshots) or drop.
 * - Enter sends only with a real keyboard (fine pointer); on phones Enter is
 *   a new line and the button sends.
 * - Dictation uses the browser's speech recognition and is hidden where there
 *   is none. While recording, the field shows a live waveform and a timer.
 *
 * Put it in <ComposerDock> at the bottom of a chat: it keeps the composer
 * above the tab bar, drops that gap when the keyboard opens, and fades the
 * conversation out underneath.
 */
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, Camera, FileText, Image as ImageIcon, Mic, Plus, Square, TextQuote, X } from 'lucide-react';
import { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from 'react';
import { cn } from '../../lib/cn';
import { haptic } from '../../lib/haptics';
import { useFinePointer, useKeyboardOpen } from '../../lib/hooks';
import { SPRING } from '../../lib/motion';
import { AssistantOrb } from './AssistantOrb';
import { Waveform } from './Waveform';

export type Attachment =
  | { id: number; kind: 'file'; file: File; url?: string }
  | { id: number; kind: 'text'; name: string; text: string };

export interface ComposerHandle {
  focus: () => void;
  setText: (t: string) => void;
  addFiles: (files: File[]) => void;
}

/** From here on, pasted text becomes a card. */
const LONG_CHARS = 2500;
const LONG_LINES = 40;
const LINE = 22;

let nextId = 1;
const sizeLabel = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const ext = (n: string) => (n.includes('.') ? n.split('.').pop()!.toUpperCase().slice(0, 5) : 'FILE');

type Recognition = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null; start: () => void; stop: () => void };
const RecognitionClass = (): (new () => Recognition) | null => {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

export interface ComposerProps {
  /** Return false to refuse (text and attachments stay). */
  onSend: (text: string, attachments: Attachment[]) => void | boolean;
  placeholder?: string;
  /** A reply is streaming: shows Stop while the field is empty. */
  busy?: boolean;
  onStop?: () => void;
  /** Shows the voice-mode orb. */
  onVoice?: () => void;
  /** Hero variant: no attach button, darker and lighter-weight. */
  compact?: boolean;
  /** Allow attachments (default true unless compact). */
  attachments?: boolean;
  /** Browser dictation, where available (default true). */
  dictation?: boolean;
  maxRows?: number;
  disabled?: boolean;
  defaultValue?: string;
  onTextChange?: (t: string) => void;
  autoFocus?: boolean;
  ref?: Ref<ComposerHandle>;
  className?: string;
}

export function Composer({ onSend, placeholder = 'Ask anything', busy, onStop, onVoice, compact, attachments: allowFiles = !compact, dictation = true, maxRows = 5, disabled, defaultValue = '', onTextChange, autoFocus, ref, className }: ComposerProps) {
  const [text, setText] = useState(defaultValue);
  const [files, setFiles] = useState<Attachment[]>([]);
  const [menu, setMenu] = useState(false);
  const [recording, setRecording] = useState(false);
  const [drag, setDrag] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);
  const recognition = useRef<Recognition | null>(null);
  const fine = useFinePointer();
  const canDictate = dictation && !!RecognitionClass();
  // Send reads from refs: a second click on the fading send button would otherwise see the old text.
  const state = useRef({ text, files });
  state.current = { text, files };

  useEffect(() => { onTextChange?.(text); }, [text]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { for (const f of state.current.files) if (f.kind === 'file' && f.url) URL.revokeObjectURL(f.url); recognition.current?.stop(); }, []);

  // Auto-size up to maxRows, then scroll.
  useLayoutEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, LINE * maxRows + 22)}px`;
  }, [text, maxRows, recording]);

  const add = (list: Attachment[]) => { if (list.length) { haptic('select'); setFiles((f) => [...f, ...list]); } };
  const addFiles = (fs: File[]) => add(fs.map((file) => ({ id: nextId++, kind: 'file' as const, file, url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined })));
  const remove = (id: number) => setFiles((f) => { const x = f.find((a) => a.id === id); if (x?.kind === 'file' && x.url) URL.revokeObjectURL(x.url); return f.filter((a) => a.id !== id); });

  useImperativeHandle(ref, () => ({ focus: () => area.current?.focus(), setText, addFiles }), []); // eslint-disable-line react-hooks/exhaustive-deps

  const canSend = !!text.trim() || files.length > 0;
  const send = () => {
    const { text: t, files: f } = state.current;
    if (!t.trim() && !f.length) return;
    if (onSend(t.trim(), f) === false) return;
    haptic('heavy');
    setText('');
    setFiles([]);
  };

  const startRec = () => {
    const K = RecognitionClass();
    if (!K) return;
    const r = new K();
    r.lang = navigator.language || 'en-US';
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (e) => {
      let heard = '';
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) heard += e.results[i][0].transcript;
      if (heard.trim()) setText((t) => (t ? `${t.trimEnd()} ` : '') + heard.trim());
    };
    r.onend = r.onerror = () => { setRecording(false); recognition.current = null; };
    recognition.current = r;
    try { r.start(); setRecording(true); } catch { recognition.current = null; }
  };
  const stopRec = () => { recognition.current?.stop(); setRecording(false); requestAnimationFrame(() => area.current?.focus()); };

  const pick = (kind: 'image' | 'doc' | 'camera') => {
    setMenu(false);
    const input = document.createElement('input');
    input.type = 'file';
    if (kind === 'camera') { input.accept = 'image/*'; input.setAttribute('capture', 'environment'); } else input.multiple = true;
    if (kind === 'image') input.accept = 'image/*';
    input.onchange = () => addFiles(Array.from(input.files ?? []));
    input.click();
  };

  const onPaste = (e: React.ClipboardEvent) => {
    if (!allowFiles) return;
    const fs = Array.from(e.clipboardData.files ?? []);
    if (fs.length) { e.preventDefault(); addFiles(fs); return; }
    const raw = e.clipboardData.getData('text/plain');
    if (raw.length > LONG_CHARS || raw.split('\n').length > LONG_LINES) { e.preventDefault(); add([{ id: nextId++, kind: 'text', name: 'Pasted text', text: raw }]); }
  };

  const showStop = busy && !canSend && !!onStop;
  return (
    <div className={cn('relative', className)}
      onDragOver={(e) => { if (allowFiles && e.dataTransfer.types.includes('Files')) { e.preventDefault(); setDrag(true); } }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDrag(false); }}
      onDrop={(e) => { if (!allowFiles) return; e.preventDefault(); setDrag(false); addFiles(Array.from(e.dataTransfer.files)); }}>
      <AnimatePresence>
        {menu && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.97 }} transition={SPRING.pop}
            className="glass absolute bottom-full left-0 z-10 mb-2 flex gap-1 rounded-[20px] p-1.5" style={{ transformOrigin: 'bottom left' }}>
            {([...(!fine ? [['Camera', Camera, 'camera']] as const : []), ['Photo', ImageIcon, 'image'], ['File', FileText, 'doc']] as const).map(([label, Icon, kind]) => (
              <button key={label} type="button" onClick={() => pick(kind)} className="flex h-16 w-[76px] flex-col items-center justify-center gap-1.5 rounded-field text-meta text-ink hover:bg-fill-3 active:bg-white/10">
                <Icon size={19} strokeWidth={1.7} />{label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn('relative rounded-[28px] border transition-[border-color,box-shadow] duration-300 focus-within:border-white/20',
        compact ? 'border-white/15 bg-black/40' : 'glass', drag && '!border-accent/60 shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-accent)_15%,transparent)]')}>
        <AnimatePresence initial={false}>
          {files.length > 0 && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={SPRING.sheet} className="overflow-hidden">
              <div data-no-swipe className="scroll-x flex gap-2 px-3 pt-3 pb-0.5">
                <AnimatePresence initial={false}>{files.map((a) => <Tile key={a.id} a={a} onRemove={() => remove(a.id)} />)}</AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-1 p-1.5">
          {allowFiles && (
            <button type="button" aria-label="Attach" aria-expanded={menu} onClick={() => setMenu((o) => !o)} className="pressable grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink hover:bg-fill-3">
              <motion.span animate={{ rotate: menu ? 45 : 0 }} transition={SPRING.toggle}><Plus size={22} strokeWidth={1.6} /></motion.span>
            </button>
          )}
          <div className="relative min-h-11 min-w-0 flex-1">
            <AnimatePresence initial={false} mode="popLayout">
              {recording ? (
                <motion.div key="rec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-11 min-w-0 items-center gap-3 pl-3">
                  <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-danger" />
                  <Waveform className="flex-1" bars={40} height={22} />
                  <RecTimer />
                </motion.div>
              ) : (
                <motion.textarea key="txt" ref={area} rows={1} value={text} disabled={disabled} autoFocus={autoFocus}
                  onChange={(e) => setText(e.target.value)}
                  onPaste={onPaste}
                  onFocus={() => setMenu(false)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229 && fine) { e.preventDefault(); send(); } }}
                  placeholder={placeholder} aria-label={placeholder}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className={cn('scroller block min-h-11 w-full resize-none bg-transparent py-[11px] text-input leading-[22px] text-bright outline-none placeholder:truncate placeholder:text-dim', allowFiles ? 'pl-1' : 'pl-4')} />
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence initial={false} mode="popLayout">
            {showStop ? (
              <motion.button key="stop" type="button" aria-label="Stop reply" onClick={() => { haptic('select'); onStop!(); }}
                initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={SPRING.toggle}
                className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/[.1] text-bright hover:bg-white/[.14] active:scale-95">
                <svg viewBox="0 0 44 44" className="absolute inset-0 animate-[spin_1.4s_linear_infinite]" aria-hidden="true">
                  <circle cx="22" cy="22" r="20" fill="none" stroke="var(--color-accent)" strokeOpacity=".7" strokeWidth="1.5" strokeDasharray="22 104" strokeLinecap="round" />
                </svg>
                <Square size={13} fill="currentColor" strokeWidth={0} />
              </motion.button>
            ) : canSend && !recording ? (
              <motion.button key="send" type="button" aria-label="Send" onClick={send}
                initial={{ scale: 0.4, opacity: 0, rotate: -40 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.4, opacity: 0 }} transition={SPRING.toggle}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-bright text-bg shadow-[0_0_30px_-6px_color-mix(in_oklab,var(--color-accent)_70%,transparent)] active:scale-95">
                <ArrowUp size={20} strokeWidth={2.2} />
              </motion.button>
            ) : (
              <motion.div key="voice" className="flex" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={SPRING.toggle}>
                {canDictate && (
                  <button type="button" aria-label={recording ? 'Stop dictation' : 'Dictate'} onClick={() => { haptic('select'); if (recording) stopRec(); else startRec(); }}
                    className={cn('pressable grid h-11 w-11 shrink-0 place-items-center rounded-full', recording ? 'bg-danger/20 text-danger' : 'text-ink hover:bg-fill-3')}>
                    {recording ? <Square size={15} fill="currentColor" /> : <Mic size={20} strokeWidth={1.6} />}
                  </button>
                )}
                {onVoice && !recording && (
                  <button type="button" aria-label="Voice mode" title="Talk" onClick={() => { haptic('select'); onVoice(); }} className="orb-trigger grid h-11 w-11 shrink-0 place-items-center rounded-full">
                    <AssistantOrb size={32} state="rest" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Tile({ a, onRemove }: { a: Attachment; onRemove: () => void }) {
  const name = a.kind === 'file' ? a.file.name || 'File' : a.name;
  return (
    <motion.div layout initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0, transition: { duration: 0.15 } }} transition={SPRING.pop} className="relative mt-1.5 shrink-0" title={name}>
      <button type="button" aria-label={`Remove ${name}`} onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 z-10 grid h-5 w-5 place-items-center rounded-full border border-white/15 bg-card-3 text-ink shadow-md after:absolute after:-inset-2.5 after:content-[''] hover:text-bright">
        <X size={11} strokeWidth={2.2} />
      </button>
      {a.kind === 'file' && a.url ? (
        <img src={a.url} alt={name} className="h-14 w-14 rounded-field border border-white/10 object-cover" />
      ) : (
        <div className="flex h-14 w-[184px] items-center gap-2.5 rounded-field border border-line-2 bg-fill-2 pr-3 pl-2">
          <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-tile bg-fill-3 text-accent">
            {a.kind === 'text' ? <TextQuote size={16} /> : <span className="font-mono text-[9px] font-medium">{ext(a.file.name)}</span>}
          </span>
          <div className="min-w-0">
            <div className="truncate text-detail text-bright">{name}</div>
            <div className="truncate text-[11.5px] text-dim">{a.kind === 'file' ? `${ext(a.file.name)} · ${sizeLabel(a.file.size)}` : `${a.text.split('\n').length.toLocaleString('en')} lines`}</div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function RecTimer() {
  const [s, setS] = useState(0);
  useEffect(() => { const t = window.setInterval(() => setS((v) => v + 1), 1000); return () => window.clearInterval(t); }, []);
  return <span className="shrink-0 font-mono text-meta text-dim tabular">{Math.floor(s / 60)}:{String(s % 60).padStart(2, '0')}</span>;
}

/**
 * Bottom dock for a chat: holds the composer above the tab bar (or 10px above
 * the keyboard when it is open) and fades the conversation out beneath it.
 * Place it absolutely at the bottom of the chat column.
 */
export function ComposerDock({ children, className }: { children: ReactNode; className?: string }) {
  const keyboard = useKeyboardOpen();
  return (
    <div className={cn('pointer-events-none absolute inset-x-0 bottom-0 z-20', className)}
      style={{ paddingBottom: keyboard ? 10 : 'calc(var(--tabbar-space) + 8px)' }}>
      <div aria-hidden="true" className="absolute inset-x-0 -top-10 bottom-0 bg-[linear-gradient(180deg,rgb(8_9_9/0),rgb(8_9_9/.86)_40%,var(--color-bg))]" />
      <div className="pointer-events-auto relative mx-auto w-full max-w-[760px] px-3">{children}</div>
    </div>
  );
}
