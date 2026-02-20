import { AuthProvider } from "./auth/AuthContext";
import AppRouter from "./router";
import "./index.css"
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster
        position="top-right"
        richColors
        closeButton
      />
    </AuthProvider>
  );
}
