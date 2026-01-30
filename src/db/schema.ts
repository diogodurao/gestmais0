import { pgTable, pgEnum, serial, text, timestamp, boolean, integer, date, real, unique, index, jsonb } from 'drizzle-orm/pg-core';
import { relations } from "drizzle-orm"

// --- Enums ---
export const occurrenceStatusEnum = pgEnum('occurrence_status', ['open', 'in_progress', 'resolved'])
export const occurrencePriorityEnum = pgEnum('occurrence_priority', ['low', 'medium', 'high', 'urgent'])
export const pollStatusEnum = pgEnum('poll_status', ['open', 'closed'])
export const pollTypeEnum = pgEnum('poll_type', ['yes_no', 'single_choice', 'multiple_choice'])
export const pollWeightModeEnum = pgEnum('poll_weight_mode', ['equal', 'permilagem'])
export const documentCategoryEnum = pgEnum('document_category', ['atas', 'regulamentos', 'contas', 'seguros', 'contratos', 'projetos', 'outros'])
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'late', 'partial'])
export const projectStatusEnum = pgEnum('project_status', ['draft', 'active', 'completed', 'cancelled', 'archived'])
export const quotaModeEnum = pgEnum('quota_mode', ['global', 'permillage'])
export const subscriptionStatusEnum = pgEnum('subscription_status', ['incomplete', 'active', 'canceled', 'past_due', 'unpaid'])
export const bankConnectionStatusEnum = pgEnum('bank_connection_status', ['pending', 'active', 'expired', 'revoked', 'error'])
export const bankTransactionTypeEnum = pgEnum('bank_transaction_type', ['credit', 'debit'])
export const transactionMatchStatusEnum = pgEnum('transaction_match_status', ['unmatched', 'matched', 'ignored'])
export const notificationTypeEnum = pgEnum('notification_type', [
    'occurrence_created',
    'occurrence_comment',
    'occurrence_status',
    'poll_created',
    'poll_closed',
    'discussion_created',
    'discussion_comment',
    'evaluation_open',
    'calendar_event',
    'payment_due',
    'payment_overdue',
    'poll',
    'subscription_payment_failed',
    'collaborator_invited',
    'collaborator_accepted',
    'collaborator_declined'
])

export const collaboratorInvitationStatusEnum = pgEnum('collaborator_invitation_status', [
    'pending',
    'accepted',
    'declined',
    'cancelled',
    'expired'
])

export const managerBuildingRoleEnum = pgEnum('manager_building_role', [
    'owner',
    'collaborator'
])

// External professional types
export const professionalTypeEnum = pgEnum('professional_type', [
    'accountant',
    'lawyer',
    'consultant'
])

// --- Auth Tables (Better-Auth) ---

export const user = pgTable('user', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull(),
    image: text('image'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    // Custom fields
    role: text('role'), // 'manager' | 'resident' | 'professional'
    nif: text('nif'),
    iban: text('iban'), // Personal IBAN for residents
    buildingId: text('building_id'), // For residents: their building
    activeBuildingId: text('active_building_id'), // For managers: currently selected building
    stripeCustomerId: text('stripe_customer_id'), // Link Stripe Customer to Manager
    preferredLanguage: text('preferred_language').default('pt'), // 'pt' | 'en'
});

export const session = pgTable('session', {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => user.id),
}, (table) => ({
    idxSessionUser: index("idx_session_user").on(table.userId),
}));

export const account = pgTable('account', {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(() => user.id),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
}, (table) => ({
    idxAccountUser: index("idx_account_user").on(table.userId),
}));

export const verification = pgTable('verification', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at'),
    updatedAt: timestamp('updated_at'),
});

// --- App Tables ---

export const building = pgTable('building', {
    id: text('id').primaryKey(), // UUID or CUID
    name: text('name').notNull(), // e.g. "Condominio do Mar"
    nif: text('nif').notNull(),
    code: text('code').notNull().unique(), // The "Building ID" for invites (e.g. "BM123")
    managerId: text('manager_id').notNull().references(() => user.id),
    city: text('city'),
    street: text('street'),
    number: text('number'),
    iban: text('iban'),
    totalApartments: integer('total_apartments'),
    quotaMode: quotaModeEnum('quota_mode').default('global'),
    monthlyQuota: integer('monthly_quota'), // in cents
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    // Payment settings
    paymentDueDay: integer('payment_due_day'), // Day of month when regular quota becomes late (1-28)
    // Stripe Subscription Fields
    stripeSubscriptionId: text('stripe_subscription_id'),
    stripePriceId: text('stripe_price_id'),
    subscriptionStatus: subscriptionStatusEnum('subscription_status').default('incomplete'),
    subscriptionCurrentPeriodEnd: timestamp('subscription_current_period_end'),
    subscriptionPastDueAt: timestamp('subscription_past_due_at'),
    setupComplete: boolean('setup_complete').default(false),
});

