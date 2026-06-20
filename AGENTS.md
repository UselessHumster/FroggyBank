# Repository Guidelines

## Project Structure & Module Organization

FroggyBank is a Next.js 15 App Router application. Main application routes live in `src/app`, split into protected app screens under `src/app/(app)` and auth screens under `src/app/(auth)`. Reusable UI primitives are in `src/components/ui`; product components are in `src/components/app`. Server actions are in `src/lib/actions`, data reads in `src/lib/data`, Supabase clients in `src/lib/supabase`, and shared types/utilities in `src/lib/types` and `src/lib/utils.ts`.

Static PWA assets are in `public/`, including `manifest.webmanifest`, `sw.js`, and icons. Supabase/Kong configuration and database schema live in `supabase/`. Docker runtime files are `Dockerfile` and `docker-compose.yml`.

## Build, Test, and Development Commands

- `npm install`: install Node dependencies.
- `npm run dev`: run the Next.js dev server.
- `npm run typecheck`: run TypeScript with `tsc --noEmit`.
- `npm run lint`: run Next/ESLint checks.
- `npm run build`: create a production Next.js build.
- `docker compose up -d`: build and run the app plus local Supabase services.
- `docker compose config`: validate Compose configuration.

## Coding Style & Naming Conventions

Use strict TypeScript and React Server Components by default. Add `"use client"` only for interactive components using hooks, browser APIs, or client-only libraries such as Recharts. Prefer named exports for shared components and helpers.

Use 2-space indentation, Tailwind utility classes, and the existing shadcn-style component patterns. Keep route folders lowercase and semantic, for example `dashboard`, `history`, and `analytics`. Use PascalCase for React components, camelCase for functions/variables, and snake_case only when matching database columns.

## Testing Guidelines

No dedicated test framework is configured yet. Before submitting changes, run:

```bash
npm run typecheck
npm run lint
npm run build
docker compose config
```

For UI or auth changes, manually verify login, protected-route redirects, category CRUD, transaction CRUD, dashboard totals, history filters, analytics charts, dark mode, and PWA manifest loading.

## Commit & Pull Request Guidelines

This repository currently has no commit history, so use clear imperative commit messages such as `Add transaction filters` or `Fix Supabase auth URL`. Keep commits focused.

Pull requests should include a concise summary, test results, screenshots for UI changes, and notes about any Docker, Supabase, schema, or environment variable changes. Link related issues when available.

## Security & Configuration Tips

Do not commit real secrets. `.env.example` and Compose defaults are development-only values. For LAN or remote testing, ensure browser-facing Supabase URLs point to an address reachable by the device, while container-to-container calls can use Docker service names such as `http://kong:8000`.
