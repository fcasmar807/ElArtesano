/* ─────────────────────────────────────────────────────────────────
   ReservasTable.jsx — Tabla de gestión de reservas
───────────────────────────────────────────────────────────────── */
import { useState, useEffect } from "react";
import { GET_RESERVAS_ENDPOINT } from "../../util/config";
import { Skeleton, ConfirmModal, Toast, Cell, EstadoReserva, DeleteCell, EmptyState, ErrorState } from "./AdminShared";

const COLS = ["Fecha", "Hora", "Mesa", "Usuario", "Estado", "Acciones"];
const GRID = "130px 90px 80px 1fr 120px 160px";

const API_BASE = "http://localhost:8080/gestor-pescaderia/public/api";

/* ── Botón de acción pequeño ── */
function ActionBtn({ label, title, color, onClick }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: `${color}18`,
        border: `1px solid ${color}66`,
        color,
        borderRadius: 6,
        padding: "4px 8px",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        lineHeight: 1,
      }}
    >
      {label}
    </button>
  );
}

export default function ReservasTable({ onCountChange }) {
  const [reservas,    setReservas]    = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState("");
  const [toDelete,    setToDelete]    = useState(null);
  const [deleting,    setDeleting]    = useState(null);
  const [confirming,  setConfirming]  = useState(null);
  const [canceling,   setCanceling]   = useState(null);
  const [completing,  setCompleting]  = useState(null);
  const [toast,       setToast]       = useState(null);

  /* ── fetch ── */
  const fetchReservas = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res  = await fetch(GET_RESERVAS_ENDPOINT, { headers });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setReservas(data);
      onCountChange?.(data.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservas(); }, []);

  /* ── confirmar ── */
  const handleConfirmar = async (item) => {
    setConfirming(item.id);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/reservas/${item.id}/confirmar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);

      // Actualizar el estado en local sin refetch
      setReservas((prev) =>
        prev.map((r) => r.id === item.id ? { ...r, estado: "confirmada" } : r)
      );
      showToast("Reserva confirmada correctamente", "success");
    } catch (err) {
      showToast(`No se pudo confirmar: ${err.message}`, "error");
    } finally {
      setConfirming(null);
    }
  };

  /* ── cancelar ── */
  const handleCancelar = async (item) => {
    setCanceling(item.id);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/reservas/${item.id}/cancelar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setReservas((prev) =>
        prev.map((r) => r.id === item.id ? { ...r, estado: "cancelada" } : r)
      );
      showToast("Reserva cancelada correctamente", "success");
    } catch (err) {
      showToast(`No se pudo cancelar: ${err.message}`, "error");
    } finally {
      setCanceling(null);
    }
  };

  /* ── completar ── */
  const handleCompletar = async (item) => {
    setCompleting(item.id);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/reservas/${item.id}/completar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setReservas((prev) =>
        prev.map((r) => r.id === item.id ? { ...r, estado: "completada" } : r)
      );
      showToast("Reserva marcada como completada", "success");
    } catch (err) {
      showToast(`No se pudo completar: ${err.message}`, "error");
    } finally {
      setCompleting(null);
    }
  };

  /* ── delete ── */
  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(toDelete.id);
    setToDelete(null);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${GET_RESERVAS_ENDPOINT}/${toDelete.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const updated = reservas.filter((r) => r.id !== toDelete.id);
      setReservas(updated);
      onCountChange?.(updated.length);
      showToast("Reserva eliminada correctamente", "success");
    } catch (err) {
      showToast(`No se pudo eliminar: ${err.message}`, "error");
    } finally {
      setDeleting(null);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  const filtered = reservas.filter((r) =>
    JSON.stringify(r).toLowerCase().includes(search.toLowerCase())
  );

  /* ── render ── */
  return (
    <>
      {/* Search */}
      <div className="ad-search-wrap" style={{ marginBottom: 20 }}>
        <span className="ad-search-icon">🔍</span>
        <input
          className="ad-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar reservas..."
        />
      </div>

      <div className="ad-card">
        {/* Head */}
        <div className="ad-table-head" style={{ gridTemplateColumns: GRID }}>
          {COLS.map((col, i) => (
            <span key={i} className="ad-th">{col}</span>
          ))}
        </div>

        {/* Body */}
        <div className="ad-table-body">
          {loading && <Skeleton />}
          {!loading && error && <ErrorState error={error} onRetry={fetchReservas} />}
          {!loading && !error && filtered.length === 0 && <EmptyState search={search} view="reservas" />}
          {!loading && !error && filtered.map((item, i) => (
            <div
              key={item.id ?? i}
              className="ad-row"
              style={{ gridTemplateColumns: GRID, animation: `rowIn .35s ease ${i * 0.05}s both` }}
            >
              <Cell main={item.fecha} />
              <Cell main={item.hora} muted />
              <Cell main={item.mesa_id ? `Mesa ${item.mesa_id}` : "—"} muted />
              <Cell main={item.user?.name ?? `Usuario #${item.user_id}`} muted />
              <EstadoReserva estado={item.estado} />

              {/* Acciones */}
              <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>

                {/* Confirmar — solo si pendiente */}
                {item.estado === "pendiente" && (
                  confirming === item.id
                    ? <span className="ad-row-spinner" />
                    : <ActionBtn
                        label="✓"
                        title="Confirmar"
                        color="#1cb8a8"
                        onClick={() => handleConfirmar(item)}
                      />
                )}

                {/* Cancelar — si pendiente o confirmada */}
                {(item.estado === "pendiente" || item.estado === "confirmada") && (
                  canceling === item.id
                    ? <span className="ad-row-spinner" />
                    : <ActionBtn
                        label="✕"
                        title="Cancelar"
                        color="#ff6b5b"
                        onClick={() => handleCancelar(item)}
                      />
                )}

                {/* Completar — solo si confirmada */}
                {item.estado === "confirmada" && (
                  completing === item.id
                    ? <span className="ad-row-spinner" />
                    : <ActionBtn
                        label="★"
                        title="Completada"
                        color="#f5c542"
                        onClick={() => handleCompletar(item)}
                      />
                )}

                <DeleteCell item={item} deleting={deleting} onDelete={setToDelete} />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {!loading && !error && filtered.length > 0 && (
          <div className="ad-table-footer">
            <span className="ad-table-footer__count">
              {filtered.length} reservas {search ? "(filtradas)" : "en total"}
            </span>
            {search && (
              <button className="ad-btn-clear" onClick={() => setSearch("")}>
                Limpiar búsqueda ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal + Toast */}
      {toDelete && (
        <ConfirmModal
          item={toDelete}
          type="reserva"
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}