// --- Junction Tables ---

export const managerBuildings = pgTable('manager_buildings', {
    id: serial('id').primaryKey(),
    managerId: text('manager_id').notNull().references(() => user.id),
    buildingId: text('building_id').notNull().references(() => building.id),
    isOwner: boolean('is_owner').default(false), // Original creator (legacy, use role instead)
    role: managerBuildingRoleEnum('role').notNull().default('owner'), // 'owner' | 'collaborator'
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
    idxManagerBuildingsManager: index("idx_manager_buildings_manager").on(table.managerId),
    idxManagerBuildingsBuilding: index("idx_manager_buildings_building").on(table.buildingId),
}))

// --- Collaborator Invitations ---

export const collaboratorInvitations = pgTable('collaborator_invitations', {
    id: serial('id').primaryKey(),
    buildingId: text('building_id').notNull().references(() => building.id),

    // For existing users (residents) - current implementation
    invitedUserId: text('invited_user_id').references(() => user.id),

    // For external professionals (future) - invite by email
    invitedEmail: text('invited_email'),

    invitedByUserId: text('invited_by_user_id').notNull().references(() => user.id),

    // Role they'll have when they accept
    role: managerBuildingRoleEnum('role').notNull().default('collaborator'),

    status: collaboratorInvitationStatusEnum('status').notNull().default('pending'),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    respondedAt: timestamp('responded_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
    idxCollaboratorInvitationsBuilding: index("idx_collaborator_invitations_building").on(table.buildingId),
    idxCollaboratorInvitationsInvitedUser: index("idx_collaborator_invitations_invited_user").on(table.invitedUserId),
    idxCollaboratorInvitationsToken: index("idx_collaborator_invitations_token").on(table.token),
    idxCollaboratorInvitationsStatus: index("idx_collaborator_invitations_status").on(table.status),
    idxCollaboratorInvitationsEmail: index("idx_collaborator_invitations_email").on(table.invitedEmail),
}));

// --- Professional Invitations ---

export const professionalInvitations = pgTable('professional_invitations', {
    id: serial('id').primaryKey(),
    buildingId: text('building_id').notNull().references(() => building.id),
    invitedEmail: text('invited_email').notNull(),
    invitedByUserId: text('invited_by_user_id').notNull().references(() => user.id),
    professionalType: professionalTypeEnum('professional_type').notNull(),
    status: collaboratorInvitationStatusEnum('status').notNull().default('pending'),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    respondedAt: timestamp('responded_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
    idxProfessionalInvitationsBuilding: index("idx_professional_invitations_building").on(table.buildingId),
    idxProfessionalInvitationsToken: index("idx_professional_invitations_token").on(table.token),
    idxProfessionalInvitationsStatus: index("idx_professional_invitations_status").on(table.status),
    idxProfessionalInvitationsEmail: index("idx_professional_invitations_email").on(table.invitedEmail),
}));

// --- Resident Invitations ---

export const residentInvitations = pgTable('resident_invitations', {
    id: serial('id').primaryKey(),
    buildingId: text('building_id').notNull().references(() => building.id),
    invitedEmail: text('invited_email').notNull(),
    invitedByUserId: text('invited_by_user_id').notNull().references(() => user.id),
    status: collaboratorInvitationStatusEnum('status').notNull().default('pending'),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    respondedAt: timestamp('responded_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
    idxResidentInvitationsBuilding: index("idx_resident_invitations_building").on(table.buildingId),
    idxResidentInvitationsToken: index("idx_resident_invitations_token").on(table.token),
    idxResidentInvitationsStatus: index("idx_resident_invitations_status").on(table.status),
    idxResidentInvitationsEmail: index("idx_resident_invitations_email").on(table.invitedEmail),
}));

// --- External Professional Profiles ---

