# FroggyBank

Mobile-first MVP для учета личных финансов на Next.js 15, Supabase и Docker Compose.

## Запуск

```bash
docker compose up -d
```

После запуска:

- приложение: http://localhost:3000
- Supabase gateway: http://localhost:8000
- Supabase Studio: http://localhost:54323

`.env.example` содержит те же dev-значения, которые уже заданы дефолтами в `docker-compose.yml`. Для локального запуска файл `.env` создавать не обязательно.

## Локальная разработка без Docker

```bash
npm install
npm run dev
```

Для dev-режима без Docker потребуется доступный Supabase URL и anon key через переменные окружения.

## Проверки

```bash
npm run typecheck
npm run lint
npm run build
docker compose config
```
