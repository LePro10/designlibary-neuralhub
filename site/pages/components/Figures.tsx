import { Stat, Trend } from '@ui/components/core/Stat';
import { Avatar, AvatarStack } from '@ui/components/core/Avatar';
import { colors, Demo, range, text } from '../../kit/Demo';
import { Doc, DocSection, Grid, Tile, Why } from '../../kit/Doc';

export default function FiguresPage() {
  return (
    <Doc eyebrow="Components" title="Stats & Avatars" source={['ui/components/core/Stat.tsx', 'ui/components/core/Avatar.tsx']}
      lead="Numbers are light and tabular: DM Sans 300, tight tracking, digits that don't dance. Avatars are initials on a quiet tile — or, with a colour, a glossy bead.">
      <DocSection title="Stat tiles" description="In rows of two or three. A trend pill compares with the previous period; up is mint unless less is better.">
        <Grid cols={3}>
          <Stat value="6.4" unit="h" label="Deep work this week" trend={12} />
          <Stat value="2:41" unit="h" label="Screen time today" trend={-18} />
          <Stat value="14" label="Workouts this month" />
        </Grid>
        <div className="mt-6 flex flex-wrap items-baseline gap-3">
          <span className="display tabular text-hero">7:48</span><span className="text-title text-dim font-light">h</span><Trend value={-9} inverse />
          <span className="text-meta text-dim">less than last week — inverse trend reads as good</span>
        </div>
      </DocSection>
      <DocSection title="Avatar">
        <Demo controls={{ name: text('Leandro Probst'), size: range(24, 96, 48, 4, 'px'), color: colors(['none', '#a898ff', '#9fe7c8', '#eadcbc', '#ff8a5c', '#5b9bff'] as const) }}
          code={(v) => `<Avatar name="${v.name}" size={${v.size}}${v.color !== 'none' ? ` color="${v.color}"` : ''} />`}>
          {(v) => <Avatar name={v.name || '?'} size={v.size} color={v.color === 'none' ? undefined : v.color} />}
        </Demo>
        <Grid cols={2}>
          <Tile label="AvatarStack"><AvatarStack people={[{ name: 'Mia K', color: '#a898ff' }, { name: 'Jonas W', color: '#9fe7c8' }, { name: 'Sara L' }, { name: 'Tom B', color: '#eadcbc' }, { name: 'Ana P' }, { name: 'Ben R' }]} /></Tile>
          <Tile label="Account colours in a thread"><div className="flex gap-3"><Avatar name="Work" color="#5b9bff" /><Avatar name="Private" color="#eadcbc" /><Avatar name="School" color="#a898ff" /></div></Tile>
        </Grid>
        <Why><p>The glossy disc is a radial highlight at the top-left over the colour — the same light direction as the glass rim and the liquid lens. Light comes from one place across the whole system.</p></Why>
      </DocSection>
    </Doc>
  );
}