export const professionalProfiles = pgTable('professional_profiles', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => user.id),
    professionalId: text('professional_id').notNull(), // Cédula profissional (5-6 digits + optional letter, e.g. 12345P)
    professionalType: professionalTypeEnum('professional_type').notNull(),
    companyName: text('company_name'),
    phone: text('phone').notNull(),
    nif: text('nif'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
    idxProfessionalProfilesUser: index("idx_professional_profiles_user").on(table.userId),
    idxProfessionalProfilesType: index("idx_professional_profiles_type").on(table.professionalType),
    uniqueProfessionalId: unique("unique_professional_id_type").on(table.professionalId, table.professionalType),
}));

// --- External Professionals linked to Buildings ---

export const buildingProfessionals = pgTable('building_professionals', {
    id: serial('id').primaryKey(),
    professionalId: text('professional_id').notNull().references(() => user.id),
    buildingId: text('building_id').notNull().references(() => building.id),
    invitedByUserId: text('invited_by_user_id').notNull().references(() => user.id),
    professionalType: professionalTypeEnum('professional_type').notNull(),
    // Permission flags based on professional type
    canViewPayments: boolean('can_view_payments').notNull().default(false),
    canViewDocuments: boolean('can_view_documents').notNull().default(false),
    canViewReports: boolean('can_view_reports').notNull().default(false),
    canViewOccurrences: boolean('can_view_occurrences').notNull().default(false),
    canViewPolls: boolean('can_view_polls').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
    idxBuildingProfessionalsProfessional: index("idx_building_professionals_professional").on(table.professionalId),
    idxBuildingProfessionalsBuilding: index("idx_building_professionals_building").on(table.buildingId),
    idxBuildingProfessionalsType: index("idx_building_professionals_type").on(table.professionalType),
    uniqueProfessionalBuilding: unique("unique_professional_building").on(table.professionalId, table.buildingId),
}));

// --- Unit/Apartment Tables ---

export const apartments = pgTable('apartments', {
    id: serial('id').primaryKey(),
    buildingId: text('building_id').notNull().references(() => building.id),
    unit: text('unit').notNull(), // Free-form: "R/C Esq", "1º A", "Loja B", "Cave 3"
    permillage: real('permillage'),
    residentId: text('resident_id').references(() => user.id), // Can be null if unclaimed
}, (table) => ({
    idxApartmentsBuilding: index("idx_apartments_building").on(table.buildingId),
    idxApartmentsResident: index("idx_apartments_resident").on(table.residentId),
}));

// --- RESIDENT QUOTA PAYMENTS (NOT STRIPE/SAAS) ---
// This table tracks if a resident has paid their monthly condominium quota.
// It is manually updated by the manager or via bank import.
// IT IS NOT RELATED TO THE MANAGER'S SUBSCRIPTION TO THE APP.
export const payments = pgTable('payments', {
    id: serial('id').primaryKey(),
    apartmentId: integer('apartment_id').notNull().references(() => apartments.id),
    month: integer('month').notNull(), // 1-12
    year: integer('year').notNull(),
    status: paymentStatusEnum('status').notNull().default('pending'),
    amount: integer('amount').notNull(), // in cents
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
    idxPaymentsApartmentYear: index("idx_payments_apartment_year").on(table.apartmentId, table.year)
}));

// --- Extraordinary Projects & Payments ---

export const extraordinaryProjects = pgTable("extraordinary_projects", {
    id: serial("id").primaryKey(),
    buildingId: text("building_id").notNull().references(() => building.id),

    // Project details
    name: text("name").notNull(),
    description: text("description"),

    // Budget & payment structure
    totalBudget: integer("total_budget").notNull(), // in cents
    numInstallments: integer("num_installments").notNull(),
    startMonth: integer("start_month").notNull(),
    startYear: integer("start_year").notNull(),
    paymentDueDay: integer("payment_due_day"), // Day of month when installment becomes late (1-28)

    // Document storage
    documentUrl: text("document_url"),
    documentName: text("document_name"),

    // Status tracking
    status: projectStatusEnum("status").default("active"),

    // Audit fields
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    createdBy: text("created_by").references(() => user.id),
}, (table) => ({
    idxExtraProjectsBuilding: index("idx_extra_projects_building").on(table.buildingId),
    idxExtraProjectsStatus: index("idx_extra_projects_status").on(table.status),
}));

