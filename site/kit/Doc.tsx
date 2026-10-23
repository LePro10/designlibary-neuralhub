/** Building blocks for showcase pages: title block, sections, guidelines, props tables. */
import { Check, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@ui/lib/cn';
import { RevealText } from '@ui/components/effects/RevealText';
import { CodeBlock } from './Code';

export function Doc({ eyebrow, title, lead, children, source }: { eyebrow: string; title: string; lead?: ReactNode; children: ReactNode; /** Path(s) of the component file(s) in the repo. */ source?: string | string[] }) {
  const files = source ? (Array.isArray(source) ? source : [source]) : [];
  return (
    <article className="mx-auto w-full max-w-[1000px] px-4 pt-8 pb-28 @min-[900px]:px-10 @min-[900px]:pt-16">
      <div className="eyebrow mb-3">{eyebrow}</div>
      <RevealText as="h1" replayKey={title} className="display text-[32px] @min-[900px]:text-[46px]">{title}</RevealText>
      {lead && <div className="doc-prose mt-3 max-w-[640px] [&_p]:text-body [&_p]:text-dim @min-[900px]:[&_p]:text-lead">{typeof lead === 'string' ? <p>{lead}</p> : lead}</div>}
      {files.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {files.map((f) => <span key={f} className="rounded-full border-hair border-line-2 px-2.5 py-0.5 font-mono text-tiny text-faint">{f}</span>)}
        </div>
      )}
      <div className="mt-10">{children}</div>
    </article>
  );
}

export function DocSection({ title, children, description, id }: { title: string; description?: ReactNode; children?: ReactNode; id?: string }) {
  return (
    <section id={id} className="mt-14 first:mt-0">
      <h2 className="text-title font-light tracking-[-.02em] text-bright">{title}</h2>
      {description && <div className="doc-prose mt-1.5 max-w-[640px] [&_p]:text-dim">{typeof description === 'string' ? <p>{description}</p> : description}</div>}
      {children}
    </section>
  );
}

export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('doc-prose max-w-[640px]', className)}>{children}</div>;
}

/** Do / Don't pair. */
export function Rules({ items }: { items: { do?: ReactNode; dont?: ReactNode }[] }) {
  return (
    <div className="mt-5 grid gap-2 @min-[700px]:grid-cols-2">
      {items.flatMap((it, i) => [
        it.do && <Rule key={`d${i}`} ok>{it.do}</Rule>,
        it.dont && <Rule key={`n${i}`}>{it.dont}</Rule>,
      ])}
    </div>
  );
}
function Rule({ ok, children }: { ok?: boolean; children: ReactNode }) {
  return (
    <div className="flex gap-2.5 surface rounded-stat p-3.5 text-small leading-relaxed text-ink">
      <span className={cn('mt-[3px] grid h-4 w-4 shrink-0 place-items-center rounded-full', ok ? 'bg-mint/15 text-mint' : 'bg-danger/15 text-danger')}>{ok ? <Check size={10} strokeWidth={2.6} /> : <X size={10} strokeWidth={2.6} />}</span>
      <div><div className={cn('mb-0.5 text-meta', ok ? 'text-mint' : 'text-danger')}>{ok ? 'Do' : "Don't"}</div>{children}</div>
    </div>
  );
}

export interface PropRow { name: string; type: string; default?: string; description: ReactNode }
export function Props({ rows }: { rows: PropRow[] }) {
  return (
    <div className="scroll-x mt-5 surface rounded-stat">
      <table className="w-full min-w-[620px] text-left text-small">
        <thead><tr className="border-b-hair border-line">{['Prop', 'Type', 'Default', ''].map((h) => <th key={h} className="px-4 py-2 font-normal"><span className="text-meta text-faint">{h}</span></th>)}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b-hair border-line align-top last:border-0">
              <td className="px-4 py-2.5 font-mono text-[11.5px] text-bright">{r.name}</td>
              <td className="px-4 py-2.5 font-mono text-[11.5px] text-accent">{r.type}</td>
              <td className="px-4 py-2.5 font-mono text-[11.5px] text-dim">{r.default ?? '—'}</td>
              <td className="px-4 py-2.5 text-ink">{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** "Why" note — explains a decision, the part an AI should not undo. */
export function Why({ children, title = 'Why it is built this way' }: { children: ReactNode; title?: string }) {
  return (
    <aside className="mt-6 max-w-[700px] border-l-[1.5px] border-accent/40 py-0.5 pl-4">
      <div className="mb-1 text-meta text-accent">{title}</div>
      <div className="doc-prose [&_p]:text-small [&_p]:text-dim">{children}</div>
    </aside>
  );
}

export function Usage({ code, title = 'Usage' }: { code: string; title?: string }) {
  return <CodeBlock className="mt-5" code={code} title={title} />;
}

/** Grid for showing many small variants side by side. */
export function Grid({ children, cols = 3, className }: { children: ReactNode; cols?: 2 | 3 | 4; className?: string }) {
  return <div className={cn('mt-5 grid gap-2', cols === 2 && '@min-[640px]:grid-cols-2', cols === 3 && '@min-[640px]:grid-cols-2 @min-[900px]:grid-cols-3', cols === 4 && 'grid-cols-2 @min-[900px]:grid-cols-4', className)}>{children}</div>;
}
export function Tile({ label, children, className, bg }: { label?: ReactNode; children: ReactNode; className?: string; bg?: 'plain' | 'raised' }) {
  return (
    <div className={cn('flex flex-col overflow-hidden surface rounded-stat', bg === 'raised' ? 'bg-raised' : 'bg-fill-1', className)}>
      <div className="grid flex-1 place-items-center p-6">{children}</div>
      {label && <div className="border-t-hair border-line px-3 py-2 text-meta text-dim">{label}</div>}
    </div>
  );
}
