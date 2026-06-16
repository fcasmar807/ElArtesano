/* ─────────────────────────────────────────────────────────────────
   MisReservas.jsx — Reservas del usuario autenticado
───────────────────────────────────────────────────────────────── */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MisReservas.css";

// ── Ajusta a tu config ────────────────────────────────────────────
import {
  MIS_RESERVAS_ENDPOINT,
  RESERVAS_ENDPOINT,
} from "../../util/config.js";
// ─────────────────────────────────────────────────────────────────

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
});

/* ── Badge de estado ─────────────────────────────────────────────── */
const ESTADO_LABELS = {
  pendiente:  "⏳ Pendiente",
  confirmada: "✅ Confirmada",
  cancelada:  "❌ Cancelada",
};

function EstadoBadge({ estado }) {
  const label = ESTADO_LABELS[estado] ?? ESTADO_LABELS.pendiente;
  return (
    <span className={`mr-badge mr-badge--${estado ?? "pendiente"}`}>
      {label}
    </span>
  );
}

/* ── Componente principal ────────────────────────────────────────── */
export default function MisReservas() {
  const navigate = useNavigate();
  const [reservas,  setReservas]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [canceling, setCanceling] = useState(null);
  const [toast,     setToast]     = useState(null);

  /* ── Auth guard ── */
  useEffect(() => {
    if (!localStorage.getItem("authToken")) navigate("/");
  }, []);

  /* ── Fetch reservas ── */
  const fetchReservas = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(MIS_RESERVAS_ENDPOINT, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setReservas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservas(); }, []);

  /* ── Cancelar reserva ── */
  const handleCancelar = async (reserva) => {
    if (!window.confirm(`¿Cancelar la reserva del ${reserva.fecha} a las ${reserva.hora}?`)) return;

    setCanceling(reserva.id);
    try {
      const res = await fetch(`${RESERVAS_ENDPOINT}/${reserva.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);

      setReservas((prev) => prev.filter((r) => r.id !== reserva.id));
      showToast("Reserva cancelada correctamente", "success");
    } catch (err) {
      showToast(`No se pudo cancelar: ${err.message}`, "error");
    } finally {
      setCanceling(null);
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  /* ── Estados de carga / error / vacío ── */
  const renderBody = () => {
    if (loading) return (
      <div className="mr-center">
        <div className="mr-spinner" />
        <p>Cargando tus reservas…</p>
      </div>
    );

    if (error) return (
      <div className="mr-center">
        <span style={{ fontSize: 40 }}>⚠️</span>
        <p className="mr-error-text">{error}</p>
        <button className="mr-btn-retry" onClick={fetchReservas}>Reintentar</button>
      </div>
    );

    if (reservas.length === 0) return (
      <div className="mr-center">
        <span style={{ fontSize: 48 }}>📅</span>
        <p>No tienes reservas todavía.</p>
      </div>
    );

    return (
      <div className="mr-list">
        {reservas.map((r) => (
          <div key={r.id} className="mr-card">
            {/* Info principal */}
            <div className="mr-card-left">
              <div className="mr-date-block">
                <span className="mr-date-day">{formatDay(r.fecha)}</span>
                <span className="mr-date-month">{formatMonth(r.fecha)}</span>
              </div>
              <div className="mr-card-info">
                <span className="mr-hora">🕐 {r.hora}</span>
                <span className="mr-mesa">🪑 Mesa {r.mesa_id ?? "—"}</span>
              </div>
            </div>

            {/* Estado + botón */}
            <div className="mr-card-right">
              <EstadoBadge estado={r.estado} />
              {r.estado !== "cancelada" && (
                <button
                  className="mr-btn-cancel"
                  disabled={canceling === r.id}
                  onClick={() => handleCancelar(r)}
                >
                  {canceling === r.id ? "Cancelando…" : "Cancelar"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mr-page">
      <div className="mr-wrapper">
        {/* Cabecera */}
        <div className="mr-header">
          <h1 className="mr-title">Mis reservas</h1>
          <p className="mr-subtitle">
            {reservas.length > 0
              ? `${reservas.length} reserva${reservas.length > 1 ? "s" : ""}`
              : "Aquí aparecerán tus reservas"}
          </p>
        </div>

        {renderBody()}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`mr-toast mr-toast--${toast.type}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ── Helpers de fecha ────────────────────────────────────────────── */
function formatDay(fecha) {
  return new Date(fecha).toLocaleDateString("es-ES", { day: "2-digit" });
}
function formatMonth(fecha) {
  return new Date(fecha).toLocaleDateString("es-ES", { month: "short", year: "numeric" });
}