export const extraordinaryPayments = pgTable(
    "extraordinary_payments",
    {
        id: serial("id").primaryKey(),
        projectId: integer("project_id").notNull().references(() => extraordinaryProjects.id),
        apartmentId: integer("apartment_id").notNull().references(() => apartments.id),

        // Installment tracking
        installment: integer("installment").notNull(),

        // Amount tracking
        expectedAmount: integer("expected_amount").notNull(),
        paidAmount: integer("paid_amount").default(0),

        // Status
        status: paymentStatusEnum("status").default("pending"),

        // Payment details
        paidAt: timestamp("paid_at"),
        paymentMethod: text("payment_method"),
        notes: text("notes"),

        // Audit
        updatedAt: timestamp("updated_at").defaultNow(),
        updatedBy: text("updated_by").references(() => user.id),
    },
    (table) => ({
        uniquePayment: unique().on(table.projectId, table.apartmentId, table.installment),
        idxExtraPaymentsProject: index("idx_extra_payments_project").on(table.projectId),
        idxExtraPaymentsApartment: index("idx_extra_payments_apartment").on(table.apartmentId),
    })
);

export const calendarEvents = pgTable('calendar_events', {
    id: serial('id').primaryKey(),
    buildingId: text('building_id').notNull().references(() => building.id),
    title: text('title').notNull(),
    type: text('type').notNull(),
    description: text('description'),
    startDate: date('start_date', { mode: 'string' }).notNull(),
    endDate: date('end_date', { mode: 'string' }),
    startTime: text('start_time'),
    createdBy: text('created_by').notNull().references(() => user.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
    idxCalendarBuilding: index("idx_calendar_building").on(table.buildingId),
}))

