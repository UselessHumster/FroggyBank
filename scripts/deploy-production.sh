#!/usr/bin/env sh
set -eu

cd /opt/froggybank

git fetch origin main
git reset --hard origin/main

docker compose -f docker-compose.prod.yml up -d --build --remove-orphans

echo "Waiting for database..."
until docker compose -f docker-compose.prod.yml exec -T db pg_isready -U postgres -d postgres >/dev/null 2>&1; do
  sleep 2
done

psql_db() {
  docker compose -f docker-compose.prod.yml exec -T db psql -v ON_ERROR_STOP=1 -U postgres -d postgres "$@"
}

migrations_table_exists=$(psql_db -tAc "select to_regclass('public.schema_migrations') is not null;")

psql_db -c "
  create table if not exists public.schema_migrations (
    filename text primary key,
    applied_at timestamptz not null default now()
  );
"

migrations_applied=0

if [ "$migrations_table_exists" = "f" ]; then
  for migration in supabase/migrations/*.sql; do
    filename=$(basename "$migration")
    psql_db -c "insert into public.schema_migrations (filename) values ('$filename') on conflict (filename) do nothing;"
  done
fi

for migration in supabase/migrations/*.sql; do
  filename=$(basename "$migration")
  applied=$(psql_db -tAc "select exists (select 1 from public.schema_migrations where filename = '$filename');")

  if [ "$applied" = "t" ]; then
    echo "Skipping already applied migration: $filename"
    continue
  fi

  echo "Applying migration: $filename"
  psql_db -f "/docker-entrypoint-initdb.d/$filename"
  psql_db -c "insert into public.schema_migrations (filename) values ('$filename') on conflict (filename) do nothing;"
  migrations_applied=1
done

if [ "$migrations_applied" = "1" ]; then
  docker compose -f docker-compose.prod.yml restart rest
fi

docker network connect froggybank_default npm 2>/dev/null || true
docker image prune -f
