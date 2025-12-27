import { z } from "zod"

// Building Schemas
export const createBuildingSchema = z.object({
    name: z.string().min(1, "Name is required"),
    nif: z.string().regex(/^\d{9}$/, "Invalid NIF format").optional().or(z.literal(""))
})

export const updateBuildingSchema = z.object({
    name: z.string().min(1).optional(),
    nif: z.string().regex(/^\d{9}$/, "Invalid NIF format").optional().or(z.literal("")),
    iban: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    street: z.string().optional().nullable(),
    number: z.string().optional().nullable(),
    quotaMode: z.string().optional(),
    monthlyQuota: z.number().min(0).optional(),
    totalApartments: z.number().int().min(1).optional(),
})

export const createApartmentSchema = z.object({
    unit: z.string().min(1, "Unit identifier is required"),
    permillage: z.number().min(0).max(1000).optional().nullable()
})

export const updateApartmentSchema = z.object({
    unit: z.string().min(1).optional(),
    permillage: z.number().min(0).max(1000).optional().nullable()
})

// Payment Schemas
export const paymentStatusSchema = z.enum(["paid", "pending", "late", "partial"])

export const updatePaymentStatusSchema = z.object({
    apartmentId: z.number().int(),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2000).max(2100),
    status: paymentStatusSchema,
    amount: z.number().min(0).optional()
})

export const bulkUpdatePaymentsSchema = z.object({
    apartmentId: z.number().int(),
    year: z.number().int().min(2000).max(2100),
    startMonth: z.number().int().min(1).max(12),
    endMonth: z.number().int().min(1).max(12),
    status: paymentStatusSchema
}).refine(data => data.endMonth >= data.startMonth, {
    message: "End month must be greater than or equal to start month",
    path: ["endMonth"]
})

// Extraordinary Project Schemas
export const createProjectSchema = z.object({
    buildingId: z.string().uuid(),
    name: z.string().min(1, "Project name is required"),
    description: z.string().optional(),
    totalBudget: z.number().min(0, "Total budget must be positive"),
    numInstallments: z.number().int().min(1, "Must have at least 1 installment"),
    startMonth: z.number().int().min(1).max(12),
    startYear: z.number().int().min(2000).max(2100),
    documentUrl: z.string().url().optional(),
    documentName: z.string().optional(),
})

export const updateProjectSchema = z.object({
    projectId: z.number().int(),
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    documentUrl: z.string().url().optional(),
    documentName: z.string().optional(),
    status: z.enum(["draft", "active", "completed", "cancelled"]).optional()
})

export const updateExtraPaymentSchema = z.object({
    paymentId: z.number().int(),
    amountPaid: z.number().min(0).optional(),
    status: z.enum(["paid", "pending", "late", "partial"]).optional(),
    paidDate: z.string().datetime().or(z.date()).optional().nullable().transform(val => val ? new Date(val) : null)
})
