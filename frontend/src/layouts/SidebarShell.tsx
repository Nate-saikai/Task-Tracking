import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./SiderbarLayout.css";

type Props = {
    title: string;
    basePath: "/admin" | "/app";
};

export default function SidebarShell({ title, basePath }: Props) {
    const auth = useAuth();
    const navigate = useNavigate();

    const me = auth.user;

    async function handleLogout() {
        await auth.logout();
        navigate("/login", { replace: true });
    }

    return (
        <div className="shell">
            <aside className="sidebar">
                <div className="brand">{title}</div>

                <nav className="nav">
                    <NavLink to={`${basePath}/tasks`}>Tasks</NavLink>
                    <NavLink to={`${basePath}/settings`}>Settings</NavLink>
                </nav>

                <div className="sidebarFooter">
                    <div className="userCard">
                        <div>
                            Welcome, <strong>{me?.fullName ?? "User"}</strong>
                        </div>
                        <div>Role: {me?.role ?? "-"}</div>
                        <div>Username: {me?.username ?? "-"}</div>
                        <div>ID: {me?.personId ?? "-"}</div>
                    </div>

                    <button className="btn btnLogout" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </aside>

            <main className="content">
                <div className="topbar">
                    <strong>{title}</strong>
                </div>

                <div className="pageCard">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
