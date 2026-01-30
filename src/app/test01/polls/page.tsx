"use client";

import { useState } from "react";

const polls = [
  {
    id: 1,
    question: "Aprovação do orçamento para pintura das escadas",
    votes: 6,
    totalUnits: 8,
    deadline: "2025-02-01",
    status: "active",
  },
  {
    id: 2,
    question: "Instalação de câmaras de videovigilância",
    votes: 8,
    totalUnits: 8,
    deadline: "2025-01-15",
    status: "closed",
    result: "Aprovado",
  },
  {
    id: 3,
    question: "Mudança de empresa de limpeza",
    votes: 5,
    totalUnits: 8,
    deadline: "2025-01-10",
    status: "closed",
    result: "Rejeitado",
  },
];

export default function PollsPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <header className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Votações</h1>
          <p className="page-description">Decisões coletivas do condomínio</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Nova votação
        </button>
      </header>

      {polls.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p className="empty-state-statement">Nenhuma votação criada</p>
            <p className="empty-state-reason">
              Crie uma votação para tomar decisões coletivas com os condóminos.
            </p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Criar votação
            </button>
          </div>
        </div>
      ) : (
        <section className="section">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Questão</th>
                  <th>Participação</th>
                  <th>Prazo</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {polls.map((poll) => (
                  <tr key={poll.id}>
                    <td>{poll.question}</td>
                    <td className="table-cell-muted">
                      {poll.votes}/{poll.totalUnits} votos
                    </td>
                    <td className="table-cell-muted">{poll.deadline}</td>
                    <td>
                      {poll.status === "active" ? (
                        <span className="badge badge-warning">A decorrer</span>
                      ) : (
                        <span
                          className={`badge ${
                            poll.result === "Aprovado" ? "badge-success" : "badge-error"
                          }`}
                        >
                          {poll.result}
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <button className="btn btn-ghost">
                        {poll.status === "active" ? "Votar" : "Ver"}
                      </button>
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
              <h2 className="modal-title">Nova votação</h2>
            </div>
            <div className="modal-body">
              <div className="flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Questão</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Aprovação do orçamento para..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Prazo para votação</label>
                  <input type="date" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Descrição</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Contexto adicional sobre a votação..."
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary">Criar votação</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
