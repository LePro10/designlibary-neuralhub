import { CalendarDays, CheckSquare, Dumbbell } from 'lucide-react';
import { useState } from 'react';
import { ChangePills, type Change } from '@ui/components/ai/ChangePill';
import { ConfirmCard, type Decision } from '@ui/components/ai/ConfirmCard';
import { DiffCard } from '@ui/components/ai/DiffCard';
import { QuestionCard, type Answer, type Question as Q } from '@ui/components/ai/QuestionCard';
import { bool, Demo, range, select } from '../../kit/Demo';
import { Doc, DocSection, Props, Rules, Why } from '../../kit/Doc';

const BEFORE = `TONIGHT\n17:00  Physics sheet 4\n18:00  Gym\n19:30  Dinner\n20:30  History reading\n21:30  Free\n\nTOMORROW\n08:00  School\n16:00  Dentist`;
const AFTER = `TONIGHT\n17:25  Physics sheet 4, tasks 2–3\n18:00  Gym\n19:30  Dinner\n21:30  Free\n\nTOMORROW\n08:00  School\n16:00  Dentist\n18:00  History reading`;

export default function CardsPage() {
  return (
    <Doc eyebrow="AI & Chat" title="Decision cards" source={['ui/components/ai/QuestionCard.tsx', 'ui/components/ai/ConfirmCard.tsx', 'ui/components/ai/DiffCard.tsx', 'ui/components/ai/ChangePill.tsx']}
      lead="When the assistant needs you, it asks with options, not paragraphs. When it acts, it shows what changed — and every change has an undo.">
      <Demo title="Question card" minHeight={420} controls={{ questions: select(['one', 'wizard'] as const, 'wizard'), multiple: bool(false) }}
        code={(v) => `<QuestionCard\n  questions={[${v.questions === 'one' ? `\n    { question: 'When should I block time?', options: ['17:25 – 17:55', 'After gym', 'Tomorrow morning']${v.multiple ? ', multiple: true' : ''} },` : `\n    { short: 'Time', question: 'When should I block time?', options: [...] },\n    { short: 'Scope', question: 'Which tasks?', options: [...], multiple: true },`}\n  ]}\n  onSubmit={(answers) => reply(answers)}\n  onSkip={skip}\n/>`}>
        {(v) => <Question key={v.questions + v.multiple} wizard={v.questions === 'wizard'} multiple={v.multiple} />}
      </Demo>

      <DocSection title="Confirm before acting" description="Anything external or irreversible waits for a yes. Once decided, the card folds into one line that stays in the conversation.">
        <Demo minHeight={300} controls={{ danger: bool(false) }} code={(v) => `<ConfirmCard\n  title="Send this reply to Anna?"\n  detail="From leandro@… · now"\n  decision={decision}\n  onDecide={setDecision}${v.danger ? '\n  danger\n  approveLabel="Delete"' : ''}\n>\n  <MailPreview />\n</ConfirmCard>`}>
          {(v) => <Confirm key={String(v.danger)} danger={v.danger} />}
        </Demo>
      </DocSection>

      <DocSection title="Diff" description="What a change did, line by line. Inline on phones, split when there is room (the toggle appears from 560px). Unchanged stretches fold.">
        <Demo minHeight={380} center={false} controls={{ mode: select(['inline', 'split'] as const), context: range(0, 4, 1) }} code={(v) => `<DiffCard title="Updated tonight’s plan" before={before} after={after} mode="${v.mode}" context={${v.context}} onUndo={undo} />`}>
          {(v) => <div className="mx-auto max-w-[760px]"><DiffCard key={v.mode} title="Updated tonight’s plan" before={BEFORE} after={AFTER} mode={v.mode} context={v.context} onUndo={() => {}} /></div>}
        </Demo>
      </DocSection>

      <DocSection title="Change pills" description="Under an answer: what it changed, each undoable in place.">
        <Demo minHeight={150} code={`<ChangePills changes={changes} onUndo={undo} onRedo={redo} onOpen={showDiff} />`}>{() => <Pills />}</Demo>
      </DocSection>

      <DocSection title="Rules">
        <Rules items={[
          { do: 'Offer 2–4 concrete options and always “Something else…”.', dont: 'Ask an open question when the assistant already knows the likely answers.' },
          { do: 'Single choice in a wizard moves on by itself — one tap per question.', dont: 'Make people confirm every step with “Next”.' },
          { do: 'Reversible, low-risk change with high confidence: just do it and show an undo pill.', dont: 'Ask for confirmation of every small edit — approvals lose meaning.' },
        ]} />
        <Why><p>Radio and checkbox are told apart by shape (circle vs. rounded square), not by a caption — the same rule as the core <code>Check</code>. The confirm card collapses rather than disappears so the record of “what did I allow” stays in the conversation.</p></Why>
      </DocSection>

      <DocSection title="API">
        <Props rows={[
          { name: 'QuestionCard.questions', type: 'Question[]', description: '{ short?, question, options, multiple?, free? }' },
          { name: 'QuestionCard.onSubmit', type: '(answers: Answer[]) => void', description: '{ picked: string[], text? } per question.' },
          { name: 'ConfirmCard', type: '{ title, detail?, children?, decision, onDecide, danger? }', description: 'decision: "approved" | "denied" | null.' },
          { name: 'DiffCard', type: '{ title, before, after, mode?, context?, onUndo? }', description: 'LCS line diff; diffLines() exported.' },
          { name: 'ChangePills', type: '{ changes, onUndo?, onRedo?, onOpen? }', description: 'Change: { id, label, Icon?, undone? }.' },
        ]} />
      </DocSection>
    </Doc>
  );
}

