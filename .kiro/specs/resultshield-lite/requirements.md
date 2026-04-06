# Requirements Document

## Introduction

ResultShield Lite™ is a sales intelligence tool for operations managers to demonstrate the financial impact of fraud detection in medical insurance claims. It presents as a premium, 3D-styled calculator device UI that takes insurer-provided claim data, applies configurable fraud/leakage detection assumptions, and outputs persuasive financial insights to help close deals.

The application is a Next.js 16 (App Router) single-page application using Tailwind CSS v4, shadcn/ui, and next-themes. It requires no backend for MVP.

## Glossary

- **Calculator**: The ResultShield Lite™ UI component that accepts inputs and displays outputs
- **Annual_Claims_Spend**: The total KES value of insurance claims processed per year, entered by the user
- **Num_Claims**: The number of insurance claims processed per year, entered by the user
- **Avg_Claim_Size**: The average KES value per claim, entered by the user
- **Leakage_Rate**: The assumed percentage of claims spend lost to fraud/leakage (range: 15%–25%, default: 20%)
- **Detection_Rate**: The assumed percentage of leakage that can be detected and recovered (range: 40%–60%, default: 50%)
- **Savings_Share**: The percentage of recoverable savings attributed to ResultShield (range: 10%–30%, default: 20%)
- **Estimated_Leakage**: Computed as `Annual_Claims_Spend × Leakage_Rate`
- **Recoverable_Savings**: Computed as `Estimated_Leakage × Detection_Rate`
- **ResultShield_Share**: Computed as `Recoverable_Savings × Savings_Share`
- **Calculation_Engine**: The module in `/lib` responsible for all financial computations
- **Calculator_UI**: The React component rendering the 3D calculator device interface
- **Power_System**: The on/off state machine controlling the calculator's active state
- **Screen**: The display area within the Calculator_UI showing inputs summary and outputs
- **Theme_System**: The next-themes integration managing light/dark mode

---

## Requirements

### Requirement 1: Core Financial Calculations

**User Story:** As an operations manager, I want the calculator to compute fraud savings estimates from my claim data, so that I can show insurers a credible financial case.

#### Acceptance Criteria

1. WHEN `Annual_Claims_Spend`, `Leakage_Rate` are provided, THE `Calculation_Engine` SHALL compute `Estimated_Leakage` as `Annual_Claims_Spend × Leakage_Rate`
2. WHEN `Estimated_Leakage` and `Detection_Rate` are provided, THE `Calculation_Engine` SHALL compute `Recoverable_Savings` as `Estimated_Leakage × Detection_Rate`
3. WHEN `Recoverable_Savings` and `Savings_Share` are provided, THE `Calculation_Engine` SHALL compute `ResultShield_Share` as `Recoverable_Savings × Savings_Share`
4. THE `Calculation_Engine` SHALL return results as numeric values rounded to the nearest whole KES
5. IF any input value is zero, THEN THE `Calculation_Engine` SHALL return zero for all dependent outputs without throwing an error
6. IF any input value is not a finite number, THEN THE `Calculation_Engine` SHALL return zero for all outputs
7. THE `Calculation_Engine` SHALL accept `Annual_Claims_Spend` values up to 999,999,999,999 (one trillion minus one) KES without overflow or precision loss

---

### Requirement 2: Auto-Calculation of Missing Input

**User Story:** As an operations manager, I want the calculator to derive a missing input field when I provide the other two, so that I can work with partial data.

#### Acceptance Criteria

1. WHEN `Annual_Claims_Spend` is empty and both `Num_Claims` and `Avg_Claim_Size` are provided, THE `Calculation_Engine` SHALL compute `Annual_Claims_Spend` as `Num_Claims × Avg_Claim_Size`
2. WHEN `Num_Claims` is empty and both `Annual_Claims_Spend` and `Avg_Claim_Size` are provided and `Avg_Claim_Size` is greater than zero, THE `Calculation_Engine` SHALL compute `Num_Claims` as `floor(Annual_Claims_Spend ÷ Avg_Claim_Size)`
3. WHEN `Avg_Claim_Size` is empty and both `Annual_Claims_Spend` and `Num_Claims` are provided and `Num_Claims` is greater than zero, THE `Calculation_Engine` SHALL compute `Avg_Claim_Size` as `Annual_Claims_Spend ÷ Num_Claims` rounded to the nearest whole KES
4. IF all three input fields are empty, THEN THE `Calculation_Engine` SHALL return zero for all outputs
5. IF two or more input fields are empty, THEN THE `Calculation_Engine` SHALL return zero for all outputs without throwing an error

---

### Requirement 3: Input Validation and Formatting

**User Story:** As an operations manager, I want input fields to accept and display KES-formatted numbers, so that I can enter large values clearly and confidently.

#### Acceptance Criteria

1. WHEN a user types a numeric value into an input field, THE `Calculator_UI` SHALL display the value formatted with comma separators (e.g., 1,000,000)
2. WHEN a user enters a non-numeric character into an input field, THE `Calculator_UI` SHALL ignore the character and retain the previous valid value
3. WHEN an input field value is zero, THE `Calculator_UI` SHALL display "0" rather than a blank field
4. THE `Calculator_UI` SHALL accept integer values only for `Num_Claims`
5. IF a user pastes text containing non-numeric characters into an input field, THEN THE `Calculator_UI` SHALL strip non-numeric characters and retain only the numeric portion

---

### Requirement 4: Adjustable Assumption Sliders

**User Story:** As an operations manager, I want to adjust leakage, detection, and savings assumptions with sliders, so that I can tailor the estimate to each insurer's context.

