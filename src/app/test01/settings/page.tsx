"use client";

import { useState } from "react";

type Tab = "profile" | "building" | "apartments" | "notifications";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <>
      <header className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Definições</h1>
          <p className="page-description">Configurações da conta e do condomínio</p>
        </div>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Perfil
        </button>
        <button
          className={`tab ${activeTab === "building" ? "active" : ""}`}
          onClick={() => setActiveTab("building")}
        >
          Edifício
        </button>
        <button
          className={`tab ${activeTab === "apartments" ? "active" : ""}`}
          onClick={() => setActiveTab("apartments")}
        >
          Frações
        </button>
        <button
          className={`tab ${activeTab === "notifications" ? "active" : ""}`}
          onClick={() => setActiveTab("notifications")}
        >
          Notificações
        </button>
      </div>

      {activeTab === "profile" && <ProfileTab />}
      {activeTab === "building" && <BuildingTab />}
      {activeTab === "apartments" && <ApartmentsTab />}
      {activeTab === "notifications" && <NotificationsTab />}
    </>
  );
}

function ProfileTab() {
  return (
    <section className="section">
      <div style={{ maxWidth: 480 }}>
        <div className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Nome</label>
            <input type="text" className="form-input" defaultValue="João Silva" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              defaultValue="joao.silva@email.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Telefone</label>
            <input type="tel" className="form-input" defaultValue="+351 912 345 678" />
          </div>
          <div className="mt-2">
            <button className="btn btn-primary">Guardar alterações</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function BuildingTab() {
  return (
    <section className="section">
      <div style={{ maxWidth: 480 }}>
        <div className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Nome do edifício</label>
            <input
              type="text"
              className="form-input"
              defaultValue="Edifício Residencial Aurora"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Morada</label>
            <input
              type="text"
              className="form-input"
              defaultValue="Rua das Flores, 123"
            />
          </div>
          <div className="flex gap-3">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Código postal</label>
              <input type="text" className="form-input" defaultValue="1000-001" />
            </div>
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Cidade</label>
              <input type="text" className="form-input" defaultValue="Lisboa" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">NIF do condomínio</label>
            <input type="text" className="form-input" defaultValue="501234567" />
          </div>
          <div className="mt-2">
            <button className="btn btn-primary">Guardar alterações</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ApartmentsTab() {
  const apartments = [
    { id: 1, unit: "A1", floor: "R/C", permilage: 100, owner: "João Silva" },
    { id: 2, unit: "A2", floor: "R/C", permilage: 100, owner: "Maria Santos" },
    { id: 3, unit: "A3", floor: "R/C", permilage: 100, owner: "Pedro Costa" },
    { id: 4, unit: "B1", floor: "1º", permilage: 150, owner: "Ana Ferreira" },
    { id: 5, unit: "B2", floor: "1º", permilage: 150, owner: "Carlos Oliveira" },
    { id: 6, unit: "B3", floor: "1º", permilage: 150, owner: "Rita Pereira" },
    { id: 7, unit: "C1", floor: "2º", permilage: 125, owner: "Miguel Rodrigues" },
    { id: 8, unit: "C2", floor: "2º", permilage: 125, owner: "Sofia Martins" },
  ];

  return (
    <section className="section">
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Fração</th>
              <th>Piso</th>
              <th>Permilagem</th>
              <th>Proprietário</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {apartments.map((apt) => (
              <tr key={apt.id}>
                <td>{apt.unit}</td>
                <td className="table-cell-muted">{apt.floor}</td>
                <td className="table-cell-mono">{apt.permilage}‰</td>
                <td>{apt.owner}</td>
                <td className="text-right">
                  <button className="btn btn-ghost">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function NotificationsTab() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState(true);
  const [newDiscussions, setNewDiscussions] = useState(false);
  const [pollReminders, setPollReminders] = useState(true);

  return (
    <section className="section">
      <div style={{ maxWidth: 480 }}>
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-3" style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
            />
            <div>
              <p className="text-body" style={{ color: "var(--gray-700)" }}>
                Notificações por email
              </p>
              <p className="text-muted">Receber notificações importantes por email</p>
            </div>
          </label>

          <label className="flex items-center gap-3" style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={paymentReminders}
              onChange={(e) => setPaymentReminders(e.target.checked)}
            />
            <div>
              <p className="text-body" style={{ color: "var(--gray-700)" }}>
                Lembretes de pagamento
              </p>
              <p className="text-muted">Receber lembretes sobre quotas pendentes</p>
            </div>
          </label>

          <label className="flex items-center gap-3" style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={newDiscussions}
              onChange={(e) => setNewDiscussions(e.target.checked)}
            />
            <div>
              <p className="text-body" style={{ color: "var(--gray-700)" }}>
                Novas discussões
              </p>
              <p className="text-muted">Notificar quando há novas discussões</p>
            </div>
          </label>

          <label className="flex items-center gap-3" style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={pollReminders}
              onChange={(e) => setPollReminders(e.target.checked)}
            />
            <div>
              <p className="text-body" style={{ color: "var(--gray-700)" }}>
                Lembretes de votação
              </p>
              <p className="text-muted">Receber lembretes sobre votações ativas</p>
            </div>
          </label>

          <div className="mt-2">
            <button className="btn btn-primary">Guardar preferências</button>
          </div>
        </div>
      </div>
    </section>
  );
}
