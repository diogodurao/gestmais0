"use client";

import { useState } from "react";

const occurrences = [
  {
    id: 1,
    title: "Luz da escada avariada",
    reporter: "João Silva",
    unit: "A1",
    date: "2025-01-15",
    status: "open",
  },
  {
    id: 2,
    title: "Infiltração na garagem",
    reporter: "Maria Santos",
    unit: "A2",
    date: "2025-01-12",
    status: "in_progress",
  },
  {
    id: 3,
    title: "Porta do prédio não fecha",
    reporter: "Pedro Costa",
    unit: "A3",
    date: "2025-01-10",
    status: "resolved",
  },
  {
    id: 4,
    title: "Elevador com barulho estranho",
    reporter: "Ana Ferreira",
    unit: "B1",
    date: "2025-01-08",
    status: "resolved",
  },
];

const statusLabels: Record<string, string> = {
  open: "Aberta",
  in_progress: "Em resolução",
  resolved: "Resolvida",
};

const statusBadge: Record<string, string> = {
  open: "badge-error",
  in_progress: "badge-warning",
  resolved: "badge-success",
};

export default function OccurrencesPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <header className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Ocorrências</h1>
          <p className="page-description">Registo de problemas e incidentes</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Nova ocorrência
        </button>
      </header>

      {occurrences.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p className="empty-state-statement">Nenhuma ocorrência registada</p>
            <p className="empty-state-reason">
              Não existem problemas ou incidentes reportados no condomínio.
            </p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Reportar ocorrência
            </button>
          </div>
        </div>
      ) : (
        <section className="section">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ocorrência</th>
                  <th>Reportado por</th>
                  <th>Fração</th>
                  <th>Data</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {occurrences.map((occurrence) => (
                  <tr key={occurrence.id}>
                    <td>{occurrence.title}</td>
                    <td>{occurrence.reporter}</td>
                    <td className="table-cell-muted">{occurrence.unit}</td>
                    <td className="table-cell-muted">{occurrence.date}</td>
                    <td>
                      <span className={`badge ${statusBadge[occurrence.status]}`}>
                        {statusLabels[occurrence.status]}
                      </span>
                    </td>
                    <td className="text-right">
                      <button className="btn btn-ghost">Ver</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nova ocorrência</h2>
            </div>
            <div className="modal-body">
              <div className="flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Título</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Luz avariada no piso 2"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Descrição</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Descreva o problema em detalhe..."
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary">Submeter</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
