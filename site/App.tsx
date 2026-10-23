/**
 * Showcase chrome. Desktop: a fixed index on the left, theme controls at its
 * foot. Phone: a glass header with a menu that slides the index in.
 * The showcase uses the library itself — if something looks off here, it is
 * off in the library.
 */
import { AnimatePresence, motion } from 'motion/react';
import { ChevronUp, Menu as MenuIcon, X } from 'lucide-react';
import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { LogoMark, Wordmark } from '@ui/components/effects/Logo';
import { SearchField } from '@ui/components/core/Field';
import { Segmented } from '@ui/components/core/Segmented';
import { Switch } from '@ui/components/core/Switch';
import { Pill } from '@ui/components/core/Chips';
import { Spinner } from '@ui/components/core/Feedback';
import { useLayer } from '@ui/lib/layers';
import { useFocusTrap } from '@ui/lib/focus-trap';
import { useMediaQuery } from '@ui/lib/hooks';
import { SPRING } from '@ui/lib/motion';
import { ACCENTS, GLASS_LEVELS, SIGNALS, setTheme, type Accent, type Corners, type GlassLevel, type Signal } from '@ui/lib/tokens';
import { cn } from '@ui/lib/cn';
import { ALL, GROUPS, findPage } from './registry';
import { go, useRoute } from './router';

const ACCENT_HEX: Record<Accent, string> = { ice: '#b9d3ff', mint: '#9fe7c8', ember: '#ffc0a3', lilac: '#cfc6ff', sand: '#eadcbc', graphite: '#eef1ee' };

const store = {
  get: (k: string) => { try { return localStorage.getItem(`nhd:${k}`); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(`nhd:${k}`, v); } catch { /* private mode */ } },
};

const cache = new Map<string, ComponentType>();
function pageComponent(path: string, load: () => Promise<{ default: ComponentType }>) {
  let c = cache.get(path);
  if (!c) { c = lazy(load); cache.set(path, c); }
  return c;
}