export const occurrences = pgTable('occurrences', {
    id: serial('id').primaryKey(),
    buildingId: text('building_id').notNull().references(() => building.id),
    title: text('title').notNull(),
    type: text('type').notNull(),
    description: text('description'),
    status: occurrenceStatusEnum('status').notNull().default('open'),
    priority: occurrencePriorityEnum('priority').notNull().default('medium'),
    createdBy: text('created_by').notNull().references(() => user.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    resolvedAt: timestamp('resolved_at'),
}, (table) => ({
    idxOccurrenceBuilding: index("idx_occurrence_building").on(table.buildingId),
    idxOccurrenceStatus: index("idx_occurrence_status").on(table.status),
}))

export const occurrenceComments = pgTable('occurrence_comments', {
    id: serial('id').primaryKey(),
    occurrenceId: integer('occurrence_id').notNull().references(() => occurrences.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    createdBy: text('created_by').notNull().references(() => user.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
    idxCommentOccurrence: index("idx_comment_occurrence").on(table.occurrenceId),
}))

export const occurrenceAttachments = pgTable('occurrence_attachments', {
    id: serial('id').primaryKey(),
    occurrenceId: integer('occurrence_id').notNull().references(() => occurrences.id, { onDelete: 'cascade' }),
    commentId: integer('comment_id').references(() => occurrenceComments.id, { onDelete: 'cascade' }), // null = attached to occurrence, set = attached to comment
    fileName: text('file_name').notNull(),
    fileKey: text('file_key').notNull(), // R2 object key
    fileUrl: text('file_url').notNull(),
    fileSize: integer('file_size').notNull(),
    fileType: text('file_type').notNull(), // image/jpeg, image/png
    uploadedBy: text('uploaded_by').notNull().references(() => user.id),
    uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
}, (table) => ({
    idxAttachmentOccurrence: index("idx_attachment_occurrence").on(table.occurrenceId),
    idxAttachmentComment: index("idx_attachment_comment").on(table.commentId),
}))

export const polls = pgTable('polls', {
    id: serial('id').primaryKey(),
    buildingId: text('building_id').notNull().references(() => building.id),
    title: text('title').notNull(),
    description: text('description'),
    type: pollTypeEnum('type').notNull(),
    weightMode: pollWeightModeEnum('weight_mode').notNull().default('equal'),
    status: pollStatusEnum('status').notNull().default('open'),
    options: jsonb('options').$type<string[]>(), // For choice types: ["Option A", "Option B"]
    createdBy: text('created_by').notNull().references(() => user.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    closedAt: timestamp('closed_at'),
}, (table) => ({
    idxPollBuilding: index("idx_poll_building").on(table.buildingId),
    idxPollStatus: index("idx_poll_status").on(table.status),
}))

export const pollVotes = pgTable('poll_votes', {
    id: serial('id').primaryKey(),
    pollId: integer('poll_id').notNull().references(() => polls.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => user.id),
    apartmentId: integer('apartment_id').references(() => apartments.id), // For permilagem lookup
    vote: jsonb('vote').notNull().$type<string | string[]>(), // "yes", "no", "abstain" or ["Option A"] or ["Option A", "Option C"]
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
    idxVotePoll: index("idx_vote_poll").on(table.pollId),
    uniqueUserPoll: unique("unique_user_poll").on(table.pollId, table.userId),
}))

export const discussions = pgTable('discussions', {
    id: serial('id').primaryKey(),
    buildingId: text('building_id').notNull().references(() => building.id),
    title: text('title').notNull(),
    content: text('content'),
    isPinned: boolean('is_pinned').notNull().default(false),
    isClosed: boolean('is_closed').notNull().default(false),
    createdBy: text('created_by').notNull().references(() => user.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    lastActivityAt: timestamp('last_activity_at').notNull().defaultNow(),
}, (table) => ({
    idxDiscussionBuilding: index("idx_discussion_building").on(table.buildingId),
    idxDiscussionPinned: index("idx_discussion_pinned").on(table.isPinned),
    idxDiscussionLastActivity: index("idx_discussion_last_activity").on(table.lastActivityAt),
}))

export const discussionComments = pgTable('discussion_comments', {
    id: serial('id').primaryKey(),
    discussionId: integer('discussion_id').notNull().references(() => discussions.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    isEdited: boolean('is_edited').notNull().default(false),
    createdBy: text('created_by').notNull().references(() => user.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
    idxDiscussionCommentDiscussion: index("idx_discussion_comment_discussion").on(table.discussionId),
}))

export const monthlyEvaluations = pgTable('monthly_evaluations', {
    id: serial('id').primaryKey(),
    buildingId: text('building_id').notNull().references(() => building.id),
    userId: text('user_id').notNull().references(() => user.id),
    year: integer('year').notNull(),
    month: integer('month').notNull(), // 1-12
    securityRating: integer('security_rating').notNull(), // 1-5
    cleaningRating: integer('cleaning_rating').notNull(), // 1-5
    maintenanceRating: integer('maintenance_rating').notNull(), // 1-5
    communicationRating: integer('communication_rating').notNull(), // 1-5
    generalRating: integer('general_rating').notNull(), // 1-5
    comments: text('comments'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
    idxEvaluationBuilding: index("idx_evaluation_building").on(table.buildingId),
    idxEvaluationPeriod: index("idx_evaluation_period").on(table.year, table.month),
    uniqueUserEvaluation: unique("unique_user_evaluation").on(
        table.buildingId,
        table.userId,
        table.year,
        table.month
    ),
}))

export const notifications = pgTable('notifications', {
    id: serial('id').primaryKey(),
    buildingId: text('building_id').notNull().references(() => building.id),
    userId: text('user_id').notNull().references(() => user.id),
    type: notificationTypeEnum('type').notNull(),
    title: text('title').notNull(),
    message: text('message'),
    link: text('link'), // e.g., '/dashboard/occurrences/123'
    isRead: boolean('is_read').notNull().default(false),
    readAt: timestamp('read_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
    idxNotificationUser: index("idx_notification_user").on(table.userId),
    idxNotificationRead: index("idx_notification_read").on(table.isRead),
    idxNotificationCreated: index("idx_notification_created").on(table.createdAt),
}))

export const pushSubscriptions = pgTable('push_subscriptions', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => user.id),
    endpoint: text('endpoint').notNull().unique(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
    idxPushSubscriptionUser: index("idx_push_subscription_user").on(table.userId),
}))

export const documents = pgTable('documents', {
    id: serial('id').primaryKey(),
    buildingId: text('building_id').notNull().references(() => building.id),
    title: text('title').notNull(),
    description: text('description'),
    category: documentCategoryEnum('category').notNull(),
    fileName: text('file_name').notNull(), // Original filename
    fileKey: text('file_key').notNull(), // R2 object key
    fileUrl: text('file_url').notNull(), // Public or signed URL
    fileSize: integer('file_size').notNull(), // Bytes
    fileType: text('file_type').notNull(), // MIME type
    version: integer('version').notNull().default(1),
    originalId: integer('original_id'), // Self-reference for versioning (null = original, set = newer version)
    uploadedBy: text('uploaded_by').notNull().references(() => user.id),
    uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
}, (table) => ({
    idxDocumentBuilding: index("idx_document_building").on(table.buildingId),
    idxDocumentCategory: index("idx_document_category").on(table.category),
    idxDocumentOriginal: index("idx_document_original").on(table.originalId),
}))

// --- Banking / Open Banking Tables ---

// Bank connection (one per building) - stores OAuth tokens from Tink
export const bankConnections = pgTable('bank_connections', {
    id: serial('id').primaryKey(),
    buildingId: text('building_id').notNull().references(() => building.id).unique(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    tokenExpiresAt: timestamp('token_expires_at'),
    providerName: text('provider_name'), // Bank name from Tink
    status: bankConnectionStatusEnum('status').default('pending'),
    lastSyncAt: timestamp('last_sync_at'),
    lastError: text('last_error'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    createdBy: text('created_by').references(() => user.id),
}, (table) => ({
    idxBankConnectionBuilding: index("idx_bank_connection_building").on(table.buildingId),
    idxBankConnectionStatus: index("idx_bank_connection_status").on(table.status),
}))

// Bank accounts linked to a connection
export const bankAccounts = pgTable('bank_accounts', {
    id: serial('id').primaryKey(),
    connectionId: integer('connection_id').notNull().references(() => bankConnections.id, { onDelete: 'cascade' }),
    buildingId: text('building_id').notNull().references(() => building.id),
    tinkAccountId: text('tink_account_id').unique(),
    name: text('name'),
    iban: text('iban'),
    balance: integer('balance'), // in cents
    availableBalance: integer('available_balance'), // in cents
    currency: text('currency').default('EUR'),
    accountType: text('account_type'),
    lastSyncAt: timestamp('last_sync_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
    idxBankAccountConnection: index("idx_bank_account_connection").on(table.connectionId),
    idxBankAccountBuilding: index("idx_bank_account_building").on(table.buildingId),
    idxBankAccountIban: index("idx_bank_account_iban").on(table.iban),
}))

// Bank transactions with counterparty IBAN for matching
export const bankTransactions = pgTable('bank_transactions', {
    id: serial('id').primaryKey(),
    accountId: integer('account_id').notNull().references(() => bankAccounts.id, { onDelete: 'cascade' }),
    buildingId: text('building_id').notNull().references(() => building.id),
    tinkTransactionId: text('tink_transaction_id').unique(),
    amount: integer('amount').notNull(), // in cents (positive=credit, negative=debit)
    type: bankTransactionTypeEnum('type').notNull(),
    description: text('description'),
    originalDescription: text('original_description'),
    transactionDate: date('transaction_date', { mode: 'string' }).notNull(),
    bookingDate: date('booking_date', { mode: 'string' }),
    counterpartyName: text('counterparty_name'),
    counterpartyIban: text('counterparty_iban'), // KEY: used for apartment matching
    matchedApartmentId: integer('matched_apartment_id').references(() => apartments.id),
    matchedPaymentId: integer('matched_payment_id').references(() => payments.id),
    matchStatus: transactionMatchStatusEnum('match_status').default('unmatched'),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
    idxBankTxAccount: index("idx_bank_tx_account").on(table.accountId),
    idxBankTxBuilding: index("idx_bank_tx_building").on(table.buildingId),
    idxBankTxCounterpartyIban: index("idx_bank_tx_counterparty_iban").on(table.counterpartyIban),
    idxBankTxMatchStatus: index("idx_bank_tx_match_status").on(table.matchStatus),
    idxBankTxTransactionDate: index("idx_bank_tx_transaction_date").on(table.transactionDate),
}))

// Resident IBANs - allows multiple IBANs per apartment for matching
export const residentIbans = pgTable('resident_ibans', {
    id: serial('id').primaryKey(),
    apartmentId: integer('apartment_id').notNull().references(() => apartments.id, { onDelete: 'cascade' }),
    iban: text('iban').notNull(),
    label: text('label'), // e.g., "Primary", "Spouse account"
    isPrimary: boolean('is_primary').default(false),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
    idxResidentIbansApartment: index("idx_resident_ibans_apartment").on(table.apartmentId),
    idxResidentIbansIban: index("idx_resident_ibans_iban").on(table.iban),
    uniqueApartmentIban: unique("unique_apartment_iban").on(table.apartmentId, table.iban),
}))

// --- Relations ---
export const buildingRelations = relations(building, ({ many }) => ({
    apartments: many(apartments),
    extraordinaryProjects: many(extraordinaryProjects),
}));

export const apartmentsRelations = relations(apartments, ({ one, many }) => ({
    building: one(building, {
        fields: [apartments.buildingId],
        references: [building.id],
    }),
    resident: one(user, {
        fields: [apartments.residentId],
        references: [user.id],
    }),
    extraordinaryPayments: many(extraordinaryPayments),
}));

export const extraordinaryProjectsRelations = relations(extraordinaryProjects, ({ many, one }) => ({
    payments: many(extraordinaryPayments),
    building: one(building, {
        fields: [extraordinaryProjects.buildingId],
        references: [building.id],
    }),
}));

export const extraordinaryPaymentsRelations = relations(extraordinaryPayments, ({ one }) => ({
    project: one(extraordinaryProjects, {
        fields: [extraordinaryPayments.projectId],
        references: [extraordinaryProjects.id],
    }),
    apartment: one(apartments, {
        fields: [extraordinaryPayments.apartmentId],
        references: [apartments.id],
    }),
}));



export const occurrenceAttachmentsRelations = relations(occurrenceAttachments, ({ one }) => ({
    occurrence: one(occurrences, {
        fields: [occurrenceAttachments.occurrenceId],
        references: [occurrences.id],
    }),
    comment: one(occurrenceComments, {
        fields: [occurrenceAttachments.commentId],
        references: [occurrenceComments.id],
    }),
    uploader: one(user, {
        fields: [occurrenceAttachments.uploadedBy],
        references: [user.id],
    }),
}))

export const occurrencesRelations = relations(occurrences, ({ one, many }) => ({
    building: one(building, {
        fields: [occurrences.buildingId],
        references: [building.id],
    }),
    creator: one(user, {
        fields: [occurrences.createdBy],
        references: [user.id],
    }),
    comments: many(occurrenceComments),
    attachments: many(occurrenceAttachments),
}))

export const occurrenceCommentsRelations = relations(occurrenceComments, ({ one, many }) => ({
    occurrence: one(occurrences, {
        fields: [occurrenceComments.occurrenceId],
        references: [occurrences.id],
    }),
    creator: one(user, {
        fields: [occurrenceComments.createdBy],
        references: [user.id],
    }),
    attachments: many(occurrenceAttachments),
}))

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
    building: one(building, {
        fields: [calendarEvents.buildingId],
        references: [building.id],
    }),
    creator: one(user, {
        fields: [calendarEvents.createdBy],
        references: [user.id],
    }),
}))

