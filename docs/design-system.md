# Design System

Tokens, semantic colors, UI primitives, and styling conventions for FelOps.

## Token Configuration

Tokens are defined directly in `src/app/globals.css` using Tailwind CSS v4's native `@theme` directive. There is no `tailwind.config.ts`. Do not add one.

### Font Family
- `--font-sans`: `var(--font-plus-jakarta), "Inter", sans-serif`

### Typography Scale
| Token | Font Size | Line Height |
| :--- | :--- | :--- |
| `text-xs` | 12px | 16px |
| `text-s` | 14px | 20px |
| `text-m` | 15px | 22px |
| `text-l` | 16px | 24px |
| `text-xl` | 18px | 26px |
| `text-1xl` | 20px | 28px |
| `text-2xl` | 24px | 32px |
| `text-3xl` | 30px | 38px |
| `text-4xl` | 36px | 44px |

### Color Token Families (50–950)
- `primary`: Orange brand accent (50: `#fff3eb` to 950: `#3d1800`, base 500: `#ff6400`).
- `secondary`: Deep blue brand scale (50: `#eff1fa` to 950: `#0e132f`, base 500: `#495cca`).
- `secondary2`: Warm amber/yellow utility (50: `#fffaeb` to 950: `#3d2d00`, base 500: `#ffc114`).
- `neutral`: Grayscale surface and text tones (50: `#f5f5f5` to 950: `#1f1f1f`, base 500: `#8a8a8a`).
- `wrong`: Destructive and error states (50: `#fffafa` to 950: `#3d0000`, base 500: `#fe1d1d`).
- `right`: Success and confirmation states (50: `#ebfff1` to 950: `#003d14`, base 500: `#14ff63`).

## Semantic Color Usage

- **Dark Application Shell**: Outer canvas uses `bg-secondary-950` with primary text in `text-secondary-50` and subdued text in `text-neutral-400`.
- **Wizard Form Cards**: Creation wizards use a light surface `bg-neutral-50` with `border-neutral-200` to isolate complex multi-input forms.
- **Primary Actions**: Key buttons and active links use `bg-secondary-500 hover:bg-secondary-600 text-secondary-50`.
- **Destructive / Error**: Validation errors, destructive modals, and failed statuses use `wrong-400`, `wrong-500`, or `bg-wrong-500/10`.
- **Success**: Verified OTPs, active status pills, and completion indicators use `right-500` or `bg-right-500/10`.
- **Warning / Processing**: In-progress document ingestion states use `secondary2-500` or `bg-secondary2-500/10`.

## Shared UI Components

- `src/components/common/`:
  - `SplitLayout.tsx`: Two-column auth/onboarding layout with brand graphic.
  - `BaseCard.tsx`: Centered dark auth card with standard responsive padding.
- `src/components/ui/`:
  - Primitives: `Button`, `Input`, `Label`, `Alert`, `Card`, `Modal`.
  - **Important**: `src/components/ui/` currently has no importers across the project and is hardcoded exclusively for dark backgrounds.

## Rules for New Code

1. Use semantic token classes exclusively (`text-secondary-50`, `bg-neutral-50`).
2. Do not use raw hex codes (e.g., `#F4F4F6`, `#6366F1`) inside class strings.
3. Do not use default Tailwind palette classes (`slate-*`, `zinc-*`, `blue-*`).
4. Avoid hardcoded `bg-white` and `text-white`; use design system tokens (`bg-neutral-50`, `text-secondary-50`).
5. Avoid arbitrary brackets (`w-[380px]`) unless strictly required for third-party geometry.

## Status / Known Gaps

- Hardcoded `bg-white`, `bg-white/60`, and `text-white` persist in `add-knowledge-form.tsx`, `KnowledgeStep.tsx`, `ReviewStep.tsx`, and `KnowledgeActionModal.tsx`.
- `src/components/ui/` primitives remain unused and lack light-surface support.
- Modals are implemented three separate times (`VerifyOtpModal`, `KnowledgeActionModal`, and `ui/modal`).
- Arbitrary classes remain (`text-[11px]`, `min-w-[600px]`, `min-h-[140px]`, `max-h-[380px]`, `max-w-[540px]`, `rounded-[24px]`, `left-[29px] top-[48px]`).
- Subdued labels using `text-neutral-400` or `text-secondary-400` suffer low contrast on `bg-neutral-50`.
- `animate-in`, `fade-in`, and `zoom-in-95` classes are referenced in modals but the animation package is not installed.
- Scrollbar utilities (`scrollbar-thin`, `scrollbar-thumb-*`) are used in `ActionsStep` without a supporting plugin.
- Duplicate `--error-200` token exists alongside `--color-wrong-200` in `globals.css`.
- Table header `<th>` cells in `knowledge-table.tsx` lack dedicated typography token classes.
- Sidebar widths diverge (`WorkspaceSidebarFallback` is `w-80`, `WorkspaceSidebar` is `w-70`, `AgentSidebar` is `w-80`).
- See [status.md](status.md) for remediation tracking.
