import { z } from "zod"
import { nifSchema, ibanSchema } from "./validations"

// Building Schemas
export const createBuildingSchema = z.object({
    name: z.string().min(1, "Name is required"),
    nif: nifSchema.optional().or(z.literal(""))
})

export const updateBuildingSchema = z.object({
    name: z.string().min(1).optional(),
    nif: nifSchema.optional().or(z.literal("")),
    iban: ibanSchema.optional().or(z.literal("")),
    city: z.string().optional().nullable(),
    street: z.string().optional().nullable(),
    number: z.string().optional().nullable(),
    quotaMode: z.enum(["global", "permillage"]).optional(),
    monthlyQuota: z.number().min(0).optional(),
    paymentDueDay: z.number().int().min(1).max(28).optional().nullable(),
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
    paymentDueDay: z.number().int().min(1).max(28).optional().nullable(),
    documentUrl: z.string().optional(),
    documentName: z.string().optional(),
})

export const updateProjectSchema = z.object({
    projectId: z.number().int(),
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    paymentDueDay: z.number().int().min(1).max(28).optional().nullable(),
    documentUrl: z.string().optional(),
    documentName: z.string().optional(),
    status: z.enum(["draft", "active", "completed", "cancelled", "archived"]).optional()
})

export const updateExtraPaymentSchema = z.object({
    paymentId: z.number().int(),
    amountPaid: z.number().min(0).optional(),
    status: z.enum(["paid", "pending", "late", "partial"]).optional(),
    paidDate: z.union([
        z.string().datetime().transform(val => new Date(val)),
        z.date(),
        z.null()
    ]).optional()
})

// Calendar Event Schemas
export const createCalendarEventSchema = z.object({
    buildingId: z.string().min(1),
    title: z.string().min(1, "Título é obrigatório"),
    type: z.string().min(1, "Tipo é obrigatório"),
    description: z.string().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    recurrence: z.enum(["none", "weekly", "biweekly", "monthly"]).optional(),
})

export const updateCalendarEventSchema = z.object({
    title: z.string().min(1).optional(),
    type: z.string().min(1).optional(),
    description: z.string().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
})

// Occurrence Schemas
const occurrencePriorityEnum = z.enum(["low", "medium", "high", "urgent"])

export const createOccurrenceSchema = z.object({
    buildingId: z.string().min(1),
    title: z.string().min(1, "Título é obrigatório").max(200),
    type: z.string().min(1, "Tipo é obrigatório").max(100),
    priority: occurrencePriorityEnum.default("medium"),
    description: z.string().max(2000).optional(),
})

export const updateOccurrenceSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    type: z.string().min(1).max(100).optional(),
    priority: occurrencePriorityEnum.optional(),
    description: z.string().max(2000).optional().nullable(),
})

// Poll Schemas
export const createPollSchema = z.object({
    buildingId: z.string().min(1),
    title: z.string().min(1, "Título é obrigatório").max(200),
    description: z.string().max(2000).optional(),
    type: z.enum(["yes_no", "single_choice", "multiple_choice"]),
    weightMode: z.enum(["equal", "permilagem"]),
    options: z.array(z.string().min(1).max(200)).max(10).optional(),
})

export const castVoteSchema = z.object({
    pollId: z.number().positive(),
    vote: z.union([
        z.string(), // For yes_no: "yes", "no", "abstain"
        z.array(z.string()), // For choices: ["Option A"] or ["Option A", "Option B"]
    ]),
})

// Discussion Schemas
export const createDiscussionSchema = z.object({
    buildingId: z.string().min(1),
    title: z.string().min(1, "Título é obrigatório").max(200),
    content: z.string().max(5000).optional(),
})

export const updateDiscussionSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().max(5000).optional().nullable(),
})

// Evaluation Schemas
const ratingSchema = z.number().int().min(1, "Mínimo 1").max(5, "Máximo 5")

export const submitEvaluationSchema = z.object({
    buildingId: z.string().min(1),
    year: z.number().int().min(2020).max(2100),
    month: z.number().int().min(1).max(12),
    securityRating: ratingSchema,
    cleaningRating: ratingSchema,
    maintenanceRating: ratingSchema,
    communicationRating: ratingSchema,
    generalRating: ratingSchema,
    comments: z.string().max(2000).optional(),
})

// Document Schemas
export const documentCategorySchema = z.enum([
    'atas',
    'regulamentos',
    'contas',
    'seguros',
    'contratos',
    'outros'
])

export const uploadDocumentSchema = z.object({
    buildingId: z.string().min(1),
    title: z.string().min(1, "Título é obrigatório").max(200),
    description: z.string().max(1000).optional(),
    category: documentCategorySchema,
})

export const updateDocumentSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional().nullable(),
})