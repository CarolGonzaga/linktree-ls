-- PostgREST 14 repete transações que retornam 40001. Uma revisão desatualizada
-- requer recarregar o rascunho e retorna HTTP 409 via PT409.
-- Altera as duas funções sem modificar suas permissões.

begin;
set local lock_timeout = '3s';

create or replace function public.ls_save_draft(p_document jsonb, p_revision bigint)
returns bigint language plpgsql security invoker set search_path = '' as $$
declare next_revision bigint;
begin
  if not coalesce(public.ls_is_admin(), false) then raise exception 'Acesso negado' using errcode='42501'; end if;
  if not public.ls_valid_document(p_document) then raise exception 'Conteúdo inválido' using errcode='22023'; end if;
  update public.ls_draft set document=p_document, revision=revision+1, updated_at=now()
    where id=true and revision=p_revision returning revision into next_revision;
  if next_revision is null then raise exception 'Rascunho alterado por outra administradora. Recarregue antes de salvar.' using errcode='PT409'; end if;
  return next_revision;
end;
$$;

-- SECURITY DEFINER necessário apenas para publicar: clientes não têm escrita
-- na tabela publicada. Autorização por auth.uid() + admin_users, search_path vazio.
create or replace function public.ls_publish(p_revision bigint)
returns bigint language plpgsql security definer set search_path = '' as $$
declare draft public.ls_draft%rowtype; published jsonb;
begin
  if not coalesce(public.ls_is_admin(),false) then raise exception 'Acesso negado' using errcode='42501'; end if;
  select * into draft from public.ls_draft where id=true for update;
  if not found or draft.revision <> p_revision then
    raise exception 'Rascunho alterado. Recarregue antes de publicar.' using errcode='PT409'; end if;
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

commit;
