alter type public.transaction_type add value if not exists 'conversion';

do $$
begin
  if not exists (select 1 from pg_type where typname = 'money_account') then
    create type public.money_account as enum ('card', 'cash');
  end if;
end $$;

alter table public.categories
add column if not exists system_key text;

create unique index if not exists categories_user_system_key_idx
on public.categories(user_id, system_key)
where system_key is not null;

alter table public.transactions
alter column category_id drop not null,
add column if not exists account public.money_account not null default 'card',
add column if not exists from_account public.money_account,
add column if not exists to_account public.money_account,
add column if not exists parent_transaction_id uuid references public.transactions(id) on delete cascade;

create index if not exists transactions_parent_transaction_id_idx
on public.transactions(parent_transaction_id);

insert into public.categories (user_id, name, emoji, type, system_key)
select distinct user_id, 'Чаевые', '🤝', 'expense'::public.category_type, 'tips'
from public.categories
on conflict (user_id, system_key) where system_key is not null do nothing;

create or replace function public.ensure_transaction_category_matches()
returns trigger
language plpgsql
as $$
declare
  category_type public.category_type;
  category_user uuid;
  parent_user uuid;
  parent_type public.transaction_type;
begin
  if new.type::text = 'conversion' then
    if new.category_id is not null then
      raise exception 'Conversion must not have a category';
    end if;

    if new.from_account is null or new.to_account is null or new.from_account = new.to_account then
      raise exception 'Conversion must have different source and destination accounts';
    end if;

    return new;
  end if;

  if new.category_id is null then
    raise exception 'Transaction category is required';
  end if;

  if new.from_account is not null or new.to_account is not null then
    raise exception 'Income and expense transactions must not have conversion accounts';
  end if;

  select type, user_id into category_type, category_user
  from public.categories
  where id = new.category_id;

  if category_user is distinct from new.user_id then
    raise exception 'Category does not belong to user';
  end if;

  if category_type <> 'both' and category_type::text <> new.type::text then
    raise exception 'Category type does not match transaction type';
  end if;

  if new.parent_transaction_id is not null then
    select user_id, type into parent_user, parent_type
    from public.transactions
    where id = new.parent_transaction_id;

    if parent_user is distinct from new.user_id then
      raise exception 'Parent transaction does not belong to user';
    end if;

    if parent_type::text <> 'expense' then
      raise exception 'Tips can only be attached to expense transactions';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.protect_system_categories()
returns trigger
language plpgsql
as $$
begin
  if old.system_key = 'tips' then
    if tg_op = 'DELETE' then
      raise exception 'System category cannot be deleted';
    end if;

    if new.name <> old.name or new.type <> old.type or new.system_key <> old.system_key then
      raise exception 'Only emoji can be changed for system category';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists categories_protect_system on public.categories;
create trigger categories_protect_system
before update or delete on public.categories
for each row execute function public.protect_system_categories();
