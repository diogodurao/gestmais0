---
description: Remove AI generated slop and enforce simplicity
---

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

4. do not respond with generic responses: "you are absolutely right!"; explore different paths and solutions for each implementation or problem. 

5. **Verify Correctness**:
   - Run the build: `npm run build`
   - Run the lint: `npm run lint`

// turbo
5. Report changes summary.