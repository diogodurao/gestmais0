# Building Roles & Invitations

## Overview

Extend the current two-role system (`manager` | `resident`) with per-building roles and an invitation system to support:

1. **Colaboradores** - Residents promoted to assistant managers with edit access
2. **Profissionais externos (Lawyers/Accountants)** - External professionals with view-only access

---

## Architecture Decisions

- **Dual-role approach**: Residents promoted to collaborator keep their `user.role = "resident"` and apartment assignment, but gain a `managerBuildings` entry with `role: "collaborator"`. Their dashboard switches to the manager/collaborator view.

- **Collaborator invitation (in-app)**: Manager clicks "Adicionar colaborador", selects a resident from the building. The resident receives an in-app notification to accept/decline. On accept, their dashboard refreshes to show the collaborator view (same as manager, minus owner-only features).

- **Profissional externo invitation (email)**: Manager clicks "Convidar profissional", enters email and selects role ("viewer"). A `buildingInvitations` record is created with a token. The professional receives an email with a link — if they have an account they link it, otherwise they sign up. On accept, they get a `managerBuildings` entry with `role: "viewer"`.

---

## Building Roles

| Role | Who | How they join |
|------|-----|---------------|
| `owner` | Manager who created the building | Automatic on building creation |
| `collaborator` | Resident promoted by owner | In-app notification accept |
| `viewer` | Lawyer/Accountant | Email invitation link |

---

## Permissions Table

| Feature | Owner | Collaborator | Viewer |
|---------|:-----:|:------------:|:------:|
| View dashboard & all data | Yes | Yes | Yes |
| View invite code | Yes | Yes | No |
| Export documents | Yes | Yes | Yes |
| Manage residents (add/remove) | Yes | Yes | No |
| Manage payments (record/edit) | Yes | Yes | No |
| Create extraordinary projects | Yes | Yes | No |
| Manage calendar events | Yes | Yes | No |
| Manage occurrences | Yes | Yes | No |
| Manage polls | Yes | Yes | No |
| Manage discussions | Yes | Yes | No |
| Edit building settings | Yes | No | No |
| Manage subscription (Stripe) | Yes | No | No |
| Invite/remove collaborators | Yes | No | No |
| Invite/remove viewers | Yes | No | No |

---

## Schema Changes

### 1. Migrate `managerBuildings.isOwner` to `role`

```sql
ALTER TABLE manager_buildings ADD COLUMN role TEXT NOT NULL DEFAULT 'owner';
UPDATE manager_buildings SET role = CASE WHEN is_owner = true THEN 'owner' ELSE 'collaborator' END;
ALTER TABLE manager_buildings DROP COLUMN is_owner;
```

**Drizzle schema** (`src/db/schema.ts`):

```typescript
export const managerBuildings = pgTable("manager_buildings", {
  id: serial("id").primaryKey(),
  managerId: uuid("manager_id").references(() => user.id).notNull(),
  buildingId: uuid("building_id").references(() => building.id).notNull(),
  role: text("role").notNull().default("owner"), // "owner" | "collaborator" | "viewer"
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_manager_buildings_manager").on(table.managerId),
  index("idx_manager_buildings_building").on(table.buildingId),
  unique("uq_manager_building").on(table.managerId, table.buildingId),
])
```

### 2. New table: `buildingInvitations`

For both collaborator (in-app) and viewer (email) invitations.

```typescript
export const buildingInvitations = pgTable("building_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  buildingId: uuid("building_id").references(() => building.id).notNull(),
  invitedBy: uuid("invited_by").references(() => user.id).notNull(),
  // For collaborator invites (in-app): targetUserId is set
  targetUserId: uuid("target_user_id").references(() => user.id),
  // For viewer invites (email): email + token are set
  email: text("email"),
  token: text("token").unique(),
  role: text("role").notNull(), // "collaborator" | "viewer"
  status: text("status").notNull().default("pending"), // "pending" | "accepted" | "declined" | "expired" | "cancelled"
  expiresAt: timestamp("expires_at").notNull(),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
})
```

### 3. Add new notification type

In `src/lib/types.ts`:

```typescript
export type NotificationType =
  | 'occurrence_created' | 'occurrence_comment' | 'occurrence_status'
  | 'poll_created' | 'poll_closed'
  | 'discussion_created' | 'discussion_comment'
  | 'evaluation_open' | 'calendar_event'
  | 'payment_due' | 'payment_overdue' | 'poll'
  | 'collaborator_invite'  // NEW
```

---

## Flows

### Flow 1: Invite Resident as Collaborator (In-App)

