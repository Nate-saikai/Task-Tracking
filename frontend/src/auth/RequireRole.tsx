import { Navigate, Outlet } from "react-router-dom";
import type { Role } from "../api/types/Role"
import { useAuth, } from "./AuthContext";

export function RequireRole({ roles }: { roles: Role[] }) {
    const auth = useAuth();

    if (auth.status === "unknown") return null;

    if (!auth.isAuthenticated) return <Navigate to="/login" replace />;

    const ok = !roles.length || (!!auth.role && roles.includes(auth.role));
    if (!ok) return <Navigate to="/forbidden" replace />;

    return <Outlet />;
}
