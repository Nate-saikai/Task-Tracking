import { AuthProvider } from "./auth/AuthContext";
import AppRouter from "./router";
import "./index.css"

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
