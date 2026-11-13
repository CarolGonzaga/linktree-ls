import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../lib/auth";
import { client, configurationError, errorMessage } from "../lib/supabase";
export default function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [recovery, setRecovery] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (auth.ready && auth.admin && !auth.recovery)
      navigate("/admin", { replace: true });
  }, [auth.ready, auth.admin, auth.recovery, navigate]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const email = String(values.get("email") || "").trim();
    const password = String(values.get("password") || "");
    setBusy(true);
    setFailed(false);
    setMessage("");
    try {
      const api = client();
      if (auth.recovery) {
        if (password !== values.get("confirmation"))
          throw new Error("As senhas precisam ser iguais.");
        const { error } = await api.auth.updateUser({ password });
        if (error) throw error;
        const { error: logoutError } = await api.auth.signOut();
        if (logoutError) throw logoutError;
        setRecovery(false);
        setMessage("Senha atualizada. Entre com sua nova senha.");
        form.reset();
      } else if (recovery) {
        const { error } = await api.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/admin/login`,
        });
        if (error) throw error;
        setMessage(
          "Se houver uma conta para este email, você receberá um link de recuperação.",
        );
      } else {
        const { data, error } = await api.auth.signInWithPassword({
          email,
          password,
        });
        if (error || !data.user)
          throw new Error(
            "Não foi possível entrar. Confira email e senha e tente novamente.",
          );
        const { data: admin, error: accessError } =
          await api.rpc("ls_is_admin");
        if (accessError) {
          await api.auth.signOut();
          throw accessError;
        }
        if (admin !== true) {
          await api.auth.signOut();
          throw new Error("Esta conta não está autorizada no painel.");
        }
        navigate("/admin", { replace: true });
      }
    } catch (error) {
      setFailed(true);
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-page">
      <Link className="back-link" to="/">
        ← Voltar aos nossos links
      </Link>
      <div className="login-card">
        <img
          src="/logo.png"
          className="avatar"
          alt="Lendo Sáficos"
          width="88"
          height="88"
        />
        <p className="eyebrow">ÁREA ADMINISTRATIVA</p>
        <h1>
          {auth.recovery
            ? "Renove seu acesso"
            : recovery
              ? "Um novo começo"
              : "Que bom ter você aqui"}
        </h1>
        <p>
          {auth.recovery
            ? "Escolha sua nova senha."
            : recovery
              ? "Recupere o acesso à sua conta."
              : "Entre para cuidar dos nossos próximos encontros."}
        </p>
        {configurationError && (
          <div className="notice" role="alert">
            {configurationError}
          </div>
        )}
        <form onSubmit={submit} aria-busy={busy}>
          <fieldset disabled={busy || !!configurationError}>
            {!auth.recovery && (
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                />
              </label>
            )}
            {(!recovery || auth.recovery) && (
              <label>
                {auth.recovery ? "Nova senha" : "Senha"}
                <input
                  name="password"
                  type="password"
                  minLength={auth.recovery ? 12 : undefined}
                  autoComplete={
                    auth.recovery ? "new-password" : "current-password"
                  }
                  required
                />
              </label>
            )}
            {auth.recovery && (
              <label>
                Confirmar nova senha
                <input
                  name="confirmation"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={12}
                />
              </label>
            )}
            <button className="primary" type="submit">
              {busy
                ? "Aguarde…"
                : auth.recovery
                  ? "Salvar nova senha"
                  : recovery
                    ? "Solicitar recuperação"
                    : "Entrar"}
            </button>
          </fieldset>
        </form>
        {message && (
          <p role={failed ? "alert" : "status"} className="notice">
            {message}
          </p>
        )}
        {auth.error && !configurationError && (
          <p className="notice" role="alert">
            {auth.error}
          </p>
        )}
        {auth.session && !auth.admin && !auth.recovery && auth.ready && (
          <div className="notice">
            <p>Esta conta não está autorizada no painel.</p>
            <button
              disabled={busy}
              onClick={async () => {
                const { error } = await client().auth.signOut();
                if (error) setMessage(error.message);
              }}
            >
              Sair desta conta
            </button>
          </div>
        )}
        {!auth.recovery && (
          <button
            className="text-button"
            disabled={busy}
            onClick={() => {
              setRecovery(!recovery);
              setMessage("");
            }}
          >
            {recovery ? "Voltar ao login" : "Esqueci minha senha"}
          </button>
        )}
        <p className="muted">Acesso exclusivo às administradoras.</p>
      </div>
    </main>
  );
}