export const pollsRelations = relations(polls, ({ one, many }) => ({
    building: one(building, {
        fields: [polls.buildingId],
        references: [building.id],
    }),
    creator: one(user, {
        fields: [polls.createdBy],
        references: [user.id],
    }),
    votes: many(pollVotes),
}))

export const pollVotesRelations = relations(pollVotes, ({ one }) => ({
    poll: one(polls, {
        fields: [pollVotes.pollId],
        references: [polls.id],
    }),
    user: one(user, {
        fields: [pollVotes.userId],
        references: [user.id],
    }),
    apartment: one(apartments, {
        fields: [pollVotes.apartmentId],
        references: [apartments.id],
    }),
}))

export const discussionsRelations = relations(discussions, ({ one, many }) => ({
    building: one(building, {
        fields: [discussions.buildingId],
        references: [building.id],
    }),
    creator: one(user, {
        fields: [discussions.createdBy],
        references: [user.id],
    }),
    comments: many(discussionComments),
}))

export const discussionCommentsRelations = relations(discussionComments, ({ one }) => ({
    discussion: one(discussions, {
        fields: [discussionComments.discussionId],
        references: [discussions.id],
    }),
    creator: one(user, {
        fields: [discussionComments.createdBy],
        references: [user.id],
    }),
}))

