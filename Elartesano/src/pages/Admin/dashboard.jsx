import { useState, useEffect, useCallback } from "react";
import { GET_PLATOS_ENDPOINT } from "../../util/config";
import { GET_USUARIOS_ENDPOINT } from "../../util/config";
import { DELETE_ME_ENDPOINT } from "../../config";
import "./AdminDashboard.css";

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
      : item.nombre ?? item.username ?? item.email ?? "este usuario";

  return (
    <div className="ad-modal-overlay">
      <div className="ad-modal">
        <div className="ad-modal__icon">
          {type === "plato" ? "🐟" : "👤"}
        </div>
        <p className="ad-modal__sup">Confirmar eliminación</p>
        <h3 className="ad-modal__name">{label}</h3>
        <p className="ad-modal__warning">Esta acción no se puede deshacer.</p>
        <div className="ad-modal__actions">
          <button className="ad-btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button className="ad-btn-confirm" onClick={onConfirm}>
            Eliminar
          </button>
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

/* ─── Main Dashboard ────────────────────────────────────────────── */
const PLATOS_COLS   = ["Nombre", "Descripción", "Precio", "Categoría", ""];
const USUARIOS_COLS = ["Nombre", "Email", "Rol", "Estado", ""];

export default function AdminDashboard() {
  const [view, setView]         = useState("platos");
  const [platos, setPlatos]     = useState([]);
  const [usuarios, setUsuarios] = useState([]);
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
      const endpoint = view === "platos" ? GET_PLATOS_ENDPOINT : GET_USUARIOS_ENDPOINT;
      const token = localStorage.getItem("token"); // ajusta la clave si la guardas con otro nombre
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res  = await fetch(endpoint, { headers });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      view === "platos" ? setPlatos(data) : setUsuarios(data);
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
      // El endpoint deleteMe borra al usuario autenticado por su token,
      // no por ID en la URL. Enviamos el token del usuario a eliminar.
      const token = toDelete.token; // campo token que debe venir en la respuesta de GET_USUARIOS_ENDPOINT
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
  const list     = view === "platos" ? platos : usuarios;
  const filtered = list.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
  );

  const columns = view === "platos" ? PLATOS_COLS : USUARIOS_COLS;

  /* ─────────────────────────────── RENDER ─────────────────────── */
  return (
    <div className="ad-root">

      {/* background glow */}
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
            {["platos", "usuarios"].map((tab) => (
              <button
                key={tab}
                onClick={() => setView(tab)}
                className={`ad-tab${view === tab ? " ad-tab--active" : ""}`}
              >
                {tab === "platos" ? "🐟 Platos" : "👤 Usuarios"}
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

          {/* Table head */}
          <div className={`ad-table-head ad-table-head--${view}`}>
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
                className={`ad-row ad-row--${view}`}
                style={{ animation: `rowIn .35s ease ${i * 0.05}s both` }}
              >
                {view === "platos" ? (
                  <>
                    <Cell main={item.nombre ?? item.name} />
                    <Cell main={item.descripcion ?? item.description} muted />
                    <PrecioCell price={item.precio ?? item.price} />
                    <TagCell label={item.categoria ?? item.category} color="sea" />
                  </>
                ) : (
                  <>
                    <Cell main={item.name} />
                    <Cell main={item.email} muted />
                    <TagCell label={item.rol} color="mist" />
                    <StatusCell active={item.estado === "activo"} />
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
          type={view === "platos" ? "plato" : "usuario"}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}