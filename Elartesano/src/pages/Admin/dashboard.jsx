import { useState, useEffect, useCallback } from "react";
import { GET_PLATOS_ENDPOINT } from "../../util/config";
import { GET_USUARIOS_ENDPOINT } from "../../util/config";
import { DELETE_ME_ENDPOINT } from "../../config";

/* ─── Palette & keyframes injected once ─────────────────────────── */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;600&display=swap');

  :root {
    --ink:      #08111f;
    --deep:     #0d1f35;
    --mid:      #122d4a;
    --panel:    #162f50;
    --rim:      #1e3f66;
    --sea:      #1cb8a8;
    --seafoam:  #4ecdc4;
    --coral:    #ff6b5b;
    --sand:     #f5ede0;
    --mist:     #9ab4cc;
    --white:    #eef5fb;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: var(--ink); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0);     }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes rowIn {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
`;

function injectStyles() {
  if (!document.getElementById("pd-admin-styles")) {
    const tag = document.createElement("style");
    tag.id = "pd-admin-styles";
    tag.textContent = GLOBAL_STYLES;
    document.head.appendChild(tag);
  }
}

/* ─── Skeleton loader ───────────────────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          style={{
            height: 58,
            borderRadius: 8,
            background:
              "linear-gradient(90deg, var(--panel) 25%, var(--rim) 50%, var(--panel) 75%)",
            backgroundSize: "800px 100%",
            animation: `shimmer 1.4s infinite linear`,
            animationDelay: `${n * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Confirm-delete modal ──────────────────────────────────────── */
function ConfirmModal({ item, type, onConfirm, onCancel }) {
  const label = type === "plato" ? item.nombre ?? item.name ?? "este plato" : item.nombre ?? item.username ?? item.email ?? "este usuario";
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "rgba(8,17,31,.82)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "fadeUp .2s ease",
      }}
    >
      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--rim)",
          borderRadius: 14,
          padding: "36px 40px",
          maxWidth: 400,
          width: "90%",
          boxShadow: "0 32px 80px rgba(0,0,0,.6)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 42, marginBottom: 16 }}>
          {type === "plato" ? "🐟" : "👤"}
        </div>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: "var(--mist)",
            fontSize: 13,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Confirmar eliminación
        </p>
        <h3
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 26,
            color: "var(--white)",
            letterSpacing: 1,
            marginBottom: 24,
          }}
        >
          {label}
        </h3>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: "var(--mist)",
            fontSize: 14,
            marginBottom: 28,
            lineHeight: 1.6,
          }}
        >
          Esta acción no se puede deshacer.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "12px 0",
              background: "transparent",
              border: "1px solid var(--rim)",
              borderRadius: 8,
              color: "var(--mist)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, fontWeight: 500,
              cursor: "pointer",
              transition: "border-color .2s, color .2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--seafoam)"; e.currentTarget.style.color = "var(--seafoam)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--rim)"; e.currentTarget.style.color = "var(--mist)"; }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "12px 0",
              background: "var(--coral)",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, fontWeight: 600,
              cursor: "pointer",
              transition: "filter .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.15)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
          >
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
    <div
      style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 1000,
        background: type === "success" ? "var(--sea)" : "var(--coral)",
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14, fontWeight: 500,
        padding: "14px 22px",
        borderRadius: 10,
        boxShadow: "0 8px 32px rgba(0,0,0,.4)",
        animation: "fadeUp .3s ease",
        display: "flex", alignItems: "center", gap: 10,
      }}
    >
      <span>{type === "success" ? "✓" : "✕"}</span>
      {message}
    </div>
  );
}

