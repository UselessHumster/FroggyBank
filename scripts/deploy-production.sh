#!/usr/bin/env sh
set -eu

cd /opt/froggybank

git fetch origin main
git reset --hard origin/main

docker compose -f docker-compose.prod.yml up -d --build --remove-orphans
docker network connect froggybank_default npm 2>/dev/null || true
docker image prune -f
