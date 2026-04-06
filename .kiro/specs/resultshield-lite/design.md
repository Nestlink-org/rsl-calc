# Design Document: ResultShield Lite™

## Overview

ResultShield Lite™ is a single-page Next.js 16 (App Router) application that renders a 3D-styled calculator device UI for computing fraud detection savings in medical insurance claims. It is a pure client-side tool — no backend, no API calls, no persistence. All computation happens in the browser via a pure TypeScript calculation engine.

The application targets operations managers using it during live sales pitches. The premium physical-device aesthetic (3D shadows, boot sequence, LED indicator, button press animations) is a core product differentiator, not decoration.

**Tech stack:**

- Next.js 16.2.2 with App Router and React Compiler
- React 19
- Tailwind CSS v4 (PostCSS plugin, no config file)
- shadcn/ui (for accessible slider and tooltip primitives)
- next-themes (light/dark mode)
- TypeScript 5 (strict mode)

---

## Architecture

The application is a single route (`/`) rendered entirely on the client. The page component is a Client Component that owns all state. There is no server-side data fetching.

```
app/
  layout.tsx          ← metadata, ThemeProvider, font setup
  page.tsx            ← root page, renders <Calculator />
  globals.css         ← Tailwind v4 @import, CSS custom properties
  sitemap.ts          ← Next.js sitemap generation
  robots.ts           ← Next.js robots generation

components/
  calculator/
    Calculator.tsx         ← top-level device shell (3D body, LED, power button)
    Screen.tsx             ← display area (boot sequence, outputs, tagline)
    InputPanel.tsx         ← three numeric input fields
    SliderPanel.tsx        ← three assumption sliders
    PowerButton.tsx        ← toggle button with press animation
    ThemeToggle.tsx        ← light/dark mode toggle
  ui/                      ← shadcn/ui primitives (Slider, Tooltip, etc.)

lib/
  calculations.ts     ← pure calculation engine (no React)
  formatting.ts       ← KES number formatting utilities
  types.ts            ← shared TypeScript types/interfaces
```

### Data Flow

```
User interaction
      │
      ▼
Calculator.tsx  (useState: inputs, sliders, powerState)
      │
      ├─► InputPanel.tsx  (controlled inputs → onChange → parent state)
      │
      ├─► SliderPanel.tsx (controlled sliders → onChange → parent state)
      │
      └─► lib/calculations.ts  (pure function: inputs + sliders → outputs)
                │
                ▼
          Screen.tsx  (receives outputs as props, renders formatted values)
```

State lives entirely in `Calculator.tsx`. All child components are controlled. The calculation engine is called on every render cycle via `useMemo` — no `useEffect` needed for computation.

---

## Components and Interfaces

### `Calculator.tsx`

The root client component. Owns all application state.

```typescript
type PowerState = "off" | "booting" | "on";

interface CalculatorState {
  power: PowerState;
  inputs: InputValues;
  sliders: SliderValues;
}
```

Responsibilities:

- Manages `PowerState` transitions: off → booting (1500ms timer) → on → off
- Derives `CalculatorOutputs` via `useMemo(() => calculate(inputs, sliders), [inputs, sliders])`
- Renders the 3D device shell with CSS box-shadow depth layering
- Renders LED indicator (green when `power === 'on'`, dark otherwise)
- Passes derived outputs to `<Screen />`

### `Screen.tsx`

```typescript
interface ScreenProps {
  power: PowerState;
  outputs: CalculatorOutputs;
}
```

Renders three states:

1. `power === 'off'` → blank/dark display
2. `power === 'booting'` → "ResultShield Lite™" boot text centered
3. `power === 'on'` → output values + tagline

Output values animate on change using CSS transitions (opacity + slight translateY). The tagline is always visible when powered on.

### `InputPanel.tsx`

```typescript
interface InputPanelProps {
  values: InputValues;
  onChange: (field: keyof InputValues, raw: string) => void;
}
```

Three fields: `annualClaimsSpend`, `numClaims`, `avgClaimSize`. Each field:

- Stores raw numeric string internally, displays comma-formatted value
- Strips non-numeric characters on input (integers only for `numClaims`)
- Shows "0" when value is zero, not blank

### `SliderPanel.tsx`

```typescript
interface SliderPanelProps {
  values: SliderValues;
  onChange: (field: keyof SliderValues, value: number) => void;
}
```

Three sliders with shadcn/ui `<Slider />` primitive. Each slider:

- Displays current percentage value adjacent to the control
- Has a shadcn/ui `<Tooltip />` on the label (hover/focus)
- Updates outputs in real time via controlled state

### `PowerButton.tsx`

```typescript
interface PowerButtonProps {
  power: PowerState;
  onToggle: () => void;
}
```

Renders a circular button. On press: CSS `scale(0.92)` + `translateY(2px)` transition lasting 150ms. Disabled during `'booting'` state to prevent double-press.

