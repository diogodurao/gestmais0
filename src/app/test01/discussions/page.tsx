"use client";

import { useState } from "react";

const discussions = [
  {
    id: 1,
    title: "Horário do portão da garagem",
    author: "João Silva",
    unit: "A1",
    date: "2025-01-20",
    replies: 5,
  },
  {
    id: 2,
    title: "Propostas para assembleia anual",
    author: "Maria Santos",
    unit: "A2",
    date: "2025-01-18",
    replies: 12,
  },
  {
    id: 3,
    title: "Limpeza das áreas comuns",
    author: "Pedro Costa",
    unit: "A3",
    date: "2025-01-15",
    replies: 3,
  },
  {
    id: 4,
    title: "Ruído noturno - regras do condomínio",
    author: "Ana Ferreira",
    unit: "B1",
    date: "2025-01-12",
    replies: 8,
  },
];

export default function DiscussionsPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <header className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Discussões</h1>
          <p className="page-description">Fórum de comunicação entre condóminos</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Nova discussão
        </button>
      </header>

      {discussions.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p className="empty-state-statement">Nenhuma discussão iniciada</p>
            <p className="empty-state-reason">
              Inicie uma discussão para comunicar com os outros condóminos.
            </p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Iniciar discussão
            </button>
          </div>
        </div>
      ) : (
        <section className="section">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Tópico</th>
                  <th>Autor</th>
                  <th>Fração</th>
                  <th>Data</th>
                  <th>Respostas</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {discussions.map((discussion) => (
                  <tr key={discussion.id}>
                    <td>{discussion.title}</td>
                    <td>{discussion.author}</td>
                    <td className="table-cell-muted">{discussion.unit}</td>
                    <td className="table-cell-muted">{discussion.date}</td>
                    <td className="table-cell-muted">{discussion.replies}</td>
                    <td className="text-right">
                      <button className="btn btn-ghost">Abrir</button>
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
              <h2 className="modal-title">Nova discussão</h2>
            </div>
            <div className="modal-body">
              <div className="flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Título</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Proposta para assembleia"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mensagem</label>
                  <textarea
                    className="form-input"
                    rows={5}
                    placeholder="Escreva a sua mensagem..."
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary">Publicar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
