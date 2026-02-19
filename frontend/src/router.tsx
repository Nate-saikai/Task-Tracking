import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth } from "./auth/RequireAuth";
import { RequireRole } from "./auth/RequireRole";

import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

import AdminTasksPage from "./pages/admin/AdminTasksPage";
import UserTasksPage from "./pages/user/UserTasksPage";
import SettingsPage from "./pages/shared/SettingsPage";

import LoginPage from "./pages/public/LoginPage";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/login" element={<LoginPage />} />

                {/* User area */}
                <Route element={<RequireAuth />}>
                    <Route path="/app" element={<UserLayout />}>
                        <Route index element={<Navigate to="tasks" replace />} />
                        <Route path="tasks" element={<UserTasksPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>
                </Route>

                {/* Admin area */}
                <Route element={<RequireRole roles={["ADMIN"]} />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="tasks" replace />} />
                        <Route path="tasks" element={<AdminTasksPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>
                </Route>

                {/* Default */}
                <Route path="/" element={<Navigate to="/app" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
