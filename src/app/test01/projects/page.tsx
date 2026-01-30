"use client";

import { useState } from "react";

/**
 * Extraordinary Projects - List Page
 *
 * Structure mirrors real app:
 * - Stats: Total Projects, Total Budget, Collected, Active
 * - Project list with: name, budget, installments, start date
 * - Links to detail page with payment grid
 */

interface Project {
  id: number;
  name: string;
  description: string | null;
  totalBudget: number; // cents
  numInstallments: number;
  startMonth: number;
  startYear: number;
  status: "active" | "completed" | "archived";
  totalCollected: number; // cents
}

const projects: Project[] = [
  {
    id: 1,
    name: "Reparação do elevador",
    description: "Substituição do motor e modernização do sistema de controlo",
    totalBudget: 500000, // €5000
    numInstallments: 6,
    startMonth: 1,
    startYear: 2025,
    status: "active",
    totalCollected: 320000,
  },
  {
    id: 2,
    name: "Pintura das escadas",
    description: "Pintura completa das áreas comuns",
    totalBudget: 120000, // €1200
    numInstallments: 3,
    startMonth: 10,
    startYear: 2024,
    status: "completed",
    totalCollected: 120000,
  },
  {
    id: 3,
    name: "Instalação de painéis solares",
    description: "Sistema fotovoltaico para áreas comuns",
    totalBudget: 1500000, // €15000
    numInstallments: 12,
    startMonth: 3,
    startYear: 2025,
    status: "active",
    totalCollected: 250000,
  },
];

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatCurrency(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

function formatCurrencyShort(cents: number): string {
  return `€${(cents / 100).toFixed(0)}`;
}

function getMonthName(month: number, short = false): string {
  const name = MONTHS[month - 1] || "";
  return short ? name.slice(0, 3) : name;
}

export default function ProjectsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Stats
  const totalBudget = projects.reduce((sum, p) => sum + p.totalBudget, 0);
  const totalCollected = projects.reduce((sum, p) => sum + p.totalCollected, 0);
  const activeCount = projects.filter((p) => p.status === "active").length;

  if (selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  return (
    <>
      {/* Header */}
      <header className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Quotas Extraordinárias</h1>
          <p className="page-description">Gestão de projetos e obras especiais</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          Novo Projeto
        </button>
      </header>

      {/* Stats */}
      <section className="section">
        <div className="flex gap-3">
          <div className="card" style={{ flex: 1 }}>
            <p className="text-muted">Total Projetos</p>
            <p
              className="mt-2"
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: "var(--font-semibold)",
                color: "var(--gray-900)",
              }}
            >
              {projects.length}
            </p>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <p className="text-muted">Orçamento Total</p>
            <p
              className="mt-2"
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: "var(--font-semibold)",
                color: "var(--gray-900)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {formatCurrencyShort(totalBudget)}
            </p>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <p className="text-muted">Cobrado</p>
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
            <p className="text-muted" style={{ fontSize: "var(--text-xs)" }}>
              {Math.round((totalCollected / totalBudget) * 100)}%
            </p>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <p className="text-muted">Em Curso</p>
            <p
              className="mt-2"
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: "var(--font-semibold)",
                color: "var(--gray-900)",
              }}
            >
              {activeCount}
            </p>
          </div>
        </div>
      </section>

      {/* Projects List */}
      <section className="section">
        <h2 className="section-title mb-4">Projetos Ativos</h2>

        {projects.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <p className="empty-state-statement">Sem projetos extraordinários</p>
              <p className="empty-state-reason">
                Crie o primeiro projeto para começar a gerir quotas extraordinárias
                para obras ou fundos de reserva.
              </p>
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                Criar Projeto
              </button>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Projeto</th>
                  <th>Orçamento</th>
                  <th>Prestações</th>
                  <th>Início</th>
                  <th>Progresso</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const progress = Math.round(
                    (project.totalCollected / project.totalBudget) * 100
                  );
                  return (
                    <tr key={project.id}>
                      <td>
                        <span style={{ fontWeight: "var(--font-medium)" }}>
                          {project.name}
                        </span>
                      </td>
                      <td className="table-cell-mono">
                        {formatCurrency(project.totalBudget)}
                      </td>
                      <td className="table-cell-muted">
                        {project.numInstallments} prestações
                      </td>
                      <td className="table-cell-muted">
                        {getMonthName(project.startMonth, true)}/{project.startYear}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div
                            style={{
                              width: 60,
                              height: 4,
                              background: "var(--gray-200)",
                              borderRadius: 2,
                            }}
                          >
                            <div
                              style={{
                                width: `${progress}%`,
                                height: "100%",
                                background: "var(--gray-500)",
                                borderRadius: 2,
                              }}
                            />
                          </div>
                          <span className="text-muted">{progress}%</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            project.status === "completed" ? "badge-success" : ""
                          }`}
                        >
                          {project.status === "active"
                            ? "Em curso"
                            : project.status === "completed"
                            ? "Concluído"
                            : "Arquivado"}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          className="btn btn-ghost"
                          onClick={() => setSelectedProject(project)}
                        >
                          Ver detalhes
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Novo projeto</h2>
            </div>
            <div className="modal-body">
              <div className="flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Nome do projeto</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Reparação do telhado"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Orçamento total (€)</label>
                    <input type="number" className="form-input" placeholder="0.00" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Nº de prestações</label>
                    <input type="number" className="form-input" placeholder="6" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Mês de início</label>
                    <select className="form-input">
                      {MONTHS.map((month, idx) => (
                        <option key={idx} value={idx + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Ano</label>
                    <input
                      type="number"
                      className="form-input"
                      defaultValue={2025}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Descrição</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Descreva o projeto..."
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowCreate(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary">Criar projeto</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Project Detail View
 * Shows payment grid by apartment and installment
 */
interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
}

interface ApartmentPayment {
  apartmentId: number;
  unit: string;
  resident: string | null;
  permillage: number;
  installments: Record<number, { status: "paid" | "pending" | "late"; amount: number }>;
  totalPaid: number;
  totalDue: number;
}

function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  // Sample payment data for the project
  const apartments: ApartmentPayment[] = [
    {
      apartmentId: 1,
      unit: "A1",
      resident: "João Silva",
      permillage: 100,
      installments: {
        1: { status: "paid", amount: 6250 },
        2: { status: "paid", amount: 6250 },
        3: { status: "paid", amount: 6250 },
        4: { status: "pending", amount: 0 },
        5: { status: "pending", amount: 0 },
        6: { status: "pending", amount: 0 },
      },
      totalPaid: 18750,
      totalDue: 37500,
    },
    {
      apartmentId: 2,
      unit: "A2",
      resident: "Maria Santos",
      permillage: 100,
      installments: {
        1: { status: "paid", amount: 6250 },
        2: { status: "late", amount: 0 },
        3: { status: "late", amount: 0 },
        4: { status: "pending", amount: 0 },
        5: { status: "pending", amount: 0 },
        6: { status: "pending", amount: 0 },
      },
      totalPaid: 6250,
      totalDue: 37500,
    },
    {
      apartmentId: 3,
      unit: "A3",
      resident: "Pedro Costa",
      permillage: 100,
      installments: {
        1: { status: "paid", amount: 6250 },
        2: { status: "paid", amount: 6250 },
        3: { status: "paid", amount: 6250 },
        4: { status: "pending", amount: 0 },
        5: { status: "pending", amount: 0 },
        6: { status: "pending", amount: 0 },
      },
      totalPaid: 18750,
      totalDue: 37500,
    },
    {
      apartmentId: 4,
      unit: "B1",
      resident: "Ana Ferreira",
      permillage: 150,
      installments: {
        1: { status: "paid", amount: 9375 },
        2: { status: "paid", amount: 9375 },
        3: { status: "paid", amount: 9375 },
        4: { status: "pending", amount: 0 },
        5: { status: "pending", amount: 0 },
        6: { status: "pending", amount: 0 },
      },
      totalPaid: 28125,
      totalDue: 56250,
    },
    {
      apartmentId: 5,
      unit: "B2",
      resident: null,
      permillage: 150,
      installments: {
        1: { status: "pending", amount: 0 },
        2: { status: "pending", amount: 0 },
        3: { status: "pending", amount: 0 },
        4: { status: "pending", amount: 0 },
        5: { status: "pending", amount: 0 },
        6: { status: "pending", amount: 0 },
      },
      totalPaid: 0,
      totalDue: 56250,
    },
    {
      apartmentId: 6,
      unit: "B3",
      resident: "Rita Pereira",
      permillage: 150,
      installments: {
        1: { status: "paid", amount: 9375 },
        2: { status: "paid", amount: 9375 },
        3: { status: "late", amount: 0 },
        4: { status: "pending", amount: 0 },
        5: { status: "pending", amount: 0 },
        6: { status: "pending", amount: 0 },
      },
      totalPaid: 18750,
      totalDue: 56250,
    },
    {
      apartmentId: 7,
      unit: "C1",
      resident: "Miguel Rodrigues",
      permillage: 125,
      installments: {
        1: { status: "paid", amount: 7813 },
        2: { status: "paid", amount: 7813 },
        3: { status: "paid", amount: 7813 },
        4: { status: "pending", amount: 0 },
        5: { status: "pending", amount: 0 },
        6: { status: "pending", amount: 0 },
      },
      totalPaid: 23439,
      totalDue: 46875,
    },
    {
      apartmentId: 8,
      unit: "C2",
      resident: "Sofia Martins",
      permillage: 125,
      installments: {
        1: { status: "late", amount: 0 },
        2: { status: "late", amount: 0 },
        3: { status: "late", amount: 0 },
        4: { status: "pending", amount: 0 },
        5: { status: "pending", amount: 0 },
        6: { status: "pending", amount: 0 },
      },
      totalPaid: 0,
      totalDue: 46875,
    },
  ];

  const totalPaid = apartments.reduce((sum, a) => sum + a.totalPaid, 0);
  const progress = Math.round((totalPaid / project.totalBudget) * 100);

  // Generate installment headers
  const installmentHeaders = Array.from({ length: project.numInstallments }, (_, i) => {
    const installmentNum = i + 1;
    const month = ((project.startMonth - 1 + i) % 12) + 1;
    const yearOffset = Math.floor((project.startMonth - 1 + i) / 12);
    const year = project.startYear + yearOffset;
    return {
      num: installmentNum,
      label: `${getMonthName(month, true)}/${year.toString().slice(-2)}`,
    };
  });

  return (
    <>
      {/* Header */}
      <header className="page-header">
        <div className="page-header-content">
          <button
            className="btn btn-ghost"
            onClick={onBack}
            style={{ marginBottom: "var(--space-2)" }}
          >
            ← Voltar
          </button>
          <h1 className="page-title">{project.name}</h1>
          <p className="page-description">{project.description}</p>
        </div>
        <button className="btn btn-primary">Editar projeto</button>
      </header>

      {/* Stats */}
      <section className="section">
        <div className="flex gap-3">
          <div className="card" style={{ flex: 1 }}>
            <p className="text-muted">Orçamento</p>
            <p
              className="mt-2"
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: "var(--font-semibold)",
                color: "var(--gray-900)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {formatCurrency(project.totalBudget)}
            </p>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <p className="text-muted">Cobrado</p>
            <p
              className="mt-2"
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: "var(--font-semibold)",
                color: "var(--gray-900)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <p className="text-muted">Progresso</p>
            <p
              className="mt-2"
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: "var(--font-semibold)",
                color: "var(--gray-900)",
              }}
            >
              {progress}%
            </p>
            <div
              style={{
                width: "100%",
                height: 4,
                background: "var(--gray-200)",
                borderRadius: 2,
                marginTop: "var(--space-2)",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "var(--gray-500)",
                  borderRadius: 2,
                }}
              />
            </div>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <p className="text-muted">Prestações</p>
            <p
              className="mt-2"
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: "var(--font-semibold)",
                color: "var(--gray-900)",
              }}
            >
              {project.numInstallments}
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
              {apartments.length}
            </p>
          </div>
        </div>
      </section>

      {/* Payment Grid */}
      <section className="section">
        <h2 className="section-title mb-4">Mapa de Pagamentos</h2>

        <div className="table-container" style={{ overflowX: "auto" }}>
          <table className="table" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ width: 60 }}>Fração</th>
                <th style={{ width: 120 }}>Residente</th>
                <th style={{ width: 60, textAlign: "right" }}>‰</th>
                {installmentHeaders.map((h) => (
                  <th key={h.num} style={{ width: 70, textAlign: "center" }}>
                    {h.label}
                  </th>
                ))}
                <th style={{ width: 80, textAlign: "right" }}>Pago</th>
                <th style={{ width: 80, textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {apartments.map((apt) => (
                <tr key={apt.apartmentId}>
                  <td style={{ fontWeight: "var(--font-medium)" }}>{apt.unit}</td>
                  <td className="table-cell-muted">
                    {apt.resident || (
                      <span style={{ fontStyle: "italic" }}>Sem residente</span>
                    )}
                  </td>
                  <td className="table-cell-mono text-right">{apt.permillage}</td>
                  {installmentHeaders.map((h) => {
                    const installment = apt.installments[h.num];
                    const status = installment?.status || "pending";

                    return (
                      <td key={h.num} style={{ padding: "var(--space-0.5)" }}>
                        <div
                          style={{
                            width: "100%",
                            height: 24,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "var(--text-xs)",
                            fontWeight: "var(--font-medium)",
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
                            ? formatCurrency(installment.amount)
                            : status === "late"
                            ? "DÍVIDA"
                            : "-"}
                        </div>
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
                      color: "var(--gray-500)",
                    }}
                  >
                    {formatCurrency(apt.totalDue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