/* ─── Main Dashboard ────────────────────────────────────────────── */
export default function AdminDashboard() {
  injectStyles();

  const [view, setView]         = useState("platos");   // "platos" | "usuarios"
  const [platos, setPlatos]     = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [toDelete, setToDelete] = useState(null);       // item to confirm
  const [toast, setToast]       = useState(null);
  const [search, setSearch]     = useState("");
  const [deleting, setDeleting] = useState(null);       // id being deleted

  /* ── fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = view === "platos" ? GET_PLATOS_ENDPOINT : GET_USUARIOS_ENDPOINT;
      const res  = await fetch(endpoint);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      view === "platos" ? setPlatos(data) : setUsuarios(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => { fetchData(); setSearch(""); }, [fetchData]);

  /* ── delete ── */
  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(toDelete.id);
    setToDelete(null);
    try {
      const res = await fetch(`${DELETE_ME_ENDPOINT}/${toDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      if (view === "platos")   setPlatos((p)   => p.filter((x) => x.id !== toDelete.id));
      if (view === "usuarios") setUsuarios((u) => u.filter((x) => x.id !== toDelete.id));
      showToast(`Eliminado correctamente`, "success");
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
  const list    = view === "platos" ? platos : usuarios;
  const q       = search.toLowerCase();
  const filtered = list.filter((item) => {
    const haystack = JSON.stringify(item).toLowerCase();
    return haystack.includes(q);
  });

  /* ── header cell util ── */
  const platosColumns   = ["ID", "Nombre", "Descripción", "Precio", "Categoría", ""];
  const usuariosColumns = ["ID", "Nombre", "Email", "Rol", "Estado", ""];

  /* ─────────────────────────────── RENDER ──────────────────────── */
  return (
    <div style={{ minHeight: "100vh", background: "var(--ink)", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Subtle wave background ── */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 10% 0%, rgba(28,184,168,.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 90% 100%, rgba(78,205,196,.07) 0%, transparent 60%)
          `,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px" }}>

        {/* ── Top bar ── */}
        <header
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "32px 0 28px",
            borderBottom: "1px solid var(--rim)",
            marginBottom: 36,
            animation: "fadeUp .5s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 46, height: 46,
                background: "linear-gradient(135deg, var(--sea), var(--seafoam))",
                borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
              }}
            >
              🐠
            </div>
            <div>
              <h1
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 30, letterSpacing: 2,
                  color: "var(--white)", lineHeight: 1,
                }}
              >
                Panel de Administración
              </h1>
              <p style={{ fontSize: 12, color: "var(--mist)", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>
                Pescadería · Gestión interna
              </p>
            </div>
          </div>

          {/* stats pills */}
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Platos",   count: platos.length,   icon: "🐟" },
              { label: "Usuarios", count: usuarios.length, icon: "👥" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "var(--panel)",
                  border: "1px solid var(--rim)",
                  borderRadius: 10,
                  padding: "10px 18px",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                <span style={{ fontSize: 16 }}>{s.icon}</span>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 600, color: "var(--white)", lineHeight: 1 }}>{s.count}</p>
                  <p style={{ fontSize: 11, color: "var(--mist)", letterSpacing: 1 }}>{s.label.toUpperCase()}</p>
                </div>
              </div>
            ))}
          </div>
        </header>

        {/* ── Controls row ── */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 16,
            marginBottom: 28,
            animation: "fadeUp .5s ease .1s both",
            flexWrap: "wrap",
          }}
        >
          {/* Toggle tabs */}
          <div
            style={{
              display: "flex",
              background: "var(--deep)",
              border: "1px solid var(--rim)",
              borderRadius: 10,
              padding: 4,
              gap: 4,
            }}
          >
            {["platos", "usuarios"].map((tab) => (
              <button
                key={tab}
                onClick={() => setView(tab)}
                style={{
                  padding: "9px 24px",
                  borderRadius: 7,
                  border: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14, fontWeight: 500,
                  letterSpacing: 0.5,
                  cursor: "pointer",
                  transition: "all .22s ease",
                  background: view === tab
                    ? "linear-gradient(135deg, var(--sea), var(--seafoam))"
                    : "transparent",
                  color: view === tab ? "#fff" : "var(--mist)",
                  boxShadow: view === tab ? "0 4px 14px rgba(28,184,168,.35)" : "none",
                  textTransform: "capitalize",
                }}
              >
                {tab === "platos" ? "🐟 Platos" : "👤 Usuarios"}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span
              style={{
                position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                color: "var(--mist)", fontSize: 14, pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Buscar ${view}...`}
              style={{
                width: "100%",
                background: "var(--panel)",
                border: "1px solid var(--rim)",
                borderRadius: 9,
                padding: "10px 14px 10px 38px",
                color: "var(--white)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                outline: "none",
                transition: "border-color .2s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--sea)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--rim)")}
            />
          </div>

          {/* Refresh */}
          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              padding: "10px 18px",
              background: "transparent",
              border: "1px solid var(--rim)",
              borderRadius: 9,
              color: "var(--mist)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              transition: "border-color .2s, color .2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--seafoam)"; e.currentTarget.style.color = "var(--seafoam)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--rim)";     e.currentTarget.style.color = "var(--mist)"; }}
          >
            <span style={{ display: "inline-block", animation: loading ? "spin 1s linear infinite" : "none" }}>↻</span>
            Actualizar
          </button>
        </div>

        {/* ── Table card ── */}
        <div
          style={{
            background: "var(--deep)",
            border: "1px solid var(--rim)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,.4)",
            animation: "fadeUp .5s ease .18s both",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: view === "platos"
                ? "80px 1fr 2fr 100px 140px 64px"
                : "80px 1fr 1.5fr 120px 120px 64px",
              padding: "14px 24px",
              background: "var(--mid)",
              borderBottom: "1px solid var(--rim)",
            }}
          >
            {(view === "platos" ? platosColumns : usuariosColumns).map((col) => (
              <span
                key={col}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11, fontWeight: 600,
                  color: "var(--mist)",
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  textAlign: col === "" ? "center" : "left",
                }}
              >
                {col}
              </span>
            ))}
          </div>

          {/* Body */}
          <div style={{ minHeight: 220 }}>
            {loading && (
              <div style={{ padding: 24 }}>
                <Skeleton />
              </div>
            )}

            {!loading && error && (
              <div
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  color: "var(--coral)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <p style={{ fontSize: 32, marginBottom: 12 }}>⚠️</p>
                <p style={{ fontSize: 15, fontWeight: 500 }}>Error al cargar datos</p>
                <p style={{ fontSize: 13, color: "var(--mist)", marginTop: 6 }}>{error}</p>
                <button
                  onClick={fetchData}
                  style={{
                    marginTop: 20, padding: "9px 22px",
                    background: "var(--panel)", border: "1px solid var(--coral)",
                    borderRadius: 8, color: "var(--coral)",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Reintentar
                </button>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div
                style={{
                  padding: "64px 24px",
                  textAlign: "center",
                  color: "var(--mist)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <p style={{ fontSize: 40, marginBottom: 14 }}>🌊</p>
                <p style={{ fontSize: 15, fontWeight: 500 }}>
                  {search ? "Sin resultados para tu búsqueda" : `No hay ${view} disponibles`}
                </p>
              </div>
            )}

            {!loading && !error && filtered.map((item, i) => (
              <div
                key={item.id ?? i}
                style={{
                  display: "grid",
                  gridTemplateColumns: view === "platos"
                    ? "80px 1fr 2fr 100px 140px 64px"
                    : "80px 1fr 1.5fr 120px 120px 64px",
                  padding: "16px 24px",
                  borderBottom: "1px solid rgba(30,63,102,.55)",
                  alignItems: "center",
                  animation: `rowIn .35s ease ${i * 0.05}s both`,
                  transition: "background .18s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,184,168,.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {view === "platos" ? (
                  <>
                    <PlatoId id={item.id} />
                    <Cell main={item.nombre ?? item.name} />
                    <Cell main={item.descripcion ?? item.description} muted />
                    <PrecioCell price={item.precio ?? item.price} />
                    <TagCell label={item.categoria ?? item.category} color="sea" />
                  </>
                ) : (
                  <>
                    <PlatoId id={item.id} />
                    <Cell main={item.nombre ?? item.username ?? item.name} />
                    <Cell main={item.email} muted />
                    <TagCell label={item.rol ?? item.role ?? "usuario"} color="mist" />
                    <StatusCell active={item.activo ?? item.active ?? item.estado !== "inactivo"} />
                  </>
                )}

                {/* Delete button */}
                <div style={{ textAlign: "center" }}>
                  {deleting === item.id ? (
                    <span
                      style={{
                        display: "inline-block",
                        width: 18, height: 18,
                        border: "2px solid var(--coral)",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => setToDelete(item)}
                      title="Eliminar"
                      style={{
                        width: 34, height: 34,
                        background: "transparent",
                        border: "1px solid rgba(255,107,91,.35)",
                        borderRadius: 7,
                        color: "var(--coral)",
                        fontSize: 15,
                        cursor: "pointer",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        transition: "background .18s, border-color .18s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,107,91,.15)"; e.currentTarget.style.borderColor = "var(--coral)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,107,91,.35)"; }}
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer count */}
          {!loading && !error && filtered.length > 0 && (
            <div
              style={{
                padding: "12px 24px",
                borderTop: "1px solid var(--rim)",
                background: "var(--mid)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12, color: "var(--mist)",
                  letterSpacing: 0.5,
                }}
              >
                {filtered.length} {view} {search ? "(filtrados)" : "en total"}
              </span>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    background: "none", border: "none",
                    color: "var(--sea)", fontSize: 12,
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  }}
                >
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

/* ─── Small cell components ──────────────────────────────────────── */
function PlatoId({ id }) {
  return (
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12, color: "var(--sea)",
        background: "rgba(28,184,168,.1)",
        padding: "3px 8px", borderRadius: 5,
        display: "inline-block",
      }}
    >
      #{String(id).padStart(4, "0")}
    </span>
  );
}

function Cell({ main, muted }) {
  return (
    <span
      style={{
        fontSize: 14,
        color: muted ? "var(--mist)" : "var(--white)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        paddingRight: 12,
      }}
    >
      {main ?? "—"}
    </span>
  );
}

function PrecioCell({ price }) {
  const formatted = price != null
    ? `${Number(price).toFixed(2)} €`
    : "—";
  return (
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 13, fontWeight: 600,
        color: "var(--seafoam)",
      }}
    >
      {formatted}
    </span>
  );
}

function TagCell({ label, color }) {
  const clr = color === "sea" ? "var(--sea)" : "var(--mist)";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        background: color === "sea" ? "rgba(28,184,168,.12)" : "rgba(154,180,204,.1)",
        border: `1px solid ${color === "sea" ? "rgba(28,184,168,.3)" : "rgba(154,180,204,.2)"}`,
        borderRadius: 20,
        fontSize: 12, color: clr,
        letterSpacing: 0.3,
        textTransform: "capitalize",
      }}
    >
      {label ?? "—"}
    </span>
  );
}

function StatusCell({ active }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 7, height: 7,
          borderRadius: "50%",
          background: active ? "var(--sea)" : "var(--mist)",
          animation: active ? "pulse 2s infinite" : "none",
          display: "inline-block",
        }}
      />
      <span
        style={{
          fontSize: 13,
          color: active ? "var(--seafoam)" : "var(--mist)",
          fontWeight: 500,
        }}
      >
        {active ? "Activo" : "Inactivo"}
      </span>
    </div>
  );
}