export const monthlyEvaluationsRelations = relations(monthlyEvaluations, ({ one }) => ({
    building: one(building, {
        fields: [monthlyEvaluations.buildingId],
        references: [building.id],
    }),
    user: one(user, {
        fields: [monthlyEvaluations.userId],
        references: [user.id],
    }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
    building: one(building, {
        fields: [notifications.buildingId],
        references: [building.id],
    }),
    user: one(user, {
        fields: [notifications.userId],
        references: [user.id],
    }),
}))

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
    user: one(user, {
        fields: [pushSubscriptions.userId],
        references: [user.id],
    }),
}))

export const documentsRelations = relations(documents, ({ one }) => ({
    building: one(building, {
        fields: [documents.buildingId],
        references: [building.id],
    }),
    uploader: one(user, {
        fields: [documents.uploadedBy],
        references: [user.id],
    }),
    original: one(documents, {
        fields: [documents.originalId],
        references: [documents.id],
    }),
}))

// --- Banking Relations ---

export const bankConnectionsRelations = relations(bankConnections, ({ one, many }) => ({
    building: one(building, {
        fields: [bankConnections.buildingId],
        references: [building.id],
    }),
    creator: one(user, {
        fields: [bankConnections.createdBy],
        references: [user.id],
    }),
    accounts: many(bankAccounts),
}))

