-- Add external professionals support

-- Create professional type enum
CREATE TYPE "professional_type" AS ENUM ('accountant', 'lawyer', 'consultant');

-- Create professional profiles table
CREATE TABLE "professional_profiles" (
    "id" serial PRIMARY KEY,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "professional_id" text NOT NULL, -- Cédula profissional (5-6 digits)
    "professional_type" "professional_type" NOT NULL,
    "company_name" text,
    "phone" text NOT NULL,
    "nif" text,
    "created_at" timestamp NOT NULL DEFAULT NOW(),
    "updated_at" timestamp NOT NULL DEFAULT NOW(),
    UNIQUE("user_id"),
    UNIQUE("professional_id", "professional_type")
);

-- Create building professionals table (external professionals linked to buildings)
CREATE TABLE "building_professionals" (
    "id" serial PRIMARY KEY,
    "professional_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "building_id" text NOT NULL REFERENCES "building"("id") ON DELETE CASCADE,
    "invited_by_user_id" text NOT NULL REFERENCES "user"("id"),
    "professional_type" "professional_type" NOT NULL,
    -- Permission flags based on professional type
    "can_view_payments" boolean NOT NULL DEFAULT false,
    "can_view_documents" boolean NOT NULL DEFAULT false,
    "can_view_reports" boolean NOT NULL DEFAULT false,
    "can_view_occurrences" boolean NOT NULL DEFAULT false,
    "can_view_polls" boolean NOT NULL DEFAULT false,
    "created_at" timestamp NOT NULL DEFAULT NOW(),
    UNIQUE("professional_id", "building_id")
);

-- Create indexes for professional profiles
CREATE INDEX "idx_professional_profiles_user" ON "professional_profiles"("user_id");
CREATE INDEX "idx_professional_profiles_type" ON "professional_profiles"("professional_type");

-- Create indexes for building professionals
CREATE INDEX "idx_building_professionals_professional" ON "building_professionals"("professional_id");
CREATE INDEX "idx_building_professionals_building" ON "building_professionals"("building_id");
CREATE INDEX "idx_building_professionals_type" ON "building_professionals"("professional_type");

-- Add index for invited_email in collaborator_invitations (for external professional invites)
CREATE INDEX "idx_collaborator_invitations_email" ON "collaborator_invitations"("invited_email");