### `ThemeToggle.tsx`

Uses `next-themes` `useTheme()` hook. Renders a sun/moon icon button. Accessible with `aria-label`.

---

## Data Models

### Input Types

```typescript
// lib/types.ts

export interface InputValues {
  annualClaimsSpend: string; // raw numeric string, empty = not provided
  numClaims: string;
  avgClaimSize: string;
}

export interface SliderValues {
  leakageRate: number; // 0.15–0.25, default 0.20
  detectionRate: number; // 0.40–0.60, default 0.50
  savingsShare: number; // 0.10–0.30, default 0.20
}

export interface CalculatorOutputs {
  estimatedLeakage: number;
  recoverableSavings: number;
  resultShieldShare: number;
  derivedAnnualClaimsSpend: number | null; // non-null when derived from numClaims × avgClaimSize
}

export type PowerState = "off" | "booting" | "on";
```

### Default Values

```typescript
export const DEFAULT_SLIDERS: SliderValues = {
  leakageRate: 0.2,
  detectionRate: 0.5,
  savingsShare: 0.2,
};

export const EMPTY_INPUTS: InputValues = {
  annualClaimsSpend: "",
  numClaims: "",
  avgClaimSize: "",
};
```

### Calculation Engine (`lib/calculations.ts`)

Pure functions with no side effects or React dependencies.

```typescript
export function resolveAnnualClaimsSpend(inputs: InputValues): number;
export function calculate(
  inputs: InputValues,
  sliders: SliderValues,
): CalculatorOutputs;
```

**`resolveAnnualClaimsSpend` logic:**

1. If `annualClaimsSpend` is provided → parse and return it
2. Else if `numClaims` and `avgClaimSize` are both provided → return `numClaims × avgClaimSize`
3. Else if `annualClaimsSpend` is empty and `avgClaimSize` is provided and `numClaims` is empty → cannot derive, return 0
4. Else → return 0

**`calculate` logic:**

1. Resolve `annualClaimsSpend` via `resolveAnnualClaimsSpend`
2. Guard: if resolved spend is not a finite positive number → return all-zero outputs
3. `estimatedLeakage = Math.round(annualClaimsSpend × leakageRate)`
4. `recoverableSavings = Math.round(estimatedLeakage × detectionRate)`
5. `resultShieldShare = Math.round(recoverableSavings × savingsShare)`

**Overflow/precision:** All inputs are parsed with `Number()`. Values up to 999,999,999,999 are safely representable as IEEE 754 doubles (max safe integer is ~9 × 10¹⁵). No BigInt needed.

### Formatting (`lib/formatting.ts`)

```typescript
export function formatKES(value: number): string;
// Returns "KES 1,234,567" for outputs

export function formatInputDisplay(raw: string): string;
// Returns "1,000,000" for input field display

export function parseInputValue(formatted: string): number;
// Strips commas, returns Number(); returns 0 for non-numeric
```

---

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Calculation pipeline correctness

_For any_ valid `Annual_Claims_Spend` (0 to 999,999,999,999), `Leakage_Rate` (0.15–0.25), `Detection_Rate` (0.40–0.60), and `Savings_Share` (0.10–0.30), calling `calculate()` should produce:

- `estimatedLeakage = Math.round(annualClaimsSpend × leakageRate)`
- `recoverableSavings = Math.round(estimatedLeakage × detectionRate)`
- `resultShieldShare = Math.round(recoverableSavings × savingsShare)`

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Outputs are whole numbers

_For any_ valid inputs, all numeric outputs returned by `calculate()` should be integers (i.e., `value === Math.floor(value)` for all output fields).

**Validates: Requirements 1.4**

### Property 3: Derived spend from num_claims × avg_claim_size

_For any_ positive `numClaims` and `avgClaimSize`, when `annualClaimsSpend` is empty, `resolveAnnualClaimsSpend()` should return `numClaims × avgClaimSize`.

**Validates: Requirements 2.1**

### Property 4: Derived num_claims from spend ÷ avg_claim_size

_For any_ positive `annualClaimsSpend` and `avgClaimSize > 0`, when `numClaims` is empty, `resolveAnnualClaimsSpend()` used in the derivation path should yield `floor(annualClaimsSpend / avgClaimSize)` as the effective claim count.

**Validates: Requirements 2.2**

### Property 5: Derived avg_claim_size from spend ÷ num_claims

_For any_ positive `annualClaimsSpend` and `numClaims > 0`, when `avgClaimSize` is empty, the derived average claim size should equal `Math.round(annualClaimsSpend / numClaims)`.

**Validates: Requirements 2.3**

### Property 6: Non-finite inputs produce zero outputs

_For any_ input set where at least one value is `NaN`, `Infinity`, or `-Infinity`, `calculate()` should return zero for all outputs without throwing.