function Question({ wizard, multiple }: { wizard: boolean; multiple: boolean }) {
  const [answers, setAnswers] = useState<Answer[] | null>(null);
  const qs: Q[] = wizard
    ? [{ short: 'Time', question: 'When should I block time for physics?', options: ['17:25 – 17:55', 'After gym, 19:00', 'Tomorrow before school'] },
      { short: 'Scope', question: 'Which tasks?', options: ['Task 2', 'Task 3', 'Tasks 4–5'], multiple: true },
      { short: 'Reminder', question: 'Remind you?', options: ['5 min before', 'At start', 'No reminder'] }]
    : [{ question: 'When should I block time for physics?', options: ['17:25 – 17:55', 'After gym, 19:00', 'Tomorrow before school'], multiple }];
  if (answers) return <button type="button" onClick={() => setAnswers(null)} className="surface rounded-stat p-3.5 text-left text-small text-ink">{answers.map((a, i) => <div key={i}>{qs[i].short ?? 'Answer'}: <span className="text-bright">{[...a.picked, a.text].filter(Boolean).join(', ') || '—'}</span></div>)}<div className="mt-2 text-meta text-dim">Tap to ask again</div></button>;
  return <div className="w-full max-w-[460px]"><QuestionCard questions={qs} onSubmit={setAnswers} onSkip={() => setAnswers([])} /></div>;
}

function Confirm({ danger }: { danger: boolean }) {
  const [d, setD] = useState<Decision>(null);
  return (
    <div className="w-full max-w-[460px]">
      <ConfirmCard decision={d} onDecide={setD} danger={danger}
        title={danger ? 'Delete “Physics — old drafts” for good?' : 'Send this reply to Anna?'}
        detail={danger ? '14 files, 38 MB. This can’t be undone.' : 'From your school account · now'}
        approveLabel={danger ? 'Delete' : 'Send'} denyLabel="Not now">
        {!danger && <><div className="text-meta text-dim">To: Anna Keller · Re: Saturday?</div><p className="mt-1.5">Yes, I’m in for Saturday — see you at 2!</p></>}
      </ConfirmCard>
      {d && <button type="button" onClick={() => setD(null)} className="mt-3 text-meta text-dim underline underline-offset-4">Reset</button>}
    </div>
  );
}

function Pills() {
  const [changes, setChanges] = useState<Change[]>([
    { id: 'a', label: 'Blocked 17:25 – 17:55 for physics', Icon: CalendarDays },
    { id: 'b', label: 'Moved history reading to tomorrow', Icon: CheckSquare },
    { id: 'c', label: 'Gym stays at 18:00', Icon: Dumbbell },
  ]);
  const flip = (id: string, undone: boolean) => setChanges((c) => c.map((x) => (x.id === id ? { ...x, undone } : x)));
  return <ChangePills changes={changes} onUndo={(id) => flip(id, true)} onRedo={(id) => flip(id, false)} className="max-w-[560px] justify-center" />;
}
