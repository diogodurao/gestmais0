# 🟢 Good Patterns to Keep

### 1. Custom Hooks
Excellent use of:
- `useAsyncAction` for optimistic updates + rollback
- `useAsyncData` for data fetching with loading states
- `useDebouncedCallback` for rate-limiting clicks

### 2. Component Composition
The extraordinary-projects folder is well-structured:
```
extraordinary-projects/
├── ExtraPaymentGrid.tsx          # Main container
├── components/
│   ├── ApartmentRow.tsx          # Row logic isolated
│   ├── BudgetProgress.tsx        # Reusable progress
│   ├── MobileApartmentCard.tsx   # Mobile view
│   └── ...
└── types.ts                      # Shared types
```

### 3. Virtualization
`PaymentDesktopTable.tsx` uses `react-window` for large lists - good for scaling.

### 4. Optimistic Updates
`PaymentGrid.tsx` and `ExtraPaymentGrid.tsx` both implement optimistic UI updates with rollback on error.
