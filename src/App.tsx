import { lazy, Suspense } from "react";
import { Link, Navigate, Route, Routes } from "react-router";
import { AuthProvider, RequireAdmin } from "./lib/auth";
import PublicPage from "./pages/PublicPage";
const LoginPage = lazy(() => import("./pages/LoginPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
export default function App() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <main className="loading" role="status">
            Carregando…
          </main>
        }
      >
        <Routes>
          <Route path="/" element={<PublicPage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminPage />
              </RequireAdmin>
            }
          />
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
          <Route
            path="*"
            element={
              <main className="login-page">
                <h1>Página não encontrada</h1>
                <Link to="/">Voltar ao início</Link>
              </main>
            }
          />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
