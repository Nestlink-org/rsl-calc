# Implementation Plan: ResultShield Lite™

## Overview

Implement a 3D calculator device UI for fraud detection cost calculation in medical insurance claims. The app is a pure client-side Next.js 16 (App Router) SPA with TypeScript, Tailwind CSS v4, shadcn/ui, and next-themes.

## Tasks

- [x] 1. Project setup and configuration
  - Install dependencies: `next-themes`, `fast-check`, `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
  - Install shadcn/ui CLI and initialise: `npx shadcn@latest init` (select App Router, TypeScript, Tailwind CSS v4)
  - Add shadcn/ui `slider` and `tooltip` components: `npx shadcn@latest add slider tooltip`
  - Configure Vitest in `vitest.config.ts` with jsdom environment and path aliases matching `tsconfig.json`
  - Add `globals.css` with Tailwind v4 `@import "tailwindcss"` and CSS custom properties for brand colors (`--color-green: #67D55E`, `--color-blue: #01B3F7`)
  - _Requirements: 4.1–4.3, 7.5, 7.6, 9.1_

- [x] 2. Shared types (`lib/types.ts`)
  - [x] 2.1 Define and export `InputValues`, `SliderValues`, `CalculatorOutputs`, `PowerState` interfaces and types
    - Include `DEFAULT_SLIDERS` and `EMPTY_INPUTS` constants
    - _Requirements: 1.1–1.7, 2.1–2.5, 4.1–4.3, 6.1_

- [x] 3. Calculation engine (`lib/calculations.ts`)
  - [x] 3.1 Implement `resolveAnnualClaimsSpend(inputs: InputValues): number`
    - Derive spend from `numClaims × avgClaimSize` when `annualClaimsSpend` is empty
    - Guard division-by-zero cases; return `0` for all-empty or two-or-more-empty inputs
    - _Requirements: 2.1–2.5_
  - [x] 3.2 Implement `calculate(inputs: InputValues, sliders: SliderValues): CalculatorOutputs`
    - Apply `Math.round` to all outputs; guard non-finite inputs with `isFinite()` returning all-zero outputs
    - _Requirements: 1.1–1.7_
  - [ ]\* 3.3 Write property tests for `resolveAnnualClaimsSpend` and `calculate` (`lib/calculations.test.ts`)
    - **Property 1: Calculation pipeline correctness** — `fc.integer` for spend (0–999999999999), `fc.float` for rates in valid ranges — **Validates: Requirements 1.1, 1.2, 1.3**
    - **Property 2: Outputs are whole numbers** — same arbitraries as P1 — **Validates: Requirements 1.4**
    - **Property 3: Derived spend from numClaims × avgClaimSize** — `fc.integer` for positive numClaims and avgClaimSize — **Validates: Requirements 2.1**
    - **Property 4: Derived numClaims from spend ÷ avgClaimSize** — `fc.integer` for positive spend and avgClaimSize — **Validates: Requirements 2.2**
    - **Property 5: Derived avgClaimSize from spend ÷ numClaims** — `fc.integer` for positive spend and numClaims — **Validates: Requirements 2.3**
    - **Property 6: Non-finite inputs produce zero outputs** — `fc.constantFrom(NaN, Infinity, -Infinity)` — **Validates: Requirements 1.6**
    - Include unit tests for zero inputs, all-empty inputs, large values near 999,999,999,999, and division-by-zero guards

- [x] 4. Formatting utilities (`lib/formatting.ts`)
  - [x] 4.1 Implement `formatKES(value: number): string` returning `"KES 1,234,567"` format
    - Implement `formatInputDisplay(raw: string): string` returning comma-separated display string
    - Implement `parseInputValue(formatted: string): number` stripping commas and returning `Number()`
    - Implement `formatSliderPercent(value: number): string` returning e.g. `"20%"` from `0.20`
    - _Requirements: 3.1–3.5, 4.5, 5.2_
  - [ ]\* 4.2 Write property tests for formatting utilities (`lib/formatting.test.ts`)
    - **Property 7: Input sanitization strips non-numeric characters** — `fc.string()` arbitrary — **Validates: Requirements 3.2, 3.5**
    - **Property 8: KES output formatting** — `fc.integer({ min: 0, max: 999999999999 })` — **Validates: Requirements 5.2**
    - **Property 9: Slider percentage display formatting** — `fc.float({ min: 0.10, max: 0.30 })` — **Validates: Requirements 4.5**
    - Include unit tests for zero display ("0" not blank), paste sanitization, and integer-only enforcement for numClaims

- [x] 5. Checkpoint — Ensure all lib tests pass
  - Run `vitest --run lib/` and confirm all calculation and formatting tests pass; resolve any failures before continuing.

- [x] 6. ThemeToggle component and ThemeProvider setup
  - [x] 6.1 Wrap `app/layout.tsx` with `next-themes` `ThemeProvider` (attribute="class", defaultTheme="system", enableSystem)
    - Add `suppressHydrationWarning` to `<html>` element
    - _Requirements: 9.1, 9.3_
  - [x] 6.2 Implement `components/calculator/ThemeToggle.tsx`
    - Use `useTheme()` hook; render sun/moon icon button toggling between `"light"` and `"dark"`
    - Include `aria-label` for accessibility
    - _Requirements: 9.2, 9.4_

