> REGISTRO HISTÓRICO: a migration inicial já foi confirmada e não deve ser repetida. Consulte docs/etapa-3.md e docs/configuracao.md para o estado atual.

# Entrega local — etapas 1 e 2; preparação da etapa 3

## Implementado

- Histórico anterior validado via bundle completo e referência local `backup/anterior-2026-11-13`, commit `2d0a72418b858db4615025f671ae0ce3e5bea0ce`. A main local ainda não tinha commits. O histórico não foi reescrito; nenhum push foi feito.
- Base parcial anterior arquivada em `backups/base-parcial-antes-reconstrucao.zip` antes da substituição.
- React, TypeScript, Vite e React Router; npm e lockfile versionável. Assets da marca preservados. Sem arquitetura de servidor.
- Página pública inicial elegante, renderizador compartilhado com a prévia, links agrupados por seções, destaque, cartões/compactos, redes, perfil, rodapé e paletas.
- Interface de login/recuperação, navegação do painel e formulários completos de edição local, ativação, destaque, ordenação e exclusão com confirmação. Excluir seção conserva os links sem seção.
- Editor local exclusivo de desenvolvimento, com aviso de dados em memória. Nenhum bypass de autenticação na produção: `/admin` redireciona ao login. Login real, logout, recuperação, persistência e upload ainda pendentes.
- Variáveis corrigidas para o único Supabase autorizado. `.env.local` ignorado. Instruções e SQL antigos removidos da árvore ativa; preservados apenas no backup local.
- Migration nova gerada pelo CLI, sem execução remota. Autorização por UUIDs em tabela protegida com dois slots; nenhum UUID antigo usado.

## Testes realizados

- TypeScript, ESLint e build de produção passaram.
- Navegador local: página pública, `/admin` redirecionando ao login, painel local, criar e editar link, destacar, pré-visualizar e ocultar link inativo. Link externo renderizado com URL correta, `target=_blank` e `rel=noopener noreferrer` no componente.
- Revisão visual desktop e celular (390 × 844) da página pública e do painel. Não houve transbordamento horizontal da página. Navegação do painel usa rolagem horizontal no celular.
- Migration executada em PostgreSQL local temporário via PGlite já instalado na máquina, com estruturas simuladas de Auth e Storage. Testes passaram para limite de duas administradoras, privacidade da tabela administrativa, rascunho inacessível ao anônimo e invisível a terceiros, negação de publicação e salvamento não autorizados, negação de autoatribuição administrativa, validação de documento e URLs, conflito de revisão, leitura publicada anônima, remoção de itens inativos e upload restrito a diretório/tipo autorizado. Script local em `backups/check-new-migration.mjs`.
- Não foram testados Auth, recuperação, logout, publicação via navegador, Storage ou RLS no Supabase real. A simulação local de Storage não valida inspeção MIME/tamanho pelo serviço. Esses testes dependem da configuração manual.
- Nenhuma operação remota, alteração no site principal, DNS, push ou deploy.

## Ação manual e próximo passo

Executar apenas [20261113192026_linktree_ls_new_project.sql](../supabase/migrations/20261113192026_linktree_ls_new_project.sql) no SQL Editor do projeto **djwrzvxzxsbrymhfpomg** e confirmar. Ver [configuração](configuracao.md). Continuar integração somente após a confirmação, conforme solicitado.

## Commits sugeridos

Etapa 1: `chore: reconstrói base estática do Linktree LS com React e Vite`

Etapa 2: `feat: cria interface editorial e prévia local do painel`

Preparação da etapa 3: `feat: prepara migration manual com RLS para novo Supabase`

Para salvar a entrega atual em um commit pelo terminal do VS Code, revisar os arquivos antes e executar:

```powershell
Set-Location 'D:\temporarios\linktree-ls'
git status --short
git add .gitignore .env.example README.md docs/configuracao.md docs/etapa-1.md eslint.config.js index.html package.json package-lock.json tsconfig.json vercel.json vite.config.ts src/App.tsx src/main.tsx src/styles.css src/components/PageContent.tsx src/lib/config.ts src/lib/document.ts src/pages/AdminPage.tsx src/pages/LoginPage.tsx public/logo.png public/og.png supabase/migrations/20261113192026_linktree_ls_new_project.sql
git diff --cached --stat
git commit -m "feat: reconstrói Linktree LS e prepara novo Supabase"
```

Não incluir `.env.local`, `backups`, `node_modules` ou `dist`. Não fazer push neste ponto. A referência de backup está local; para restaurar em outra pasta vazia, pode-se clonar o bundle completo. Não substituir o projeto atual pela arquitetura do backup.
