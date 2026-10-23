/**
 * Showcase chrome. Desktop: a fixed index on the left, theme controls at its
 * foot. Phone: a glass header with a menu that slides the index in.
 * The showcase uses the library itself — if something looks off here, it is
 * off in the library.
 */
import { AnimatePresence, motion } from 'motion/react';
import { Menu as MenuIcon, X } from 'lucide-react';
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
import { ACCENTS, GLASS_LEVELS, setTheme, type Accent, type GlassLevel } from '@ui/lib/tokens';
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
  const main = useRef<HTMLDivElement>(null);

  useEffect(() => { setTheme({ accent, glass }); store.set('accent', accent); store.set('glass', glass); }, [accent, glass]);
  useEffect(() => { document.documentElement.classList.toggle('reduce-motion', calm); store.set('calm', calm ? '1' : '0'); }, [calm]);

  const found = findPage(route) ?? findPage(`${GROUPS[0].id}/${GROUPS[0].pages[0].id}`)!;
  const Page = pageComponent(`${found.group.id}/${found.page.id}`, found.page.load);
  // New content starts at the top.
  useEffect(() => { main.current?.scrollTo({ top: 0 }); setNavOpen(false); }, [route]);
  useEffect(() => { document.title = `${found.page.title} · NeuralHub Design`; }, [found.page.title]);

  const index = (
    <Index route={route} accent={accent} setAccent={setAccent} glass={glass} setGlass={setGlass} calm={calm} setCalm={setCalm} />
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      {wide && <aside className="h-full w-[284px] shrink-0 border-r border-line bg-chrome">{index}</aside>}
      <div className="relative min-w-0 flex-1">
        {!wide && (
          <header className="glass absolute inset-x-3 top-3 z-40 flex h-14 items-center justify-between !rounded-full pr-1.5 pl-4" style={{ top: 'max(12px, var(--safe-top))' }}>
            <button type="button" onClick={() => go('start/overview')} className="group flex items-center gap-2.5"><LogoMark size={22} /><Wordmark /></button>
            <button type="button" aria-label="Open index" onClick={() => setNavOpen(true)} className="pressable grid h-11 w-11 place-items-center rounded-full bg-fill-3 text-bright"><MenuIcon size={19} /></button>
          </header>
        )}
        <div ref={main} className={cn('scroller @container h-full', !wide && 'pt-[76px]')}>
          <Suspense fallback={<div className="grid h-[60dvh] place-items-center"><Spinner size={22} /></div>}>
            <motion.div key={route} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
              <Page />
            </motion.div>
          </Suspense>
        </div>
      </div>
      {!wide && <Drawer open={navOpen} onClose={() => setNavOpen(false)}>{index}</Drawer>}
      <div className="grain" aria-hidden="true" />
    </div>
  );
}

function Drawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  useLayer(open, onClose);
  const box = useRef<HTMLDivElement>(null);
  useFocusTrap(open, box);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="b" className="fixed inset-0 z-[80] bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div key="d" ref={box} role="dialog" aria-modal="true" aria-label="Index"
            className="fixed inset-y-0 left-0 z-[81] w-[min(86vw,320px)] border-r border-line-2 bg-sheet shadow-dialog"
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={SPRING.sheet}>
            <button type="button" aria-label="Close index" onClick={onClose} className="pressable absolute top-4 right-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-fill-3 text-ink"><X size={17} /></button>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Index({ route, accent, setAccent, glass, setGlass, calm, setCalm }: {
  route: string; accent: Accent; setAccent: (a: Accent) => void; glass: GlassLevel; setGlass: (g: GlassLevel) => void; calm: boolean; setCalm: (v: boolean) => void;
}) {
  const [q, setQ] = useState('');
  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? ALL.filter((p) => `${p.title} ${p.summary} ${p.group.title}`.toLowerCase().includes(s)) : null;
  }, [q]);
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6 pb-4" style={{ paddingTop: 'max(24px, var(--safe-top))' }}>
        <button type="button" onClick={() => go('start/overview')} className="group flex items-center gap-3"><LogoMark size={26} /><span><Wordmark /><span className="eyebrow mt-0.5 block">Design library</span></span></button>
        <SearchField className="mt-5 !h-10" value={q} onChange={setQ} placeholder="Find a component" />
      </div>
      <nav aria-label="Index" className="scroller scroller-subtle flex-1 px-3 pb-6">
        {hits ? (
          hits.length ? hits.map((p) => <Item key={p.path} path={p.path} title={p.title} hint={p.group.title} active={route === p.path} />)
            : <p className="px-3 py-6 text-[13px] text-dim">Nothing matches “{q}”.</p>
        ) : GROUPS.map((g) => (
          <div key={g.id} className="mt-5 first:mt-1">
            <div className="eyebrow mb-1.5 px-3">{g.title}</div>
            {g.pages.map((p) => <Item key={p.id} path={`${g.id}/${p.id}`} title={p.title} badge={p.badge} active={route === `${g.id}/${p.id}`} />)}
          </div>
        ))}
      </nav>
      <div className="space-y-3 border-t border-line px-5 pt-4" style={{ paddingBottom: 'max(18px, var(--safe-bottom))' }}>
        <div className="flex items-center justify-between">
          <span className="eyebrow">Accent</span>
          <div className="flex gap-1.5">
            {ACCENTS.map((a) => (
              <button key={a} type="button" aria-label={`Accent ${a}`} aria-pressed={accent === a} title={a} onClick={() => setAccent(a)}
                className={cn('h-[22px] w-[22px] rounded-full ring-offset-2 ring-offset-chrome transition-shadow', accent === a && 'ring-[1.5px] ring-bright')}
                style={{ background: `radial-gradient(circle at 35% 30%, #fff8, transparent 55%), ${ACCENT_HEX[a]}` }} />
            ))}
          </div>
        </div>
        <div>
          <span className="eyebrow mb-2 block">Glass</span>
          <Segmented size="sm" className="w-full" value={glass} onChange={setGlass} label="Glass level" options={GLASS_LEVELS.map((g) => ({ value: g, label: g === 'default' ? 'std' : g }))} />
        </div>
        <label className="flex items-center justify-between">
          <span className="eyebrow">Reduce motion</span>
          <Switch size="sm" checked={calm} onChange={setCalm} label="Reduce motion" />
        </label>
      </div>
    </div>
  );
}

function Item({ path, title, hint, badge, active }: { path: string; title: string; hint?: string; badge?: 'new' | 'refined'; active: boolean }) {
  return (
    <a href={`#/${path}`} aria-current={active ? 'page' : undefined}
      className={cn('relative flex h-9 items-center gap-2 rounded-[11px] px-3 text-[14px] transition-colors', active ? 'text-bright' : 'text-dim hover:text-ink')}>
      {active && <motion.span layoutId="index-active" className="absolute inset-0 rounded-[11px] border border-line-2 bg-fill-2" transition={SPRING.snap} />}
      <span className="relative truncate">{title}</span>
      {hint && <span className="relative ml-auto text-meta text-faint">{hint}</span>}
      {badge && !hint && <span className="relative ml-auto"><Pill size="sm" tone={badge === 'new' ? 'accent' : 'neutral'}>{badge}</Pill></span>}
    </a>
  );
}
