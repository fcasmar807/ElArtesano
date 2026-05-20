import { useState, useEffect, useCallback } from "react";
import { GET_PLATOS_ENDPOINT }   from "../../util/config";
import { GET_USUARIOS_ENDPOINT } from "../../util/config";
import { GET_RESERVAS_ENDPOINT } from "../../util/config";
import { DELETE_ME_ENDPOINT }    from "../../util/config";
import "./Admindashboard.css";

/* ─── Skeleton loader ───────────────────────────────────────────── */
function Skeleton() {
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
function ConfirmModal({ item, type, onConfirm, onCancel }) {
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
function Toast({ message, type }) {
  return (
    <div className={`ad-toast ad-toast--${type}`}>
      <span>{type === "success" ? "✓" : "✕"}</span>
      {message}
    </div>
  );
}

/* ─── Cell components ───────────────────────────────────────────── */
function PlatoId({ id }) {
  return (
    <span className="ad-cell-id">
      #{String(id).padStart(4, "0")}
    </span>
  );
}

function Cell({ main, muted }) {
  return (
    <span className={`ad-cell-text${muted ? " ad-cell-text--muted" : ""}`}>
      {main ?? "—"}
    </span>
  );
}

function PrecioCell({ price }) {
  const formatted = price != null ? `${Number(price).toFixed(2)} €` : "—";
  return <span className="ad-cell-price">{formatted}</span>;
}

function TagCell({ label, color }) {
  return (
    <span className={`ad-tag ad-tag--${color}`}>
      {label ?? "—"}
    </span>
  );
}

function StatusCell({ active }) {
  return (
    <div className="ad-status">
      <span className={`ad-status__dot ad-status__dot--${active ? "active" : "inactive"}`} />
      <span className={`ad-status__label ad-status__label--${active ? "active" : "inactive"}`}>
        {active ? "Activo" : "Inactivo"}
      </span>
    </div>
  );
}

/* ─── Estado reserva badge ───────────────────────────────────────── */
const ESTADO_COLOR = {
  pendiente:  { bg: "rgba(245,197,66,.12)",  border: "rgba(245,197,66,.35)",  text: "#f5c542" },
  confirmada: { bg: "rgba(28,184,168,.12)",  border: "rgba(28,184,168,.35)",  text: "#1cb8a8" },
  cancelada:  { bg: "rgba(255,107,91,.12)",  border: "rgba(255,107,91,.35)",  text: "#ff6b5b" },
};

function EstadoReserva({ estado }) {
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

/* ─── Column & grid definitions ─────────────────────────────────── */
const PLATOS_COLS   = ["Nombre", "Descripción", "Precio", "Categoría", ""];
const USUARIOS_COLS = ["Nombre", "Email", "Rol", "Estado", ""];
const RESERVAS_COLS = ["Fecha", "Hora", "Mesa", "Usuario", "Estado", ""];

const GRID = {
  platos:   "1fr 2fr 100px 140px 64px",
  usuarios: "1fr 1.5fr 120px 120px 64px",
  reservas: "130px 90px 80px 1fr 120px 64px",
};

/* ─── Main Dashboard ─────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [view, setView]         = useState("platos");
  const [platos, setPlatos]     = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [toast, setToast]       = useState(null);
  const [search, setSearch]     = useState("");
  const [deleting, setDeleting] = useState(null);

  /* ── fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint =
        view === "platos"   ? GET_PLATOS_ENDPOINT   :
        view === "usuarios" ? GET_USUARIOS_ENDPOINT :
                              GET_RESERVAS_ENDPOINT;

      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res  = await fetch(endpoint, { headers });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();

      if (view === "platos")   setPlatos(data);
      if (view === "usuarios") setUsuarios(data);
      if (view === "reservas") setReservas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    fetchData();
    setSearch("");
  }, [fetchData]);

  /* ── delete ── */
  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(toDelete.id);
    setToDelete(null);
    try {
      const token = toDelete.token;
      const res = await fetch(DELETE_ME_ENDPOINT, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      if (view === "platos")   setPlatos((p)   => p.filter((x) => x.id !== toDelete.id));
      if (view === "usuarios") setUsuarios((u) => u.filter((x) => x.id !== toDelete.id));
      if (view === "reservas") setReservas((r) => r.filter((x) => x.id !== toDelete.id));
      showToast("Eliminado correctamente", "success");
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

  /* ── filtered list ── */
  const list =
    view === "platos"   ? platos   :
    view === "usuarios" ? usuarios :
                          reservas;

  const filtered = list.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
  );

  const columns  = view === "platos" ? PLATOS_COLS : view === "usuarios" ? USUARIOS_COLS : RESERVAS_COLS;
  const gridCols = GRID[view];

  /* ─────────────────────────────── RENDER ─────────────────────── */
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
              { label: "Platos",   count: platos.length,   icon: "🐟" },
              { label: "Usuarios", count: usuarios.length, icon: "👥" },
              { label: "Reservas", count: reservas.length, icon: "📅" },
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

        {/* ── Controls ── */}
        <div className="ad-controls">

          {/* Toggle tabs */}
          <div className="ad-tabs">
            {[
              { key: "platos",   label: "🐟 Platos"  },
              { key: "usuarios", label: "👤 Usuarios" },
              { key: "reservas", label: "📅 Reservas" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`ad-tab${view === key ? " ad-tab--active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="ad-search-wrap">
            <span className="ad-search-icon">🔍</span>
            <input
              className="ad-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Buscar ${view}...`}
            />
          </div>

          {/* Refresh */}
          <button
            className="ad-btn-refresh"
            onClick={fetchData}
            disabled={loading}
          >
            <span className={loading ? "ad-spin" : ""}>↻</span>
            Actualizar
          </button>
        </div>

        {/* ── Table card ── */}
        <div className="ad-card">

          {/* Table head — grid dinámico por vista */}
          <div
            className="ad-table-head"
            style={{ gridTemplateColumns: gridCols }}
          >
            {columns.map((col, i) => (
              <span
                key={i}
                className={`ad-th${col === "" ? " ad-th--center" : ""}`}
              >
                {col}
              </span>
            ))}
          </div>

          {/* Table body */}
          <div className="ad-table-body">

            {loading && <Skeleton />}

            {!loading && error && (
              <div className="ad-state ad-state--error">
                <p className="ad-state__icon">⚠️</p>
                <p className="ad-state__title">Error al cargar datos</p>
                <p className="ad-state__sub">{error}</p>
                <button className="ad-btn-retry" onClick={fetchData}>
                  Reintentar
                </button>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="ad-state ad-state--empty">
                <p className="ad-state__icon">🌊</p>
                <p className="ad-state__title">
                  {search
                    ? "Sin resultados para tu búsqueda"
                    : `No hay ${view} disponibles`}
                </p>
              </div>
            )}

            {!loading && !error && filtered.map((item, i) => (
              <div
                key={item.id ?? i}
                className="ad-row"
                style={{
                  gridTemplateColumns: gridCols,
                  animation: `rowIn .35s ease ${i * 0.05}s both`,
                }}
              >
                {/* ── Platos ── */}
                {view === "platos" && (
                  <>
                    <Cell main={item.nombre ?? item.name} />
                    <Cell main={item.descripcion ?? item.description} muted />
                    <PrecioCell price={item.precio ?? item.price} />
                    <TagCell label={item.categoria ?? item.category} color="sea" />
                  </>
                )}

                {/* ── Usuarios ── */}
                {view === "usuarios" && (
                  <>
                    <Cell main={item.name} />
                    <Cell main={item.email} muted />
                    <TagCell label={item.rol} color="mist" />
                    <StatusCell active={item.estado === "activo"} />
                  </>
                )}

                {/* ── Reservas ── */}
                {view === "reservas" && (
                  <>
                    <Cell main={item.fecha} />
                    <Cell main={item.hora} muted />
                    <Cell main={item.mesa_id ? `Mesa ${item.mesa_id}` : "—"} muted />
                    <Cell main={item.user?.name ?? `Usuario #${item.user_id}`} muted />
                    <EstadoReserva estado={item.estado} />
                  </>
                )}

                {/* Delete */}
                <div className="ad-row-delete-cell">
                  {deleting === item.id ? (
                    <span className="ad-row-spinner" />
                  ) : (
                    <button
                      className="ad-btn-delete"
                      onClick={() => setToDelete(item)}
                      title="Eliminar"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {!loading && !error && filtered.length > 0 && (
            <div className="ad-table-footer">
              <span className="ad-table-footer__count">
                {filtered.length} {view} {search ? "(filtrados)" : "en total"}
              </span>
              {search && (
                <button className="ad-btn-clear" onClick={() => setSearch("")}>
                  Limpiar búsqueda ✕
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals & notifications ── */}
      {toDelete && (
        <ConfirmModal
          item={toDelete}
          type={view === "platos" ? "plato" : view === "reservas" ? "reserva" : "usuario"}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}