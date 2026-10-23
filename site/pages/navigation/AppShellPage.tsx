import { DemoApp } from './demoApp';
import { Phone } from '../../kit/Phone';
import { Browser } from '../../kit/Browser';
import { Doc, DocSection, Prose, Rules, Usage, Why } from '../../kit/Doc';
import { bool, Demo } from '../../kit/Demo';

export default function AppShellPage() {
  return (
    <Doc eyebrow="Navigation & Layout" title="App shell" source={['ui/components/layout/AppShell.tsx', 'ui/lib/surface.tsx']}
      lead="One frame, two bodies. Below 900px of its own width the app wears a floating liquid-glass tab bar; above, a slim sidebar that opens over the content. Everything inside learns which one through <Surface>.">
      <Demo title="Phone" controls={{ ambient: bool(true), badges: bool(true) }} padded={false} minHeight={760}
        description="Tap or drag the lens across the tabs. Scroll: the title lifts off and stays, content sinks into a frosted fade. Tap the active tab again to scroll to the top.">
        {(v) => <div className="w-full py-6"><Phone><DemoApp mode="phone" ambient={v.ambient} badges={v.badges} /></Phone></div>}
      </Demo>
      <Demo title="Desktop" padded={false} minHeight={420} description="Hover the rail: it opens to 232px over the page (no reflow). ⌘/Ctrl + 1–9 switch, ⌘K searches.">
        {() => <div className="w-full p-4 @min-[760px]:p-8"><Browser><DemoApp mode="desktop" /></Browser></div>}
      </Demo>
      <DocSection title="Who owns which space">
        <Prose><p>The most important layout rule, learned the hard way when two layers both padded and the last 72px of every page hid under the tab bar: <strong>exactly one owner per space.</strong></p></Prose>
        <div className="scroll-x mt-5 rounded-stat border border-line">
          <table className="w-full min-w-[560px] text-left text-[13px]">
            <thead><tr className="border-b border-line">{['Layer', 'Owns', 'Never owns'].map((h) => <th key={h} className="px-4 py-2.5 font-normal"><span className="eyebrow">{h}</span></th>)}</tr></thead>
            <tbody className="text-ink">
              <tr className="border-b border-line"><td className="px-4 py-2.5 font-mono text-[12px] text-bright">AppShell</td><td className="px-4 py-2.5">full height, sidebar column, tab bar, <code className="inline-code">--tabbar-space</code></td><td className="px-4 py-2.5">any content spacing</td></tr>
              <tr className="border-b border-line"><td className="px-4 py-2.5 font-mono text-[12px] text-bright">Page</td><td className="px-4 py-2.5">safe-area top + 44px, 16/32px gutters, max width, bottom = tab bar + 24px</td><td className="px-4 py-2.5">—</td></tr>
              <tr><td className="px-4 py-2.5 font-mono text-[12px] text-bright">Your content</td><td className="px-4 py-2.5">only itself</td><td className="px-4 py-2.5">distance to the edge, tab-bar height</td></tr>
            </tbody>
          </table>
        </div>
        <Rules items={[
          { do: 'Need bottom room in your own scroller? Use var(--tabbar-space).', dont: 'Negative margins to cancel someone else’s padding; pb-[88px] guesses.' },
          { do: 'h-dvh and flex chains for height.', dont: 'calc(100vh − 3.5rem) in a page — vh lies on phones with browser chrome.' },
        ]} />
        <Why><p>The dashboard decided phone vs. desktop from the viewport. Here the shell measures itself (ResizeObserver) and passes the mode down — so the same app works in a 390px pane on a 27" screen, in a device preview, or embedded. Sheets portal into the shell, which is a transform containing block: “fixed” means “fixed to the app”.</p></Why>
      </DocSection>
      <DocSection title="Usage">
        <Usage code={`<AppShell
  sidebar={<Sidebar items={tabs} value={tab} onChange={setTab} brand={{ mark: <LogoMark />, word: <Wordmark /> }} />}
  tabbar={<TabBar items={tabs} value={tab} onChange={setTab} />}
>
  <Page title="Plan" ambient="plan" actions={<IconButton label="New"><Plus /></IconButton>}>
    …
  </Page>
</AppShell>`} />
      </DocSection>
    </Doc>
  );
}