export function App() {
  const route = useRoute();
  const wide = useMediaQuery('(min-width: 1000px)');
  const [navOpen, setNavOpen] = useState(false);
  const [accent, setAccent] = useState<Accent>(() => (store.get('accent') as Accent) ?? 'ice');
  const [glass, setGlass] = useState<GlassLevel>(() => (store.get('glass') as GlassLevel) ?? 'default');
  const [calm, setCalm] = useState(() => store.get('calm') === '1');
  const [corners, setCorners] = useState<Corners>(() => (store.get('corners') as Corners) ?? 'continuous');
  const [signal, setSignal] = useState<Signal | ''>(() => (store.get('signal') as Signal) ?? '');
  const main = useRef<HTMLDivElement>(null);

  useEffect(() => { setTheme({ accent, glass, corners }); store.set('accent', accent); store.set('glass', glass); store.set('corners', corners); }, [accent, glass, corners]);
  useEffect(() => { document.documentElement.classList.toggle('reduce-motion', calm); store.set('calm', calm ? '1' : '0'); }, [calm]);
  useEffect(() => { const r = document.documentElement; if (signal) r.dataset.signal = signal; else delete r.dataset.signal; store.set('signal', signal); }, [signal]);

  const found = findPage(route) ?? findPage(`${GROUPS[0].id}/${GROUPS[0].pages[0].id}`)!;
  const Page = pageComponent(`${found.group.id}/${found.page.id}`, found.page.load);
  // New content starts at the top.
  useEffect(() => { main.current?.scrollTo({ top: 0 }); setNavOpen(false); }, [route]);
  useEffect(() => { document.title = `${found.page.title} · NeuralHub Design`; }, [found.page.title]);

  const index = (
    <Index route={route} panel={!wide} accent={accent} setAccent={setAccent} glass={glass} setGlass={setGlass} corners={corners} setCorners={setCorners} calm={calm} setCalm={setCalm} signal={signal} setSignal={setSignal} />
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      {/* Desktop: the index is a lifted surface, 8px off the window's edge. */}
      {wide && <div className="h-full w-[272px] shrink-0 p-2 pr-0"><aside className="surface h-full overflow-hidden rounded-dialog">{index}</aside></div>}
      <div className="relative min-w-0 flex-1">
        {!wide && <PhoneHeader open={navOpen} setOpen={setNavOpen} group={found.group.title} title={found.page.title}>{index}</PhoneHeader>}
        <div ref={main} className={cn('scroller @container h-full', !wide && 'pt-[60px]')}>
          <Suspense fallback={<div className="grid h-[60dvh] place-items-center"><Spinner size={22} /></div>}>
            <motion.div key={route} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
              <Page />
            </motion.div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

/**
 * Phone: a slim glass bar that says where you are. Tap it and the same glass
 * grows down into the index — no drawer from the side, nothing to find twice.
 */
function PhoneHeader({ open, setOpen, group, title, children }: { open: boolean; setOpen: (v: boolean) => void; group: string; title: string; children: React.ReactNode }) {
  useLayer(open, () => setOpen(false));
  const box = useRef<HTMLDivElement>(null);
  useFocusTrap(open, box);
  const [full, setFull] = useState(() => Math.min(window.innerHeight - 20, 780));
  useEffect(() => {
    const r = () => setFull(Math.min(window.innerHeight - 20, 780));
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  return (
    <>
      <AnimatePresence>
        {open && <motion.div key="scrim" className="fixed inset-0 z-[39] bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={() => setOpen(false)} />}
      </AnimatePresence>
      <motion.div ref={box} role={open ? 'dialog' : undefined} aria-modal={open || undefined} aria-label={open ? 'Index' : undefined}
        className="glass absolute inset-x-2 z-40 overflow-hidden outline-none"
        style={{ top: 'max(8px, var(--safe-top))' }}
        initial={false}
        animate={{ height: open ? full : 44, borderRadius: open ? 24 : 22 }}
        transition={SPRING.sheet}>
        <div className="relative flex h-11 items-center gap-2.5 pr-1 pl-3.5">
          <button type="button" onClick={() => { setOpen(false); go('start/overview'); }} aria-label="Overview" className="group shrink-0"><LogoMark size={18} /></button>
          <button type="button" onClick={() => setOpen(!open)} className="flex min-w-0 flex-1 items-baseline gap-1.5 text-left" aria-expanded={open}>
            <span className="shrink-0 text-meta text-faint">{group}</span>
            <span className="truncate text-chip text-bright">{title}</span>
          </button>
          <button type="button" aria-label={open ? 'Close index' : 'Open index'} aria-expanded={open} onClick={() => setOpen(!open)}
            className="pressable relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-bright hover:bg-fill-3">
            <motion.span className="absolute" initial={false} animate={{ opacity: open ? 0 : 1, rotate: open ? 45 : 0, scale: open ? 0.7 : 1 }} transition={SPRING.pop}><MenuIcon size={17} strokeWidth={1.75} /></motion.span>
            <motion.span className="absolute" initial={false} animate={{ opacity: open ? 1 : 0, rotate: open ? 0 : -45, scale: open ? 1 : 0.7 }} transition={SPRING.pop}><X size={17} strokeWidth={1.75} /></motion.span>
          </button>
        </div>
        {/* The index keeps its full height and is only revealed — nothing reflows while the glass grows. */}
        <motion.div className="absolute inset-x-0 top-11 bg-[rgb(14_16_15/.5)]" style={{ height: full - 44 }}
          initial={false} animate={{ opacity: open ? 1 : 0, y: open ? 0 : -8 }} transition={{ duration: open ? 0.35 : 0.15, delay: open ? 0.06 : 0, ease: [0.22, 1, 0.36, 1] }}
          inert={!open}>
          {children}
        </motion.div>
      </motion.div>
    </>
  );
}

function Index({ route, panel, accent, setAccent, glass, setGlass, corners, setCorners, calm, setCalm, signal, setSignal }: {
  route: string; panel: boolean; corners: Corners; setCorners: (c: Corners) => void; accent: Accent; setAccent: (a: Accent) => void; glass: GlassLevel; setGlass: (g: GlassLevel) => void; calm: boolean; setCalm: (v: boolean) => void;
  signal: Signal | ''; setSignal: (s: Signal | '') => void;
}) {
  const [q, setQ] = useState('');
  const [tune, setTune] = useState(false);
  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? ALL.filter((p) => `${p.title} ${p.summary} ${p.group.title}`.toLowerCase().includes(s)) : null;
  }, [q]);
  return (
    <div className="flex h-full flex-col">
      <div className={cn('px-3', panel ? 'pt-1 pb-2' : 'pt-5 pb-3')}>
        {!panel && <button type="button" onClick={() => go('start/overview')} className="group mb-5 flex items-center gap-2.5 px-1.5"><LogoMark size={20} /><span className="text-left"><Wordmark /><span className="mt-0.5 block text-meta text-faint">Design library</span></span></button>}
        <SearchField value={q} onChange={setQ} placeholder="Find a component" />
      </div>
      <nav aria-label="Index" className="scroller scroller-subtle flex-1 px-2.5 pb-6">
        {hits ? (
          hits.length ? hits.map((p) => <Item key={p.path} path={p.path} title={p.title} hint={p.group.title} active={route === p.path} />)
            : <p className="px-3 py-6 text-small text-dim">Nothing matches “{q}”.</p>
        ) : GROUPS.map((g) => (
          <div key={g.id} className="mt-5 first:mt-1">
            <div className="mb-1 px-2.5 text-meta text-faint">{g.title}</div>
            {g.pages.map((p) => <Item key={p.id} path={`${g.id}/${p.id}`} title={p.title} badge={p.badge} active={route === `${g.id}/${p.id}`} />)}
          </div>
        ))}
      </nav>
      {/* Theme knobs fold away into one row, so the index keeps the height. */}
      <div className="border-t-hair border-line px-2.5 pt-1.5" style={{ paddingBottom: 'max(8px, var(--safe-bottom))' }}>
        <AnimatePresence initial={false}>
          {tune && (
            <motion.div key="tune" className="overflow-hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0, transition: { duration: 0.16 } }} transition={SPRING.sheet}>
        <div className="space-y-3 px-1.5 pt-2.5 pb-3">
        <div>
          <span className="mb-1.5 block text-meta text-dim">Place</span>
          <div className="flex flex-wrap gap-[5px]">
            <button type="button" aria-label="No place" aria-pressed={!signal} title="none" onClick={() => setSignal('')}
              className={cn('h-3.5 w-3.5 rounded-full border-hair border-white/40 ring-offset-2 ring-offset-chrome', !signal && 'ring-1 ring-bright')} />
            {SIGNALS.map((s) => (
              <button key={s} type="button" aria-label={`Place colour ${s}`} aria-pressed={signal === s} title={s} onClick={() => setSignal(s)}
                className={cn('h-3.5 w-3.5 rounded-full ring-offset-2 ring-offset-chrome', signal === s && 'ring-1 ring-bright')} style={{ background: `var(--color-signal-${s})` }} />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-meta text-dim">Accent</span>
          <div className="flex gap-1.5">
            {ACCENTS.map((a) => (
              <button key={a} type="button" aria-label={`Accent ${a}`} aria-pressed={accent === a} title={a} onClick={() => setAccent(a)}
                className={cn('h-[18px] w-[18px] rounded-full ring-offset-2 ring-offset-chrome transition-shadow', accent === a && 'ring-1 ring-bright')}
                style={{ background: ACCENT_HEX[a] }} />
            ))}
          </div>
        </div>
        <div>
          <span className="mb-1.5 block text-meta text-dim">Glass</span>
          <Segmented size="sm" className="w-full" value={glass} onChange={setGlass} label="Glass level" options={GLASS_LEVELS.map((g) => ({ value: g, label: g === 'default' ? 'std' : g }))} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-meta text-dim">Corners</span>
          <Segmented size="sm" value={corners} onChange={setCorners} label="Corner shape" options={[{ value: 'continuous', label: 'continuous' }, { value: 'round', label: 'round' }]} />
        </div>
        <label className="flex items-center justify-between">
          <span className="text-meta text-dim">Reduce motion</span>
          <Switch size="sm" checked={calm} onChange={setCalm} label="Reduce motion" />
        </label>
        </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button type="button" onClick={() => setTune(!tune)} aria-expanded={tune}
          className="flex h-9 w-full items-center gap-2.5 rounded-field px-2.5 text-chip text-dim transition-colors hover:bg-fill-1 hover:text-ink">
          <span className="flex -space-x-1">
            <i className="h-3 w-3 rounded-full ring-[1.5px] ring-chrome" style={{ background: ACCENT_HEX[accent] }} />
            {signal && <i className="h-3 w-3 rounded-full ring-[1.5px] ring-chrome" style={{ background: `var(--color-signal-${signal})` }} />}
          </span>
          Theme
          <span className="ml-auto text-meta text-faint">{glass === 'default' ? '' : glass}</span>
          <motion.span animate={{ rotate: tune ? 180 : 0 }} transition={SPRING.snap}><ChevronUp size={14} strokeWidth={1.75} /></motion.span>
        </button>
      </div>
    </div>
  );
}

function Item({ path, title, hint, badge, active }: { path: string; title: string; hint?: string; badge?: 'new' | 'refined'; active: boolean }) {
  return (
    <a href={`#/${path}`} aria-current={active ? 'page' : undefined}
      className={cn('relative flex h-8 items-center gap-2 rounded-field px-2.5 text-chip transition-colors', active ? 'text-bright' : 'text-dim hover:text-ink')}>
      {active && <motion.span layoutId="index-active" className="absolute inset-0 rounded-field bg-fill-3" transition={SPRING.snap} />}
      <span className="relative truncate">{title}</span>
      {hint && <span className="relative ml-auto text-meta text-faint">{hint}</span>}
      {badge === 'new' && !hint && <span className="relative ml-auto"><Pill size="sm" tone="accent">new</Pill></span>}
    </a>
  );
}
