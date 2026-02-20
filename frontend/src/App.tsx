import { AuthProvider } from "./auth/AuthContext";
import AppRouter from "./router";
import "./index.css";

// 1. Import your custom Toaster component
// (Adjust the import path based on where you saved the file)
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  );
}