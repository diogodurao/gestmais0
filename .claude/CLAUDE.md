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
- if the task is extensive, use a task list or plan mode; Choose what you think is best.
- if you need to change something, ask me first.


---

## TypeScript

- Use strict mode; avoid `any` types
- Always typecheck after making code changes
- Centralize types in `src/lib/types.ts`

---

## React Patterns

### Async State Management

Replace manual `isLoading` state with:

- **`useTransition`** - for async actions that update UI/render data
- **`useAsyncAction`** - for server actions (wraps with toast notifications)
- **`useOptimisticAction`** - for optimistic updates

### Component IDs

Use `useId()` instead of `Math.random()` for stable IDs across SSR/hydration.

> `Math.random()` causes: hydration mismatches, component remounts, broken animations, lost focus/scroll position.

---

## Server Actions

- Return results, not `void` (avoid `Promise<void>` return types)
- Use pattern: `Promise<{ success: boolean; data?: T; error?: string }>`
- Use `useAsyncAction` hook on client instead of manual try/catch

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
