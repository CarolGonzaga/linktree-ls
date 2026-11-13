export const authorizedProject = "djwrzvxzxsbrymhfpomg";
export function configurationStatus(): string | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || key.includes("SUBSTITUA"))
    return "Configure as variáveis de ambiente para conectar a página.";
  if (url !== `https://${authorizedProject}.supabase.co`)
    return "Configuração bloqueada: projeto Supabase diferente do autorizado.";
  if (!key.startsWith("sb_publishable_"))
    return "Configure somente a publishable key do projeto autorizado.";
  return null;
}
