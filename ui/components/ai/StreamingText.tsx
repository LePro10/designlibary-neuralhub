/**
 * An answer as it streams: words arrive by colour (`.word-in`), never by blur
 * — a blur makes every word its own GPU layer. Bursts from the network are
 * smoothed into a word-by-word flow (useSmoothText). Text only ever grows at
 * the end, so nothing above the caret moves: no layout shift while reading.
 *
 * Understands just enough markdown for chat: paragraphs, "- " lists,
 * **bold**, `code`, and [n] citations (rendered as <Citation> when `sources`
 * are given). For full markdown, render the finished text with your renderer
 * and use this only while `live`.
 */
import { Fragment, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Citation, type Source } from './Sources';
import { useSmoothText } from './stream';

export function StreamingText({ text, live = false, smooth = true, caret = true, sources, className }: {
  text: string;
  /** Still streaming: smooth, animate new words, show the caret. */
  live?: boolean;
  smooth?: boolean;
  caret?: boolean;
  sources?: Source[];
  className?: string;
}) {
  const smoothed = useSmoothText(text, live);
  let shown = smooth ? smoothed : text;
  // An unclosed ** or ` mid-stream would flash raw symbols: hold it back until it closes.
  if (live) {
    if ((shown.match(/\*\*/g)?.length ?? 0) % 2) shown = shown.slice(0, shown.lastIndexOf('**'));
    if ((shown.match(/`/g)?.length ?? 0) % 2) shown = shown.slice(0, shown.lastIndexOf('`'));
  }
  const counter = { i: 0 };
  const blocks = shown ? shown.split(/\n{2,}/) : [];
  const showCaret = live && caret;
  return (
    <div className={cn('selectable space-y-[0.65em] text-[15.5px] leading-[1.62] text-ink [&_strong]:font-medium [&_strong]:text-bright', className)} aria-live={live ? 'polite' : undefined} aria-busy={live || undefined}>
      {blocks.map((b, bi) => {
        const last = bi === blocks.length - 1;
        const lines = b.split('\n');
        if (lines.every((l) => /^\s*[-•]\s/.test(l))) {
          return (
            <ul key={bi} className="list-disc space-y-1 pl-5 marker:text-faint">
              {lines.map((l, li) => <li key={li} className={cn(last && li === lines.length - 1 && showCaret && 'caret')}>{inline(l.replace(/^\s*[-•]\s/, ''), live, counter, sources)}</li>)}
            </ul>
          );
        }
        return <p key={bi} className={cn(last && showCaret && 'caret')}>{inline(b, live, counter, sources)}</p>;
      })}
      {!shown && showCaret && <p className="caret" />}
    </div>
  );
}

function inline(src: string, live: boolean, counter: { i: number }, sources?: Source[]): ReactNode[] {
  return src.split(/(\*\*[^*]+\*\*|`[^`]+`|\[\d+\])/).filter(Boolean).map((seg, k) => {
    if (seg.startsWith('**')) return <strong key={k}>{words(seg.slice(2, -2), live, counter)}</strong>;
    if (seg.startsWith('`')) return <code key={k} className="rounded-[6px] bg-fill-3 px-1.5 py-0.5 font-mono text-[.86em] text-bright">{seg.slice(1, -1)}</code>;
    const m = seg.match(/^\[(\d+)\]$/);
    if (m) {
      const n = Number(m[1]);
      const c = <Citation key={k} n={n} source={sources?.[n - 1]} />;
      // Arrives with its sentence, not ahead of it.
      return live ? <span key={k} className="fade-in">{c}</span> : c;
    }
    return <Fragment key={k}>{words(seg, live, counter)}</Fragment>;
  });
}

/** Live: one span per word with a globally stable key, so only new words animate. */
function words(s: string, live: boolean, counter: { i: number }): ReactNode {
  if (!live) return s;
  return s.split(/(?<=\s)/).map((w) => <span key={counter.i++} className="word-in">{w}</span>);
}
