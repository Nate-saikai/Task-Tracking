import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

type Mode = "login" | "register";

export default function LoginPage() {
    const auth = useAuth();
    const nav = useNavigate();
    const location = useLocation();

    const [mode, setMode] = useState<Mode>("login");
    const [error, setError] = useState<string | null>(null);

    // Login fields
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Register fields
    const [fullName, setFullName] = useState("");

    // where user wanted to go before redirecting to /login
    const from = useMemo(() => {
        const state = location.state as any;
        return state?.from?.pathname || auth.homeByRole();
    }, [location.state, auth]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        try {
            if (mode === "login") {
                await auth.login({ username, password });
                nav(from, { replace: true });
                return;
            }

            // register
            await auth.register({
                fullName,
                username,
                password,
                // role not required — backend sets USER in AuthController.register
            });

            nav(auth.homeByRole(), { replace: true });
        } catch (err: any) {
            // If you already have Axios interceptor + toasts, you can remove this.
            setError(err?.message ?? "Request failed");
        }
    }

    return (
        <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
            <h1 style={{ marginBottom: 6 }}>Task Tracking System</h1>
            <p style={{ marginTop: 0, color: "#6b7280" }}>
                {mode === "login" ? "Sign in to continue." : "Create your account."}
            </p>

            {/* Toggle */}
            <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
                <button
                    type="button"
                    onClick={() => setMode("login")}
                    style={{
                        flex: 1,
                        padding: 10,
                        borderRadius: 10,
                        border: "1px solid #e5e7eb",
                        background: mode === "login" ? "#111827" : "white",
                        color: mode === "login" ? "white" : "#111827",
                        cursor: "pointer",
                        fontWeight: 600,
                    }}
                >
                    Login
                </button>

                <button
                    type="button"
                    onClick={() => setMode("register")}
                    style={{
                        flex: 1,
                        padding: 10,
                        borderRadius: 10,
                        border: "1px solid #e5e7eb",
                        background: mode === "register" ? "#111827" : "white",
                        color: mode === "register" ? "white" : "#111827",
                        cursor: "pointer",
                        fontWeight: 600,
                    }}
                >
                    Register
                </button>
            </div>

            {error && (
                <div
                    style={{
                        background: "#fee2e2",
                        color: "#991b1b",
                        padding: 10,
                        borderRadius: 10,
                        marginBottom: 12,
                        border: "1px solid #fecaca",
                    }}
                >
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
                {mode === "register" && (
                    <label style={{ display: "grid", gap: 6 }}>
                        Full Name
                        <input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Juan Dela Cruz"
                            minLength={8}
                            required
                            style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
                        />
                    </label>
                )}

                <label style={{ display: "grid", gap: 6 }}>
                    Username
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="min 8 characters"
                        minLength={8}
                        required
                        style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
                    />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="min 8 characters"
                        minLength={8}
                        required
                        style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
                    />
                </label>

                <button
                    type="submit"
                    style={{
                        marginTop: 6,
                        padding: 12,
                        borderRadius: 10,
                        border: 0,
                        background: "#2563eb",
                        color: "white",
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    {mode === "login" ? "Login" : "Create Account"}
                </button>
            </form>
        </div>
    );
}
