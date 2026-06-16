/* ─────────────────────────────────────────────────────────────────
   AdminShared.jsx — Componentes compartidos entre las tres tablas
───────────────────────────────────────────────────────────────── */

/* ─── Skeleton loader ───────────────────────────────────────────── */
export function Skeleton() {
  return (
    <div className="ad-skeleton-wrap">
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className="ad-skeleton-row"
          style={{ animationDelay: `${n * 0.12}s` }}
        />
      ))}
    </div>
  );
}

/* ─── Confirm-delete modal ──────────────────────────────────────── */
export function ConfirmModal({ item, type, onConfirm, onCancel }) {
  const label =
    type === "plato"
      ? item.nombre ?? item.name ?? "este plato"
      : type === "reserva"
      ? `Reserva ${item.fecha} · ${item.hora}`
      : item.nombre ?? item.username ?? item.email ?? "este usuario";

  return (
    <div className="ad-modal-overlay">
      <div className="ad-modal">
        <div className="ad-modal__icon">
          {type === "plato" ? "🐟" : type === "reserva" ? "📅" : "👤"}
        </div>
        <p className="ad-modal__sup">Confirmar eliminación</p>
        <h3 className="ad-modal__name">{label}</h3>
        <p className="ad-modal__warning">Esta acción no se puede deshacer.</p>
        <div className="ad-modal__actions">
          <button className="ad-btn-cancel" onClick={onCancel}>Cancelar</button>
          <button className="ad-btn-confirm" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Toast notification ────────────────────────────────────────── */
export function Toast({ message, type }) {
  return (
    <div className={`ad-toast ad-toast--${type}`}>
      <span>{type === "success" ? "✓" : "✕"}</span>
      {message}
    </div>
  );
}

/* ─── Cell components ───────────────────────────────────────────── */
export function Cell({ main, muted }) {
  return (
    <span className={`ad-cell-text${muted ? " ad-cell-text--muted" : ""}`}>
      {main ?? "—"}
    </span>
  );
}

export function PrecioCell({ price }) {
  const formatted = price != null ? `${Number(price).toFixed(2)} €` : "—";
  return <span className="ad-cell-price">{formatted}</span>;
}

export function TagCell({ label, color }) {
  return (
    <span className={`ad-tag ad-tag--${color}`}>
      {label ?? "—"}
    </span>
  );
}

/* ─── Estado reserva badge ───────────────────────────────────────── */
const ESTADO_COLOR = {
  pendiente:  { bg: "rgba(245,197,66,.12)", border: "rgba(245,197,66,.35)", text: "#f5c542" },
  confirmada: { bg: "rgba(28,184,168,.12)", border: "rgba(28,184,168,.35)", text: "#1cb8a8" },
  cancelada:  { bg: "rgba(255,107,91,.12)", border: "rgba(255,107,91,.35)", text: "#ff6b5b" },
};

export function EstadoReserva({ estado }) {
  const c = ESTADO_COLOR[estado] ?? ESTADO_COLOR.pendiente;
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 500,
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.text,
      textTransform: "capitalize",
    }}>
      {estado ?? "—"}
    </span>
  );
}

/* ─── Fila de acción eliminar ────────────────────────────────────── */
export function DeleteCell({ item, deleting, onDelete }) {
  return (
    <div className="ad-row-delete-cell">
      {deleting === item.id ? (
        <span className="ad-row-spinner" />
      ) : (
        <button
          className="ad-btn-delete"
          onClick={() => onDelete(item)}
          title="Eliminar"
        >
          🗑
        </button>
      )}
    </div>
  );
}

/* ─── Estado vacío / error ───────────────────────────────────────── */
export function EmptyState({ search, view }) {
  return (
    <div className="ad-state ad-state--empty">
      <p className="ad-state__icon">🌊</p>
      <p className="ad-state__title">
        {search ? "Sin resultados para tu búsqueda" : `No hay ${view} disponibles`}
      </p>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="ad-state ad-state--error">
      <p className="ad-state__icon">⚠️</p>
      <p className="ad-state__title">Error al cargar datos</p>
      <p className="ad-state__sub">{error}</p>
      <button className="ad-btn-retry" onClick={onRetry}>Reintentar</button>
    </div>
  );
}