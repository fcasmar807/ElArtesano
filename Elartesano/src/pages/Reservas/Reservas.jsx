import { useState, useEffect } from "react";
import "./Reservas.css";

// ─── Ajusta estas rutas a tu config ─────────────────────────────────
import { GET_HORAS_ENDPOINT, POST_RESERVA_ENDPOINT } from "../../util/config";

// ─── Helpers ─────────────────────────────────────────────────────────
const hoy = () => new Date().toISOString().split("T")[0];

const formatFechaLegible = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  const meses = ["enero","febrero","marzo","abril","mayo","junio",
                  "julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return `${Number(d)} de ${meses[Number(m) - 1]} de ${y}`;
};

// ─── Sub-componentes ──────────────────────────────────────────────────

function StepIndicator({ step }) {
  const pasos = ["Fecha", "Hora", "Confirmar"];
  return (
    <div className="rv-steps">
      {pasos.map((label, i) => {
        const n      = i + 1;
        const active = step === n;
        const done   = step > n;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div className={`rv-step${active ? " rv-step--active" : ""}${done ? " rv-step--done" : ""}`}>
              <div className="rv-step__bubble">
                {done ? "✓" : n}
              </div>
              <span className="rv-step__label">{label}</span>
            </div>
            {i < pasos.length - 1 && (
              <div className={`rv-step__line${done ? " rv-step__line--done" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function HorasGrid({ horas, horaSeleccionada, onSelect, loading }) {
  if (loading) {
    return (
      <div className="rv-hours-skeleton">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rv-hour-skeleton"
            style={{ animationDelay: `${i * 0.07}s` }}
          />
        ))}
      </div>
    );
  }

  if (!horas || horas.length === 0) {
    return (
      <div className="rv-no-hours">
        <span className="rv-no-hours__icon">🌊</span>
        <span>No hay horas disponibles para este día</span>
      </div>
    );
  }

  return (
    <div className="rv-hours-grid">
      {horas.map((hora) => (
        <button
          key={hora}
          onClick={() => onSelect(hora)}
          className={`rv-hour-btn${horaSeleccionada === hora ? " rv-hour-btn--selected" : ""}`}
        >
          <span>{hora}</span>
        </button>
      ))}
    </div>
  );
}

function ResumenReserva({ fecha, hora }) {
  if (!fecha || !hora) return null;
  return (
    <div className="rv-summary">
      <div className="rv-summary__item">
        <span className="rv-summary__key">Fecha</span>
        <span className="rv-summary__val">{formatFechaLegible(fecha)}</span>
      </div>
      <div className="rv-summary__divider" />
      <div className="rv-summary__item">
        <span className="rv-summary__key">Hora</span>
        <span className="rv-summary__val">{hora}</span>
      </div>
    </div>
  );
}

function SuccessScreen({ fecha, hora, onNuevaReserva }) {
  return (
    <div className="rv-success">
      <span className="rv-success__icon">🐠</span>
      <h2 className="rv-success__title">¡Reserva confirmada!</h2>
      <p className="rv-success__sub">
        Tu reserva ha sido registrada correctamente.<br />
        Te esperamos en la pescadería.
      </p>
      <div className="rv-success__detail">
        <div className="rv-success__row">
          <span>📅</span>
          <span>Fecha: <strong>{formatFechaLegible(fecha)}</strong></span>
        </div>
        <div className="rv-success__row">
          <span>🕐</span>
          <span>Hora: <strong>{hora}</strong></span>
        </div>
      </div>
      <button className="rv-btn-new" onClick={onNuevaReserva}>
        Hacer otra reserva
      </button>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────
export default function Reservas() {
  const [fecha, setFecha]               = useState("");
  const [horas, setHoras]               = useState([]);
  const [horaSeleccionada, setHora]     = useState(null);
  const [loadingHoras, setLoadingHoras] = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [success, setSuccess]           = useState(false);
  const [toast, setToast]               = useState(null);

  // Paso actual del wizard: 1 = fecha, 2 = hora, 3 = confirmar
  const step = !fecha ? 1 : !horaSeleccionada ? 2 : 3;

  // ── Fetch horas disponibles al cambiar fecha ──
  useEffect(() => {
    if (!fecha) return;

    setHoras([]);
    setHora(null);
    setLoadingHoras(true);

    const fetchHoras = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${GET_HORAS_ENDPOINT}?fecha=${fecha}`, { headers });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();

        // Acepta tanto { horas: [...] } como un array directo [...]
        setHoras(Array.isArray(data) ? data : data.horas ?? []);
      } catch (err) {
        showToast(`No se pudieron cargar las horas: ${err.message}`);
      } finally {
        setLoadingHoras(false);
      }
    };

    fetchHoras();
  }, [fecha]);

  // ── Submit reserva ──
  const handleSubmit = async () => {
    if (!fecha || !horaSeleccionada) return;
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(POST_RESERVA_ENDPOINT, {
        method: "POST",
        headers,
        body: JSON.stringify({
          fecha,
          hora: horaSeleccionada,
          // El backend extrae el user_id del token (auth()->id())
          // Si tu backend lo requiere explícito, añade: usuario_id: ...
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `Error ${res.status}`);
      }

      setSuccess(true);
    } catch (err) {
      showToast(`No se pudo guardar la reserva: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const resetForm = () => {
    setFecha("");
    setHoras([]);
    setHora(null);
    setSuccess(false);
  };

  // ─── Render ───────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="rv-root">
        <div className="rv-bg" />
        <div className="rv-container">
          <header className="rv-header">
            <p className="rv-header__eyebrow">Pescadería</p>
            <h1 className="rv-header__title">Reservas</h1>
          </header>
          <SuccessScreen
            fecha={fecha}
            hora={horaSeleccionada}
            onNuevaReserva={resetForm}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rv-root">
      <div className="rv-bg" />

      <div className="rv-container">

        {/* ── Header ── */}
        <header className="rv-header">
          <p className="rv-header__eyebrow">Pescadería</p>
          <h1 className="rv-header__title">Hacer una reserva</h1>
          <p className="rv-header__sub">
            Elige el día y la hora que más te convenga.
          </p>
        </header>

        {/* ── Step indicator ── */}
        <StepIndicator step={step} />

        {/* ── Paso 1: Fecha ── */}
        <div className="rv-card">
          <p className="rv-card__label">📅 Elige una fecha</p>
          <input
            type="date"
            className="rv-date-input"
            value={fecha}
            min={hoy()}
            onChange={(e) => {
              setFecha(e.target.value);
              setHora(null);
            }}
          />
        </div>

        {/* ── Paso 2: Horas disponibles ── */}
        {fecha && (
          <div className="rv-card rv-hours-section">
            <p className="rv-card__label">🕐 Horas disponibles</p>
            <HorasGrid
              horas={horas}
              horaSeleccionada={horaSeleccionada}
              onSelect={setHora}
              loading={loadingHoras}
            />
          </div>
        )}

        {/* ── Paso 3: Resumen + confirmar ── */}
        {fecha && horaSeleccionada && (
          <>
            <div className="rv-card" style={{ animation: "scaleIn .3s ease" }}>
              <p className="rv-card__label">✅ Resumen de tu reserva</p>
              <ResumenReserva fecha={fecha} hora={horaSeleccionada} />
            </div>

            <button
              className="rv-btn-submit"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="rv-btn-submit__spinner" />
                  Guardando reserva...
                </>
              ) : (
                "Confirmar reserva"
              )}
            </button>
          </>
        )}
      </div>

      {/* ── Toast error ── */}
      {toast && (
        <div className="rv-toast">
          <span>✕</span>
          {toast}
        </div>
      )}
    </div>
  );
}