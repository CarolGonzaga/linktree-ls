# Validação da integração e refinamento visual — 13/11/2026

Projeto Supabase exclusivo: `djwrzvxzxsbrymhfpomg`. Migration e autorização das duas contas já executadas pela proprietária. Não repetir SQLs. Cadastro público desativado, URLs Auth e variáveis Vercel Production confirmadas. Nenhum push ou deploy realizado por Codex.

## Integração real

### Verificado por automação

- Projeto conferido pela API: ID exato e status ACTIVE_HEALTHY.
- Sessão da anacquesta no Chrome: painel autorizado e rascunho inicial carregado na revisão 0.
- Criação do link `Conheça o Lendo Sáficos`, destino `https://www.lendosaficos.com.br`, e salvamento pela interface: revisão 1.
- Isolamento do rascunho: após salvar a revisão 1, a consulta anônima a `ls_published` ainda retornava zero publicações.
- Upload real de PNG da marca: URL pública no bucket `ls-linktree`, dentro do diretório UUID da administradora. Salvamento e recarga persistida da revisão 2 com um link.
- A automação nativa foi interrompida na confirmação da publicação. Na retomada, consulta real comprovou `ls_published` na revisão 2, com o link esperado. A imagem publicada retornou HTTP 200 com tipo de conteúdo de imagem, sem autenticação. A página pública local renderizou o link e as imagens corretamente.
- Leitura anônima de `ls_draft` e `admin_users` negada (401/42501). RPCs `ls_save_draft` e `ls_publish` negadas para anônimo (401/42501). Tentativas usaram documento/revisão inválidos para impedir gravação mesmo em caso de regressão dos grants. Conteúdo publicado preservado entre essas verificações.
- Configuração pública Auth: `disable_signup=true`, provedor de email habilitado.

### Confirmado manualmente pela proprietária

- Login inicial com `anacquesta@gmail.com`.
- Logout, acesso direto a `/admin` redirecionando ao login, login com `anaflavial1n4@gmail.com`, painel e rascunho carregados, seguido de novo logout: todos os passos confirmados como funcionando.
- Captura enviada mostra a segunda administradora e a pré-visualização do rascunho carregada.

Não houve acesso a senhas ou extração de tokens. Não foi criada terceira conta para teste.

### Limites da validação

Recuperação por email, renovação real de token, conflito concorrente entre sessões e usuário autenticado sem autorização não foram exercitados no ambiente real. Os testes SQL locais anteriores cobrem concorrência e bloqueio de terceiros com Auth/Storage simulados; não devem ser descritos como testes de login reais. Esses limites não impedem o refinamento visual solicitado, mas precisam ser considerados antes da aprovação final de produção.

A publicação de validação contém um link real para o site da marca e uma imagem da marca. Não há texto fictício de teste publicado. A revisão visual posterior usou fixtures locais ignoradas pelo Git e não gravou conteúdo no Supabase.

## Refinamento visual

Alterações restritas ao renderizador compartilhado `src/components/PageContent.tsx` e seus estilos em `src/styles.css`:

- Coluna centralizada de até 480 px, perfil compacto e menos espaços verticais.
- Redes sociais em linha abaixo da descrição, com nomes acessíveis e área de toque de 44 px.
- Botões empilhados com título geometricamente centralizado, independentemente da presença de ícone ou imagem.
- Altura mínima de 64 px; formato compacto preservado com mínimo de 56 px. Descrições e títulos longos podem aumentar a altura para manter leitura e toque adequados.
- Seções discretas, rodapé leve, Playfair Display e DM Sans, paletas rosa/vinho/neutros e estilos existentes preservados.
- A prévia usa exatamente `PageContent`, sem regras próprias de tipografia ou espaçamento que divergiam da página pública.
- Nenhuma alteração em banco, RLS, Auth ou funcionalidades do painel nesta entrega.

## Verificações visuais e técnicas

- Página pública real revisada em desktop e 390 × 844, com imagens carregadas e sem transbordamento horizontal.
- Fixture local com redes, seções, título longo, descrição, link destacado, link sem ícone e link compacto: nove combinações de paleta/estilo verificadas em 390 px. Nenhum transbordamento; título centralizado (desvio medido de 0 px).
- Mesma fixture em 320 × 760: sem transbordamento; redes antes dos links; três links visíveis e link da seção inativa ausente. Todos os links externos com `_blank`, `noopener` e `noreferrer`.
- Desktop em 1280 px: coluna medida em 480 px.
- TypeScript, ESLint e build de produção passaram após o refinamento.
- Verificação pública reproduzível, sem alteração de dados: `node scripts/check-public.mjs`.

Capturas e fixtures ficam somente em `backups/`, ignorado pelo Git. As fixtures não são rotas da aplicação nem entram no build.

## Entrega e commit

O commit anterior `6f95cb0` já contém a correção da renovação da sessão e as verificações de acesso. Não incluí-lo novamente nesta entrega.

Adicionar apenas:

- `src/components/PageContent.tsx`
- `src/styles.css`
- `docs/validacao-real.md`

Mensagem: `style: refina layout público mantendo identidade Lendo Sáficos`

Não incluir `.env.local`, credenciais, `node_modules`, `dist` ou `backups`. Não há nova migration ou configuração remota necessária para esse ajuste visual. O push à main continua aguardando autorização de publicação, pois pode disparar a Vercel automaticamente.
