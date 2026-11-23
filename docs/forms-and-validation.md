# Forms and Validation

Form architectures, validation schemas, stepper coordination, and form audit inventory for FelOps.

## Standard Form Pattern

Standard forms pair `react-hook-form` with Zod schemas through `@hookform/resolvers/zod`:
1. Define schema and export inferred TypeScript type in a colocated `schemas/` file.
2. Initialize `useForm` with `zodResolver(schema)` and explicit `defaultValues`.
3. Bind inputs via `{...register("field")}`.
4. Render errors from `formState.errors`.

```tsx
// Pattern from src/app/(auth)/sign-in/page.tsx
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<SignInInput>({
  resolver: zodResolver(signInSchema),
  defaultValues: {
    email: "",
    password: "",
  },
  mode: "onTouched",
});
```

## Shared Schemas

- `src/lib/validation/password.ts`: Centralized `passwordSchema` enforcing 8+ characters, uppercase, lowercase, and numeric digits.
- `src/app/(auth)/schemas/auth.ts`: Auth schemas (`signInSchema`, `signUpSchema`, `forgotPasswordSchema`, `resetPasswordSchema`, `verifyOtpSchema`).
- `src/app/(onboarding)/schemas/workspace.ts`: `createWorkspaceSchema` validating workspace names (2–50 characters).
- `src/app/(protected)/w/[workspaceId]/agents/_components/agent-form.schema.ts`: `agentFormSchema` and `STEPS` configuration.

## Multi-Step Wizard Pattern

The Agent Creation wizard (`agents/new/page.tsx` + `agent-stepper.tsx`) implements a controlled stepper with shared form context:
- **Root Context**: A single `FormProvider` in `AgentStepperForm` wraps all 4 steps.
- **Step Field Triggers**: `STEPS` config specifies active fields per step (`fields: ["name", "instructions"]`).
- **Validation Guard**: `handleNext` calls `methods.trigger(currentStepConfig.fields)` before advancing.
- **Back-Only Navigation**: `handleStepClick` only permits jumping to steps strictly less than `currentStep`.
- **Single Submission**: Form dispatches to API only on the final step (`ReviewStep`).

## Application Form Inventory

| Form | File Path | RHF + Zod | Validation Mode | Submission Handling |
| :--- | :--- | :--- | :--- | :--- |
| Sign In | `(auth)/sign-in/page.tsx` | Yes | `onTouched` | Mock (`console.log`) |
| Sign Up | `(auth)/sign-up/page.tsx` | Yes | `onTouched` | Mock (`console.log` + OTP modal) |
| Forgot Password | `(auth)/forgot-password/page.tsx` | Yes | `onTouched` | Mock (`console.log` + OTP modal) |
| Reset Password | `(auth)/reset-password/page.tsx` | Yes | `onTouched` | Mock (`console.log` + redirect) |
| Create Workspace | `(onboarding)/workspaces/new/page.tsx` | No (`useState`) | `onSubmit` | Mock (generates slug + pushes route) |
| Create Agent | `agents/_components/agent-stepper.tsx` | Yes | `onSubmit` | Mock (`console.log`) |
| Add Knowledge | `knowledge/.../add-knowledge-form.tsx` | No (`useState`) | Manual step check | Mock (prepends to local array) |

## Status / Known Gaps

- `workspaces/new/page.tsx` uses manual `useState` and `safeParse` instead of `react-hook-form`.
- `add-knowledge-form.tsx` has no Zod schema and validates URLs using a custom regex function (`isValidUrl`).
- The 25MB file upload limit is displayed as text but never validated in code, and dropzone accepts any MIME type.
- Knowledge file source is stored as `file.name` and typed as `"PDF"`, causing table row links to open broken relative URLs.
- Agent wizard submission only executes `console.log` without error boundaries, success states, or route redirect.
- `KnowledgeStep` in the agent stepper is a static mockup; `knowledgeIds` is never populated.
- `ReviewStep` renders transformed action IDs (e.g., `act_slack_notify` -> `slack notify`) rather than action names.
- "Select All" in `ActionsStep` selects all workspace actions, ignoring the active search query filter.
- Untyped error handling (`catch (err: any)`) persists across 7 authentication handlers.
- `KnowledgeItem.type` and `KnowledgeItem.status` are defined as loose string unions without Zod parsing.
- Form validation modes diverge (`onTouched` in auth vs `onSubmit` in agent wizard).
- `verifyOtpSchema` is defined in `schemas/auth.ts` but unused; `VerifyOtpModal` relies on array checks.
- Form accessibility is incomplete: only 2 of 15 `<label>` tags provide `htmlFor`, and inputs lack `autoComplete`.
- Multiple `console.log` statements output sensitive data (passwords, email addresses, OTP codes).
- Password reset passes plaintext email via `?email=` parameter without cryptographically verifying the OTP token.
- See [status.md](status.md) for remediation tracking.
