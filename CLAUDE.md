- avoid barrel files; only if strictly necessary;
- don´t use any mock data
- use Typescript strict mode; too many problems with [any] types;
- Be sure to typecheck when you’re done making a series of code changes;
- avoid hardcoded data or variables and inline components that should be extracted.
- replace [isLoading] (manual loading state) with other better suited options for use case:
    - [useTransition] for asynchronous actions (for rendering data);
    - [useAsyncState] is for fetching data. Use it for server actions instead of manual try/catch;
    
- enforce TailwindCSS v4 modern pattern = CSS-first configuration
- server actions should return results, not void. (Promise<void> return types)
- avoid monolithic files and hardcoded inline; quick fix monolithic is dangerous!
- don't mix server-side data fetching with UI presentation logic.
- think twice; do not touch good working code. Only change what is asked.
- Prefer running single tests, and not the whole test suite, for performance.

- useID react hook (stable across SSR/hydration) instead of Math.random() = because causes hydration problems
    - math.random() problems:
    - react remounts components constantly; breaks animations, transitions, and component state; terrible performance; lost focus/scroll position

Attention to:
- inefficient data fetching and hydration delays
- large javascript bundles (needed code splitting or dynamic imports)

- Keep this simple. Don't add abstractions I didn't ask for. One file if possible.