#### Acceptance Criteria

1. THE `Calculator_UI` SHALL render a slider for `Leakage_Rate` with a minimum of 15%, maximum of 25%, and default of 20%
2. THE `Calculator_UI` SHALL render a slider for `Detection_Rate` with a minimum of 40%, maximum of 60%, and default of 50%
3. THE `Calculator_UI` SHALL render a slider for `Savings_Share` with a minimum of 10%, maximum of 30%, and default of 20%
4. WHEN a slider value changes, THE `Calculator_UI` SHALL update all output values in real time without requiring a form submission
5. THE `Calculator_UI` SHALL display the current percentage value of each slider adjacent to the slider control
6. WHERE a tooltip is supported by the device, THE `Calculator_UI` SHALL display a tooltip for each slider explaining its meaning when the user hovers or focuses the slider label

---

### Requirement 5: Real-Time Output Display

**User Story:** As an operations manager, I want to see the financial outputs update instantly as I change inputs, so that I can demonstrate live scenarios to insurers.

#### Acceptance Criteria

1. WHEN any input field or slider value changes, THE `Calculator_UI` SHALL recompute and display updated output values within 100ms
2. THE `Screen` SHALL display `Estimated_Leakage`, `Recoverable_Savings`, and `ResultShield_Share` each formatted as KES with comma separators (e.g., KES 1,234,567)
3. WHEN output values change, THE `Screen` SHALL animate the transition using a smooth numeric or fade transition lasting no more than 400ms
4. THE `Screen` SHALL display the persuasive statement: "We're not asking you to believe this — we're asking you to let us prove it using your own data."
5. WHILE the `Power_System` is in the OFF state, THE `Screen` SHALL display no output values

---

### Requirement 6: Power System and Boot Sequence

**User Story:** As an operations manager, I want the calculator to have a power on/off experience, so that the tool feels like a premium physical device during a pitch.

#### Acceptance Criteria

1. THE `Calculator_UI` SHALL render a POWER button that toggles the `Power_System` between ON and OFF states
2. WHEN the POWER button is pressed and the `Power_System` transitions to ON, THE `Screen` SHALL display a boot screen showing "ResultShield Lite™" for 1500ms before transitioning to the calculator interface
3. WHEN the POWER button is pressed and the `Power_System` transitions to OFF, THE `Screen` SHALL immediately go blank/dark
4. WHILE the `Power_System` is in the ON state, THE `Calculator_UI` SHALL display a green LED indicator
5. WHILE the `Power_System` is in the OFF state, THE `Calculator_UI` SHALL display no LED indicator or a dark/inactive LED indicator
6. WHEN the page first loads, THE `Power_System` SHALL be in the OFF state

---

### Requirement 7: 3D Calculator Device UI

**User Story:** As an operations manager, I want the calculator to look and feel like a premium physical device, so that it creates a strong impression during client pitches.

#### Acceptance Criteria

1. THE `Calculator_UI` SHALL render with a 3D appearance using CSS box shadows, highlights, and depth layering
2. THE `Calculator_UI` SHALL render with rounded edges on the calculator body
3. THE `Calculator_UI` SHALL apply a glossy/shiny edge effect to the calculator body border
4. WHEN a button within the `Calculator_UI` is pressed, THE `Calculator_UI` SHALL animate the button with a press/depress effect lasting no more than 150ms
5. THE `Calculator_UI` SHALL use `#67D55E` (green) as the primary color for success indicators and savings outputs
6. THE `Calculator_UI` SHALL use `#01B3F7` (blue) as the secondary color for input fields and interactive controls

---

### Requirement 8: Responsive Layout

**User Story:** As an operations manager, I want the calculator to work on both my phone and laptop, so that I can use it in any pitch setting.

#### Acceptance Criteria

1. THE `Calculator_UI` SHALL be designed mobile-first, with all controls reachable by thumb on screens 375px wide and above
2. WHILE the viewport width is 768px or greater, THE `Calculator_UI` SHALL be centered horizontally with a maximum width of 480px
3. WHILE the viewport width is less than 768px, THE `Calculator_UI` SHALL occupy the full viewport width
4. THE `Calculator_UI` SHALL render without horizontal scrollbars on viewports 320px wide and above

---

### Requirement 9: Theme Support (Light / Dark Mode)

**User Story:** As an operations manager, I want the calculator to support light and dark modes, so that it looks good in any lighting environment during a pitch.

#### Acceptance Criteria

1. THE `Theme_System` SHALL support light mode and dark mode using next-themes
2. WHEN the user toggles the theme, THE `Calculator_UI` SHALL update all colors and backgrounds to match the selected theme without a page reload
3. THE `Calculator_UI` SHALL default to the user's operating system color scheme preference on first load
4. THE `Calculator_UI` SHALL render a theme toggle control accessible from the main interface

---

### Requirement 10: SEO and Metadata

**User Story:** As a product owner, I want the application to be discoverable by search engines, so that prospects can find the tool online.

#### Acceptance Criteria

1. THE application SHALL export a Next.js `metadata` object with `title` set to "ResultShield Lite™ | Medical Claims Fraud Savings Calculator"
2. THE application SHALL export a Next.js `metadata` object with a `description` meta tag summarizing the tool's purpose
3. THE application SHALL include OpenGraph `og:title`, `og:description`, and `og:type` meta tags
4. THE application SHALL export a `sitemap.ts` file compatible with Next.js App Router sitemap generation
5. THE application SHALL export a `robots.ts` file compatible with Next.js App Router robots generation
