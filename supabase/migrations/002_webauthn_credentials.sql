create table public.webauthn_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  user_email text not null,
  credential_id text not null unique,
  public_key text not null,
  counter bigint not null default 0,
  transports text[] not null default '{}',
  device_type text not null,
  backed_up boolean not null default false,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create index webauthn_credentials_user_id_idx on public.webauthn_credentials(user_id);
create index webauthn_credentials_user_email_idx on public.webauthn_credentials(lower(user_email));

alter table public.webauthn_credentials enable row level security;

create policy "Users can read own webauthn credentials"
on public.webauthn_credentials for select
using (user_id = public.current_user_id());

create policy "Users can insert own webauthn credentials"
on public.webauthn_credentials for insert
with check (user_id = public.current_user_id());

create policy "Users can update own webauthn credentials"
on public.webauthn_credentials for update
using (user_id = public.current_user_id())
with check (user_id = public.current_user_id());

create policy "Users can delete own webauthn credentials"
on public.webauthn_credentials for delete
using (user_id = public.current_user_id());

grant all on public.webauthn_credentials to anon, authenticated, service_role;
