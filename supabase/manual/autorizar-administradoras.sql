-- EXECUÇÃO MANUAL SOMENTE no projeto djwrzvxzxsbrymhfpomg.
-- Migration inicial já executada pela proprietária. Não repetir a migration.
-- Confere UUIDs e emails reais informados antes de autorizar as duas contas.
begin;
do $$
begin
  if not exists (select 1 from auth.users where id='bc8ffc34-18a5-43b9-87ac-e3e51cc58b02' and lower(email)='anacquesta@gmail.com')
    or not exists (select 1 from auth.users where id='b7597e03-50df-4c97-a3d2-51e80829fd13' and lower(email)='anaflavial1n4@gmail.com') then
    raise exception 'UUID/email não corresponde às contas esperadas neste projeto. Nenhuma autorização aplicada.';
  end if;
  if exists (select 1 from public.admin_users where
    (slot=1 and user_id<>'bc8ffc34-18a5-43b9-87ac-e3e51cc58b02') or
    (slot=2 and user_id<>'b7597e03-50df-4c97-a3d2-51e80829fd13')) then
    raise exception 'Slots administrativos ocupados por UUIDs diferentes. Revise antes de continuar.';
  end if;
end $$;
insert into public.admin_users(slot,user_id) values
  (1,'bc8ffc34-18a5-43b9-87ac-e3e51cc58b02'),
  (2,'b7597e03-50df-4c97-a3d2-51e80829fd13')
on conflict (slot) do nothing;
select a.slot, a.user_id, u.email from public.admin_users a join auth.users u on u.id=a.user_id order by slot;
commit;
