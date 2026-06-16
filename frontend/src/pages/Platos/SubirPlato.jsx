/* ─────────────────────────────────────────────────────────────────
   SubirPlato.jsx — Página de creación de platos (solo admin)
   Verifica rol admin via /api/me antes de renderizar el formulario.
───────────────────────────────────────────────────────────────── */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ME_ENDPOINT, POST_PLATO_ENDPOINT, ADMIN_ROL_ID } from "../../util/config";
// ── Ajusta estas constantes a tu config ──────────────────────────
// ─────────────────────────────────────────────────────────────────

/* ── Helpers ────────────────────────────────────────────────────── */
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
});

/* ── Componente principal ────────────────────────────────────────── */
export default function SubirPlato() {
  const navigate = useNavigate();

  // Auth state
  const [authStatus, setAuthStatus] = useState("loading"); // loading | ok | denied

  // Form state
  const [nombre,      setNombre]      = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio,      setPrecio]      = useState("");
  const [estado,      setEstado]      = useState("activo");
  const [imagen,      setImagen]      = useState(null);
  const [preview,     setPreview]     = useState(null);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [toast,      setToast]      = useState(null); // { msg, type }
  const [errors,     setErrors]     = useState({});

  const fileRef = useRef();

  /* ── Verificar admin ──────────────────────────────────────────── */
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) { navigate("/"); return; }

    fetch(ME_ENDPOINT, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((user) => {
        // Acepta rol_id o role_id según tu BD
        const rol = user.rol_id ?? user.role_id;
        if (rol === ADMIN_ROL_ID) {
          setAuthStatus("ok");
        } else {
          setAuthStatus("denied");
          setTimeout(() => navigate("/"), 2500);
        }
      })
      .catch(() => {
        setAuthStatus("denied");
        setTimeout(() => navigate("/"), 2500);
      });
  }, []);

  /* ── Preview imagen ───────────────────────────────────────────── */
  const handleImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const quitarImagen = () => {
    setImagen(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  /* ── Validación ───────────────────────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!nombre.trim())          e.nombre      = "El nombre es obligatorio.";
    if (!precio || isNaN(precio) || Number(precio) <= 0)
                                  e.precio      = "Introduce un precio válido.";
    if (imagen && imagen.size > 2 * 1024 * 1024)
                                  e.imagen      = "La imagen no puede superar 2 MB.";
    return e;
  };

  /* ── Submit ───────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length) { setErrors(validation); return; }
    setErrors({});
    setSubmitting(true);

    const formData = new FormData();
    formData.append("nombre",      nombre.trim());
    formData.append("descripcion", descripcion.trim());
    formData.append("precio",      precio);
    formData.append("estado",      estado);
    if (imagen) formData.append("imagen", imagen);

    try {
      const res = await fetch(POST_PLATO_ENDPOINT, {
        method:  "POST",
        headers: authHeaders(), // ⚠️ sin Content-Type, FormData lo pone solo
        body:    formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? `Error ${res.status}`);
      }

      showToast("¡Plato creado correctamente!", "success");
      // Reset
      setNombre(""); setDescripcion(""); setPrecio(""); setEstado("activo");
      quitarImagen();
    } catch (err) {
      showToast(`No se pudo crear el plato: ${err.message}`, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Loading / denegado ───────────────────────────────────────── */
  if (authStatus === "loading") {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
        <p style={{ color: "#94a3b8", marginTop: 16 }}>Verificando acceso…</p>
      </div>
    );
  }

  if (authStatus === "denied") {
    return (
      <div style={styles.center}>
        <span style={{ fontSize: 48 }}>🚫</span>
        <h2 style={{ color: "#f87171", marginTop: 12 }}>Acceso denegado</h2>
        <p style={{ color: "#94a3b8" }}>Redirigiendo al inicio…</p>
      </div>
    );
  }

  /* ── Formulario ───────────────────────────────────────────────── */
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Cabecera */}
        <div style={styles.header}>
          <span style={styles.headerIcon}>🍽️</span>
          <div>
            <h1 style={styles.title}>Añadir plato</h1>
            <p style={styles.subtitle}>Rellena los datos del nuevo plato del menú</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Nombre */}
          <Field label="Nombre *" error={errors.nombre}>
            <input
              style={inputStyle(errors.nombre)}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Lubina a la sal"
              maxLength={100}
            />
          </Field>

          {/* Descripción */}
          <Field label="Descripción">
            <textarea
              style={{ ...inputStyle(), resize: "vertical", minHeight: 80 }}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ingredientes principales, forma de preparación…"
              maxLength={500}
            />
          </Field>

          {/* Precio + Estado en fila */}
          <div style={styles.row}>
            <Field label="Precio (€) *" error={errors.precio} style={{ flex: 1 }}>
              <input
                style={inputStyle(errors.precio)}
                type="number"
                min="0"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="0.00"
              />
            </Field>

            <Field label="Estado" style={{ flex: 1 }}>
              <select
                style={inputStyle()}
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </Field>
          </div>

          {/* Imagen */}
          <Field label="Imagen" error={errors.imagen}>
            {preview ? (
              <div style={styles.previewWrap}>
                <img src={preview} alt="preview" style={styles.previewImg} />
                <button type="button" style={styles.removeBtn} onClick={quitarImagen}>
                  ✕ Quitar imagen
                </button>
              </div>
            ) : (
              <label style={styles.dropzone}>
                <span style={{ fontSize: 32 }}>📷</span>
                <span style={{ color: "#94a3b8", fontSize: 14, marginTop: 6 }}>
                  Haz clic para seleccionar una imagen
                </span>
                <span style={{ color: "#64748b", fontSize: 12 }}>
                  JPG, PNG, WebP — máx. 2 MB
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImagen}
                />
              </label>
            )}
          </Field>

          {/* Botón */}
          <button
            type="submit"
            style={submitting ? { ...styles.btn, opacity: 0.6 } : styles.btn}
            disabled={submitting}
          >
            {submitting ? "Guardando…" : "Crear plato"}
          </button>
        </form>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ ...styles.toast, background: toast.type === "success" ? "#16a34a" : "#dc2626" }}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ── Field wrapper ───────────────────────────────────────────────── */
