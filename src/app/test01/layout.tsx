"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Painel", href: "/test01" },
  { name: "Quotas", href: "/test01/payments" },
  { name: "Quotas Extra", href: "/test01/projects" },
  { name: "Ocorrências", href: "/test01/occurrences" },
  { name: "Votações", href: "/test01/polls" },
  { name: "Discussões", href: "/test01/discussions" },
  { name: "Documentos", href: "/test01/documents" },
  { name: "Avaliações", href: "/test01/evaluations" },
  { name: "Definições", href: "/test01/settings" },
];

export default function Test01Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div style={{ marginBottom: "var(--space-6)" }}>
          <span
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: "var(--font-semibold)",
              color: "var(--gray-900)",
            }}
          >
            Test01
          </span>
        </div>

        <nav className="nav">
          {navigation.map((item) => {
            const isActive =
              item.href === "/test01"
                ? pathname === "/test01"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}