- [x] 7. PowerButton component (`components/calculator/PowerButton.tsx`)
  - Render a circular button accepting `power: PowerState` and `onToggle: () => void` props
  - Apply CSS `scale(0.92) translateY(2px)` press animation lasting 150ms on click
  - Disable the button (pointer-events-none) while `power === 'booting'`
  - _Requirements: 6.1, 6.2, 7.4_

- [x] 8. Screen component (`components/calculator/Screen.tsx`)
  - [x] 8.1 Implement three render states: blank/dark for `'off'`, boot text "ResultShield Lite™" for `'booting'`, outputs + tagline for `'on'`
    - Accept `power: PowerState` and `outputs: CalculatorOutputs` props
    - _Requirements: 5.5, 6.2, 6.3_
  - [x] 8.2 Render `Estimated_Leakage`, `Recoverable_Savings`, and `ResultShield_Share` using `formatKES()`
    - Apply CSS opacity + translateY transition (max 400ms) on output value changes
    - Render the tagline: "We're not asking you to believe this — we're asking you to let us prove it using your own data."
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 9. InputPanel component (`components/calculator/InputPanel.tsx`)
  - Accept `values: InputValues` and `onChange: (field: keyof InputValues, raw: string) => void` props
  - Each field displays `formatInputDisplay(raw)` and strips non-numeric characters on input via `parseInputValue`
  - Enforce integer-only for `numClaims` (strip decimals); show "0" when value is zero
  - Handle paste events by stripping non-numeric characters
  - _Requirements: 3.1–3.5_

- [x] 10. SliderPanel component (`components/calculator/SliderPanel.tsx`)
  - Accept `values: SliderValues` and `onChange: (field: keyof SliderValues, value: number) => void` props
  - Render three shadcn/ui `<Slider />` components for `leakageRate` (15–25%), `detectionRate` (40–60%), `savingsShare` (10–30%) with correct min/max/step/default
  - Display current percentage via `formatSliderPercent()` adjacent to each slider
  - Wrap each slider label in a shadcn/ui `<Tooltip />` with a description of the assumption
  - _Requirements: 4.1–4.6_

- [x] 11. Calculator shell (`components/calculator/Calculator.tsx`)
  - [x] 11.1 Implement `PowerState` transitions: off → booting (setTimeout 1500ms) → on → off
    - Initialise `power` as `'off'` on page load
    - Derive `CalculatorOutputs` via `useMemo(() => calculate(inputs, sliders), [inputs, sliders])`
    - _Requirements: 6.1–6.6_
  - [x] 11.2 Render the 3D device shell
    - Apply CSS box-shadow depth layering, rounded edges, and glossy border highlight
    - Render green LED indicator (`#67D55E`) when `power === 'on'`, dark/inactive otherwise
    - Use `#67D55E` for savings outputs and `#01B3F7` for input fields and interactive controls
    - _Requirements: 7.1–7.6_
  - [x] 11.3 Compose `<Screen />`, `<InputPanel />`, `<SliderPanel />`, `<PowerButton />`, and `<ThemeToggle />` inside the shell
    - Wire all `onChange` handlers to update `Calculator` state
    - _Requirements: 5.1, 4.4_
  - [ ]\* 11.4 Write property tests for power state machine (`components/calculator/Calculator.test.tsx`)
    - **Property 10: Power state machine transitions** — `fc.constantFrom('off', 'booting', 'on')` — **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 5.5**
    - Include unit tests: initial state is `'off'`, boot timer fires after 1500ms, button disabled during booting, LED active only when `'on'`

- [x] 12. Page and layout wiring
  - [x] 12.1 Update `app/layout.tsx`
    - Import and apply `ThemeProvider`; set font (e.g. `next/font/google` Inter or Geist); apply `globals.css`
    - Export `metadata` with `title: "ResultShield Lite™ | Medical Claims Fraud Savings Calculator"`, `description`, and OpenGraph tags (`og:title`, `og:description`, `og:type`)
    - _Requirements: 10.1, 10.2, 10.3_
  - [x] 12.2 Update `app/page.tsx` to render `<Calculator />` centered on the page
    - _Requirements: 8.1–8.4_
  - [x] 12.3 Create `app/sitemap.ts` exporting a default function returning a valid Next.js sitemap array
    - Create `app/robots.ts` exporting a default function returning a valid Next.js robots config
    - _Requirements: 10.4, 10.5_

- [x] 13. Responsive layout and theme polish
  - Apply mobile-first Tailwind classes: full viewport width below 768px, `max-w-[480px] mx-auto` at 768px and above
  - Verify no horizontal scrollbars at 320px viewport width
  - Apply light/dark theme color tokens to all components (backgrounds, text, borders) using Tailwind `dark:` variants
  - _Requirements: 8.1–8.4, 9.2_

- [x] 14. Final checkpoint — Ensure all tests pass
  - Run `vitest --run` and confirm all tests pass; resolve any failures before considering the feature complete.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check with `{ numRuns: 100 }` and the tag format `// Feature: resultshield-lite, Property N: <text>`
- Read `node_modules/next/dist/docs/` before writing any Next.js 16 code — breaking changes apply
- Tailwind CSS v4 uses `@import "tailwindcss"` in CSS, not a `tailwind.config.js` file
