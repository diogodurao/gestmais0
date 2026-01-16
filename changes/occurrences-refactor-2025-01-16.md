# Occurrences Feature Refactor

**Date:** 2025-01-16
**Branch:** refactor

---

## Overview

Complete UI refactor of the occurrences feature to match the test page design. Added priority field to the database and implemented inline detail viewing with Sheet component instead of separate detail page.

---

## Database Changes

### Schema (`src/db/schema.ts`)
- Added `priority` column to `occurrences` table with default value `'medium'`

### Migration (`drizzle/0011_bouncy_mongu.sql`)
```sql
ALTER TABLE "occurrences" ADD COLUMN "priority" text DEFAULT 'medium' NOT NULL;
```

---

## Type Changes

### `src/lib/types.ts`
- Added `OccurrencePriority` type: `"low" | "medium" | "high" | "urgent"`
- Added `priority` field to `Occurrence` interface
- Added `priority` field to `CreateOccurrenceInput` and `UpdateOccurrenceInput`

### `src/lib/zod-schemas.ts`
- Added `occurrencePriorityEnum` schema
- Added `priority` field to `createOccurrenceSchema` and `updateOccurrenceSchema`

---

## Constants Changes

### `src/lib/constants/ui.ts`

**Modified:**
- `OCCURRENCE_STATUS_CONFIG` - Changed from `color` format to `variant` format for Badge component:
  - `open: { label: "Aberta", variant: "warning" }`
  - `in_progress: { label: "Em Progresso", variant: "info" }`
  - `resolved: { label: "Resolvida", variant: "success" }`

**Added:**
- `OCCURRENCE_PRIORITY_CONFIG` - Priority styling configuration:
  - `low: { label: "Baixa", color: "text-[#6C757D]", bg: "bg-[#F1F3F5]" }`
  - `medium: { label: "Média", color: "text-[#B8963E]", bg: "bg-[#FBF6EC]" }`
  - `high: { label: "Alta", color: "text-[#B86B73]", bg: "bg-[#F9ECEE]" }`
  - `urgent: { label: "Urgente", color: "text-white", bg: "bg-[#B86B73]" }`

- `OCCURRENCE_CATEGORY_OPTIONS` - Category dropdown options
- `OCCURRENCE_PRIORITY_OPTIONS` - Priority dropdown options

---

## Service Changes

### `src/services/occurrence.service.ts`
- Added `priority` to select queries in `getByBuilding()` and `getById()`
- Added `priority` to `create()` method

---

## Component Changes

### `src/components/dashboard/occurrences/OccurrencesList.tsx`
**Complete rewrite:**
- New props: `currentUserId`, `currentUserName`, `isManager`
- Added 4 StatCards: Abertas, Em Progresso, Resolvidas, Urgentes
- Removed search/filter toolbar (was deemed unnecessary)
- Added state management for selected occurrence and sheet visibility
- Integrated `OccurrenceDetailSheet` for inline viewing

### `src/components/dashboard/occurrences/OccurrenceCard.tsx`
**Updated:**
- Changed from `Link` navigation to `onClick` prop
- Uses `Badge variant={statusConfig.variant}` instead of className
- Added priority badge with custom styling
- Compact styling matching test page (`p-1.5`, `text-[11px]`, etc.)
- Shows: status badge, priority badge, title, description, reporter, comment count, relative time

### `src/components/dashboard/occurrences/OccurrenceDetailSheet.tsx`
**New file:**
- Sheet component for inline occurrence detail viewing
- Fetches occurrence data, comments, and attachments when opened
- Displays:
  - Status badge (Badge variant)
  - Priority badge (custom styling)
  - Category badge (Badge variant="default")
  - Description
  - Date with Calendar icon
  - Photos (PhotoGallery component)
- Actions:
  - Status change buttons (manager only)
  - Edit/Delete buttons (owner only, when status is open)
- Comments section:
  - Different background for manager comments (`bg-[#E8F4EA]`)
  - Admin badge (`Badge variant="success"`)
  - IconButton for sending comments
  - Disabled when occurrence is resolved

### `src/components/dashboard/occurrences/OccurrenceModal.tsx`
**Updated:**
- Added priority Select field in grid layout with category
- Uses constants from `OCCURRENCE_CATEGORY_OPTIONS` and `OCCURRENCE_PRIORITY_OPTIONS`
- Mobile responsive: Drawer on mobile, Modal on desktop

---

## Page Changes

### `src/app/dashboard/occurrences/page.tsx`
- Updated to pass new props to `OccurrencesList`:
  - `currentUserId`
  - `currentUserName`
  - `isManager`

---

## Deleted Files

- `src/app/dashboard/occurrences/[id]/page.tsx` - Detail page removed (Sheet replaces it)
- `src/components/dashboard/occurrences/OccurrenceDetail.tsx` - Old detail component removed

---

## UI Design Notes

The new design follows the test page at `src/app/test/occurrences/page.tsx`:

- **Compact styling** - Uses small text sizes (`text-[9px]`, `text-[10px]`, `text-[11px]`)
- **Badge variants** - Uses Badge component's built-in variants (warning, info, success, default)
- **Priority badge** - Custom styled span with background and text colors
- **Sheet pattern** - Inline detail viewing instead of separate page navigation
- **Mobile responsive** - Modal on desktop, Drawer on mobile for create/edit forms