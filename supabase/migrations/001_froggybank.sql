do $$
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
    create role authenticator login password 'postgres' noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    create role supabase_auth_admin login password 'postgres' noinherit createrole;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'supabase_admin') then
    create role supabase_admin login password 'postgres' createrole createdb;
  end if;
end $$;

grant anon, authenticated, service_role to authenticator;
grant all privileges on database postgres to supabase_auth_admin;
grant all privileges on schema public to supabase_auth_admin;
grant create on schema public to supabase_auth_admin;

create type public.category_type as enum ('income', 'expense', 'both');
create type public.transaction_type as enum ('income', 'expense');

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null check (char_length(name) between 1 and 40),
  emoji text not null check (char_length(emoji) between 1 and 8),
  type public.category_type not null default 'expense',
  created_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  category_id uuid not null references public.categories(id) on delete restrict,
  amount numeric(14, 2) not null check (amount > 0),
  type public.transaction_type not null,
  note text,
  transaction_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index categories_user_id_idx on public.categories(user_id);
create index transactions_user_id_date_idx on public.transactions(user_id, transaction_date desc);
create index transactions_category_id_idx on public.transactions(category_id);

alter table public.categories enable row level security;
alter table public.transactions enable row level security;

create or replace function public.current_user_id()
returns uuid
language sql
stable
as $$
  select nullif(
    coalesce(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub',
      current_setting('request.jwt.claim.sub', true)
    ),
    ''
  )::uuid;
$$;

create policy "Users can read own categories"
on public.categories for select
using (user_id = public.current_user_id());

create policy "Users can insert own categories"
on public.categories for insert
with check (user_id = public.current_user_id());

create policy "Users can update own categories"
on public.categories for update
using (user_id = public.current_user_id())
with check (user_id = public.current_user_id());

create policy "Users can delete own categories"
on public.categories for delete
using (user_id = public.current_user_id());

create policy "Users can read own transactions"
on public.transactions for select
using (user_id = public.current_user_id());

create policy "Users can insert own transactions"
on public.transactions for insert
with check (user_id = public.current_user_id());

create policy "Users can update own transactions"
on public.transactions for update
using (user_id = public.current_user_id())
with check (user_id = public.current_user_id());

create policy "Users can delete own transactions"
on public.transactions for delete
using (user_id = public.current_user_id());

create or replace function public.ensure_transaction_category_matches()
returns trigger
language plpgsql
as $$
declare
  category_type public.category_type;
  category_user uuid;
begin
  select type, user_id into category_type, category_user
  from public.categories
  where id = new.category_id;

  if category_user is distinct from new.user_id then
    raise exception 'Category does not belong to user';
  end if;

  if category_type <> 'both' and category_type::text <> new.type::text then
    raise exception 'Category type does not match transaction type';
  end if;

  return new;
end;
$$;

create trigger transactions_category_type_check
before insert or update on public.transactions
for each row execute function public.ensure_transaction_category_matches();

grant usage on schema public to anon, authenticated;
grant all on public.categories to anon, authenticated;
grant all on public.transactions to anon, authenticated;
