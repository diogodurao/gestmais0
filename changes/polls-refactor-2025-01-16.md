# Polls UI Refactor - 2025-01-16

## Overview
Refactored the polls feature UI to use a Sheet-based detail view instead of a separate page, added search/filter functionality, and simplified the poll creation modal.

---

## Files Modified

### 1. `src/lib/constants/ui.ts`
**Change:** Updated `POLL_STATUS_CONFIG` to use Badge variants

```typescript
// Before
export const POLL_STATUS_CONFIG = {
    open: { label: "Ativa", color: "bg-green-100 text-green-700" },
    closed: { label: "Encerrada", color: "bg-gray-100 text-gray-700" },
}

// After
export const POLL_STATUS_CONFIG = {
    open: { label: "Ativa", variant: "success" as const },
    closed: { label: "Encerrada", variant: "default" as const },
}
```

### 2. `src/components/dashboard/polls/PollCard.tsx`
**Changes:**
- Changed from `Link` navigation to `onClick` handler
- Compact styling matching design system
- Uses Badge with `variant` prop

### 3. `src/components/dashboard/polls/PollsList.tsx`
**Changes:**
- Added search bar with real-time filtering by title
- Added filter buttons: "Todas", "Ativas", "Encerradas"
- Added StatCards: Ativas, Encerradas, Total Votos, Participação
- Integrated `PollDetailSheet` for inline detail viewing
- Uses `useMemo` for filtered polls

### 4. `src/components/dashboard/polls/PollModal.tsx`
**Changes:**
- Simplified poll types from 3 to 2:
  - "Sim/Não/Abstenção" (yes_no)
  - "Escolha múltipla" (multiple_choice)
- Shows 3 option input fields by default for multiple choice
- "Adicionar opção" button (up to 10 options)
- Added Drawer for mobile responsiveness
- Removed unused imports

---

## Files Created

### `src/components/dashboard/polls/PollDetailSheet.tsx`
New Sheet-based component that replaces the separate detail page.

**Features:**
- Voting UI with option selection (yes/no, single choice, multiple choice)
- Abstain handling
- Results display with progress bars and percentages
- Individual voter details showing who voted for what
- Permillage display when weight mode is "permilagem"
- "Alterar o meu voto" button to change vote while poll is open
- Manager actions: "Encerrar" (close poll), "Eliminar" (delete if no votes)
- Restricted results for residents who haven't voted

**Props:**
```typescript
interface Props {
    pollId: number | null
    open: boolean
    onClose: () => void
    isManager: boolean
}
```

---

## Files Deleted

| File | Reason |
|------|--------|
| `src/app/dashboard/polls/[id]/page.tsx` | Replaced by PollDetailSheet |
| `src/app/dashboard/polls/[id]/loading.tsx` | No longer needed |
| `src/components/dashboard/polls/PollDetail.tsx` | Functionality merged into PollDetailSheet |
| `src/components/dashboard/polls/VoteForm.tsx` | Functionality merged into PollDetailSheet |
| `src/components/dashboard/polls/PollResults.tsx` | Functionality merged into PollDetailSheet |

---

## Feature Comparison

### Poll Creation (PollModal)

| Feature | Before | After |
|---------|--------|-------|
| Poll types | 3 (yes_no, single_choice, multiple_choice) | 2 (yes_no, multiple_choice) |
| Default options | 2 | 3 |
| Mobile support | Modal only | Drawer on mobile, Modal on desktop |

### Poll List (PollsList)

| Feature | Before | After |
|---------|--------|-------|
| Search | No | Yes (by title) |
| Filter | No | Yes (Todas/Ativas/Encerradas) |
| Stats | No | Yes (4 StatCards) |
| Detail view | Separate page | Inline Sheet |

### Poll Detail (PollDetailSheet)

| Feature | Before (PollDetail) | After (PollDetailSheet) |
|---------|---------------------|-------------------------|
| Navigation | Separate /polls/[id] page | Inline Sheet |
| Vote change | Yes | Yes |
| Voter details | Yes | Yes |
| Manager actions | Yes | Yes |
| Restricted results | Yes | Yes |

---

## Weight Mode Logic

The weight mode determines how votes are counted:

| Mode | Database Value | Behavior |
|------|---------------|----------|
| Maioria simples | `equal` | Each vote = 1 |
| Permilagem | `permilagem` | Vote weighted by apartment's permillage |

**Implementation in `poll.service.ts`:**
```typescript
const isWeighted = poll.weightMode === 'permilagem'
const weight = isWeighted ? (v.apartmentPermillage || 1) : 1
```

---

## Results Visibility

| User Role | Can See Results |
|-----------|-----------------|
| Manager | Always |
| Resident | Only after voting |

Residents who haven't voted see: "Vote primeiro para ver os resultados"

---

## UI Components Used

- `Sheet` - Slide-in panel for detail view
- `Badge` - Status badges with variants
- `StatCard` - Statistics display
- `Progress` - Vote percentage bars
- `Button` - Actions and filters
- `Input` - Search field
- `Modal` - Desktop poll creation
- `Drawer` - Mobile poll creation
- `EmptyState` - No polls message