**Validates: Requirements 1.6**

### Property 7: Input sanitization strips non-numeric characters

_For any_ string input, the sanitization function should return a string containing only digit characters (0–9), with all other characters removed.

**Validates: Requirements 3.2, 3.5**

### Property 8: KES output formatting

_For any_ non-negative integer `n`, `formatKES(n)` should return a string that starts with `"KES "` and whose numeric portion uses comma separators consistent with standard thousands grouping.

**Validates: Requirements 5.2**

### Property 9: Slider percentage display formatting

_For any_ slider value in its valid range (expressed as a decimal, e.g., 0.20), the display formatter should return the value multiplied by 100 as a whole number followed by `"%"` (e.g., `"20%"`).

**Validates: Requirements 4.5**

### Property 10: Power state machine transitions

_For any_ initial power state, the state machine should satisfy:

- Toggling from `'off'` transitions to `'booting'`
- After the boot delay, `'booting'` transitions to `'on'`
- Toggling from `'on'` transitions to `'off'`
- The screen renders no output values when power is `'off'`
- The LED indicator is active only when power is `'on'`

**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 5.5**

---

## Error Handling

Since this is a pure client-side calculation tool with no network calls or async operations, error handling is focused on input validation and numeric edge cases.

**Invalid numeric inputs:**

- Non-numeric strings → sanitized to empty string before parsing; `parseInputValue` returns `0`
- `NaN` / `Infinity` from `Number()` → `calculate()` guards with `isFinite()` check, returns all-zero outputs
- Negative values → treated as zero (no negative claims spend is meaningful)
- Division by zero in derivation (e.g., `avgClaimSize = 0` when deriving `numClaims`) → guarded by `> 0` check, returns `0`

**Power state:**

- Double-press during boot sequence → `PowerButton` is disabled while `power === 'booting'`
- No async errors possible (no timers that can fail; `setTimeout` for boot is fire-and-forget)

**Theme system:**

- `next-themes` handles SSR hydration mismatch via `suppressHydrationWarning` on `<html>`. The `ThemeProvider` must wrap the app in `layout.tsx`.

**No error boundaries needed** — there are no async data fetches, no dynamic imports, and no operations that can throw at runtime given the input guards above.

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required. They are complementary:

- Unit tests cover specific examples, edge cases, and integration points
- Property tests verify universal correctness across all valid inputs

### Property-Based Testing

**Library:** [fast-check](https://github.com/dubzzz/fast-check) — the standard PBT library for TypeScript/JavaScript.

**Configuration:** Each property test runs a minimum of 100 iterations (fast-check default is 100; set explicitly via `{ numRuns: 100 }`).

**Tag format for each test:**

```
// Feature: resultshield-lite, Property N: <property_text>
```

Each correctness property from the design document maps to exactly one property-based test:

| Property                      | Test file                                   | fast-check arbitraries   |
| ----------------------------- | ------------------------------------------- | ------------------------ |
| P1: Calculation pipeline      | `lib/calculations.test.ts`                  | `fc.float`, `fc.integer` |
| P2: Outputs are whole numbers | `lib/calculations.test.ts`                  | same as P1               |
| P3: Derived spend             | `lib/calculations.test.ts`                  | `fc.integer`             |
| P4: Derived num_claims        | `lib/calculations.test.ts`                  | `fc.integer`             |
| P5: Derived avg_claim_size    | `lib/calculations.test.ts`                  | `fc.integer`             |
| P6: Non-finite inputs → zero  | `lib/calculations.test.ts`                  | `fc.constant(NaN)`, etc. |
| P7: Input sanitization        | `lib/formatting.test.ts`                    | `fc.string`              |
| P8: KES formatting            | `lib/formatting.test.ts`                    | `fc.integer`             |
| P9: Slider % display          | `lib/formatting.test.ts`                    | `fc.float`               |
| P10: Power state machine      | `components/calculator/Calculator.test.tsx` | `fc.constantFrom`        |

### Unit Tests

Unit tests focus on:

- **Specific examples:** zero inputs → zero outputs, all-empty inputs → zero outputs, initial power state is `'off'`
- **Edge cases:** `avgClaimSize = 0` division guard, `numClaims = 0` division guard, large values near 999,999,999,999
- **Integration:** `InputPanel` correctly calls `onChange` with sanitized values; `Screen` renders tagline when powered on
- **Metadata:** `layout.tsx` exports correct `title`, `description`, and OpenGraph tags
- **SEO files:** `sitemap.ts` and `robots.ts` return valid structures

### Test Runner

**Vitest** is the recommended test runner (fast, native ESM, TypeScript support, compatible with Next.js 16). Run with:

```
vitest --run
```

Test files live alongside their source:

```
lib/calculations.test.ts
lib/formatting.test.ts
components/calculator/Calculator.test.tsx
app/metadata.test.ts
```
