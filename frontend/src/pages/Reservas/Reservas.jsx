import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Reservas.css";

import { GET_HORAS_ENDPOINT, POST_RESERVA_ENDPOINT } from "../../util/config";

// ─── Cambia "token" por la clave exacta que usas en tu login ─────────
const TOKEN_KEY = "authToken";

// ─── Helpers ─────────────────────────────────────────────────────────
const hoy = () => new Date().toISOString().split("T")[0];

const formatFechaLegible = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  const meses = ["enero","febrero","marzo","abril","mayo","junio",
                  "julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return `${Number(d)} de ${meses[Number(m) - 1]} de ${y}`;
};

// ─── Mesas disponibles ────────────────────────────────────────────────
const MESAS = [
  { id: 1, label: "Mesa 1", capacidad: 2 },
  { id: 2, label: "Mesa 2", capacidad: 4 },
  { id: 3, label: "Mesa 3", capacidad: 6 },
  { id: 4, label: "Mesa 4", capacidad: 8 },
];

// ─── Sub-componentes ──────────────────────────────────────────────────

function StepIndicator({ step }) {
  const pasos = ["Mesa", "Fecha", "Hora", "Confirmar"];
  return (
    <div className="rv-steps">
      {pasos.map((label, i) => {
        const n      = i + 1;
        const active = step === n;
        const done   = step > n;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div className={`rv-step${active ? " rv-step--active" : ""}${done ? " rv-step--done" : ""}`}>
              <div className="rv-step__bubble">{done ? "✓" : n}</div>
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

function MesaSelector({ mesaId, comensales, onMesaChange, onComensalesChange }) {
  return (
    <div className="rv-card">
      <p className="rv-card__label">🪑 Selecciona una mesa</p>
      <div className="rv-mesas-grid">
        {MESAS.map((mesa) => (
          <button
            key={mesa.id}
            onClick={() => onMesaChange(mesa.id)}
            className={`rv-mesa-btn${mesaId === mesa.id ? " rv-mesa-btn--selected" : ""}`}
          >
            <span className="rv-mesa-btn__icon">🪑</span>
            <span className="rv-mesa-btn__label">{mesa.label}</span>
            <span className="rv-mesa-btn__cap">hasta {mesa.capacidad} personas</span>
          </button>
        ))}
      </div>

      <p className="rv-card__label" style={{ marginTop: "1.5rem" }}>
        👥 Número de comensales
      </p>
      <div className="rv-comensales-row">
        <button
          className="rv-counter-btn"
          onClick={() => onComensalesChange(Math.max(1, comensales - 1))}
          disabled={comensales <= 1}
        >−</button>
        <span className="rv-counter-val">{comensales}</span>
        <button
          className="rv-counter-btn"
          onClick={() => {
            const mesa = MESAS.find((m) => m.id === mesaId);
            const max  = mesa ? mesa.capacidad : 8;
            onComensalesChange(Math.min(max, comensales + 1));
          }}
        >+</button>
      </div>
      {mesaId && (
        <p className="rv-comensales-hint">
          Mesa seleccionada: <strong>
            {MESAS.find((m) => m.id === mesaId)?.label}
          </strong> — hasta {MESAS.find((m) => m.id === mesaId)?.capacidad} personas
        </p>
      )}
    </div>
  );
}

function HorasGrid({ horas, horaSeleccionada, onSelect, loading }) {
  if (loading) {
    return (
      <div className="rv-hours-skeleton">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rv-hour-skeleton" style={{ animationDelay: `${i * 0.07}s` }} />
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

function ResumenReserva({ fecha, hora, mesaId, comensales }) {
  const mesa = MESAS.find((m) => m.id === mesaId);
  if (!fecha || !hora) return null;
  return (
    <div className="rv-summary">
      <div className="rv-summary__item">
        <span className="rv-summary__key">Mesa</span>
        <span className="rv-summary__val">{mesa?.label ?? `Mesa ${mesaId}`}</span>
      </div>
      <div className="rv-summary__divider" />
      <div className="rv-summary__item">
        <span className="rv-summary__key">Comensales</span>
        <span className="rv-summary__val">{comensales}</span>
      </div>
      <div className="rv-summary__divider" />
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

function SuccessScreen({ fecha, hora, mesaId, comensales, onNuevaReserva }) {
  const mesa = MESAS.find((m) => m.id === mesaId);
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
          <span>🪑</span>
          <span>Mesa: <strong>{mesa?.label ?? `Mesa ${mesaId}`}</strong></span>
        </div>
        <div className="rv-success__row">
          <span>👥</span>
          <span>Comensales: <strong>{comensales}</strong></span>
        </div>
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
  const navigate = useNavigate();

  const [mesaId, setMesaId]             = useState(null);
  const [comensales, setComensales]     = useState(1);
  const [fecha, setFecha]               = useState("");
  const [horas, setHoras]               = useState([]);
  const [horaSeleccionada, setHora]     = useState(null);
  const [loadingHoras, setLoadingHoras] = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [success, setSuccess]           = useState(false);
  const [toast, setToast]               = useState(null);

  // ── Verificar sesión al montar ──────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate("/signin"); // ← ajusta la ruta a tu página de login
    }
  }, [navigate]);

  // Paso actual del wizard
  const step = !mesaId ? 1 : !fecha ? 2 : !horaSeleccionada ? 3 : 4;

  // ── Fetch horas disponibles ─────────────────────────────────────────
  useEffect(() => {
    if (!fecha || !mesaId) return;

    setHoras([]);
    setHora(null);
    setLoadingHoras(true);

    const fetchHoras = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(
          `${GET_HORAS_ENDPOINT}?fecha=${fecha}&mesa_id=${mesaId}`,
          { headers }
        );

        if (res.status === 401) { navigate("/signin"); return; }
        if (!res.ok) throw new Error(`Error ${res.status}`);

        const data = await res.json();
        setHoras(Array.isArray(data) ? data : data.horas ?? []);
      } catch (err) {
        showToast(`No se pudieron cargar las horas: ${err.message}`);
      } finally {
        setLoadingHoras(false);
      }
    };

    fetchHoras();
  }, [fecha, mesaId, navigate]);

  // ── Submit reserva ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!fecha || !horaSeleccionada || !mesaId) return;

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate("/signin");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(POST_RESERVA_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          fecha,
          hora:      horaSeleccionada,
          mesa_id:   mesaId,
          comensales,
        }),
      });

      if (res.status === 401) { navigate("/signin"); return; }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? err.message ?? `Error ${res.status}`);
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
    setMesaId(null);
    setComensales(1);
    setFecha("");
    setHoras([]);
    setHora(null);
    setSuccess(false);
  };

  // ── Render ────────────────────────────────────────────────────────
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
            mesaId={mesaId}
            comensales={comensales}
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

        <header className="rv-header">
          <p className="rv-header__eyebrow">Pescadería</p>
          <h1 className="rv-header__title">Hacer una reserva</h1>
          <p className="rv-header__sub">Elige mesa, día y hora que más te convenga.</p>
        </header>

        <StepIndicator step={step} />

        <MesaSelector
          mesaId={mesaId}
          comensales={comensales}
          onMesaChange={(id) => {
            setMesaId(id);
            setFecha("");
            setHora(null);
            const cap = MESAS.find((m) => m.id === id)?.capacidad ?? 8;
            if (comensales > cap) setComensales(cap);
          }}
          onComensalesChange={setComensales}
        />

        {mesaId && (
          <div className="rv-card">
            <p className="rv-card__label">📅 Elige una fecha</p>
            <input
              type="date"
              className="rv-date-input"
              value={fecha}
              min={hoy()}
              onChange={(e) => { setFecha(e.target.value); setHora(null); }}
            />
          </div>
        )}

        {mesaId && fecha && (
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

        {mesaId && fecha && horaSeleccionada && (
          <>
            <div className="rv-card" style={{ animation: "scaleIn .3s ease" }}>
              <p className="rv-card__label">✅ Resumen de tu reserva</p>
              <ResumenReserva
                fecha={fecha}
                hora={horaSeleccionada}
                mesaId={mesaId}
                comensales={comensales}
              />
            </div>

            <button
              className="rv-btn-submit"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <><span className="rv-btn-submit__spinner" />Guardando reserva...</>
              ) : (
                "Confirmar reserva"
              )}
            </button>
          </>
        )}
      </div>

      {toast && (
        <div className="rv-toast">
          <span>✕</span>
          {toast}
        </div>
      )}
    </div>
  );
}