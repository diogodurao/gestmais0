# Future PR: External Professional Collaborators

## Overview

Extend the collaborator invitation system to allow inviting **external professionals** (lawyers, accountants, consultants) who are NOT residents of the building.

---

## Prerequisites

- Current PR (Collaborator Invitation Feature) must be merged first
- Database schema already supports this via `invitedEmail` field

---

## Proposed Changes

### 1. UI Changes

**Modify: `src/app/dashboard/collaborators/CollaboratorsPageClient.tsx`**

Add a second invitation option:
```
[Tab 1: Convidar Residente] [Tab 2: Convidar Externo]

Tab 1 (existing):
- Dropdown to select from building residents

Tab 2 (new):
- Email input field
- Name input field (optional)
- Role description text
```

### 2. Service Layer Changes

**Modify: `src/services/collaborator.service.ts`**

Update `createInvitation()` to accept either:
- `invitedUserId` (existing resident)
- OR `invitedEmail` (external professional)

```typescript
async createInvitation(
    buildingId: string,
    invitedByUserId: string,
    target: { userId: string } | { email: string; name?: string }
): Promise<...>
```

### 3. Invitation Flow for External Professionals

```
┌─────────────────────────────────────────────────────────────────────┐
│                   EXTERNAL PROFESSIONAL FLOW                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  MANAGER                           EXTERNAL PROFESSIONAL             │
│     │                                    │                           │
│     │ 1. Enter email + optional name     │                           │
│     │                                    │                           │
│     ▼                                    │                           │
│  ┌──────────────────┐                    │                           │
│  │ Create Invitation │                   │                           │
│  │ (invitedEmail)    │                   │                           │
│  └────────┬─────────┘                    │                           │
│           │                              │                           │
│           │ 2. Send email only           │                           │
│           │    (no in-app notification)  │                           │
│           ├──────────────────────────────┼──► Email with link        │
│           │                              │                           │
│           │                              ▼                           │
│           │                    ┌─────────────────────┐               │
│           │                    │ Professional clicks │               │
│           │                    │ email link          │               │
│           │                    └─────────┬───────────┘               │
│           │                              │                           │
│           │                    ┌─────────┴───────────┐               │
│           │                    │                     │               │
│           │                    ▼                     ▼               │
│           │           [Has Account]         [No Account]             │
│           │                    │                     │               │
│           │                    ▼                     ▼               │
│           │         ┌──────────────────┐   ┌────────────────┐       │
│           │         │ Login + Accept   │   │ Create Account │       │
│           │         └────────┬─────────┘   │ + Accept       │       │
│           │                  │             └───────┬────────┘       │
│           │                  │                     │                 │
│           │                  └──────────┬──────────┘                 │
│           │                             │                            │
│           │                             ▼                            │
│           │                   ┌──────────────────┐                   │
│           │                   │ Add to           │                   │
│           │                   │ managerBuildings │                   │
│           │                   │ role: collaborator│                   │
│           │                   └────────┬─────────┘                   │
│           │                            │                             │
│           │                            ▼                             │
│           │                  User has manager                        │
│           │                  dashboard access                        │
│           │                  (with restrictions)                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 4. New Invitation Accept Page

**Create: `src/app/invite/[token]/page.tsx`**

Public page (no auth required initially) that:
1. Validates the token
2. Shows building name and who invited them
3. If user is logged in with matching email: show Accept/Decline buttons
4. If user is logged in with different email: show error
5. If user is not logged in:
   - Check if email exists in system -> redirect to login with return URL
   - If email doesn't exist -> show account creation form inline

### 5. Email Template

**Modify: `src/lib/email.ts`**

Create variation for external professionals:
- Different subject: "You've been invited to collaborate on building management"
- Different body: Include context about what GestMais is
- Link goes to `/invite/[token]` instead of dashboard invitations page

### 6. Account Creation During Accept

**Create: `src/lib/actions/invite.ts`**

```typescript
// Accept invitation with existing account
acceptInvitationWithAccount(token: string)

// Create account and accept invitation in one step
createAccountAndAcceptInvitation(token: string, userData: {
    name: string
    email: string  // Must match invitation email
    password: string
})
```

---

## Files to Create/Modify

| Action | File Path |
|--------|-----------|
| Modify | `src/app/dashboard/collaborators/CollaboratorsPageClient.tsx` |
| Modify | `src/services/collaborator.service.ts` |
| Modify | `src/lib/actions/collaborators.ts` |
| Modify | `src/lib/email.ts` |
| Create | `src/app/invite/[token]/page.tsx` |
| Create | `src/app/invite/[token]/InvitePageClient.tsx` |
| Create | `src/lib/actions/invite.ts` |

---

## Validation Rules

1. **Email uniqueness**: Cannot invite email if:
   - Already a pending invitation exists for that email on this building
   - Email belongs to existing collaborator/owner of this building
   - Email belongs to a resident of this building (use resident flow instead)

2. **Token handling**:
   - Same 7-day expiry as resident invitations
   - Token links `invitedEmail` to invitation, not user ID

3. **Account creation**:
   - Email MUST match `invitedEmail` in invitation
   - Standard password requirements apply
   - Account created with no buildingId (not a resident)

---

## Security Considerations

1. Rate limit invitation creation per building
2. Rate limit invitation accept attempts per token
3. Validate email format on invitation creation
4. External professionals should NOT have resident role/access
5. Consider adding "collaborator type" field to distinguish professionals from resident collaborators

---

## Future Enhancements (Beyond This PR)

- Collaborator types/categories (accountant, lawyer, consultant, etc.)
- Expiring collaborator access (temporary access for a project)
- Audit log of collaborator actions
- Building owner can set specific permissions per collaborator
