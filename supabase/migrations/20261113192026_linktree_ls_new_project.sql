-- Executar MANUALMENTE, uma única vez, SOMENTE no projeto djwrzvxzxsbrymhfpomg.
-- Confira o Project ID no painel antes de executar. Não há conexão remota neste arquivo.
-- Não executar migrations antigas. Nenhum usuário é autorizado automaticamente.
begin;

-- Falha se a conexão expuser um identificador diferente do projeto autorizado.
do $$
declare ref text := current_setting('app.settings.project_ref', true);
begin
  if ref is not null and ref <> '' and ref <> 'djwrzvxzxsbrymhfpomg' then
    raise exception 'Projeto incorreto. Esperado djwrzvxzxsbrymhfpomg';
  end if;
end $$;

create table public.admin_users (
  slot smallint primary key check (slot in (1,2)),
  user_id uuid not null unique references auth.users(id) on delete cascade
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from public, anon, authenticated;
grant select on public.admin_users to authenticated;
create policy admin_self_read on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));
-- Sem policies ou grants de escrita para o frontend: apenas SQL Editor.
create function public.ls_is_admin() returns boolean
language sql stable security invoker set search_path = '' as $$
  select exists(select 1 from public.admin_users where user_id = (select auth.uid()))
$$;
revoke all on function public.ls_is_admin() from public, anon;
grant execute on function public.ls_is_admin() to authenticated;

