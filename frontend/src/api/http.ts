import axios, { AxiosError } from "axios";
import { toast } from "sonner";

export const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
    withCredentials: true, // ✅ cookie-based auth
    headers: { "Content-Type": "application/json" },
});

// Extract a useful message from Spring errors
function extractApiErrorMessage(err: AxiosError<any>): string {
    const payload = err.response?.data;

    if (typeof payload === "string") return payload;
    if (payload?.message) return payload.message;
    if (payload?.error) return payload.error;

    if (payload && typeof payload === "object") {
        const first = Object.values(payload).find((v) => typeof v === "string");
        if (typeof first === "string") return first;
    }

    return err.message || "Unexpected server error.";
}

http.interceptors.response.use(
    (res) => res,
    (err: AxiosError) => {
        // Skip toast for /auth/me (like your Angular interceptor)
        const url = err.config?.url ?? "";
        if (!url.includes("/auth/me")) {
            const msg = extractApiErrorMessage(err as AxiosError<any>);
            toast.error(msg);
        }
        return Promise.reject(err);
    }
);

