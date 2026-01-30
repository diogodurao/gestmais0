
export const ROUTES = {
    DASHBOARD: {
        HOME: "/dashboard",
        SETTINGS: "/dashboard/settings",
        PAYMENTS: "/dashboard/payments",
        RESIDENTS: "/dashboard/residents",
        EXTRAORDINARY: "/dashboard/extraordinary",
        ONBOARDING: "/dashboard/onboarding",
        CALENDAR: "/dashboard/calendar",
        OCCURRENCES: "/dashboard/occurrences",
        OCCURRENCE_DETAIL: (id: number) => `/dashboard/occurrences/${id}`,
        DISCUSSIONS: "/dashboard/discussions",
        DISCUSSION_DETAIL: (id: number) => `/dashboard/discussions/${id}`,
        POLLS: "/dashboard/polls",
        POLL_DETAIL: (id: number) => `/dashboard/polls/${id}`,
        EVALUATIONS: "/dashboard/evaluations",
        DOCUMENTS: "/dashboard/documents",
        COLLABORATORS: "/dashboard/collaborators",
        INVITATIONS: "/dashboard/invitations",
        PROFESSIONALS: "/dashboard/professionals",
    },
    INVITE: "/invite",
    AUTH: {
        LOGIN: "/auth/login",
    },
    HOME: "/",
} as const
