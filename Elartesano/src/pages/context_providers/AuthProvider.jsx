import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ME_ENDPOINT } from "../../config";

const AuthContext = createContext();
const AUTH_TOKEN_KEY = "authToken";

export function AuthProvider({ children }) {

    const tokenLS = localStorage.getItem(AUTH_TOKEN_KEY);
    const [token, setToken] = useState(tokenLS || null);
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();

    const clearAuthState = () => {
        setIsAuthenticated(false);
        setToken(null);
        setUser(null);
        localStorage.removeItem(AUTH_TOKEN_KEY);
    };

    const fetchAuthenticatedUser = async (tokenToValidate) => {
        const response = await fetch(ME_ENDPOINT, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokenToValidate}`,
            },
        });
           if (!response.ok) {
            throw new Error("Token invalido o caducado");
        }

        const dataUser = await response.json();
        console.log("respuesta dataUser", dataUser);

     
        return dataUser;
    };

    const refreshUser = async () => {
        const activeToken = localStorage.getItem(AUTH_TOKEN_KEY);

        if (!activeToken) {
            clearAuthState();
            return null;
        }

        try {
            const authenticatedUser = await fetchAuthenticatedUser(activeToken);
            setToken(activeToken);
            setUser(authenticatedUser);
            setIsAuthenticated(true);
            return authenticatedUser;
        } catch {
            clearAuthState();
            return null;
        }
    };

    const login = async (token) => {
      
        setIsLoggingOut(false);
        setIsAuthenticated(true);
        setToken(token);
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        console.log("guardando token en localstorage");
        try {
            const authenticatedUser = await fetchAuthenticatedUser(token);
            setUser(authenticatedUser);
            console.log("guardando la información del usuario", authenticatedUser)
        } catch {
            clearAuthState();
            return;
        }

        navigate("/");
    };

    const logout = () => {
        setIsLoggingOut(true);
        clearAuthState();
        navigate("/", { replace: true });
    };

    useEffect(() => {
        const validateToken = async () => {
            const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);

            if (!storedToken) {
                clearAuthState();
                setIsAuthLoading(false);
                return;
            }

            setIsAuthLoading(true);

            try {
                const authenticatedUser = await fetchAuthenticatedUser(storedToken);
                setToken(storedToken);
                setIsAuthenticated(true);
                setUser(authenticatedUser);
                setIsLoggingOut(false);
            } catch (error) {
                console.error("Sesion invalida o caducada:", error);
                clearAuthState();
            } finally {
                setIsAuthLoading(false);
            }
        };

        validateToken();
        console.log("usuario",user);
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, token, user, isAuthLoading, isLoggingOut, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}



export const useAuth = () => {
    return useContext(AuthContext);
};