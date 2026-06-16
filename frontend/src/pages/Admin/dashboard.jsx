/* ─────────────────────────────────────────────────────────────────
   AdminDashboard.jsx — Orquestador principal del panel de admin
───────────────────────────────────────────────────────────────── */
import { useState } from "react";
import PlatosTable   from "./Platostable";
import UsuariosTable from "./Usuariostable";
import ReservasTable from "./Reservastable";
import "./Admindashboard.css";

const TABS = [
  { key: "platos",   label: "🐟 Platos"   },
  { key: "usuarios", label: "👤 Usuarios"  },
  { key: "reservas", label: "📅 Reservas"  },
];

export default function AdminDashboard() {
  const [view, setView] = useState("platos");
  const [counts, setCounts] = useState({ platos: 0, usuarios: 0, reservas: 0 });

  const updateCount = (key) => (n) =>
    setCounts((prev) => ({ ...prev, [key]: n }));

  return (
    <div className="ad-root">
      <div className="ad-bg" />

      <div className="ad-container">

        {/* ── Header ── */}
        <header className="ad-header">
          <div className="ad-header__brand">
            <div className="ad-header__logo">🐠</div>
            <div>
              <h1 className="ad-header__title">Panel de Administración</h1>
              <p className="ad-header__subtitle">Pescadería · Gestión interna</p>
            </div>
          </div>

          <div className="ad-header__stats">
            {[
              { label: "Platos",   count: counts.platos,   icon: "🐟" },
              { label: "Usuarios", count: counts.usuarios, icon: "👥" },
              { label: "Reservas", count: counts.reservas, icon: "📅" },
            ].map((s) => (
              <div key={s.label} className="ad-stat-pill">
                <span className="ad-stat-pill__icon">{s.icon}</span>
                <div>
                  <p className="ad-stat-pill__count">{s.count}</p>
                  <p className="ad-stat-pill__label">{s.label.toUpperCase()}</p>
                </div>
              </div>
            ))}
          </div>
        </header>

        {/* ── Tabs ── */}
        <div className="ad-controls">
          <div className="ad-tabs">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`ad-tab${view === key ? " ad-tab--active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Contenido activo ── */}
        {view === "platos"   && <PlatosTable   onCountChange={updateCount("platos")}   />}
        {view === "usuarios" && <UsuariosTable onCountChange={updateCount("usuarios")} />}
        {view === "reservas" && <ReservasTable onCountChange={updateCount("reservas")} />}

      </div>
    </div>
  );
}