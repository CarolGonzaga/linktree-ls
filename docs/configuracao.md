# Configuração atual — Linktree LS

## Confirmado

- Projeto exclusivo: `djwrzvxzxsbrymhfpomg`, URL `https://djwrzvxzxsbrymhfpomg.supabase.co`.
- Migration inicial executada pela proprietária. **Não repetir a migration inicial.**
- `.env.local` configurado, com URL e publishable key fornecidas, ignorado pelo Git. `.env.example` continua somente com placeholder.
- Duas contas criadas manualmente no Auth, conforme UUIDs informados pela proprietária.

## 1. Autorizar as contas no banco

No SQL Editor do projeto **djwrzvxzxsbrymhfpomg**, executar manualmente **somente**:

`supabase/manual/autorizar-administradoras.sql`

O script confere os UUIDs reais e emails e preenche `admin_users`:

| Slot | UUID | Email |
|---|---|---|
| 1 | bc8ffc34-18a5-43b9-87ac-e3e51cc58b02 | anacquesta@gmail.com |
| 2 | b7597e03-50df-4c97-a3d2-51e80829fd13 | anaflavial1n4@gmail.com |

Ele falha antes de aplicar mudanças se as contas não corresponderem ou os slots estiverem ocupados por outros UUIDs. Pode ser repetido sem trocar uma autorização existente. O resultado deve mostrar exatamente as duas linhas. Confirmar a execução para prosseguir com os testes autenticados. Não enviar senhas pelo chat.

## 2. Configurar Authentication

No mesmo projeto:

- Desativar **Allow new users to sign up**. A consulta pública de configurações mostrou `disable_signup: false`; o cadastro ainda está habilitado. A interface não oferece cadastro e RLS continua bloqueando contas não autorizadas.
- Site URL: `https://linktree-ls-xi.vercel.app`.
- Redirect URLs exatas: `https://linktree-ls-xi.vercel.app/admin/login`, `http://127.0.0.1:5173/admin/login` e `http://localhost:5173/admin/login`.
- Confirmar acesso aos emails de recuperação. O aplicativo usa `resetPasswordForEmail` e trata `PASSWORD_RECOVERY` para atualizar a senha via Supabase Auth. Senha nova: pelo menos 12 caracteres; políticas adicionais do Auth também se aplicam.

Não incluir o futuro domínio até ele estar pronto. Não alterar DNS.

## 3. Configurar a Vercel existente

Projeto **linktree-ls → Settings → Environment Variables**. Adicionar ou atualizar:

| Nome | Valor |
|---|---|
| VITE_SUPABASE_URL | https://djwrzvxzxsbrymhfpomg.supabase.co |
| VITE_SUPABASE_PUBLISHABLE_KEY | A mesma publishable key fornecida e salva em .env.local |

Aplicar ao ambiente **Production**; aplicar também a **Preview** se usar previews com esse mesmo projeto. Ambas são configurações públicas usadas pelo build Vite. Não cadastrar `service_role`, `sb_secret` ou `SESSION_SECRET`.

Preset Vite, Build Command `npm run build`, Output Directory `dist`, Production Branch `main`. Não criar outro projeto. Alterações de variáveis só entram em novos builds; o deploy continua dependendo de autorização explícita.

## 4. Validação autenticada

Depois da autorização das contas, iniciar `npm run dev` e entrar em `http://localhost:5173/admin/login`. A proprietária deve digitar as credenciais no navegador.

Verificar ambas administradoras, logout, recuperação, criação/edição/ordenação, salvar rascunho sem alterar o público, enviar imagem, pré-visualizar, publicar e conferir `/` em outra aba. Publicar nessa etapa altera o conteúdo real do Supabase mesmo se o frontend estiver local: só testar publicação quando o conteúdo estiver aprovado para os visitantes.

Não presumir configurações concluídas sem confirmação. Nenhum SQL, criação de conta, mudança de configuração, escrita, upload, push ou deploy foi executado remotamente por Codex nesta etapa; somente verificações de leitura no projeto autorizado.

Referências: [Supabase Auth](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail), [Storage](https://supabase.com/docs/reference/javascript/storage-from-upload), [variáveis Vercel](https://vercel.com/docs/environment-variables).
