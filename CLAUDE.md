# CLAUDE.md

Everything an agent needs is in **[AGENTS.md](AGENTS.md)** — one file, so there
are never two truths. Read it fully before writing any UI with this library.

Short version: copy `ui/`, import `ui/styles/index.css` after Tailwind, use the
tokens (no raw hex, no `text-[…]`, no `rounded-[…]`), the named springs, the
existing components, and verify at 390px and desktop width.
