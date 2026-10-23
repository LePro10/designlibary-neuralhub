import { Browser } from '../../kit/Browser';
import { Demo } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Why } from '../../kit/Doc';
import { DemoApp } from './demoApp';

export default function SidebarPage() {
  return (
    <Doc eyebrow="Navigation & Layout" title="Sidebar" source="ui/components/layout/Sidebar.tsx"
      lead="A 76px rail of quiet icons. Point at it and it opens to 232px over the page with a spring and a long soft shadow — labels and shortcuts fade in, nothing underneath moves. The active item carries a highlight that slides between entries.">
      <Demo padded={false} minHeight={420}>{() => <div className="w-full p-4 @min-[760px]:p-8"><Browser height={640}><DemoApp mode="desktop" ambient /></Browser></div>}</Demo>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'Group with a hairline (groupStart) — “you”, “organise”, “library”.', dont: 'Section headings inside the rail; collapsed they become noise.' },
          { do: 'Only ⌘1–⌘9 are shown — that is all that exists.', dont: 'Label ⌘10, ⌘11: shortcuts that do nothing.' },
        ]} />
        <Why><p>Opening over the content instead of pushing it means the reading position never shifts while you navigate. It opens on keyboard focus too, so Tab-users see the labels.</p></Why>
        <Props rows={[
          { name: 'items', type: 'SidebarItem[]', description: '{ id, label, Icon, badge?, groupStart? }' },
          { name: 'brand', type: '{ mark, word?, onClick? }', description: 'Logo mark when collapsed, wordmark fades in.' },
          { name: 'search', type: '() => void', description: 'Adds a search entry and ⌘K.' },
          { name: 'footer', type: '(open) => ReactNode', description: 'Account slot; fade your text with `open`.' },
        ]} />
      </DocSection>
    </Doc>
  );
}
