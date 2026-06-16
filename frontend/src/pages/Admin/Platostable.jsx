/* ─────────────────────────────────────────────────────────────────
   PlatosTable.jsx — Tabla de gestión de platos
───────────────────────────────────────────────────────────────── */
import { useState, useEffect } from "react";
import { GET_PLATOS_ENDPOINT} from "../../util/config";
import { Skeleton, ConfirmModal, Toast, Cell, PrecioCell, DeleteCell, EmptyState, ErrorState } from "./AdminShared";

const COLS    = ["Nombre", "Descripción", "Precio", "Eliminar"];
const GRID    = "1fr 2fr 100px 64px";

export default function PlatosTable({ onCountChange }) {
  const [platos, setPlatos]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast]       = useState(null);

  /* ── fetch ── */
  const fetchPlatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res  = await fetch(GET_PLATOS_ENDPOINT, { headers });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setPlatos(data);
      onCountChange?.(data.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlatos(); }, []);

  /* ── delete ── */
  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(toDelete.id);
    setToDelete(null);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${GET_PLATOS_ENDPOINT}/${toDelete.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const updated = platos.filter((p) => p.id !== toDelete.id);
      setPlatos(updated);
      onCountChange?.(updated.length);
      showToast("Plato eliminado correctamente", "success");
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

  const filtered = platos.filter((p) =>
    JSON.stringify(p).toLowerCase().includes(search.toLowerCase())
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
          placeholder="Buscar platos..."
        />
      </div>

      <div className="ad-card">
        {/* Head */}
        <div className="ad-table-head" style={{ gridTemplateColumns: GRID }}>
          {COLS.map((col, i) => (
            <span key={i} className={`ad-th${col === "Eliminar" ? " ad-th--center" : ""}`}>
              {col}
            </span>
          ))}
        </div>

        {/* Body */}
        <div className="ad-table-body">
          {loading && <Skeleton />}
          {!loading && error && <ErrorState error={error} onRetry={fetchPlatos} />}
          {!loading && !error && filtered.length === 0 && <EmptyState search={search} view="platos" />}
          {!loading && !error && filtered.map((item, i) => (
            <div
              key={item.id ?? i}
              className="ad-row"
              style={{ gridTemplateColumns: GRID, animation: `rowIn .35s ease ${i * 0.05}s both` }}
            >
              <Cell main={item.nombre ?? item.name} />
              <Cell main={item.descripcion ?? item.description} muted />
              <PrecioCell price={item.precio ?? item.price} />
              <DeleteCell item={item} deleting={deleting} onDelete={setToDelete} />
            </div>
          ))}
        </div>

        {/* Footer */}
        {!loading && !error && filtered.length > 0 && (
          <div className="ad-table-footer">
            <span className="ad-table-footer__count">
              {filtered.length} platos {search ? "(filtrados)" : "en total"}
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
          type="plato"
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}