/* ─────────────────────────────────────────────────────────────────
   MisReservas.jsx — Reservas del usuario autenticado
───────────────────────────────────────────────────────────────── */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ── Ajusta a tu config ────────────────────────────────────────────
const MIS_RESERVAS_ENDPOINT = "http://localhost:8080/gestor-pescaderia/public/api/mis-reservas";
const RESERVAS_ENDPOINT     = "http://localhost:8080/gestor-pescaderia/public/api/reservas";
// ─────────────────────────────────────────────────────────────────

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
});

/* ── Badge de estado ─────────────────────────────────────────────── */
const ESTADO_STYLES = {
  pendiente:  { background: "#854d0e", color: "#fef08a", label: "⏳ Pendiente"  },
  confirmada: { background: "#14532d", color: "#86efac", label: "✅ Confirmada" },
  cancelada:  { background: "#3f3f46", color: "#a1a1aa", label: "❌ Cancelada"  },
};

function EstadoBadge({ estado }) {
  const s = ESTADO_STYLES[estado] ?? ESTADO_STYLES.pendiente;
  return (
    <span style={{
      padding: "4px 10px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 700,
      background: s.background,
      color: s.color,
    }}>
      {s.label}
    </span>
  );
}

/* ── Componente principal ────────────────────────────────────────── */
export default function MisReservas() {
  const navigate = useNavigate();
  const [reservas,  setReservas]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [canceling, setCanceling] = useState(null); // id en proceso
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
      <div style={styles.center}>
        <div style={styles.spinner} />
        <p style={{ color: "#94a3b8", marginTop: 14 }}>Cargando tus reservas…</p>
      </div>
    );

    if (error) return (
      <div style={styles.center}>
        <span style={{ fontSize: 40 }}>⚠️</span>
        <p style={{ color: "#f87171", marginTop: 10 }}>{error}</p>
        <button style={styles.retryBtn} onClick={fetchReservas}>Reintentar</button>
      </div>
    );

    if (reservas.length === 0) return (
      <div style={styles.center}>
        <span style={{ fontSize: 48 }}>📅</span>
        <p style={{ color: "#94a3b8", marginTop: 12 }}>No tienes reservas todavía.</p>
      </div>
    );

    return (
      <div style={styles.list}>
        {reservas.map((r) => (
          <div key={r.id} style={styles.card}>
            {/* Info principal */}
            <div style={styles.cardLeft}>
              <div style={styles.dateBlock}>
                <span style={styles.dateDay}>{formatDay(r.fecha)}</span>
                <span style={styles.dateMonth}>{formatMonth(r.fecha)}</span>
              </div>
              <div style={styles.cardInfo}>
                <span style={styles.hora}>🕐 {r.hora}</span>
                <span style={styles.mesa}>🪑 Mesa {r.mesa_id ?? "—"}</span>
              </div>
            </div>

            {/* Estado + botón */}
            <div style={styles.cardRight}>
              <EstadoBadge estado={r.estado} />
              {r.estado !== "cancelada" && (
                <button
                  style={canceling === r.id ? { ...styles.cancelBtn, opacity: 0.6 } : styles.cancelBtn}
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
    <div style={styles.page}>
      <div style={styles.wrapper}>
        {/* Cabecera */}
        <div style={styles.header}>
          <h1 style={styles.title}>📋 Mis reservas</h1>
          <p style={styles.subtitle}>
            {reservas.length > 0
              ? `Tienes ${reservas.length} reserva${reservas.length > 1 ? "s" : ""}`
              : "Aquí aparecerán tus reservas"}
          </p>
        </div>

        {renderBody()}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          ...styles.toast,
          background: toast.type === "success" ? "#16a34a" : "#dc2626",
        }}>
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

/* ── Estilos ─────────────────────────────────────────────────────── */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0f1e",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: "40px 16px",
  },
  wrapper: {
    maxWidth: 680,
    margin: "0 auto",
  },
  header: {
    marginBottom: 28,
  },
  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 700,
    color: "#f1f5f9",
  },
  subtitle: {
    margin: "6px 0 0",
    fontSize: 14,
    color: "#94a3b8",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "60px 0",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  card: {
    background: "#1e293b",
    borderRadius: 12,
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    boxShadow: "0 2px 12px rgba(0,0,0,.3)",
  },
  cardLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  dateBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#0f172a",
    borderRadius: 8,
    padding: "8px 12px",
    minWidth: 54,
  },
  dateDay: {
    fontSize: 22,
    fontWeight: 800,
    color: "#f1f5f9",
    lineHeight: 1,
  },
  dateMonth: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
    textTransform: "capitalize",
  },
  cardInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  hora: {
    fontSize: 15,
    fontWeight: 600,
    color: "#f1f5f9",
  },
  mesa: {
    fontSize: 13,
    color: "#94a3b8",
  },
  cardRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 10,
  },
  cancelBtn: {
    background: "none",
    border: "1.5px solid #dc2626",
    color: "#f87171",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background .2s",
  },
  retryBtn: {
    marginTop: 12,
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 20px",
    fontWeight: 600,
    cursor: "pointer",
  },
  toast: {
    position: "fixed",
    bottom: 28,
    right: 28,
    color: "#fff",
    padding: "14px 20px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    boxShadow: "0 4px 20px rgba(0,0,0,.4)",
    zIndex: 9999,
  },
  spinner: {
    width: 36,
    height: 36,
    border: "4px solid #334155",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};