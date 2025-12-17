import { pgTable, serial, text, timestamp, boolean, integer, date, real, uniqueIndex } from 'drizzle-orm/pg-core';

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
    buildingId: text('building_id'), // Link to building (Manager manages it, Resident lives in it)
    profileComplete: boolean('profile_complete').notNull().default(false),
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
});

// Update user to have optional link to building (Manager owns it, Resident belongs to it)
// Note: We'll need to manually modify the user table definition above to include 'buildingId'

export const apartments = pgTable('apartments', {
    id: serial('id').primaryKey(),
    unit: text('unit').notNull(), // e.g., "1A", "2B"
    residentId: text('resident_id').references(() => user.id), // Can be null if empty
    floor: integer('floor'),
    permillage: real('permillage'), // e.g., 45 means 45/1000 of building
    buildingId: text('building_id').notNull().references(() => building.id), // Link to building
}, (table) => ({
    buildingUnitUnique: uniqueIndex('apartments_building_unit_idx').on(table.buildingId, table.unit),
}));

export const payments = pgTable('payments', {
    id: serial('id').primaryKey(),
    apartmentId: integer('apartment_id').notNull().references(() => apartments.id),
    month: integer('month').notNull(), // 1-12
    year: integer('year').notNull(),
    status: text('status').notNull().default('pending'), // 'paid' | 'pending' | 'late'
    amount: integer('amount').notNull(), // in cents
    updatedAt: timestamp('updated_at').defaultNow(),
});