export const bankAccountsRelations = relations(bankAccounts, ({ one, many }) => ({
    connection: one(bankConnections, {
        fields: [bankAccounts.connectionId],
        references: [bankConnections.id],
    }),
    building: one(building, {
        fields: [bankAccounts.buildingId],
        references: [building.id],
    }),
    transactions: many(bankTransactions),
}))

export const bankTransactionsRelations = relations(bankTransactions, ({ one }) => ({
    account: one(bankAccounts, {
        fields: [bankTransactions.accountId],
        references: [bankAccounts.id],
    }),
    building: one(building, {
        fields: [bankTransactions.buildingId],
        references: [building.id],
    }),
    matchedApartment: one(apartments, {
        fields: [bankTransactions.matchedApartmentId],
        references: [apartments.id],
    }),
    matchedPayment: one(payments, {
        fields: [bankTransactions.matchedPaymentId],
        references: [payments.id],
    }),
}))

export const residentIbansRelations = relations(residentIbans, ({ one }) => ({
    apartment: one(apartments, {
        fields: [residentIbans.apartmentId],
        references: [apartments.id],
    }),
}))

// --- Collaborator Invitations Relations ---

export const collaboratorInvitationsRelations = relations(collaboratorInvitations, ({ one }) => ({
    building: one(building, {
        fields: [collaboratorInvitations.buildingId],
        references: [building.id],
    }),
    invitedUser: one(user, {
        fields: [collaboratorInvitations.invitedUserId],
        references: [user.id],
        relationName: 'invitedUser',
    }),
    invitedBy: one(user, {
        fields: [collaboratorInvitations.invitedByUserId],
        references: [user.id],
        relationName: 'invitedBy',
    }),
}))

export const managerBuildingsRelations = relations(managerBuildings, ({ one }) => ({
    manager: one(user, {
        fields: [managerBuildings.managerId],
        references: [user.id],
    }),
    building: one(building, {
        fields: [managerBuildings.buildingId],
        references: [building.id],
    }),
}))

export const professionalProfilesRelations = relations(professionalProfiles, ({ one }) => ({
    user: one(user, {
        fields: [professionalProfiles.userId],
        references: [user.id],
    }),
}))

export const buildingProfessionalsRelations = relations(buildingProfessionals, ({ one }) => ({
    professional: one(user, {
        fields: [buildingProfessionals.professionalId],
        references: [user.id],
    }),
    building: one(building, {
        fields: [buildingProfessionals.buildingId],
        references: [building.id],
    }),
    invitedBy: one(user, {
        fields: [buildingProfessionals.invitedByUserId],
        references: [user.id],
    }),
}))

export const professionalInvitationsRelations = relations(professionalInvitations, ({ one }) => ({
    building: one(building, {
        fields: [professionalInvitations.buildingId],
        references: [building.id],
    }),
    invitedBy: one(user, {
        fields: [professionalInvitations.invitedByUserId],
        references: [user.id],
    }),
}))

export const residentInvitationsRelations = relations(residentInvitations, ({ one }) => ({
    building: one(building, {
        fields: [residentInvitations.buildingId],
        references: [building.id],
    }),
    invitedBy: one(user, {
        fields: [residentInvitations.invitedByUserId],
        references: [user.id],
    }),
}))