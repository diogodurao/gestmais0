export interface Dictionary {
    nav: {
        modules: string
        pricing: string
        docs: string
        login: string
        getAccess: string
    }
    hero: {
        systemStatus: string
        titleLine1: string
        titleLine2: string
        subtitle: string
        ctaPrimary: string
        ctaSecondary?: string
        dashboardPreview: string
        paid: string
        late: string
    }
    features: {
        title: string
        cards: {
            finance: {
                title: string
                items: string[]
            }
            occurrences: {
                title: string
                items: string[]
            }
            documents: {
                title: string
                items: string[]
            }
        }
    }
    pricing: {
        title: string
        subtitle: string
        card: {
            price: string
            unit: string
            feature1: string
            feature2: string
            feature3: string
            cta: string
        }
    }
    faq: {
        title: string
        items: {
            question: string
            answer: string
        }[]
    }
    footer: {
        designedIn: string
        rights: string
        sitemap: string
        legal: string
    }
    common: {
        loading: string
        error: string
        success: string
        save: string
        cancel: string
        edit: string
        delete: string
        confirm: string
        back: string
        search: string
        all: string
        none: string
    }
    extraPayment: {
        budgetExecution: string
        toolsAndFilters: string
        editMode: string
        markPaid: string
        markPending: string
        toggleState: string
        collected: string
        totalBudget: string
        unit: string
        resident: string
        permillage: string
        totalShare: string
        totalPaid: string
        debt: string
        status: string
        noResident: string
        installments: string
        paid: string
        pending: string
        overdue: string
        partial: string
        tools: string
        filters: string
        exportPdf: string
        exportExcel: string
        allUnits: string
        paidUnits: string
        pendingUnits: string
        deleteConfirm: string
        deleteSuccess: string
        updateSuccess: string
    }
    subscription: {
        totalCalculation: string
        commitSubscription: string
        secureTransaction: string
        redirecting: string
        syncPayment: string
        syncing: string
        awaitingSync: string
        stateActive: string
        noSession: string
        billingServiceSubscription: string
        liveSubscription: string
        awaitingSyncBadge: string
        colStatus: string
        statusIncomplete: string
        subscriptionActive: string
        featureUnlockMessage: string
        featureLockActive: string
        subscribeUnlockMessage: string
        validateProfile: string
        validateBuilding: string
        insertAllUnits: string
        toEnableBilling: string
        poweredByStripe: string
    }
    paymentGrid: {
        masterLedger: string
        financialYear: string
        collected: string
        overdue: string
        markPaid: string
        markOverdue: string
        clear: string
        search: string
        legend: string
        editTap: string
        refreshed: string
        deleteApartment: string
        deleteMessage: string
    }
}
