# Validação real da integração — 13/11/2026

Projeto exclusivo: `djwrzvxzxsbrymhfpomg`. Nenhuma migration remota, push ou deploy executado nesta validação.

## Configuração confirmada pela proprietária

Migration inicial e autorização das duas administradoras concluídas. Cadastro público desativado, Site URL/Redirect URLs configurados, variáveis Vite adicionadas à Vercel Production. Não repetir os SQLs de configuração.

## Testes concluídos

- Projeto conferido pela API: ID exato e status ACTIVE_HEALTHY.
- Banco real via chave publishable: leitura pública `ls_published` permitida (200), ainda sem publicação no início da validação.
- Leitura anônima de `ls_draft` e `admin_users` bloqueada (401/42501).
- RPCs `ls_save_draft` e `ls_publish` bloqueadas para anônimo (401/42501); parâmetros inválidos de revisão/documento impediriam gravação mesmo em caso de regressão de grants. Publicação preservada entre as verificações.
- Configuração real do Auth: `disable_signup=true`, email habilitado.
- TypeScript, ESLint e build passaram após a correção do estado de autorização.
- Testes de PostgreSQL local com Auth/Storage simulados passaram novamente. Esses testes locais não comprovam login ou upload reais.

Verificação pública reproduzível, sem chaves no código e sem criar usuários ou enviar emails:

```powershell
node scripts/check-public.mjs
```

## Correção restrita

`src/lib/auth.tsx`: a renovação do token da mesma conta agora preserva o editor enquanto revalida a autorização. Antes, a associação da autorização ao token fazia a rota mostrar carregamento e desmontar o editor a cada renovação, perdendo alterações não salvas. A autorização fica associada ao UUID; cada novo token continua disparando consulta a Auth e à RPC. Troca de conta, logout e negação de acesso continuam protegidos. A autorização das gravações permanece no banco.

Esta correção passou nas verificações estáticas; o comportamento com renovação real ainda depende de sessão autenticada.

## Aguardando login feito pela proprietária

Foi aberta a página `http://127.0.0.1:5173/admin/login` no navegador do Codex. A proprietária deve digitar sua senha somente no navegador e informar quando o painel abrir e qual conta utilizou. Não compartilhar senha no chat.

Pendentes de validação real:

- Login e autorização de cada uma das duas contas.
- Leitura e salvamento do rascunho, incluindo recarga e conflito de revisão.
- Prévia e isolamento entre rascunho e publicação.
- Publicação pela RPC e leitura pública da nova versão.
- Upload de imagem, URL pública e renderização.
- Logout e bloqueio do painel após sair.
- Recuperação por email e bloqueio de usuário autenticado não autorizado (não criar conta adicional sem combinar).

Não declarar esses fluxos aprovados antes da execução real. As credenciais não são necessárias no chat. O conteúdo de teste deverá usar a identidade da marca e ter as alterações temporárias removidas no próprio painel ao finalizar.

## Arquivos para o commit da entrega completa

O repositório local ainda não possui commit na main e os arquivos da aplicação aparecem como não rastreados. Revisar e incluir os arquivos abaixo, abrangendo também as etapas anteriores:

```powershell
git add .gitignore .env.example README.md package.json package-lock.json tsconfig.json vite.config.ts eslint.config.js vercel.json index.html public/logo.png public/og.png src/main.tsx src/App.tsx src/styles.css src/components/PageContent.tsx src/lib/auth.tsx src/lib/config.ts src/lib/document.ts src/lib/media.ts src/lib/supabase.ts src/lib/validation.ts src/pages/AdminPage.tsx src/pages/LoginPage.tsx src/pages/PublicPage.tsx scripts/check-public.mjs docs/etapa-1.md docs/etapa-3.md docs/configuracao.md docs/validacao-real.md supabase/migrations/20261113192026_linktree_ls_new_project.sql supabase/manual/autorizar-administradoras.sql
git diff --cached --stat
```

Não incluir `.env.local`, `node_modules`, `dist` ou `backups`. Não executar push. Sugestão de mensagem após a validação: `feat: reconstrói Linktree LS com Supabase Auth, publicação e Storage`.
