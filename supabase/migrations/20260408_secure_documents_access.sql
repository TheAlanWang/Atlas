do $$
declare
  function_signature text;
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'documents'
  ) then
    execute 'alter table public.documents enable row level security';
    execute 'revoke all on table public.documents from anon';
    execute 'revoke all on table public.documents from authenticated';
    execute 'revoke all on table public.documents from public';
  end if;

  for function_signature in
    select p.oid::regprocedure::text
    from pg_proc p
    join pg_namespace n
      on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('match_documents', 'search_documents_lexical')
  loop
    execute format(
      'alter function %s security definer',
      function_signature
    );
    execute format(
      'alter function %s set search_path = public, extensions',
      function_signature
    );
    execute format(
      'grant execute on function %s to anon',
      function_signature
    );
    execute format(
      'grant execute on function %s to authenticated',
      function_signature
    );
    execute format(
      'grant execute on function %s to service_role',
      function_signature
    );
  end loop;
end $$;
