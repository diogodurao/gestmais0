"use client";

import { useState } from "react";

const documents = [
  {
    id: 1,
    name: "Regulamento do condomínio",
    type: "PDF",
    size: "245 KB",
    uploadedBy: "Administração",
    date: "2025-01-05",
  },
  {
    id: 2,
    name: "Ata da assembleia - Dezembro 2024",
    type: "PDF",
    size: "128 KB",
    uploadedBy: "Administração",
    date: "2024-12-20",
  },
  {
    id: 3,
    name: "Orçamento 2025",
    type: "PDF",
    size: "312 KB",
    uploadedBy: "Administração",
    date: "2024-12-15",
  },
  {
    id: 4,
    name: "Contrato de manutenção do elevador",
    type: "PDF",
    size: "456 KB",
    uploadedBy: "Administração",
    date: "2024-11-10",
  },
  {
    id: 5,
    name: "Apólice de seguro",
    type: "PDF",
    size: "892 KB",
    uploadedBy: "Administração",
    date: "2024-10-01",
  },
];

export default function DocumentsPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <header className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Documentos</h1>
          <p className="page-description">Ficheiros partilhados do condomínio</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Carregar documento
        </button>
      </header>

      {documents.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p className="empty-state-statement">Nenhum documento disponível</p>
            <p className="empty-state-reason">
              Carregue documentos para partilhar com os condóminos.
            </p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Carregar documento
            </button>
          </div>
        </div>
      ) : (
        <section className="section">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Tamanho</th>
                  <th>Carregado por</th>
                  <th>Data</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.name}</td>
                    <td className="table-cell-muted">{doc.type}</td>
                    <td className="table-cell-muted">{doc.size}</td>
                    <td className="table-cell-muted">{doc.uploadedBy}</td>
                    <td className="table-cell-muted">{doc.date}</td>
                    <td className="text-right">
                      <button className="btn btn-ghost">Descarregar</button>
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
              <h2 className="modal-title">Carregar documento</h2>
            </div>
            <div className="modal-body">
              <div className="flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Ficheiro</label>
                  <input type="file" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Nome (opcional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nome personalizado para o documento"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary">Carregar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
