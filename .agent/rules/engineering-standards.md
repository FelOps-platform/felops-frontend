# FelOps Engineering Standards

Workspace rules for all Antigravity agents working in the FelOps frontend repository.

## Framework & Version Rules
- **Next.js 16 App Router & React 19**: Conventions differ from legacy Next.js. See `AGENTS.md` and check `node_modules/next/dist/docs/` before writing framework code.
- **Server Components**: Default to Server Components. Keep `"use client"` leaf-level.
- **Page Pattern**: Server `page.tsx` awaits `params` inside a `<Suspense>` boundary and passes `workspaceId` to client views.

## Styling & Design System
- **Design Tokens**: All styling must use design tokens defined in `src/app/globals.css` (`@theme`).
- **Token Families**: `primary`, `secondary`, `secondary2`, `neutral`, `wrong`, `right`.
- **No Hardcoded Hex**: Never use raw hex values (e.g. `#fff`, `#000`, `#111827`, `#4F46E5`) in component classes or inline styles.
- **Tailwind Setup**: Tailwind CSS v4 is used without `tailwind.config.ts`. Do not create or reference one.

## Forms & Validation
- **Libraries**: `react-hook-form` + `@hookform/resolvers/zod` + `zod` 4.
- **Domain Schemas**: Place domain Zod schemas in `src/features/<domain>/schema.ts` as the Single Source of Truth (or colocated in `schemas/` only for route-only forms not yet migrated to a feature module).
- **Types**: Derive form types using `z.infer<typeof schema>`.
- **Submit State**: Disable buttons and show loading spinners when `isSubmitting` is true.
- **Error Handling**: Type catch blocks with `error: unknown` and narrow safely using domain `ApiError` subclasses (from `src/lib/api/errors.ts`) and domain error mappers.

## Accessibility (a11y)
- **Labels**: Every input and textarea must have an explicit `<label>` with `htmlFor` matching the input `id`.
- **Autocomplete**: Standard inputs must have appropriate `autoComplete` attributes.
- **Interactive Elements**: Use semantic `<button>` or `<Link>`/`<a>`. Never use `<div>` or `<span>` with click handlers.

## State Completeness
Async screens and interactive lists must implement all four UI states:
1. **Loading**: Skeleton or loading spinner.
2. **Empty**: Clear explanation with action CTA.
3. **Error**: Informative message with retry CTA.
4. **Success**: Rendered data and responsive actions.

## Code Quality & Architecture
- **No `console.log`**: Never commit `console.log`. Use `console.error` only inside error handlers/catch blocks.
- **Component Reuse**: Check `src/components/common` and `src/components/ui` before creating new UI components. Extend existing components for light surfaces if needed.
- **Feature Domain Layer (SSOT)**: Domain types (`types.ts`), Zod validation schemas (`schema.ts`), DTO & error mappers (`mappers.ts`), and async services (`service.ts`) live in `src/features/<domain>/` and are exported through `src/features/<domain>/index.ts`.
- **Shared Errors & Mock Services**: Base `ApiError` lives in `src/lib/api/errors.ts`. Feature services under `src/features/<domain>/service.ts` return typed mock data with TODO markers for future API integration.
- **TypeScript**: Strict mode. No `any`. Domain models belong in `src/features/<domain>/types.ts`; shared cross-domain types live in `src/types/`.
