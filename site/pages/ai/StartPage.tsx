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
      lead="The first screen is an invitation, not a form: the orb, a greeting with your name in dim, and two to four next steps taken from your own context.">
      <Demo title="Hero" minHeight={560} background="ambient"
        controls={{ name: text('Leandro'), layout: select(['grid', 'rail'] as const), suggestions: bool(true), composer: bool(true) }}
        code={(v) => `<EmptyChatHero name="${v.name}">\n${v.suggestions ? `  <SuggestionGrid items={suggestions} layout="${v.layout}" onPick={(s) => ask(s.title)} />\n` : ''}</EmptyChatHero>`}>
        {(v) => (
          <div className="@container w-full max-w-[640px] py-6">
            <EmptyChatHero key={v.layout + v.name} name={v.name || undefined}>
              {v.suggestions && <SuggestionGrid items={SUGGESTIONS} layout={v.layout} onPick={() => {}} />}
            </EmptyChatHero>
            {v.composer && <div className="mt-8"><Composer onSend={() => false} onVoice={() => {}} placeholder={`Ask anything${v.name ? `, ${v.name}` : ''}`} /></div>}
          </div>
        )}
      </Demo>
      <DocSection title="Model pill" description="Quiet, in the chat header. The warning dot means the chosen model is unavailable and a fallback is answering — say it, don’t hide it.">
        <Demo minHeight={320} controls={{ fallback: bool(false) }} code={(v) => `<ModelPill models={models} value={model} onChange={setModel}${v.fallback ? ' fallback="Fast"' : ''} />`}>
          {(v) => <Pill fallback={v.fallback} />}
        </Demo>
      </DocSection>
      <DocSection title="Rules">
        <Rules items={[
          { do: 'Suggest real next steps from the user’s data (“2 unread from Anna”).', dont: 'Generic prompts (“Write a poem”) — they say the assistant doesn’t know you.' },
          { do: 'Shrink the hero on short screens so the composer never covers it.', dont: 'Center a 280px orb on a landscape phone.' },
        ]} />
      </DocSection>
      <DocSection title="API">
        <Props rows={[
          { name: 'EmptyChatHero', type: '{ name?, greeting?, orb?, children? }', description: 'children: suggestions under the greeting.' },
          { name: 'SuggestionGrid', type: '{ items, onPick, layout?: "grid" | "rail" }', description: 'Suggestion: { title, detail?, Icon?, prompt? }.' },
          { name: 'ModelPill', type: '{ models, value, onChange, fallback?, align? }', description: 'Inline list; Escape / back / outside click close it.' },
        ]} />
      </DocSection>
    </Doc>
  );
}

function Pill({ fallback }: { fallback: boolean }) {
  const [m, setM] = useState('smart');
  return <div className="h-[260px] pt-4"><ModelPill models={MODELS} value={m} onChange={setM} fallback={fallback ? 'Fast' : undefined} /></div>;
}
