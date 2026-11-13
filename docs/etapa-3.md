# Etapa 3 — integração após confirmação da migration

## Implementado

- Migration inicial confirmada pela proprietária; projeto remoto conferido via API: ID `djwrzvxzxsbrymhfpomg`, estado `ACTIVE_HEALTHY`.
- Variáveis locais reais configuradas somente em `.env.local`, ignorado pelo Git; chave real não incluída no código-fonte ou `.env.example`.
- Supabase JS com bloqueio de URL de projeto incorreto e chave que não seja publishable.
- Página pública consulta somente `ls_published`, com carregamento, erro, nova tentativa e estado inicial quando não há publicação.
- Supabase Auth para login, logout, recuperação por email e atualização de senha; não há cadastro nem gestão própria de JWT/sessão. Sessão administrada pelo SDK.
- Proteção da rota com sessão validada em Auth e RPC de autorização; permissões continuam sendo verificadas no banco a cada operação. Usuário sem autorização não recebe editor nem rascunho.
- Painel conectado ao rascunho real, salvamento por revisão, recarga com confirmação, mensagens de erro, prévia e publicação explícita da revisão salva. Campos ficam bloqueados durante gravação/upload.
- Upload de logo/avatar/fundo/imagens de links, com MIME permitido, até 5 MB, caminho UUID/UUID.ext, sem sobrescrita. URLs de mídia são públicas desde o upload.
- SQL manual específico para vincular UUIDs reais, conferindo emails e slots existentes.

## Testes e evidências

- TypeScript, lint e build de produção passaram.
- PostgreSQL temporário local: migration e autorização manual testadas com estruturas simuladas de Auth/Storage. Script de autorização rejeita contas ausentes e pode ser repetido quando já correto. Mantidos testes de limite de duas administradoras, RLS, bloqueios, validação, concorrência, publicação e políticas Storage. Script: `backups/check-integrated-sql.mjs`.
- Projeto real, somente leitura com chave publishable: `ls_published` respondeu `200` com zero publicações; `ls_draft` e `admin_users` responderam `401`, código `42501`, para anônimo. Script: `backups/check-remote-readonly.mjs`.
- Configuração pública Auth respondeu `disable_signup: false`, `external.email: true`. É necessária a desativação manual do cadastro público.
- Navegador local conectado ao Supabase real: página pública carregou o estado inicial sem erros/warnings no console; `/admin` redirecionou ao login sem sessão.
- Login válido das duas contas, recuperação por email, logout, salvamento, publicação e upload reais ainda NÃO foram testados. Dependem da autorização dos UUIDs e da interação das proprietárias com suas credenciais. Não houve acesso às senhas.

## Intervenções manuais

Executar `supabase/manual/autorizar-administradoras.sql`, configurar Auth e variáveis da Vercel conforme [configuracao.md](configuracao.md). Não repetir a migration inicial. Confirmar os resultados antes de testar gravação/publicação.

Commit sugerido: `feat: integra Auth, rascunho, publicação e Storage ao novo Supabase`.

Não foi criado commit, push ou deploy. Próximo passo: após confirmar a autorização, testar os fluxos autenticados com as administradoras, concluir os testes de permissões e preparar a publicação mediante autorização.
