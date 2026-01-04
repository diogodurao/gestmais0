---
description: Remove AI generated slop; enforce simplicity; good implementation.
---

# Workflow
- Be sure to typecheck when you’re done making a series of code changes
- Prefer running single tests, and not the whole test suite, for performance

# Code style
- Write concise, algorithmic code. 
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')
- Use data structures over conditionals (when appropriate), minimal comments (only the necessary), short variable names.
- Don´t handle edge cases I didn't ask for; Avoid over-engineering edge cases. 
- Target solutions at ~30-50% the length of typical AI output.

# Code Cleanup & Simplification Workflow
1. **Check for "AI Slop" Styling**:
   - Remove usage of Generic fonts, excessive gradients, glassmorphism filters, usage of "modern" purples/blues if they look generic.
   - Remove "Grid of Cards" layouts if a simple list or table is more appropriate.
   - Remove over-rounded corners (keep it subtle).
   - Ensure high contrast and clear typography.

2. **Remove Unnecessary Complexity**:
   - **Comments**: Remove explanations that are obvious from the code (e.g., `// Import React`).
   - **Defensive Coding**: Remove `try/catch` or heavy validation in internal/trusted paths unless external I/O is involved.
   - **Types**: Remove `any` casts. Fix the types properly.

3. **Simplify Component Structure**:
   - Break huge components into smaller chunks ONLY if reusable.
   - If a component is used once, keep it local or inline if small enough.

4. do not respond with generic responses: "you are absolutely right!"; explore different paths and solutions for each implementation or problem; think twice.

5. **Verify Correctness**:
   - Run the build: `npm run build`; lint/type-check.

// turbo
Report changes summary.