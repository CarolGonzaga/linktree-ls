import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { Navigate, useLocation } from "react-router";
import { configurationError, errorMessage, supabase } from "./supabase";
type AuthState = {
  session: Session | null;
  ready: boolean;
  admin: boolean;
  recovery: boolean;
  error: string;
};
const AuthContext = createContext<AuthState>({
  session: null,
  ready: false,
  admin: false,
  recovery: false,
  error: "",
});
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(!supabase);
  const [recovery, setRecovery] = useState(false);
  const [access, setAccess] = useState({ token: "", admin: false, error: "" });
  useEffect(() => {
    if (!supabase) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      setInitialized(true);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      if (event === "SIGNED_OUT") setRecovery(false);
    });
    return () => subscription.unsubscribe();
  }, []);
  const token = session?.access_token || "";
  useEffect(() => {
    if (!token || !supabase) return;
    let cancelled = false;
    const api = supabase;
    async function check() {
      try {
        const { data: identity, error: identityError } =
          await api.auth.getUser();
        if (identityError || !identity.user)
          throw identityError || new Error("Sessão inválida. Entre novamente.");
        const { data, error } = await api.rpc("ls_is_admin");
        if (error) throw error;
        if (!cancelled) setAccess({ token, admin: data === true, error: "" });
      } catch (error) {
        if (!cancelled)
          setAccess({ token, admin: false, error: errorMessage(error) });
      }
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, [token]);
  return (
    <AuthContext.Provider
      value={{
        session,
        ready: initialized && (!token || access.token === token),
        admin: !!token && access.token === token && access.admin,
        recovery,
        error:
          configurationError ||
          (token && access.token === token ? access.error : ""),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function RequireAdmin({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const location = useLocation();
  if (!auth.ready)
    return (
      <main className="loading" role="status">
        Verificando acesso…
      </main>
    );
  if (!auth.session || auth.recovery)
    return (
      <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
    );
  if (auth.error)
    return (
      <main className="login-page">
        <h1>Acesso indisponível</h1>
        <p role="alert">{auth.error}</p>
        <button onClick={() => window.location.reload()}>
          Tentar novamente
        </button>
        <button
          onClick={() => {
            void supabase?.auth.signOut();
          }}
        >
          Sair
        </button>
      </main>
    );
  if (!auth.admin)
    return (
      <main className="login-page">
        <h1>Acesso restrito</h1>
        <p>
          Esta conta não está autorizada no painel. Solicite a configuração da
          sua autorização.
        </p>
        <button
          onClick={() => {
            void supabase?.auth.signOut();
          }}
        >
          Sair
        </button>
      </main>
    );
  return children;
}
