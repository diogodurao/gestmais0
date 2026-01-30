"use client";

import { useState } from "react";

const evaluations = [
  { month: "Janeiro 2025", rating: 4, responses: 6, totalUnits: 8 },
  { month: "Dezembro 2024", rating: 3.5, responses: 7, totalUnits: 8 },
  { month: "Novembro 2024", rating: 4.2, responses: 5, totalUnits: 8 },
  { month: "Outubro 2024", rating: 3.8, responses: 8, totalUnits: 8 },
  { month: "Setembro 2024", rating: 4, responses: 6, totalUnits: 8 },
];

export default function EvaluationsPage() {
  const [selectedRating, setSelectedRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedRating > 0) {
      setSubmitted(true);
    }
  };

  return (
    <>
      <header className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Avaliações</h1>
          <p className="page-description">Avaliação mensal da gestão do condomínio</p>
        </div>
      </header>

      <section className="section">
        <h2 className="section-title mb-4">Avaliar este mês</h2>

        <div className="card">
          {submitted ? (
            <div style={{ padding: "var(--space-4)", textAlign: "center" }}>
              <p className="text-body">Obrigado pela sua avaliação.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-body">
                Como avalia a gestão do condomínio este mês?
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    className="btn"
                    style={{
                      width: 40,
                      height: 40,
                      padding: 0,
                      background:
                        selectedRating >= rating ? "var(--gray-200)" : "var(--white)",
                    }}
                    onClick={() => setSelectedRating(rating)}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <div>
                <button
                  className="btn btn-primary"
                  disabled={selectedRating === 0}
                  onClick={handleSubmit}
                >
                  Submeter avaliação
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title mb-4">Histórico</h2>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Mês</th>
                <th>Média</th>
                <th>Participação</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((evaluation, index) => (
                <tr key={index}>
                  <td>{evaluation.month}</td>
                  <td>
                    <span className="table-cell-mono">{evaluation.rating.toFixed(1)}</span>
                    <span className="text-muted"> / 5</span>
                  </td>
                  <td className="table-cell-muted">
                    {evaluation.responses}/{evaluation.totalUnits} respostas
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
