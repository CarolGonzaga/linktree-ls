import { createClient } from "@supabase/supabase-js";
import { configurationStatus } from "./config";
export const configurationError = configurationStatus();
export const supabase = configurationError
  ? null
  : createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    );
export function client() {
  if (!supabase) throw new Error(configurationError || "Conexão indisponível.");
  return supabase;
}
export function errorMessage(error: unknown) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "";
  if (code === "40001")
    return "Outra administradora alterou o rascunho. Recarregue a versão salva antes de continuar.";
  if (code === "42501")
    return "Sua conta não tem autorização para esta operação.";
  if (code === "22023" || code === "23514")
    return "Revise os campos: o conteúdo não passou na validação.";
  return error instanceof Error
    ? error.message
    : "Não foi possível concluir a operação. Tente novamente.";
}