```
Manager (owner) → Settings > Equipa > "Adicionar colaborador"
  → Modal shows list of building residents (from apartments)
  → Manager selects resident
  → Server action: createCollaboratorInvite(residentId, buildingId)
    → Creates buildingInvitations record (targetUserId = residentId, role = "collaborator")
    → Creates notification for resident (type: "collaborator_invite", link: "/dashboard?invite={id}")
  → Resident sees notification in dashboard
  → Resident clicks → ConfirmModal: "Aceitar convite de colaborador?"
  → On accept: acceptInvitation(invitationId)
    → Creates managerBuildings entry (managerId = residentId, buildingId, role = "collaborator")
    → Updates invitation status = "accepted"
    → revalidatePath("/dashboard")
  → Resident's dashboard reloads → now sees collaborator view
```

### Flow 2: Invite Profissional Externo (Email)

```
Manager (owner) → Settings > Equipa > "Convidar profissional"
  → Modal with email input + role selector (viewer)
  → Server action: createViewerInvite(email, buildingId)
    → Creates buildingInvitations record (email, token = nanoid(), role = "viewer")
    → Sends email with link: /invite/{token}
  → Professional clicks link
    → If logged in: shows accept page
    → If not: redirects to signup, then back to accept
  → On accept: acceptEmailInvitation(token)
    → Creates managerBuildings entry (managerId = userId, buildingId, role = "viewer")
    → Updates invitation status = "accepted"
    → Redirects to /dashboard (viewer sees read-only manager dashboard)
```

### Flow 3: Collaborator Dashboard Experience

```
Resident with collaborator role:
  → DashboardContext checks managerBuildings for user
  → If has collaborator/viewer entry → activeBuildingId is set
  → Navigation shows managerNavItems (filtered by collaborator permissions)
  → Dashboard renders ManagerDashboard (not ResidentDashboard)
  → Actions check buildingRole before allowing mutations
  → Settings shows: Profile + Notifications (no building/subscription/apartments tabs)
```

### Flow 4: Remove Collaborator/Viewer

```
Manager (owner) → Settings > Equipa
  → Sees list of collaborators and viewers
  → Clicks "Remover" on a member
  → ConfirmModal confirmation
  → Server action: removeBuildingMember(userId, buildingId)
    → Deletes managerBuildings entry
    → If was collaborator (resident): user reverts to normal resident dashboard
    → revalidatePath("/dashboard")
```

---

## File Changes

### Types (`src/lib/types.ts`)

```typescript
export type BuildingRole = "owner" | "collaborator" | "viewer"

// Update SessionUser or DashboardInitialData to include buildingRole
export type DashboardInitialData = {
  session: SessionUser | null
  managerBuildings: ManagedBuilding[]
  activeBuilding: ManagedBuilding | null
  activeBuildingRole: BuildingRole | null  // NEW
  residentApartment: Apartment | null
  setupComplete: boolean
}
```

### Permissions (`src/lib/permissions.ts`)

```typescript
// New building-role checks
export function canEdit(role: BuildingRole | null): boolean {
  return role === "owner" || role === "collaborator"
}

export function canManageTeam(role: BuildingRole | null): boolean {
  return role === "owner"
}

export function canEditSettings(role: BuildingRole | null): boolean {
  return role === "owner"
}

export function canManageSubscription(role: BuildingRole | null): boolean {
  return role === "owner"
}
```

### Auth helpers (`src/lib/auth-helpers.ts`)

```typescript
// Update requireBuildingAccess to return role
export async function requireBuildingAccess(buildingId: string) {
  const session = await requireSession()
  const access = await db.query.managerBuildings.findFirst({
    where: and(
      eq(managerBuildings.managerId, session.user.id),
      eq(managerBuildings.buildingId, buildingId),
    ),
  })
  if (!access) throw new Error("No access to this building")
  return { session, buildingRole: access.role as BuildingRole }
}

// New: require edit permission
export async function requireEditAccess(buildingId: string) {
  const { session, buildingRole } = await requireBuildingAccess(buildingId)
  if (buildingRole === "viewer") throw new Error("Viewer cannot edit")
  return { session, buildingRole }
}
```

### Dashboard detection (`src/app/dashboard/page.tsx`)

```typescript
// Updated logic:
// 1. Check if user is manager → ManagerDashboard
// 2. Check if resident has managerBuildings entry → ManagerDashboard (collaborator)
// 3. Otherwise → ResidentDashboard

const buildingAccess = await db.query.managerBuildings.findFirst({
  where: eq(managerBuildings.managerId, sessionUser.id),
})

if (isManager(sessionUser) || buildingAccess) {
  return <ManagerDashboard session={session} buildingRole={buildingAccess?.role} />
}
return <ResidentDashboard session={session} />
```