-- Validação compartilhada pelas constraints e RPCs; nenhum SQL dinâmico.
create function public.ls_valid_document(d jsonb) returns boolean
language plpgsql immutable set search_path = '' as $$
declare item jsonb; field text; ids text[] := '{}'; section_ids text[] := '{}';
begin
  if d is null or jsonb_typeof(d) <> 'object' or octet_length(d::text) > 1048576
    or not (d ?& array['profile','appearance','sections','links','socials'])
    or jsonb_typeof(d->'profile') <> 'object'
    or jsonb_typeof(d->'appearance') <> 'object'
    or jsonb_typeof(d->'sections') <> 'array'
    or jsonb_typeof(d->'links') <> 'array'
    or jsonb_typeof(d->'socials') <> 'array' then return false; end if;
  if jsonb_array_length(d->'links') > 100 or jsonb_array_length(d->'sections') > 30
    or jsonb_array_length(d->'socials') > 20 then return false; end if;
  if jsonb_typeof(d#>'{profile,name}') is distinct from 'string'
    or length(btrim(d#>>'{profile,name}')) not between 1 and 100 then return false; end if;
  foreach field in array array['description','footer','avatar','logo','background'] loop
    if jsonb_typeof(d->'profile'->field) is distinct from 'string'
      or length(d->'profile'->>field) > 2000 then return false; end if;
  end loop;
  foreach field in array array['avatar','logo','background'] loop
    if (d->'profile'->>field) <> '' and (d->'profile'->>field) !~ '^https://[^[:space:]]+$'
      and (d->'profile'->>field) not in ('/logo.png','/og.png') then return false; end if;
  end loop;
  if (d#>>'{appearance,palette}') is null or (d#>>'{appearance,palette}') not in ('rose','wine','neutral')
    or (d#>>'{appearance,buttons}') is null or (d#>>'{appearance,buttons}') not in ('rounded','soft','outline')
    then return false; end if;
  for item in select value from jsonb_array_elements(d->'sections') loop
    if jsonb_typeof(item) is distinct from 'object' or not (item ?& array['id','title','active'])
      or jsonb_typeof(item->'id') <> 'string' or (item->>'id') !~ '^[a-zA-Z0-9_-]{1,80}$'
      or (item->>'id') = any(ids) or jsonb_typeof(item->'title') <> 'string'
      or length(btrim(item->>'title')) not between 1 and 100
      or jsonb_typeof(item->'active') <> 'boolean' then return false; end if;
    ids := array_append(ids,item->>'id'); section_ids := array_append(section_ids,item->>'id');
  end loop;
  for item in select value from jsonb_array_elements((d->'links') || (d->'socials')) loop
    if jsonb_typeof(item) is distinct from 'object' or not (item ?& array['id','title','url','active','icon'])
      or jsonb_typeof(item->'id') <> 'string' or (item->>'id') !~ '^[a-zA-Z0-9_-]{1,80}$'
      or (item->>'id') = any(ids) or jsonb_typeof(item->'title') <> 'string'
      or length(btrim(item->>'title')) not between 1 and 160
      or jsonb_typeof(item->'url') <> 'string' or length(item->>'url') > 2048
      or (item->>'url') !~ '^https?://[^[:space:]]+$'
      or (item->>'url') ~ '^https?://[^/]*@'
      or jsonb_typeof(item->'active') <> 'boolean'
      or jsonb_typeof(item->'icon') <> 'string' or length(item->>'icon') > 40
      then return false; end if;
    ids := array_append(ids,item->>'id');
  end loop;
  for item in select value from jsonb_array_elements(d->'links') loop
    if not (item ?& array['description','image','sectionId','featured','style'])
      or jsonb_typeof(item->'description') <> 'string' or length(item->>'description') > 500
      or jsonb_typeof(item->'image') <> 'string' or length(item->>'image') > 2048
      or ((item->>'image') <> '' and (item->>'image') !~ '^https://[^[:space:]]+$')
      or jsonb_typeof(item->'sectionId') <> 'string'
      or ((item->>'sectionId') <> '' and not ((item->>'sectionId') = any(section_ids)))
      or jsonb_typeof(item->'featured') <> 'boolean'
      or jsonb_typeof(item->'style') <> 'string' or (item->>'style') not in ('card','compact')
      then return false; end if;
  end loop;
  return true;
exception when others then return false;
end;
$$;
revoke all on function public.ls_valid_document(jsonb) from public, anon;
grant execute on function public.ls_valid_document(jsonb) to authenticated;

create table public.ls_draft (
  id boolean primary key default true check (id),
  document jsonb not null check (public.ls_valid_document(document)),
  revision bigint not null default 0 check (revision >= 0),
  updated_at timestamptz not null default now()
);
create table public.ls_published (
  id boolean primary key default true check (id),
  document jsonb not null check (public.ls_valid_document(document)),
  revision bigint not null check (revision >= 0),
  published_at timestamptz not null default now()
);
alter table public.ls_draft enable row level security;
alter table public.ls_published enable row level security;
revoke all on public.ls_draft, public.ls_published from public, anon, authenticated;
grant select on public.ls_draft to authenticated;
grant select on public.ls_published to anon, authenticated;
create policy ls_draft_admin_read on public.ls_draft for select to authenticated
  using ((select public.ls_is_admin()));
create policy ls_published_read on public.ls_published for select to anon, authenticated
  using (true);

insert into public.ls_draft (document) values ('{
  "profile":{"name":"Lendo Sáficos","description":"Um espaço para descobrir, celebrar e compartilhar histórias sáficas.","footer":"Lendo Sáficos · Literatura e comunidade","avatar":"/logo.png","logo":"/logo.png","background":""},
  "appearance":{"palette":"rose","buttons":"rounded"},
  "sections":[],"links":[],"socials":[]
}'::jsonb);

-- RLS autoriza somente a atualização do rascunho; não há INSERT/DELETE.
grant update(document,revision,updated_at) on public.ls_draft to authenticated;
create policy ls_draft_admin_update on public.ls_draft for update to authenticated
  using ((select public.ls_is_admin())) with check ((select public.ls_is_admin()));
create function public.ls_save_draft(p_document jsonb, p_revision bigint)
returns bigint language plpgsql security invoker set search_path = '' as $$
declare next_revision bigint;
begin
  if not coalesce(public.ls_is_admin(), false) then raise exception 'Acesso negado' using errcode='42501'; end if;
  if not public.ls_valid_document(p_document) then raise exception 'Conteúdo inválido' using errcode='22023'; end if;
  update public.ls_draft set document=p_document, revision=revision+1, updated_at=now()
    where id=true and revision=p_revision returning revision into next_revision;
  if next_revision is null then raise exception 'Rascunho alterado por outra administradora. Recarregue antes de salvar.' using errcode='40001'; end if;
  return next_revision;
end;
$$;

-- SECURITY DEFINER necessário apenas para publicar: clientes não têm escrita
-- na tabela publicada. Autorização por auth.uid() + admin_users, search_path vazio.
create function public.ls_publish(p_revision bigint)
returns bigint language plpgsql security definer set search_path = '' as $$
declare draft public.ls_draft%rowtype; published jsonb;
begin
  if not coalesce(public.ls_is_admin(),false) then raise exception 'Acesso negado' using errcode='42501'; end if;
  select * into draft from public.ls_draft where id=true for update;
  if not found or draft.revision <> p_revision then
    raise exception 'Rascunho alterado. Recarregue antes de publicar.' using errcode='40001'; end if;
  if not public.ls_valid_document(draft.document) then raise exception 'Conteúdo inválido' using errcode='22023'; end if;
  -- Conteúdo inativo nunca é enviado aos visitantes.
  published := jsonb_build_object(
    'profile',draft.document->'profile', 'appearance',draft.document->'appearance',
    'sections',(select coalesce(jsonb_agg(s.value order by s.ord),'[]'::jsonb)
      from jsonb_array_elements(draft.document->'sections') with ordinality s(value,ord)
      where (s.value->>'active')::boolean),
    'links',(select coalesce(jsonb_agg(l.value order by l.ord),'[]'::jsonb)
      from jsonb_array_elements(draft.document->'links') with ordinality l(value,ord)
      where (l.value->>'active')::boolean and ((l.value->>'sectionId')=''
        or exists (select 1 from jsonb_array_elements(draft.document->'sections') s
          where s->>'id'=l.value->>'sectionId' and (s->>'active')::boolean))),
    'socials',(select coalesce(jsonb_agg(s.value order by s.ord),'[]'::jsonb)
      from jsonb_array_elements(draft.document->'socials') with ordinality s(value,ord)
      where (s.value->>'active')::boolean)
  );
  insert into public.ls_published (id,document,revision,published_at)
    values (true,published,draft.revision,now())
    on conflict(id) do update set document=excluded.document, revision=excluded.revision, published_at=excluded.published_at;
  return draft.revision;
end;
$$;
revoke all on function public.ls_save_draft(jsonb,bigint), public.ls_publish(bigint) from public, anon;
grant execute on function public.ls_save_draft(jsonb,bigint), public.ls_publish(bigint) to authenticated;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('ls-linktree','ls-linktree',true,5242880,array['image/jpeg','image/png','image/webp']);

-- Caminho: UUID da administradora/UUID aleatório.ext. Sem sobrescrita nem
-- exclusão para impedir a quebra de imagens que já estejam publicadas.
create policy ls_linktree_upload on storage.objects for insert to authenticated
with check (bucket_id='ls-linktree' and (select public.ls_is_admin())
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$');
create policy ls_linktree_admin_media_read on storage.objects for select to authenticated
using (bucket_id='ls-linktree' and (select public.ls_is_admin()));

-- Bucket público: URLs de imagens são públicas desde o upload, mesmo no
-- rascunho. O documento do rascunho continua privado. Não enviar mídia sigilosa.
commit;
