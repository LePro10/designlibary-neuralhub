import { useState } from 'react';
import { Composer } from '@ui/components/ai/Composer';
import { EmptyChatHero } from '@ui/components/ai/EmptyChatHero';
import { ModelPill } from '@ui/components/ai/ModelPill';
import { SuggestionGrid } from '@ui/components/ai/Suggestions';
import { bool, Demo, select, text } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules } from '../../kit/Doc';
import { MODELS, SUGGESTIONS } from './_content';

export default function StartPage() {
  return (
    <Doc eyebrow="AI & Chat" title="Empty chat & suggestions" source={['ui/components/ai/EmptyChatHero.tsx', 'ui/components/ai/Suggestions.tsx', 'ui/components/ai/ModelPill.tsx']}
      lead="The first screen is an invitation, not a form: the mark, a greeting that rises out of a mask with your name in dim, and two to four next steps taken from your own context.">
      <Demo title="Hero" minHeight={560} background="ambient"
        controls={{ name: text('Leandro'), visual: select(['mark', 'orb'] as const), layout: select(['grid', 'rail'] as const), suggestions: bool(true), composer: bool(true) }}
        code={(v) => `<EmptyChatHero name="${v.name}"${v.visual === 'orb' ? ' visual="orb"' : ''}>\n${v.suggestions ? `  <SuggestionGrid items={suggestions} layout="${v.layout}" onPick={(s) => ask(s.title)} />\n` : ''}</EmptyChatHero>`}>
        {(v) => (
          <div data-signal="periwinkle" className="@container w-full max-w-[600px] py-6">
            <EmptyChatHero key={v.layout + v.name + v.visual} name={v.name || undefined} visual={v.visual}>
              {v.suggestions && <SuggestionGrid items={SUGGESTIONS} layout={v.layout} onPick={() => {}} />}
            </EmptyChatHero>
            {v.composer && <div className="mt-7"><Composer onSend={() => false} onVoice={() => {}} placeholder={`Ask anything${v.name ? `, ${v.name}` : ''}`} /></div>}
          </div>
        )}
      </Demo>
      <DocSection title="Model pill" description="Quiet, in the chat header. It opens a small translucent pull-down right under your finger — no panel, no dimmed screen. The warning dot means the chosen model is unavailable and a fallback is answering: say it, don’t hide it.">
        <Demo minHeight={320} controls={{ fallback: bool(false) }} code={(v) => `<ModelPill models={models} value={model} onChange={setModel}${v.fallback ? ' fallback="Fast"' : ''} />`}>
          {(v) => <Pill fallback={v.fallback} />}
        </Demo>
      </DocSection>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'Suggest real next steps from the user’s data (“2 unread from Anna”).', dont: 'Generic prompts (“Write a poem”) — they say the assistant doesn’t know you.' },
          { do: 'Shrink the hero on short screens so the composer never covers it.', dont: 'Center a 280px glowing orb on a landscape phone.' },
          { do: 'Let the greeting rise once, then hold still.', dont: 'Loop an animation on the empty screen while it waits for you.' },
        ]} />
      </DocSection>
      <DocSection title="API">
        <Props rows={[
          { name: 'EmptyChatHero', type: '{ name?, greeting?, visual?: "mark" | "orb", working?, orb?, align?, children? }', description: 'children: suggestions under the greeting. working runs the mark’s light (context loading).' },
          { name: 'SuggestionGrid', type: '{ items, onPick, layout?: "grid" | "rail" }', description: 'Suggestion: { title, detail?, Icon?, prompt? }.' },
          { name: 'ModelPill', type: '{ models, value, onChange, fallback?, align?: "left" | "center" | "right" }', description: 'Pull-down; arrows move, Escape / back / outside click close it.' },
        ]} />
      </DocSection>
    </Doc>
  );
}

function Pill({ fallback }: { fallback: boolean }) {
  const [m, setM] = useState('smart');
  return <div className="h-[260px] pt-4"><ModelPill models={MODELS} value={m} onChange={setM} fallback={fallback ? 'Fast' : undefined} /></div>;
}
