import { CodeBlock } from '../../kit/Code';
import { Doc, DocSection, Prose, Rules, Why } from '../../kit/Doc';

const PROMPT_NEW = `Use the design library at https://github.com/LePro10/designlibary-neuralhub for this project.
Read its AGENTS.md first and follow it: copy ui/styles and the components we need,
use the tokens (no raw hex, no Tailwind palettes), the named springs and radii,
and the mobile rules (one breakpoint at 900px, 44px targets, sheets instead of <select>).
Build: <describe your screen or app>.`;

const PROMPT_EXISTING = `Restyle this app in the NeuralHub design (https://github.com/LePro10/designlibary-neuralhub).
Follow its AGENTS.md "Migrating an existing app" section: map our colours to the tokens,
replace our buttons/inputs/dialogs with the library components, keep our behaviour.
Do it screen by screen and show me each one at 390px and desktop width.`;

export default function UseWithAI() {
  return (
    <Doc eyebrow="Start" title="Use it with Claude" source={['AGENTS.md', 'CLAUDE.md', 'registry.json']}
      lead="This repository is written for two readers: you, and an AI that builds your next project. Point it at the repo and it finds the rules, the tokens, the components and the reasons behind them.">
      <DocSection title="1 · New project">
        <Prose><p>React + Tailwind v4 (Vite or Next.js). Give Claude the repo link and what you want to build:</p></Prose>
        <CodeBlock className="mt-4" code={PROMPT_NEW} lang="prompt" title="Prompt" />
      </DocSection>
      <DocSection title="2 · Existing project">
        <CodeBlock className="mt-4" code={PROMPT_EXISTING} lang="prompt" title="Prompt" />
      </DocSection>
      <DocSection title="MCP: search, source and screenshots">
        <Prose><p>Add the library as an MCP server and Claude can search components, fetch source with its dependencies and look at screenshots — no key, no clone. Needs Node 18+.</p></Prose>
        <CodeBlock className="mt-4" lang="bash" title="Claude Code" code={`curl -o ~/neuralhub-mcp.mjs https://ui.neuralhub.dev/mcp.mjs
claude mcp add neuralhub-ui -- node ~/neuralhub-mcp.mjs`} />
        <CodeBlock className="mt-3" lang="json" title="Cursor, Claude Desktop, .mcp.json" code={`{
  "mcpServers": {
    "neuralhub-ui": { "command": "node", "args": ["/path/to/neuralhub-mcp.mjs"] }
  }
}`} />
        <Prose><p>Tools: <code>get_guidelines</code> (call first), <code>search</code>, <code>list_components</code>, <code>get_component</code>, <code>get_file</code>, <code>get_screenshot</code>.</p></Prose>
      </DocSection>
      <DocSection title="What the AI reads">
        <div className="mt-5 grid gap-3 @min-[700px]:grid-cols-2">
          {[
            ['AGENTS.md', 'The contract: setup steps, hard rules, which component for which job, how to verify. CLAUDE.md points here.'],
            ['registry.json', 'Every component with its file, dependencies on other files and npm packages — what to copy for what.'],
            ['docs/', 'Principles, foundations, mobile rules, motion and performance — the “why” in plain text.'],
            ['ui/', 'The source itself. Comments explain decisions that must not be undone.'],
          ].map(([t, d]) => <div key={t} className="card p-5"><div className="font-mono text-[13px] text-bright">{t}</div><p className="mt-1.5 text-[13.5px] leading-relaxed text-dim">{d}</p></div>)}
        </div>
      </DocSection>
      <DocSection title="Setup in a project">
        <CodeBlock className="mt-4" lang="bash" code={`pnpm add motion lucide-react @fontsource-variable/dm-sans @fontsource/ibm-plex-mono
pnpm add -D tailwindcss @tailwindcss/vite

# copy the library folder
cp -r designlibary-neuralhub/ui ./src/ui`} />
        <CodeBlock className="mt-3" lang="css" title="src/index.css" code={`@import "tailwindcss";
@import "./ui/styles/index.css";`} />
        <CodeBlock className="mt-3" lang="tsx" title="src/main.tsx" code={`import '@fontsource-variable/dm-sans';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './index.css';`} />
        <CodeBlock className="mt-3" lang="html" title="index.html" code={`<html lang="en" data-accent="ice" data-glass="default">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#080909" />`} />
      </DocSection>
      <DocSection title="Rules for the AI">
        <Rules items={[
          { do: 'Copy components and adapt their content; keep their behaviour and comments.', dont: 'Rebuild a component from a screenshot — the behaviour (gestures, focus, keyboard) is the point.' },
          { do: 'Verify at 390px and desktop, scroll to the end, open every overlay with keyboard.', dont: 'Declare done after a green typecheck — layout needs eyes.' },
        ]} />
        <Why><p>An agent without design context drifts: raw hex instead of tokens, a fresh button instead of the existing one. AGENTS.md names the anti-patterns explicitly, so the drift has nowhere to start.</p></Why>
      </DocSection>
    </Doc>
  );
}
