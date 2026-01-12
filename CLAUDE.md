# CLAUDE.md

## Tech Stack

- **Framework**: Next.js 16 + React 19 (React Compiler enabled)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Better Auth
- **Styling**: TailwindCSS v4 (CSS-first configuration)
- **Validation**: Zod + React Hook Form

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

- TailwindCSS v4 with CSS-first configuration
- Design tokens defined in `globals.css` via `@theme`
- Use `clsx` + `tailwind-merge` for className composition

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
