export interface FeatureTranslations {
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

export const t: FeatureTranslations = {
    common: {
        loading: "Carregando...",
        error: "Erro",
        success: "Sucesso",
        save: "Guardar",
        cancel: "Cancelar",
        edit: "Editar",
        delete: "Apagar",
        confirm: "Confirmar",
        back: "Voltar",
        search: "Procurar",
        all: "Tudo",
        none: "Nenhum"
    },
    extraPayment: {
        budgetExecution: "Execução do Orçamento",
        toolsAndFilters: "Ferramentas & Filtros",
        editMode: "Modo de Edição",
        markPaid: "Marcar Pago",
        markPending: "Marcar Pendente",
        toggleState: "Alternar Estado",
        collected: "Cobrado",
        totalBudget: "Orçamento Total",
        unit: "Fração",
        resident: "Residente",
        permillage: "Permilagem",
        totalShare: "Quota Total",
        totalPaid: "Total Pago",
        debt: "Em Dívida",
        status: "Estado",
        noResident: "Sem residente",
        installments: "Prestações",
        paid: "Pago",
        pending: "Pendente",
        overdue: "Atraso",
        partial: "Parcial",
        tools: "Ferramentas",
        filters: "Filtros",
        exportPdf: "Exportar PDF",
        exportExcel: "Exportar Excel",
        allUnits: "Todas as Frações",
        paidUnits: "Só Pagos",
        pendingUnits: "Só Pendentes",
        deleteConfirm: "Tem a certeza que deseja apagar?",
        deleteSuccess: "Apagado com sucesso",
        updateSuccess: "Atualizado com sucesso"
    },
    subscription: {
        totalCalculation: "Cálculo Total",
        commitSubscription: "Confirmar Subscrição",
        secureTransaction: "Transação Segura (Stripe)",
        redirecting: "A redirecionar para o Stripe...",
        syncPayment: "Sincronizar estado do pagamento",
        syncing: "A sincronizar...",
        awaitingSync: "A aguardar sincronização?",
        stateActive: "Estado: Ativo",
        noSession: "Sessão não encontrada"
    },
    paymentGrid: {
        masterLedger: "Livro de Mestre",
        financialYear: "Ano Civil",
        collected: "Cobrado",
        overdue: "Em atraso",
        markPaid: "Marcar Pago",
        markOverdue: "Marcar em Atraso",
        clear: "Limpar",
        search: "PROCURAR...",
        legend: "LEGENDA:",
        editTap: "EDITAR: TOQUE PARA",
        refreshed: "Atualizado: ",
        deleteApartment: "Apagar Fração",
        deleteMessage: "Tem a certeza? Isto irá apagar todos os pagamentos desta fração."
    }
}
