# CLAUDE.md

## Tech Stack

- **Framework**: Next.js 16 + React 19 (React Compiler enabled)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Better Auth
- **Styling**: TailwindCSS v4 (CSS-first configuration)
- **Validation**: Zod + React Hook Form

---

## MCP Usage

Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.


# thinking and code generation

- Read the library's actual behavior, not what I assume it does.
- Don't assume anything, always verify --> use context7 mcp
- when generating and changing code, never change the code that is not related to the task. If its not clear, ask questions or plan mode until it is clear.
- if you need to change something, ask me first.
- always make a quick plan before making any changes. dont matter how small the change is.
- always create a brief schema from the last changes to understand the context.

- in the implementation plan, show implementation order and if appropriate, show a brief visual schema of the proposed changes.

- if the task is extensive, use a task list or plan mode; Choose what you think is best.

- when in plan mode, do not code until the human aproves the implementation plan.

---

## TypeScript

- Use strict mode; avoid `any` types
- Always typecheck after making code changes
- Centralize types in `src/lib/types.ts`

---

## Styling

**Always read `@/globals.css` before writing any styles.**
(tailwindCSS v4 with CSS-first configuration)

Use design tokens from `@theme`:
- Colors, spacing, border radius
- Font families, sizes, weights, line heights
- Shadows, transition durations, timing

Use utility classes from `@layer utilities`:
- Typography
- Focus states
- Mobile responsive utilities

Never hardcode values (no `bg-[#xxx]`, `text-[12px]`, `p-[16px]`, etc.). If a token or utility doesn't exist, ask before using arbitrary values.

Use `cn()` from `@/lib/utils.ts` (clsx + tailwind-merge) for className composition.


---

## Architecture

- Avoid barrel files (only if strictly necessary)
- Avoid monolithic files; extract components and logic
- Don't mix server-side data fetching with UI presentation
- Avoid hardcoded data/variables and inline components
- No mock data

---

## Performance

Watch for:
- Inefficient data fetching and hydration delays
- Large JavaScript bundles (use code splitting / dynamic imports)

---

## Testing

- Prefer running single tests over the whole suite

---

## General Principles

- **Keep it simple** - don't add abstractions not asked for; one file if possible
- **Minimal changes** - don't touch working code; only change what's asked
- **Think twice** before modifying existing code
