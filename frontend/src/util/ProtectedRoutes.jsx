import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../pages/context_providers/AuthProvider";

const ProtectedRoutes = () => {
      const { isAuthenticated, isAuthLoading, isLoggingOut, user } = useAuth();
  const isClient = Number(user?.rol_id) === 2;

  if (isAuthLoading || isLoggingOut) {
    return null;
  }

  return isAuthenticated && isClient ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoutes;