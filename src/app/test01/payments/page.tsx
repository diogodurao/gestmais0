"use client";

import { useState, useMemo } from "react";

/**
 * Payment Grid - Monthly Quotas
 *
 * Structure mirrors real app:
 * - 12-month grid (Jan-Dec)
 * - Stats: Total Collected, Units, On-time, Overdue
 * - Toolbar: Tools (paid/pending/late), search, filter
 * - Table: Fração | Residente | [12 months] | Pago | Dívida
 * - Interactive cells for status changes
 */

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

type PaymentStatus = "paid" | "pending" | "late";
type ToolType = "markPaid" | "markPending" | "markLate" | null;
type FilterMode = "all" | "paid" | "pending" | "late";

interface Payment {
  status: PaymentStatus;
  amount: number;
}

interface ApartmentData {
  id: number;
  unit: string;
  resident: string | null;
  quota: number;
  payments: Record<number, Payment>;
}

// Sample data matching real app structure
const initialData: ApartmentData[] = [
  {
    id: 1,
    unit: "A1",
    resident: "João Silva",
    quota: 8500, // cents
    payments: {
      1: { status: "paid", amount: 8500 },
      2: { status: "paid", amount: 8500 },
      3: { status: "paid", amount: 8500 },
      4: { status: "pending", amount: 0 },
      5: { status: "pending", amount: 0 },
      6: { status: "pending", amount: 0 },
      7: { status: "pending", amount: 0 },
      8: { status: "pending", amount: 0 },
      9: { status: "pending", amount: 0 },
      10: { status: "pending", amount: 0 },
      11: { status: "pending", amount: 0 },
      12: { status: "pending", amount: 0 },
    },
  },
  {
    id: 2,
    unit: "A2",
    resident: "Maria Santos",
    quota: 8500,
    payments: {
      1: { status: "paid", amount: 8500 },
      2: { status: "late", amount: 0 },
      3: { status: "late", amount: 0 },
      4: { status: "pending", amount: 0 },
      5: { status: "pending", amount: 0 },
      6: { status: "pending", amount: 0 },
      7: { status: "pending", amount: 0 },
      8: { status: "pending", amount: 0 },
      9: { status: "pending", amount: 0 },
      10: { status: "pending", amount: 0 },
      11: { status: "pending", amount: 0 },
      12: { status: "pending", amount: 0 },
    },
  },
  {
    id: 3,
    unit: "A3",
    resident: "Pedro Costa",
    quota: 8500,
    payments: {
      1: { status: "paid", amount: 8500 },
      2: { status: "paid", amount: 8500 },
      3: { status: "paid", amount: 8500 },
      4: { status: "pending", amount: 0 },
      5: { status: "pending", amount: 0 },
      6: { status: "pending", amount: 0 },
      7: { status: "pending", amount: 0 },
      8: { status: "pending", amount: 0 },
      9: { status: "pending", amount: 0 },
      10: { status: "pending", amount: 0 },
      11: { status: "pending", amount: 0 },
      12: { status: "pending", amount: 0 },
    },
  },
  {
    id: 4,
    unit: "B1",
    resident: "Ana Ferreira",
    quota: 12000,
    payments: {
      1: { status: "paid", amount: 12000 },
      2: { status: "paid", amount: 12000 },
      3: { status: "paid", amount: 12000 },
      4: { status: "paid", amount: 12000 },
      5: { status: "pending", amount: 0 },
      6: { status: "pending", amount: 0 },
      7: { status: "pending", amount: 0 },
      8: { status: "pending", amount: 0 },
      9: { status: "pending", amount: 0 },
      10: { status: "pending", amount: 0 },
      11: { status: "pending", amount: 0 },
      12: { status: "pending", amount: 0 },
    },
  },
  {
    id: 5,
    unit: "B2",
    resident: null,
    quota: 12000,
    payments: {
      1: { status: "pending", amount: 0 },
      2: { status: "pending", amount: 0 },
      3: { status: "pending", amount: 0 },
      4: { status: "pending", amount: 0 },
      5: { status: "pending", amount: 0 },
      6: { status: "pending", amount: 0 },
      7: { status: "pending", amount: 0 },
      8: { status: "pending", amount: 0 },
      9: { status: "pending", amount: 0 },
      10: { status: "pending", amount: 0 },
      11: { status: "pending", amount: 0 },
      12: { status: "pending", amount: 0 },
    },
  },
  {
    id: 6,
    unit: "B3",
    resident: "Rita Pereira",
    quota: 12000,
    payments: {
      1: { status: "paid", amount: 12000 },
      2: { status: "paid", amount: 12000 },
      3: { status: "late", amount: 0 },
      4: { status: "pending", amount: 0 },
      5: { status: "pending", amount: 0 },
      6: { status: "pending", amount: 0 },
      7: { status: "pending", amount: 0 },
      8: { status: "pending", amount: 0 },
      9: { status: "pending", amount: 0 },
      10: { status: "pending", amount: 0 },
      11: { status: "pending", amount: 0 },
      12: { status: "pending", amount: 0 },
    },
  },
  {
    id: 7,
    unit: "C1",
    resident: "Miguel Rodrigues",
    quota: 9500,
    payments: {
      1: { status: "paid", amount: 9500 },
      2: { status: "paid", amount: 9500 },
      3: { status: "paid", amount: 9500 },
      4: { status: "pending", amount: 0 },
      5: { status: "pending", amount: 0 },
      6: { status: "pending", amount: 0 },
      7: { status: "pending", amount: 0 },
      8: { status: "pending", amount: 0 },
      9: { status: "pending", amount: 0 },
      10: { status: "pending", amount: 0 },
      11: { status: "pending", amount: 0 },
      12: { status: "pending", amount: 0 },
    },
  },
  {
    id: 8,
    unit: "C2",
    resident: "Sofia Martins",
    quota: 9500,
    payments: {
      1: { status: "late", amount: 0 },
      2: { status: "late", amount: 0 },
      3: { status: "late", amount: 0 },
      4: { status: "pending", amount: 0 },
      5: { status: "pending", amount: 0 },
      6: { status: "pending", amount: 0 },
      7: { status: "pending", amount: 0 },
      8: { status: "pending", amount: 0 },
      9: { status: "pending", amount: 0 },
      10: { status: "pending", amount: 0 },
      11: { status: "pending", amount: 0 },
      12: { status: "pending", amount: 0 },
    },
  },
];