### Navigation (`src/config/navigation.ts`)

```typescript
// Add role filtering to nav items
export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  requiresSetup?: boolean
  requiresSubscription?: boolean
  roles?: ("manager" | "resident")[]
  minBuildingRole?: BuildingRole  // NEW: minimum role needed
}

// Settings only for owner
{ href: "/dashboard/settings", label: "Definições", icon: Settings,
  requiresSetup: true, minBuildingRole: "collaborator" }
```

### New server actions (`src/lib/actions/invitations.ts`)

```typescript
// createCollaboratorInvite(residentId: string, buildingId: string)
// createViewerInvite(email: string, buildingId: string)
// acceptInvitation(invitationId: string)
// declineInvitation(invitationId: string)
// cancelInvitation(invitationId: string)
// removeBuildingMember(userId: string, buildingId: string)
// getPendingInvitations(buildingId: string)
// getBuildingTeam(buildingId: string)
```

### New UI components

```
src/components/dashboard/settings/TeamSection.tsx
  → Tab content for "Equipa" in Settings
  → Lists: owner, collaborators, viewers
  → Buttons: "Adicionar colaborador", "Convidar profissional"
  → Pending invitations list

src/components/dashboard/settings/AddCollaboratorModal.tsx
  → Shows residents list (from apartments)
  → Select + confirm

src/components/dashboard/settings/InviteViewerModal.tsx
  → Email input + submit

src/app/invite/[token]/page.tsx
  → Accept email invitation page (for viewers)
```

### Settings tabs update (`src/components/dashboard/settings/SettingsLayout.tsx`)

```typescript
const tabs = [
  { id: "profile", label: "Perfil", icon: User, show: true },
  { id: "team", label: "Equipa", icon: Users, show: isOwner },      // NEW
  { id: "building", label: "Edifício", icon: Building, show: isOwner },
  { id: "apartments", label: "Frações", icon: Key, show: isOwner },
  { id: "subscription", label: "Subscrição", icon: CreditCard, show: isOwner },
  { id: "banking", label: "Open Banking", icon: Landmark, show: isOwner },
  { id: "notifications", label: "Notificações", icon: Bell, show: true },
]
```

---

## Implementation Phases

### Phase 1: Schema & Types
- [ ] Add `role` column to `managerBuildings`, migrate `isOwner` data, drop `isOwner`
- [ ] Create `buildingInvitations` table
- [ ] Add `BuildingRole` type to `src/lib/types.ts`
- [ ] Add `collaborator_invite` to `NotificationType`
- [ ] Update `ManagedBuilding` type to include `role` instead of `isOwner`
- [ ] Generate and run Drizzle migration

### Phase 2: Permissions & Auth
- [ ] Add `canEdit()`, `canManageTeam()`, `canEditSettings()` to `permissions.ts`
- [ ] Update `requireBuildingAccess()` to return `buildingRole`
- [ ] Add `requireEditAccess()` helper
- [ ] Update existing server actions to use `requireEditAccess` where needed

### Phase 3: Dashboard Role Detection
- [ ] Update `DashboardInitialData` to include `activeBuildingRole`
- [ ] Update dashboard `page.tsx` to detect collaborator residents
- [ ] Update `DashboardContext` to expose `buildingRole`
- [ ] Update navigation filtering to respect `buildingRole`
- [ ] Update Settings tabs visibility based on `buildingRole`

### Phase 4: Collaborator Invite Flow
- [ ] Create `src/lib/actions/invitations.ts` with collaborator actions
- [ ] Create `TeamSection.tsx` settings tab
- [ ] Create `AddCollaboratorModal.tsx` (pick resident from list)
- [ ] Create notification on invite
- [ ] Handle notification click → accept/decline modal
- [ ] On accept: create `managerBuildings` entry + revalidate
- [ ] On decline: update invitation status

### Phase 5: Viewer Invite Flow
- [ ] Add viewer invite actions to `invitations.ts`
- [ ] Create `InviteViewerModal.tsx` (email input)
- [ ] Create `/app/invite/[token]/page.tsx` accept page
- [ ] Email sending (or placeholder for email service)
- [ ] On accept: create `managerBuildings` entry with role "viewer"
- [ ] Viewer dashboard: hide all mutation buttons/actions

### Phase 6: Remove & Revoke
- [ ] Remove collaborator action (deletes `managerBuildings` entry)
- [ ] Remove viewer action
- [ ] Cancel pending invitation action
- [ ] UI: remove buttons in TeamSection
- [ ] Collaborator reverts to resident dashboard on removal