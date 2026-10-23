import { FileText, Folder, Image as ImageIcon } from 'lucide-react';
import { List, Row } from '@ui/components/core/List';
import { Page } from '@ui/components/layout/Page';
import { Stack, useStack, useStackNav } from '@ui/components/overlays/Stack';
import { Demo } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Usage, Why } from '../../kit/Doc';
import { Phone } from '../../kit/Phone';
import { Side } from './_shared';

interface Node { name: string; kind: 'folder' | 'doc' | 'image'; children?: Node[]; size?: string }

const TREE: Node = {
  name: 'Files', kind: 'folder', children: [
    { name: 'School', kind: 'folder', children: [
      { name: 'Physics', kind: 'folder', children: Array.from({ length: 14 }, (_, i) => ({ name: `Worksheet ${i + 1}.pdf`, kind: 'doc' as const, size: `${180 + i * 23} KB` })) },
      { name: 'History', kind: 'folder', children: [{ name: 'Essay draft.md', kind: 'doc', size: '12 KB' }] },
      { name: 'Timetable.pdf', kind: 'doc', size: '88 KB' },
    ] },
    { name: 'Photos', kind: 'folder', children: Array.from({ length: 8 }, (_, i) => ({ name: `IMG_04${20 + i}.heic`, kind: 'image' as const, size: `${2 + (i % 3)}.${i} MB` })) },
    { name: 'Notes.md', kind: 'doc', size: '4 KB' },
  ],
};

const ICON = { folder: Folder, doc: FileText, image: ImageIcon } as const;

function FolderView({ node, backLabel }: { node: Node; backLabel?: string }) {
  const { push, pop } = useStackNav();
  if (node.kind !== 'folder') {
    return (
      <Page title={node.name} backLabel={backLabel} onBack={pop} place="files">
        <div className="card grid h-[300px] place-items-center !rounded-list text-dim">
          <span className="text-center"><FileText size={36} strokeWidth={1.3} className="mx-auto mb-3" />{node.size}</span>
        </div>
      </Page>
    );
  }
  return (
    <Page title={node.name} eyebrow={backLabel ? undefined : 'Drive'} backLabel={backLabel} onBack={pop} place="files">
      <List>
        {node.children!.map((c) => (
          <Row key={c.name} Icon={ICON[c.kind]} title={c.name} detail={c.kind === 'folder' ? `${c.children?.length ?? 0} items` : c.size}
            onClick={() => push(`${node.name}/${c.name}`, <FolderView node={c} backLabel={node.name} />)} />
        ))}
      </List>
      <p className="mt-4 px-1 text-detail text-dim">Scroll a folder, open a file, come back: the folder is where you left it.</p>
    </Page>
  );
}

function Browser() {
  const stack = useStack();
  return <Stack stack={stack} root={<FolderView node={TREE} />} />;
}

export default function StackPage() {
  return (
    <Doc eyebrow="Navigation" title="Stack" source="ui/components/overlays/Stack.tsx"
      lead="Levels inside one place: folder → subfolder → file, list → detail → setting. A shared-axis transition moves only the content while the light behind stays put — you go deeper into the same place, not to another one.">
      <Demo title="File browser" center={false} padded
        description="Open folders, scroll, go back. In the phone frame swipe right anywhere (touch) to go back — the page follows your finger 1:1."
        code={`const stack = useStack();

<Stack stack={stack} root={<FolderView node={root} />} />

function FolderView({ node, backLabel }) {
  const { push, pop } = useStackNav();
  return (
    <Page title={node.name} backLabel={backLabel} onBack={pop}>
      {node.children.map((c) => (
        <Row title={c.name} onClick={() => push(c.id, <FolderView node={c} backLabel={node.name} />)} />
      ))}
    </Page>
  );
}`}>
        {() => (
          <Side
            desktop={<div className="h-[560px] overflow-hidden surface rounded-card [transform:translateZ(0)]"><Browser /></div>}
            phone={<Phone maxHeight={640}><Browser /></Phone>}
          />
        )}
      </Demo>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'Push for “deeper into the same thing”; the back button names where it goes (“‹ School”).', dont: 'Push to switch places (another tab) — that is navigation, not depth.' },
          { do: 'Content-heavy levels keep their scroll: the Stack keeps covered levels mounted.', dont: 'Unmount and refetch the parent on every back — the list jumps to the top.' },
        ]} />
        <Why>
          <p><strong>Shared axis, not a full-width slide.</strong> The entering content travels only 72px, the covered one drifts 44px. The fades are staggered (the outgoing text is mostly gone before the new one shows), so two pages of text never overlap legibly — that is what makes it feel calm rather than busy.</p>
          <p><strong>Swipe-back.</strong> Touch only, from anywhere on the page, after a 10px horizontal lock. The top follows the finger and fades, the parent glides back in; past 35% or with a flick it pops, otherwise it springs back. A row's own swipe (<code>SwipeRow</code>) and anything marked <code>data-no-swipe</code> wins.</p>
          <p><strong>Stable keys.</strong> A level keeps its identity while it stays open; pushing the same route again right after going back creates a fresh level instead of reviving the one still sliding out with its old scroll position.</p>
        </Why>
      </DocSection>

      <DocSection title="API">
        <Props rows={[
          { name: 'useStack(initial?)', type: 'StackApi', description: '{ levels, push(key, node), pop(), popTo(depth), reset() }' },
          { name: '<Stack stack root swipeBack />', type: '', description: 'Renders the root and every level; swipeBack defaults to true.' },
          { name: 'useStackNav()', type: 'StackApi & { depth }', description: 'Inside any level: push deeper or pop.' },
        ]} />
        <Usage code={`import { Stack, useStack, useStackNav } from '@/ui/components/overlays/Stack';`} />
      </DocSection>
    </Doc>
  );
}
