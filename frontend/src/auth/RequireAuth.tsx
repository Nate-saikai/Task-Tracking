import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function RequireAuth() {
    const auth = useAuth();
    const location = useLocation();

    if (auth.status === "unknown") return null;

    if (!auth.isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}
