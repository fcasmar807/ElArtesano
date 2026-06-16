/* ─────────────────────────────────────────────────────────────────
   SubirPlato.jsx — Página de creación de platos (solo admin)
   Verifica rol admin via /api/me antes de renderizar el formulario.
───────────────────────────────────────────────────────────────── */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ME_ENDPOINT, POST_PLATO_ENDPOINT, ADMIN_ROL_ID } from "../../util/config";
import "./SubirPlato.css";

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
    if (!nombre.trim())                              e.nombre = "El nombre es obligatorio.";
    if (!precio || isNaN(precio) || Number(precio) <= 0) e.precio = "Introduce un precio válido.";
    if (imagen && imagen.size > 2 * 1024 * 1024)    e.imagen = "La imagen no puede superar 2 MB.";
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
      <div className="sp-center">
        <div className="sp-spinner" />
        <p>Verificando acceso…</p>
      </div>
    );
  }

  if (authStatus === "denied") {
    return (
      <div className="sp-center">
        <span style={{ fontSize: 48 }}>🚫</span>
        <h2>Acceso denegado</h2>
        <p>Redirigiendo al inicio…</p>
      </div>
    );
  }

  /* ── Formulario ───────────────────────────────────────────────── */
  return (
    <div className="sp-page">
      <div className="sp-card">
        {/* Cabecera */}
        <div className="sp-header">
          <span className="sp-header-icon">🍽️</span>
          <div>
            <h1 className="sp-title">Añadir plato</h1>
            <p className="sp-subtitle">Rellena los datos del nuevo plato del menú</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Nombre */}
          <Field label="Nombre *" error={errors.nombre}>
            <input
              className={`sp-input${errors.nombre ? " sp-input--error" : ""}`}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Lubina a la sal"
              maxLength={100}
            />
          </Field>

          {/* Descripción */}
          <Field label="Descripción">
            <textarea
              className="sp-textarea"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ingredientes principales, forma de preparación…"
              maxLength={500}
            />
          </Field>

          {/* Precio + Estado en fila */}
          <div className="sp-row">
            <Field label="Precio (€) *" error={errors.precio}>
              <input
                className={`sp-input${errors.precio ? " sp-input--error" : ""}`}
                type="number"
                min="0"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="0.00"
              />
            </Field>

            <Field label="Estado">
              <select
                className="sp-select"
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
              <div className="sp-preview-wrap">
                <img src={preview} alt="preview" className="sp-preview-img" />
                <button type="button" className="sp-btn-remove" onClick={quitarImagen}>
                  ✕ Quitar imagen
                </button>
              </div>
            ) : (
              <label className="sp-dropzone">
                <span className="sp-dropzone-icon">📷</span>
                <span className="sp-dropzone-text">Haz clic para seleccionar una imagen</span>
                <span className="sp-dropzone-hint">JPG, PNG, WebP — máx. 2 MB</span>
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
            className="sp-btn-submit"
            disabled={submitting}
          >
            {submitting ? "Guardando…" : "Crear plato"}
          </button>
        </form>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`sp-toast sp-toast--${toast.type}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ── Field wrapper ───────────────────────────────────────────────── */
function Field({ label, error, children }) {
  return (
    <div className="sp-field">
      <label className="sp-label">{label}</label>
      {children}
      {error && <span className="sp-error-msg">{error}</span>}
    </div>
  );
}