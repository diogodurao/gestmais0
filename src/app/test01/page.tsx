export default function Test01Dashboard() {
  return (
    <>
      <header className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Painel</h1>
          <p className="page-description">Visão geral do condomínio</p>
        </div>
      </header>

      <section className="section">
        <h2 className="section-title mb-4">Resumo</h2>

        <div className="flex gap-4">
          <div className="card" style={{ flex: 1 }}>
            <p className="text-muted">Quotas em atraso</p>
            <p
              className="mt-2"
              style={{
                fontSize: "var(--text-xl)",
                fontWeight: "var(--font-semibold)",
                color: "var(--gray-900)",
              }}
            >
              3
            </p>
          </div>

          <div className="card" style={{ flex: 1 }}>
            <p className="text-muted">Ocorrências abertas</p>
            <p
              className="mt-2"
              style={{
                fontSize: "var(--text-xl)",
                fontWeight: "var(--font-semibold)",
                color: "var(--gray-900)",
              }}
            >
              2
            </p>
          </div>

          <div className="card" style={{ flex: 1 }}>
            <p className="text-muted">Votações ativas</p>
            <p
              className="mt-2"
              style={{
                fontSize: "var(--text-xl)",
                fontWeight: "var(--font-semibold)",
                color: "var(--gray-900)",
              }}
            >
              1
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title mb-4">Pagamentos recentes</h2>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Fração</th>
                <th>Mês</th>
                <th>Valor</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>A1</td>
                <td className="table-cell-muted">Jan 2025</td>
                <td className="table-cell-mono">€85.00</td>
                <td>
                  <span className="badge badge-success">Pago</span>
                </td>
              </tr>
              <tr>
                <td>A2</td>
                <td className="table-cell-muted">Jan 2025</td>
                <td className="table-cell-mono">€85.00</td>
                <td>
                  <span className="badge badge-warning">Pendente</span>
                </td>
              </tr>
              <tr>
                <td>B1</td>
                <td className="table-cell-muted">Jan 2025</td>
                <td className="table-cell-mono">€120.00</td>
                <td>
                  <span className="badge badge-success">Pago</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
