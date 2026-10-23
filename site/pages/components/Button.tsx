import { ArrowRight, Heart, Mic, Plus, Send, Share2, Trash2 } from 'lucide-react';
import { Button, IconButton } from '@ui/components/core/Button';
import { bool, Demo, select, text } from '../../kit/Demo';
import { Doc, DocSection, Grid, Props, Rules, Tile, Why } from '../../kit/Doc';

export default function ButtonPage() {
  return (
    <Doc eyebrow="Components" title="Button" source="ui/components/core/Button.tsx"
      lead="Always a pill. One action per view is primary — solid bright with a soft accent glow. Everything else steps back: glass over light, ghost for secondary, quiet for inline.">
      <Demo
        title="Playground"
        controls={{
          variant: select(['primary', 'tint', 'glass', 'ghost', 'quiet', 'danger'] as const),
          size: select(['xs', 'sm', 'md', 'lg'] as const, 'md'),
          label: text('Continue'),
          icon: bool(false),
          arrow: bool(true),
          sheen: bool(true),
          busy: bool(false),
          disabled: bool(false),
          backdrop: select(['plain', 'ambient', 'scene'] as const),
        }}
        background="plain"
        code={(v) => `<Button variant="${v.variant}" size="${v.size}"${v.icon ? ' Icon={Send}' : ''}${v.arrow ? ' IconEnd={ArrowRight}' : ''}${v.sheen ? ' sheen' : ''}${v.busy ? ' busy' : ''}${v.disabled ? ' disabled' : ''}>\n  ${v.label}\n</Button>`}
      >
        {(v) => (
          <div className="relative grid min-h-[260px] w-full place-items-center">
            {v.backdrop !== 'plain' && <BackdropLayer kind={v.backdrop} />}
            <Button variant={v.variant} size={v.size} Icon={v.icon ? Send : undefined} IconEnd={v.arrow ? ArrowRight : undefined} sheen={v.sheen} busy={v.busy} disabled={v.disabled}>{v.label}</Button>
          </div>
        )}
      </Demo>

      <DocSection title="Variants" description="Pick by importance, not by colour. A screen has at most one primary.">
        <Grid cols={3}>
          <Tile label="primary — the one action"><Button>Save changes</Button></Tile>
          <Tile label="tint — the place's colour"><div data-signal="amber"><Button variant="tint" size="sm" Icon={Plus}>New story</Button></div></Tile>
          <Tile label="ghost — secondary"><Button variant="ghost">Cancel</Button></Tile>
          <Tile label="glass — over images and light" className="relative overflow-hidden"><BackdropLayer kind="scene" /><Button variant="glass" Icon={Share2}>Share</Button></Tile>
          <Tile label="quiet — inline, tertiary"><Button variant="quiet" size="sm">Show all</Button></Tile>
          <Tile label="danger — destructive"><Button variant="danger" Icon={Trash2}>Delete</Button></Tile>
        </Grid>
      </DocSection>

      <DocSection title="Icon buttons" description="Round, 40px by default. The small size draws 32px but keeps a 44px touch target — its hit area extends past the edge.">
        <Grid cols={4}>
          <Tile label="fill (default)"><IconButton label="Add"><Plus size={18} /></IconButton></Tile>
          <Tile label="glass" className="relative overflow-hidden"><BackdropLayer kind="ambient" /><IconButton variant="glass" label="Like"><Heart size={18} /></IconButton></Tile>
          <Tile label="sm · ghost"><IconButton size="sm" variant="ghost" label="Share"><Share2 size={16} /></IconButton></Tile>
          <Tile label="lg · solid (voice, camera)"><IconButton size="lg" variant="solid" label="Talk"><Mic size={22} /></IconButton></Tile>
        </Grid>
      </DocSection>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'Use one primary per view. Its glow is the visual anchor of the screen.', dont: 'Two glowing buttons side by side — the eye has nowhere to land.' },
          { do: 'Set busy while saving: the spinner replaces the icon and a second tap cannot slip through.', dont: 'Disable without a reason in view. Explain what is missing next to the button.' },
          { do: 'Glass only on light, images or video. On flat black it is just a grey ghost.', dont: 'Override heights with !h-9 — add a size here instead.' },
        ]} />
        <Why>
          <p>The dashboard had 20 buttons with <code>!h-…</code> overrides and 28 hand-made pill buttons — the component lacked sizes, so pages made their own. Now there are four sizes (32 / 40 / 44 / 52px) and the overrides have nowhere left to come from.</p>
          <p><code>type="button"</code> is the default because inside a form a bare button submits it — the dashboard shipped that bug twice.</p>
        </Why>
      </DocSection>

      <DocSection title="Props">
        <Props rows={[
          { name: 'variant', type: "'primary' | 'solid' | 'glass' | 'ghost' | 'quiet' | 'danger'", default: "'primary'", description: 'Importance.' },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", description: '32 / 40 / 44 / 52px.' },
          { name: 'Icon / IconEnd', type: 'LucideIcon', description: 'Leading / trailing icon, sized to the button.' },
          { name: 'sheen', type: 'boolean', description: 'A gloss band sweeps across on hover (pointer devices).' },
          { name: 'busy', type: 'boolean', description: 'Spinner instead of icon, locked.' },
          { name: 'block', type: 'boolean', description: 'Full width (sheets, forms on phones).' },
          { name: 'href', type: 'string', description: 'Renders a link with the same look.' },
        ]} />
      </DocSection>
    </Doc>
  );
}

function BackdropLayer({ kind }: { kind: 'ambient' | 'scene' }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-0 overflow-hidden rounded-[inherit]">
      {kind === 'scene'
        ? <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_20%_20%,#3b5bff,transparent_70%),radial-gradient(50%_70%_at_85%_30%,#ff8a5c,transparent_70%),radial-gradient(60%_60%_at_50%_100%,#9fe7c8,transparent_70%)] opacity-80" />
        : <div className="absolute inset-0 bg-[radial-gradient(70%_90%_at_30%_0%,color-mix(in_oklab,var(--color-accent-deep)_60%,transparent),transparent_70%),radial-gradient(50%_70%_at_90%_10%,rgb(168_152_255/.4),transparent_70%)]" />}
    </div>
  );
}
