import { Browser } from '../../kit/Browser';
import { Demo } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Usage, Why } from '../../kit/Doc';
import { DemoApp } from './demoApp';

export default function SidebarPage() {
  return (
    <Doc eyebrow="Navigation & Layout" title="Sidebar" source="ui/components/layout/Sidebar.tsx"
      lead="A glass island that floats 8px off the window's edge, with the page's light running underneath — the desktop twin of the tab bar. Rest the pointer on it and it opens over the page; pin it and the page makes room.">
      <Demo padded={false} minHeight={420} description="Rest the pointer on the rail (passing by does nothing). ⌘/Ctrl + \ or the button at its foot pins it. ⌘1–9 switch, ⌘K searches.">
        {() => <div className="w-full p-4 @min-[760px]:p-8"><Browser height={640}><DemoApp mode="desktop" ambient /></Browser></div>}
      </Demo>
      <DocSection title="Behaviour">
        <ol className="mt-4 max-w-[680px] list-decimal space-y-2 pl-5 text-small leading-relaxed text-ink marker:text-dim">
          <li><strong className="font-medium text-bright">Rail</strong> — 60px of icons; the active one wears its place's colour on a raised highlight that slides between entries.</li>
          <li><strong className="font-medium text-bright">Peek</strong> — hover intent: 120ms in, 240ms out. It opens to 228px over the page with a long shadow; nothing underneath moves. Keyboard focus opens it too.</li>
          <li><strong className="font-medium text-bright">Pin</strong> — kept open; the island reports its width to the shell (<code className="inline-code">--sidebar-space</code>) and the page's content slides over, while its light still runs under the glass.</li>
          <li><strong className="font-medium text-bright">Groups</strong> — items sharing a <code className="inline-code">group</code> sit under its name when open; collapsed, the name becomes a short hairline of the same height, so nothing jumps.</li>
        </ol>
      </DocSection>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'Define places once and pass them to <AppShell nav> — tab bar and sidebar come from the same list.', dont: 'Two hand-kept lists for phone and desktop that drift apart.' },
          { do: 'Only ⌘1–⌘9 are shown — that is all that exists.', dont: 'Label ⌘10, ⌘11: shortcuts that do nothing.' },
        ]} />
        <Why><p>A rail that opens on every pass of the pointer is a flickering nuisance; hover intent makes it open only when you mean it. Opening over the content keeps your reading position; pinning is the explicit choice to give up width for labels.</p></Why>
        <Props rows={[
          { name: 'items', type: 'SidebarItem[]', description: '{ id, label, Icon, place?, signal?, badge?, group? }' },
          { name: 'brand', type: '{ mark, word?, onClick? }', description: 'Logo mark when collapsed, wordmark fades in.' },
          { name: 'search', type: '() => void', description: 'Adds a search entry and ⌘K.' },
          { name: 'footer', type: '(open) => ReactNode', description: 'Account slot; fade your text with `open`.' },
          { name: 'pinned / onPinnedChange', type: 'boolean / (v) => void', description: 'Controlled pin (persist it); uncontrolled if left out.' },
        ]} />
        <Usage code={`<Sidebar items={places} value={tab} onChange={setTab} brand={{ mark: <LogoMark />, word: <Wordmark /> }}
  pinned={pinned} onPinnedChange={setPinned} search={openPalette} />`} />
      </DocSection>
    </Doc>
  );
}
