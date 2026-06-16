import { useRef, useState } from "react";
import "./Register.Module.css";
import { useNavigate, Link } from "react-router-dom";

// ── Ajusta a tu config ────────────────────────────────────────────
const REGISTER_ENDPOINT = "http://localhost:8080/gestor-pescaderia/public/api/users";
// ─────────────────────────────────────────────────────────────────

function Register() {
    const navigate = useNavigate();

    const nameRef      = useRef(null);
    const emailRef     = useRef(null);
    const telefonoRef  = useRef(null);
    const passwordRef  = useRef(null);
    const password2Ref = useRef(null);

    const [errors,    setErrors]    = useState({});
    const [apiError,  setApiError]  = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    /* ── Validación ── */
    const validate = () => {
        const e = {};
        if (!nameRef.current.value.trim())
            e.name = "El nombre es obligatorio.";
        if (!emailRef.current.value.trim())
            e.email = "El email es obligatorio.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRef.current.value))
            e.email = "Introduce un email válido.";
        if (!telefonoRef.current.value.trim())
            e.telefono = "El teléfono es obligatorio.";
        if (passwordRef.current.value.length < 6)
            e.password = "La contraseña debe tener al menos 6 caracteres.";
        if (passwordRef.current.value !== password2Ref.current.value)
            e.password2 = "Las contraseñas no coinciden.";
        return e;
    };

    /* ── Submit ── */
    const handleSubmit = async (event) => {
        event.preventDefault();
        setApiError(null);

        const validation = validate();
        if (Object.keys(validation).length) {
            setErrors(validation);
            return;
        }
        setErrors({});
        setIsLoading(true);

        try {
            const res = await fetch(REGISTER_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name:     nameRef.current.value.trim(),
                    email:    emailRef.current.value.trim(),
                    telefono: telefonoRef.current.value.trim(),
                    password: passwordRef.current.value,
                }),
            });

            if (res.ok) {
                navigate("/ signin", { state: { message: "Cuenta creada con éxito. Inicia sesión." } });
            } else {
                const data = await res.json().catch(() => ({}));
                // Laravel devuelve errores de validación en data.errors
                if (data.errors) {
                    const mapped = {};
                    Object.entries(data.errors).forEach(([key, msgs]) => {
                        mapped[key] = msgs[0];
                    });
                    setErrors(mapped);
                } else {
                    setApiError(data.message ?? "Error al registrarse. Inténtalo de nuevo.");
                }
            }
        } catch (err) {
            setApiError(`Error de servidor: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container-log">
            <div className="left-panel-log">
                <Link to="/">
                    <h2>El Artesano</h2>
                </Link>

                <form onSubmit={handleSubmit} noValidate>
                    <h1>Crear cuenta</h1>

                    {/* Nombre */}
                    <input
                        ref={nameRef}
                        type="text"
                        placeholder="Nombre completo"
                        className={errors.name ? "input-error" : ""}
                        autoComplete="name"
                    />
                    {errors.name && <p>{errors.name}</p>}

                    {/* Email */}
                    <input
                        ref={emailRef}
                        type="email"
                        placeholder="Email"
                        className={errors.email ? "input-error" : ""}
                        autoComplete="email"
                    />
                    {errors.email && <p>{errors.email}</p>}

                    {/* Teléfono */}
                    <input
                        ref={telefonoRef}
                        type="tel"
                        placeholder="Teléfono"
                        className={errors.telefono ? "input-error" : ""}
                        autoComplete="tel"
                    />
                    {errors.telefono && <p>{errors.telefono}</p>}

                    {/* Contraseña */}
                    <input
                        ref={passwordRef}
                        type="password"
                        placeholder="Contraseña"
                        className={errors.password ? "input-error" : ""}
                        autoComplete="new-password"
                    />
                    {errors.password && <p>{errors.password}</p>}

                    {/* Repetir contraseña */}
                    <input
                        ref={password2Ref}
                        type="password"
                        placeholder="Repite la contraseña"
                        className={errors.password2 ? "input-error" : ""}
                        autoComplete="new-password"
                    />
                    {errors.password2 && <p>{errors.password2}</p>}

                    <div className="separator">
                        {apiError && <p>{apiError}</p>}
                    </div>

                    <button
                        type="submit"
                        className="big-button primary-button"
                        disabled={isLoading}
                    >
                        {isLoading ? "Registrando…" : "Crear cuenta"}
                    </button>

                    <div>
                        ¿Ya tienes cuenta? <Link to="/signin">Inicia sesión</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;