# FelOps Frontend

FelOps is a multi-tenant SaaS for building and managing AI agents. This repo is the frontend.

## Tech Stack

- **Framework**: Next.js 16 (`16.4.6`) with App Router, `cacheComponents`, and `partialPrefetching`
- **Library**: React 19 (`19.3.0`)
- **Styling**: Tailwind CSS v4 (`4`) with native CSS `@theme` tokens (via `@tailwindcss/turbopack`)
- **Forms**: React Hook Form (`^7.91.0`) with Zod 4 (`^4.6.7`) and `@hookform/resolvers` (`^7.0.6`)
- **Icons**: Lucide React (`^1.59.0`)
- **Localization**: `next-intl` (`^4.14.9`) is installed but not configured or used

> **Important**: `AGENTS.md` notes that Next.js 16 introduces breaking conventions. Consult `node_modules/next/dist/docs/` before implementing framework APIs.

## Setup & Scripts

Install dependencies:
```bash
npm install
```

Available scripts from `package.json`:
- `npm run dev`: Starts the local development server on port 3000
- `npm run build`: Generates the production build
- `npm run start`: Runs the built production server
- `npm run lint`: Runs ESLint across the codebase

## Source Map (`src/`)

- `src/app/`: Application routes, route groups (`(auth)`, `(onboarding)`, `(protected)`), and root layout
- `src/components/`: Reusable UI elements (`components/ui`) and page layouts (`components/common`)
- `src/data/`: Centralized application mock data and data helpers (`data/mock-workspaces.ts`)
- `src/lib/`: Shared utilities and validation schemas (`lib/validation/password.ts`)
- `src/types/`: Centralized TypeScript domain types (`types/workspace.ts`)

## Documentation

- [Architecture](docs/architecture.md): Route groups, shells, layouts, page patterns, and mock service layer
- [Design System](docs/design-system.md): Tailwind v4 tokens, semantic usage, UI primitives, and styling rules
- [Forms & Validation](docs/forms-and-validation.md): React Hook Form + Zod patterns, multi-step steppers, and form inventory
- [Project Status & Backlog](docs/status.md): Actionable gap checklist across security, forms, accessibility, and stubs

## Status / Known Gaps

- Backend APIs are not connected; all workflows currently operate against in-memory mock services.
- Multi-language localization (`next-intl`) is installed but not wired up.
- Root route error and loading boundaries (`error.tsx`, `loading.tsx`, `not-found.tsx`) are missing.
- Unit and end-to-end testing frameworks are not installed or configured.
- See [docs/status.md](docs/status.md) for the complete backlog.
