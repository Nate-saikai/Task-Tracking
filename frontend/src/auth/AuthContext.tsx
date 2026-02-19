import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/api";
import type { CreatePersonDto, LoginPersonDto, PersonDto } from "../api/types/Person";

export type Role = "ADMIN" | "USER";
export type AuthStatus = "unknown" | "authenticated" | "unauthenticated";

type AuthContextValue = {
    status: AuthStatus;
    user: PersonDto | null;
    isAuthenticated: boolean;
    role?: Role;

    setUser: (user: PersonDto) => void;
    ensureSession: () => Promise<boolean>;
    login: (body: LoginPersonDto) => Promise<PersonDto>;
    register: (body: CreatePersonDto) => Promise<PersonDto>;
    logout: () => Promise<void>;

    homeByRole: (role?: Role) => string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<AuthStatus>("unknown");
    const [user, setUser] = useState<PersonDto | null>(null);

    // Prevent multiple /me calls simultaneously (like _restoreInFlight$)
    const restoreInFlight = useRef<Promise<boolean> | null>(null);

    const isAuthenticated = status === "authenticated" && !!user;
    const role = (user?.role as Role | undefined) ?? undefined;

    function setUnauthenticated() {
        setUser(null);
        setStatus("unauthenticated");
    }

    function setAuthenticated(u: PersonDto) {
        setUser(u);
        setStatus("authenticated");
    }

    async function ensureSession(): Promise<boolean> {
        if (status !== "unknown") return isAuthenticated;

        if (restoreInFlight.current) return restoreInFlight.current;

        const p = api.auth
            .me()
            .then((me) => {
                setAuthenticated(me);
                return true;
            })
            .catch(() => {
                setUnauthenticated();
                return false;
            })
            .finally(() => {
                restoreInFlight.current = null;
            });

        restoreInFlight.current = p;
        return p;
    }

    function homeByRole(r: Role | undefined = role) {
        return r === "ADMIN" ? "/admin" : "/app";
    }

    async function login(body: LoginPersonDto) {
        const me = await api.auth.login(body);
        setAuthenticated(me);
        return me;
    }

    async function register(body: CreatePersonDto) {
        const me = await api.auth.register(body);
        setAuthenticated(me);
        return me;
    }

    async function logout() {
        try {
            await api.auth.logout();
        } finally {
            setUnauthenticated();
        }
    }

    // Optional: restore session at app start
    useEffect(() => {
        ensureSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            status,
            user,
            isAuthenticated,
            role,
            ensureSession,
            login,
            register,
            logout,
            homeByRole,
            setUser: (u) => setAuthenticated(u),
        }),
        [status, user, isAuthenticated, role]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}
