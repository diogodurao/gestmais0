---
paths:
- "src/components/**/*.tsx"
---

# UI Component Rules

## Before Building/Modifying Components

1. **Always analyze existing similar components first**
   - Find 2-3 similar components in the codebase
   - Extract their patterns (structure, spacing, typography)
   - Match the established visual language

2. **Reference the design system**
   - Read `src/app/globals.css` for tokens
   - Check `src/components/ui/` for base components
   - Never invent new patterns without asking

3. **Ask before making design decisions**
   - "Should this match [existing component]?"
   - "What visual style do you want?"
   - Don't assume what looks "better"

---

## Component Structure

### Use existing UI primitives
```tsx
// Good - use existing components
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Alert } from "@/components/ui/Alert"

// Bad - creating custom containers
<div className="border rounded-lg p-4 bg-white">
```

### Typography classes (from globals.css)
```tsx
text-label    // 10px, medium, gray-500 - labels, metadata
text-body     // 11px, normal, gray-600 - body text
text-subtitle // 13px, medium, gray-700 - section titles
text-heading  // 14px, semibold, gray-800 - headings
```

### Spacing (use design tokens)
```tsx
// Good
className="space-y-4 p-1.5 gap-2"

// Bad - arbitrary values
className="space-y-[18px] p-[10px]"
```

---

## Layout Patterns

### Card-based content
```tsx
<Card variant="default|success|warning|error">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Footer */}
  </CardFooter>
</Card>
```

### Empty states
```tsx
import { EmptyState } from "@/components/ui/Empty-State"

<EmptyState
  icon={<Icon />}
  title="Title"
  description="Description"
  action={<Button>Action</Button>}
/>
```

### Alerts/Messages
```tsx
<Alert variant="info|success|warning|error">
  Message text
</Alert>
```

---

## Colors (from @theme)

### Semantic colors
- `text-gray-500` - secondary text
- `text-gray-600` - body text
- `text-gray-700` - emphasized text
- `text-gray-800` - headings
- `text-primary` - primary actions
- `text-error` - errors
- `text-warning` - warnings
- `text-success` - success states

### Backgrounds
- `bg-white` - default
- `bg-gray-50` - subtle sections
- `bg-error-light` - error backgrounds
- `bg-warning-light` - warning backgrounds
- `bg-success-light` - success backgrounds

---

## Button Patterns

```tsx
// Primary action
<Button variant="primary" size="md">Action</Button>

// Secondary action
<Button variant="outline" size="sm">Secondary</Button>

// Destructive/urgent
<Button variant="outline" className="bg-red-50 border-red-200 text-red-700">
```

---

## DO NOT

- Invent new visual patterns without asking
- Use arbitrary Tailwind values (`[#xxx]`, `[12px]`)
- Create inline styled containers when UI components exist
- Add decorative elements (icons, badges) without reference
- Change existing component styling without explicit request