function formatCurrency(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

function formatCurrencyShort(cents: number): string {
  return `€${(cents / 100).toFixed(0)}`;
}

export default function PaymentsPage() {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [activeTool, setActiveTool] = useState<ToolType>(null);

  // Calculate totals per apartment
  const dataWithTotals = useMemo(() => {
    return data.map((apt) => {
      const totalPaid = Object.values(apt.payments).reduce(
        (sum, p) => sum + (p.status === "paid" ? p.amount : 0),
        0
      );
      // Current month is 4 (April) for demo
      const currentMonth = 4;
      const expectedTotal = currentMonth * apt.quota;
      const balance = Math.max(0, expectedTotal - totalPaid);

      return { ...apt, totalPaid, balance };
    });
  }, [data]);

  // Filter and search
  const filteredData = useMemo(() => {
    let result = dataWithTotals;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (apt) =>
          apt.unit.toLowerCase().includes(term) ||
          apt.resident?.toLowerCase().includes(term)
      );
    }

    if (filterMode !== "all") {
      result = result.filter((apt) => {
        if (filterMode === "paid") return apt.balance === 0;
        if (filterMode === "late") return apt.balance > 0;
        if (filterMode === "pending") {
          return Object.values(apt.payments).some((p) => p.status === "pending");
        }
        return true;
      });
    }

    return result;
  }, [dataWithTotals, searchTerm, filterMode]);

  // Stats
  const totalCollected = dataWithTotals.reduce((sum, apt) => sum + apt.totalPaid, 0);
  const totalOverdue = dataWithTotals.reduce((sum, apt) => sum + apt.balance, 0);
  const paidCount = dataWithTotals.filter((apt) => apt.balance === 0).length;
  const overdueCount = dataWithTotals.filter((apt) => apt.balance > 0).length;

  // Cell click handler
  const handleCellClick = (aptId: number, monthIdx: number) => {
    if (!activeTool) return;

    const statusMap: Record<NonNullable<ToolType>, PaymentStatus> = {
      markPaid: "paid",
      markPending: "pending",
      markLate: "late",
    };

    const newStatus = statusMap[activeTool];
    const monthNum = monthIdx + 1;

    setData((prev) =>
      prev.map((apt) => {
        if (apt.id !== aptId) return apt;

        return {
          ...apt,
          payments: {
            ...apt.payments,
            [monthNum]: {
              status: newStatus,
              amount: newStatus === "paid" ? apt.quota : 0,
            },
          },
        };
      })
    );
  };

  const handleToolClick = (tool: ToolType) => {
    setActiveTool((prev) => (prev === tool ? null : tool));
  };

  return (
    <>
      {/* Header */}
      <header className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Quotas Mensais</h1>
          <p className="page-description">
            Gestão de pagamentos de quotas do condomínio - 2025
          </p>
        </div>
        <button className="btn btn-primary">Gerar quotas</button>
      </header>

      {/* Stats */}
      <section className="section">
        <div className="flex gap-3">
          <div className="card" style={{ flex: 1 }}>
            <p className="text-muted">Total Cobrado</p>
            <p
              className="mt-2"
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: "var(--font-semibold)",
                color: "var(--gray-900)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {formatCurrencyShort(totalCollected)}
            </p>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <p className="text-muted">Frações</p>
            <p
              className="mt-2"
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: "var(--font-semibold)",
                color: "var(--gray-900)",
              }}
            >
              {data.length}
            </p>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <p className="text-muted">Em Dia</p>
            <p
              className="mt-2"
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: "var(--font-semibold)",
                color: "var(--gray-900)",
              }}
            >
              {paidCount}
            </p>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <p className="text-muted">Em Dívida</p>
            <p
              className="mt-2"
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: "var(--font-semibold)",
                color: "var(--gray-900)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {formatCurrencyShort(totalOverdue)}
            </p>
            {overdueCount > 0 && (
              <p className="text-muted" style={{ fontSize: "var(--text-xs)" }}>
                {overdueCount} frações
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="section">
        <div className="card">
          <div className="flex items-center justify-between gap-4">
            {/* Tools */}
            <div className="flex items-center gap-2">
              <span className="text-muted" style={{ marginRight: "var(--space-2)" }}>
                Ferramentas:
              </span>
              <button
                className={`btn ${activeTool === "markPaid" ? "btn-primary" : ""}`}
                onClick={() => handleToolClick("markPaid")}
              >
                Pago
              </button>
              <button
                className={`btn ${activeTool === "markPending" ? "btn-primary" : ""}`}
                onClick={() => handleToolClick("markPending")}
              >
                Pendente
              </button>
              <button
                className={`btn ${activeTool === "markLate" ? "btn-primary" : ""}`}
                onClick={() => handleToolClick("markLate")}
              >
                Dívida
              </button>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="form-input"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 160 }}
              />
              <select
                className="form-input"
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value as FilterMode)}
              >
                <option value="all">Todos</option>
                <option value="paid">Em dia</option>
                <option value="pending">Pendentes</option>
                <option value="late">Em dívida</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Edit mode indicator */}
      {activeTool && (
        <div
          style={{
            padding: "var(--space-3) var(--space-4)",
            background: "var(--gray-100)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--space-4)",
            textAlign: "center",
          }}
        >
          <span className="text-body">
            Modo de edição ativo: clique nas células para{" "}
            {activeTool === "markPaid"
              ? "marcar como pago"
              : activeTool === "markLate"
              ? "marcar como em dívida"
              : "marcar como pendente"}
          </span>
        </div>
      )}

      {/* Payment Grid */}
      <section className="section">
        {filteredData.length === 0 ? (
          <div className="table-container">
            <div className="empty-state">
              <p className="empty-state-statement">Sem resultados</p>
              <p className="empty-state-reason">
                Nenhum registo corresponde aos filtros selecionados.
              </p>
              <button
                className="btn"
                onClick={() => {
                  setSearchTerm("");
                  setFilterMode("all");
                }}
              >
                Limpar filtros
              </button>
            </div>
          </div>
        ) : (
          <div className="table-container" style={{ overflowX: "auto" }}>
            <table className="table" style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Fração</th>
                  <th style={{ width: 120 }}>Residente</th>
                  {MONTHS.map((month) => (
                    <th key={month} style={{ width: 50, textAlign: "center" }}>
                      {month}
                    </th>
                  ))}
                  <th style={{ width: 70, textAlign: "right" }}>Pago</th>
                  <th style={{ width: 70, textAlign: "right" }}>Dívida</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((apt) => (
                  <tr key={apt.id}>
                    <td style={{ fontWeight: "var(--font-medium)" }}>{apt.unit}</td>
                    <td className="table-cell-muted">
                      {apt.resident || (
                        <span style={{ fontStyle: "italic" }}>Sem residente</span>
                      )}
                    </td>
                    {MONTHS.map((_, monthIdx) => {
                      const monthNum = monthIdx + 1;
                      const payment = apt.payments[monthNum];
                      const status = payment?.status || "pending";

                      return (
                        <td key={monthIdx} style={{ padding: "var(--space-0.5)" }}>
                          <button
                            type="button"
                            disabled={!activeTool}
                            onClick={() => activeTool && handleCellClick(apt.id, monthIdx)}
                            style={{
                              width: "100%",
                              height: 24,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "var(--radius-sm)",
                              border: "none",
                              fontSize: "var(--text-xs)",
                              fontWeight: "var(--font-medium)",
                              cursor: activeTool ? "crosshair" : "default",
                              background:
                                status === "paid"
                                  ? "var(--gray-200)"
                                  : status === "late"
                                  ? "var(--gray-300)"
                                  : "transparent",
                              color:
                                status === "paid"
                                  ? "var(--gray-700)"
                                  : status === "late"
                                  ? "var(--gray-800)"
                                  : "var(--gray-400)",
                            }}
                          >
                            {status === "paid"
                              ? formatCurrency(payment?.amount || apt.quota)
                              : status === "late"
                              ? "DÍVIDA"
                              : "-"}
                          </button>
                        </td>
                      );
                    })}
                    <td
                      className="table-cell-mono"
                      style={{
                        textAlign: "right",
                        fontWeight: "var(--font-medium)",
                        color: "var(--gray-700)",
                      }}
                    >
                      {formatCurrency(apt.totalPaid)}
                    </td>
                    <td
                      className="table-cell-mono"
                      style={{
                        textAlign: "right",
                        fontWeight: "var(--font-medium)",
                        color: apt.balance > 0 ? "var(--gray-800)" : "var(--gray-400)",
                        background: apt.balance > 0 ? "var(--gray-100)" : "transparent",
                      }}
                    >
                      {formatCurrency(apt.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Legend */}
      <div
        className="flex items-center justify-center gap-4"
        style={{
          padding: "var(--space-3)",
          borderTop: "var(--border)",
          marginTop: "var(--space-4)",
        }}
      >
        <span className="flex items-center gap-2 text-muted">
          <span
            style={{
              width: 8,
              height: 8,
              background: "var(--gray-200)",
              borderRadius: 2,
            }}
          />
          Pago
        </span>
        <span className="flex items-center gap-2 text-muted">
          <span
            style={{
              width: 8,
              height: 8,
              background: "var(--gray-100)",
              borderRadius: 2,
            }}
          />
          Pendente
        </span>
        <span className="flex items-center gap-2 text-muted">
          <span
            style={{
              width: 8,
              height: 8,
              background: "var(--gray-300)",
              borderRadius: 2,
            }}
          />
          Em dívida
        </span>
      </div>
    </>
  );
}
