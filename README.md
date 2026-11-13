# Linktree LS

Aplicação estática React + TypeScript + Vite, com React Router e Supabase JS. Sem SSR, backend próprio ou funções serverless. Usa exclusivamente o projeto `djwrzvxzxsbrymhfpomg`.

## Desenvolvimento

```powershell
npm ci
npm run dev
npm run typecheck
npm run lint
npm run build
```

`.env.local` já configurado localmente e ignorado pelo Git. Em outra máquina, copiar `.env.example` e substituir o placeholder da publishable key. Variáveis exatas: `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Nunca usar chaves privilegiadas no frontend.

Rotas: `/` lê somente `ls_published`; `/admin/login` usa Supabase Auth; `/admin` exige sessão e autorização por UUID no banco. A rota de demonstração sem login foi removida.

Painel: edição de links, seções, redes, perfil e aparência; uploads; salvamento do rascunho; prévia compartilhada com a página pública; publicação explícita. Edite → salve o rascunho → confira a prévia → publique. A revisão do banco detecta conflito entre as administradoras. Links e seções inativos são removidos da cópia pública pela RPC.

## Situação do Supabase

A proprietária confirmou a execução de `supabase/migrations/20261113192026_linktree_ls_new_project.sql`. **Não executar novamente.** As contas foram criadas e seus UUIDs foram informados. Falta executar manualmente [autorizar-administradoras.sql](supabase/manual/autorizar-administradoras.sql) no mesmo projeto e confirmar. Esse script verifica a correspondência entre UUIDs e emails antes de preencher os dois slots administrativos.

Ver [configuração atual e ações manuais](docs/configuracao.md) e [validação da integração](docs/etapa-3.md).

## Produção

Vercel existente: `linktree-ls`, produção `main`, preset Vite, comando `npm run build`, saída `dist`. Fallback SPA em `vercel.json`.

Adicionar na Vercel as duas variáveis indicadas em `.env.example`, usando a URL autorizada e a publishable key fornecida. Variáveis Vite entram no build estático; alterar variáveis exige um novo build/deploy para ter efeito. Nenhum push ou deploy autorizado nesta entrega.

## Histórico preservado

Branch local `backup/anterior-2026-11-13`, commit `2d0a72418b858db4615025f671ae0ce3e5bea0ce`, e bundle completo validado `backups/links-anterior-2026-11-13.bundle`. Backups locais ignorados pelo Git; conservar uma cópia fora do projeto. [Etapas iniciais](docs/etapa-1.md) são um registro histórico.
