import { pgTable, serial, text, timestamp, boolean, integer, date, real, unique, index } from 'drizzle-orm/pg-core';
import { relations } from "drizzle-orm"

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
    role: text('role'), // 'manager' | 'resident'
    nif: text('nif'),
    iban: text('iban'), // Personal IBAN for residents
    buildingId: text('building_id'), // For residents: their building
    activeBuildingId: text('active_building_id'), // For managers: currently selected building
    stripeCustomerId: text('stripe_customer_id'), // Link Stripe Customer to Manager
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
});

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
});

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
    quotaMode: text('quota_mode').default('global'), // 'global' | 'permillage'
    monthlyQuota: integer('monthly_quota'), // in cents
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    // Stripe Subscription Fields
    stripeSubscriptionId: text('stripe_subscription_id'),
    stripePriceId: text('stripe_price_id'),
    subscriptionStatus: text('subscription_status').default('incomplete'), // 'active', 'incomplete', 'canceled', 'past_due'
    setupComplete: boolean('setup_complete').default(false),
});

// --- Junction Tables ---

export const managerBuildings = pgTable('manager_buildings', {
    id: serial('id').primaryKey(),
    managerId: text('manager_id').notNull().references(() => user.id),
    buildingId: text('building_id').notNull().references(() => building.id),
    isOwner: boolean('is_owner').default(false), // Original creator
    createdAt: timestamp('created_at').defaultNow(),
});

// --- Unit/Apartment Tables ---

export const apartments = pgTable('apartments', {
    id: serial('id').primaryKey(),
    buildingId: text('building_id').notNull().references(() => building.id),
    unit: text('unit').notNull(), // Free-form: "R/C Esq", "1º A", "Loja B", "Cave 3"
    permillage: real('permillage'),
    residentId: text('resident_id').references(() => user.id), // Can be null if unclaimed
}, (table) => ({
    idxApartmentsBuilding: index("idx_apartments_building").on(table.buildingId)
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
    status: text('status').notNull().default('pending'), // 'paid' | 'pending' | 'late'
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

    // Document storage
    documentUrl: text("document_url"),
    documentName: text("document_name"),

    // Status tracking
    status: text("status").default("active"),

    // Audit fields
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    createdBy: text("created_by").references(() => user.id),
});

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
        status: text("status").default("pending"),

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
        idxExtraPaymentsProject: index("idx_extra_payments_project").on(table.projectId)
    })
);

// --- RELATIONS ---

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
