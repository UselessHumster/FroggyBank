#!/usr/bin/env sh
set -eu

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<SQL
do \$\$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticator') then
    create role authenticator login password '$POSTGRES_PASSWORD' noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    create role supabase_auth_admin login password '$POSTGRES_PASSWORD' noinherit createrole;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'supabase_admin') then
    create role supabase_admin login password '$POSTGRES_PASSWORD' createrole createdb;
  end if;
  if not exists (select 1 from information_schema.schemata where schema_name = 'auth') then
    create schema auth authorization supabase_auth_admin;
  end if;
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'auth' and t.typname = 'factor_type'
  ) then
    create type auth.factor_type as enum ('totp', 'webauthn');
  end if;
end
\$\$;

alter type auth.factor_type owner to supabase_auth_admin;
SQL
