/* ─────────────────────────────────────────────────────────────────
   UsuariosTable.jsx — Tabla de gestión de usuarios
───────────────────────────────────────────────────────────────── */
import { useState, useEffect } from "react";
import { GET_USUARIOS_ENDPOINT } from "../../util/config";
import { Skeleton, ConfirmModal, Toast, Cell, TagCell, DeleteCell, EmptyState, ErrorState } from "./AdminShared";

const COLS = ["Nombre", "Email", "Rol", "Eliminar"];
const GRID = "1fr 1.5fr 120px 64px";

export default function UsuariosTable({ onCountChange }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast]       = useState(null);

  /* ── fetch ── */
  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res  = await fetch(GET_USUARIOS_ENDPOINT, { headers });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setUsuarios(data);
      onCountChange?.(data.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsuarios(); }, []);

  /* ── delete ── */
  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(toDelete.id);
    setToDelete(null);
    try {
      const res = await fetch(`${GET_USUARIOS_ENDPOINT}/${toDelete.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${toDelete.token}`,
        },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const updated = usuarios.filter((u) => u.id !== toDelete.id);
      setUsuarios(updated);
      onCountChange?.(updated.length);
      showToast("Usuario eliminado correctamente", "success");
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

  const filtered = usuarios.filter((u) =>
    JSON.stringify(u).toLowerCase().includes(search.toLowerCase())
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
          placeholder="Buscar usuarios..."
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
          {!loading && error && <ErrorState error={error} onRetry={fetchUsuarios} />}
          {!loading && !error && filtered.length === 0 && <EmptyState search={search} view="usuarios" />}
          {!loading && !error && filtered.map((item, i) => (
            <div
              key={item.id ?? i}
              className="ad-row"
              style={{ gridTemplateColumns: GRID, animation: `rowIn .35s ease ${i * 0.05}s both` }}
            >
              <Cell main={item.name} />
              <Cell main={item.email} muted />
              <TagCell label={item.rol_id === 1 ? "Administrador" : "Usuario"} color="mist" />
              <DeleteCell item={item} deleting={deleting} onDelete={setToDelete} />
            </div>
          ))}
        </div>

        {/* Footer */}
        {!loading && !error && filtered.length > 0 && (
          <div className="ad-table-footer">
            <span className="ad-table-footer__count">
              {filtered.length} usuarios {search ? "(filtrados)" : "en total"}
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
          type="usuario"
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}