function Field({ label, error, children, style }) {
  return (
    <div style={{ marginBottom: 18, ...style }}>
      <label style={styles.label}>{label}</label>
      {children}
      {error && <span style={styles.error}>{error}</span>}
    </div>
  );
}

/* ── Input style helper ──────────────────────────────────────────── */
const inputStyle = (error) => ({
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: `1.5px solid ${error ? "#f87171" : "#334155"}`,
  background: "#0f172a",
  color: "#f1f5f9",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color .2s",
});

/* ── Styles ──────────────────────────────────────────────────────── */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0f1e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  center: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#0a0f1e",
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    background: "#1e293b",
    borderRadius: 16,
    padding: "36px 40px",
    width: "100%",
    maxWidth: 560,
    boxShadow: "0 8px 40px rgba(0,0,0,.45)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 28,
  },
  headerIcon: { fontSize: 40 },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: "#f1f5f9",
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#94a3b8",
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#cbd5e1",
    marginBottom: 6,
  },
  error: {
    display: "block",
    fontSize: 12,
    color: "#f87171",
    marginTop: 4,
  },
  row: {
    display: "flex",
    gap: 16,
  },
  dropzone: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: "24px 16px",
    border: "2px dashed #334155",
    borderRadius: 10,
    cursor: "pointer",
    transition: "border-color .2s",
  },
  previewWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 10,
  },
  previewImg: {
    width: "100%",
    maxHeight: 200,
    objectFit: "cover",
    borderRadius: 8,
    border: "1.5px solid #334155",
  },
  removeBtn: {
    background: "none",
    border: "1.5px solid #475569",
    color: "#94a3b8",
    borderRadius: 6,
    padding: "6px 12px",
    fontSize: 13,
    cursor: "pointer",
  },
  btn: {
    width: "100%",
    padding: "12px",
    marginTop: 8,
    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    transition: "opacity .2s",
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
    animation: "fadeIn .3s ease",
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