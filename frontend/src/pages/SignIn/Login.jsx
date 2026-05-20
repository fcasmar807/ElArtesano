import { useRef, useState } from "react";
import { validation } from "../../util/validationForm";
import "./Login.Module.css";
import { LOGIN_ENDPOINT } from "../../util/config";
import { useNavigate } from "react-router-dom";  
import { useAuth } from "../context_providers/AuthProvider";  // Importa el hook del contexto
import logo from "../../components/img/LOGO.png";
import { Link } from 'react-router-dom';


function Login() {
    const navigate = useNavigate();
    const { login } = useAuth(); 
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const [emailError, setEmailError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [promesaError, setPromesaError] = useState(null);
    const [isLoading, setIsLoading] = useState(null);

    const handleSubmit = (event) => {
        event.preventDefault();

        const emailValue = emailRef.current.value;
/*         if (!validation.isValidEmail(emailValue)) {
            setEmailError("Por favor, introduce un formato de email válido.");
            return;
        } else {
            setEmailError(null);
        } */

        const passwordValue = passwordRef.current.value;
      /*   if (!validation.isValidPassword(passwordValue)) {
            setPasswordError(
                "La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales."
            );
            return;
        } else {
            setPasswordError(null);
        }
 */
        const objetoBackend = {
            email: emailValue,
            password: passwordValue
        };

        fetchingData(LOGIN_ENDPOINT, objetoBackend);
        reseteoForm();
    };

    function reseteoForm() {
        emailRef.current.value = "";
        passwordRef.current.value = "";
    }

    async function fetchingData(url, data) {
        try {
            setIsLoading(true);
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

          
                console.log("respuesta:", response);
            if (response.ok) {
                const datosPromesa = await response.json();
                const token = datosPromesa.token;
                console.log("token recibido", token);
                login(token);
          

                setPromesaError(null);
            } else {
                setPromesaError("Contraseña o email incorrectos");
            }
        } catch (error) {
            console.log(error);
            setPromesaError(`error server ${error}`);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container-log">
            <div className="left-panel-log">
                <Link to={`/`}>
                    <h2>El Artesano</h2>
                </Link>
                <form>
                    <h1>Inicia Sesión</h1>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email"
                        required
                        ref={emailRef}
                    />
                    {emailError && <p>{emailError}</p>}
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Contraseña"
                        required
                        ref={passwordRef}
                    />
                    {passwordError && <p>{passwordError}</p>}
                    <div>
                        <a href="/Register">¿Has olvidado tu contraseña?</a>
                    </div>
                    <button onClick={handleSubmit} disabled={isLoading} className="big-button primary-button">
                        {isLoading ? "Cargando..." : "Entrar"}
                    </button>
                    <div className="separator">
                                            {promesaError && <p>{promesaError}</p>}

                    </div>
                    <div>
                        ¿No tienes cuenta?<Link to={"/Register"}> Regístrate</Link>
                    </div>
                </form>
            </div>
       
        </div>
    );
}

export default Login;