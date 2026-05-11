import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../pages/context_providers/AuthProvider";

function AdminRoute() {
    const { user, isAuthenticated, isAuthLoading } = useAuth();

    const isAdmin = user?.rol_id === 1;
    if (isAuthLoading) {
        return null;
    }

    if (!isAuthenticated || !isAdmin) {
        return <Navigate to="/signin" replace />;
    } else {
        return <Outlet />;
    }

    
}

export default AdminRoute;