import { useState } from 'react';
import { Field, Input, SearchField, TextArea, inputClass } from '@ui/components/core/Field';
import { Button } from '@ui/components/core/Button';
import { bool, Demo } from '../../kit/Demo';
import { Doc, DocSection, Rules, Usage, Why } from '../../kit/Doc';

export default function InputsPage() {
  return (
    <Doc eyebrow="Components" title="Inputs" source="ui/components/core/Field.tsx"
      lead="Fields are wells sunk into the page: a faint fill, an inner shadow from the top, a rim that brightens on focus, 10px corners, a quiet label above. 44px tall on phones with 16px text (the browser never zooms in), 38px on desktop.">
      <Demo title="Form" controls={{ hints: bool(true), error: bool(false) }} center={false}
        code={`<Field label="Email" hint="We never share it.">\n  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />\n</Field>`}>
        {(v) => <FormDemo {...v} />}
      </Demo>
      <DocSection title="Search" description="Clears with the ✕ or Escape (Escape on an empty field still closes the sheet around it). Shows the shortcut on desktop while empty.">
        <Demo code={`<SearchField value={q} onChange={setQ} hint="⌘K" />`}>{() => <SearchDemo />}</Demo>
      </DocSection>
      <DocSection title="Any other input">
        <Usage code={`import { inputClass } from './ui/components/core/Field';\n\n<input type="time" className={inputClass} />`} />
        <div className="mt-4 max-w-[320px]"><input type="time" defaultValue="07:30" className={inputClass} /></div>
      </DocSection>
      <DocSection title="Rules">
        <Rules items={[
          { do: '16px text in fields on phones (text-input). iOS zooms into anything smaller.', dont: 'Placeholder as the label. It disappears exactly when you need it.' },
          { do: 'Keep typed text through errors, navigation and reloads (drafts).', dont: 'Replace the local value with the server value after a failed save.' },
        ]} />
        <Why><p>Fields are 44px on phones and 38px on desktop — finger vs. pointer. Invalid fields set <code>aria-invalid</code>, which the recipe turns into a red hairline; the message below has <code>role="alert"</code>.</p></Why>
      </DocSection>
    </Doc>
  );
}
function FormDemo({ hints, error }: { hints: boolean; error: boolean }) {
  const [name, setName] = useState('Leandro'); const [mail, setMail] = useState(''); const [note, setNote] = useState('');
  return (
    <div className="mx-auto w-full max-w-[420px] space-y-5">
      <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label="Email" hint={hints ? 'Used for sign-in only.' : undefined} error={error ? 'That doesn’t look like an email.' : undefined}>
        <Input type="email" invalid={error} placeholder="you@example.com" value={mail} onChange={(e) => setMail(e.target.value)} />
      </Field>
      <Field label="Note" hint={hints ? 'Grows as you type, up to 8 lines.' : undefined}><TextArea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything Luna should know…" /></Field>
      <Button block>Save</Button>
    </div>
  );
}
function SearchDemo() { const [q, setQ] = useState(''); return <SearchField className="w-full max-w-[420px]" value={q} onChange={setQ} hint="⌘K" placeholder="Search everything" />; }
