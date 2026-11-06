# BuildCalc --- Development Handoff

## First Handoff Version (v1.0)

**Document purpose:** This document transfers the currently agreed
BuildCalc project scope, technology decisions, development status, and
implementation guidelines into the existing VS Code project.

**Handoff version:** 1.0 --- First Handoff\
**Date:** November 5, 2026\
**Project:** BuildCalc --- A Smart Construction Cost Estimate
Calculator\
**Development status:** Existing React Native project; calculator
development has already started.

------------------------------------------------------------------------

## 1. Project Overview

BuildCalc is a mobile application intended to help users calculate
construction material quantities and estimate material costs. The
application is organized around eight construction work categories
derived from the project's construction-estimation spreadsheet.

The current development objective is to complete the agreed **Phase 1
scope** using the existing project. This is not a request to restart,
replace, or unnecessarily restructure the current codebase.

### Phase 1 objective

Provide construction material quantity calculators and a material cost
estimation workflow. Users enter construction dimensions or
specifications, review the calculated material quantities, manually
enter material unit prices, and view the resulting material cost
breakdown.

The application must clearly identify its financial output as **Total
Estimated Material Cost**, not total construction cost.

------------------------------------------------------------------------

## 2. Locked Phase 1 Scope

### 2.1 Main application modules

The agreed Phase 1 application contains five top-level areas:

1.  **Home** --- application overview and navigation to the available
    calculators.
2.  **Construction Calculators** --- access to all eight construction
    categories and their individual calculators.
3.  **Material Cost Estimator** --- material list, manually entered unit
    prices, automatic subtotals, and total material cost.
4.  **Estimate Results** --- calculated material quantities, units, unit
    prices, cost breakdown, and total estimated material cost.
5.  **Settings** --- basic measurement and calculation preferences, PHP
    currency presentation, and application information.

These are the agreed functional areas. Their exact screen arrangement
should follow the existing application's implementation where practical.

### 2.2 Eight construction categories

All eight categories are retained:

1.  Concreting Works
2.  Masonry Works
3.  Steel Reinforcement Works
4.  Carpentry Works
5.  Roofing Works
6.  Tiling Works
7.  Painting Works
8.  Scaffoldings and Forms (also referred to as Formworks and
    Scaffoldings)

Concreting Works and Masonry Works have already been started and are
reported as completed modules. Their implementation has not yet been
independently reviewed as part of this handoff.

The remaining six categories are:

-   Steel Reinforcement Works
-   Carpentry Works
-   Roofing Works
-   Tiling Works
-   Painting Works
-   Scaffoldings and Forms

Do not assume that every possible calculator listed in an early
brainstorming discussion is mandatory. Determine the exact calculator
list, inputs, formulas, and outputs from the project's source
spreadsheet and validated requirements before implementation.

------------------------------------------------------------------------

## 3. Explicit Phase 1 Exclusions

The following features are outside the locked Phase 1 scope and must not
be added as requirements without a separate decision:

-   User registration and login
-   User profiles and account management
-   Cloud accounts or synchronization
-   Saved estimates, estimate history, and estimate revisions
-   Project management
-   Labor costing
-   Equipment costing
-   Overhead and other non-material construction expenses
-   Budget monitoring
-   Supplier or government database integration
-   Automatic online material-price retrieval

Calculations and estimates are temporary during the current application
session. They do not need to persist after the application is closed or
restarted.

A database is therefore not required for estimate storage in Phase 1.
Basic application preferences may be stored locally.

------------------------------------------------------------------------

## 4. Approved Technology Stack

The following stack was discussed and approved as the recommended
BuildCalc stack.

  -----------------------------------------------------------------------
  Area                    Selected technology     Intended use
  ----------------------- ----------------------- -----------------------
  Mobile framework        React Native            Android and iOS
                                                  application

  Development platform    Expo                    Development and build
                                                  workflow

  Programming language    TypeScript              Application and
                                                  calculation logic

  UI component library    React Native Paper      Reusable interface
                                                  components

  Navigation              Expo Router             Screen navigation and
                                                  routing

  State management        Zustand                 Temporary calculator
                                                  and estimate state

  Form handling           React Hook Form         Calculator input forms

  Input validation        Zod                     Input and data
                                                  validation

  Calculation engine      TypeScript services     Construction formulas
                                                  and computations

  Decimal arithmetic      decimal.js              More reliable decimal
                                                  and monetary
                                                  calculations

  Local preferences       AsyncStorage            Basic non-sensitive
                                                  application preferences

  Testing                 Jest and React Native   Unit and component
                          Testing Library         testing

  IDE                     Visual Studio Code      Development environment

  Version control         Git and GitHub          Source control
  -----------------------------------------------------------------------

### Important implementation note

This is the approved recommended stack, not an instruction to replace
working dependencies blindly. The project already exists. Before adding
or replacing a package:

1.  Inspect the existing `package.json`.
2.  Check whether the project already has an equivalent library.
3.  Preserve working implementations where reasonable.
4.  Add only dependencies needed by the actual features.
5.  Avoid introducing duplicate state-management, navigation, or UI
    libraries.

For example, if the existing project already uses a working navigation
or state-management solution, review it before migrating to Expo Router
or Zustand.

------------------------------------------------------------------------

## 5. Architecture and Code Organization Guidelines

Use a modular, feature-oriented organization that separates the user
interface from calculation logic. Adapt this guidance to the existing
repository instead of forcing a complete folder restructure.

Suggested logical organization:

``` text
app/
  (tabs)/
  calculators/
  results/

src/
  components/
  constants/
  models/
  calculations/
    concreting/
    masonry/
    reinforcement/
    carpentry/
    roofing/
    tiling/
    painting/
    scaffoldings/
  services/
  store/
  utils/
  validators/

assets/
tests/
```

### Separation of concerns

-   **Screens and UI components:** display forms, controls,
    instructions, and results.
-   **Calculation services:** perform construction formulas and material
    quantity computations.
-   **Models and types:** define calculator inputs, material outputs,
    units, and estimate data structures.
-   **Validators:** validate dimensions, quantities, required fields,
    and allowed values.
-   **Utilities and conversions:** handle reusable unit conversions,
    rounding, and formatting.
-   **State management:** hold temporary inputs, calculated materials,
    manually adjusted quantities, and entered prices.

Do not place substantial construction formulas directly inside screen
components. Each calculator should call a dedicated calculation function
or service so that the formula can be tested independently.

------------------------------------------------------------------------

## 6. Agreed Calculation and Costing Workflow

The intended Phase 1 workflow is:

1.  User selects a construction category and calculator.
2.  User enters the required dimensions and specifications.
3.  The application validates the inputs and units.
4.  The calculation service computes the required material quantities.
5.  An appropriate wastage allowance is applied where applicable.
6.  The application displays the material list, quantities, and units.
7.  The user manually enters a unit price for each material.
8.  The application computes each material subtotal.
9.  The application sums the subtotals and displays the estimate
    results.

### Core costing formulas

**Material Cost**

`Material Cost = Required Quantity × Unit Price`

**Total Estimated Material Cost**

`Total Estimated Material Cost = Sum of all material subtotals`

### Six agreed business rules

1.  **Manual material pricing:** Material unit prices are entered by the
    user. Do not invent, automatically retrieve, or silently assign
    current market prices.
2.  **Historical price preservation:** When saved estimates are
    considered in a future phase, each saved estimate must retain the
    prices used when it was created. Later catalog-price changes must
    not silently change historical estimates.
3.  **Unit consistency:** The material quantity unit and price unit must
    match or be converted correctly. Never multiply incompatible units.
4.  **Editable quantities:** Users may override calculated quantities.
    The interface must clearly identify manually adjusted quantities.
5.  **Material wastage:** Provide a configurable wastage percentage
    where appropriate for the material and calculator.
6.  **Transparent cost reporting:** Label the result **Total Estimated
    Material Cost**. State that labor, equipment, overhead, and other
    construction expenses are excluded.

### Quantity, purchasing, and rounding

Do not apply one universal rounding rule to every material.

-   Indivisible purchase units, such as bags or individual tiles, may
    require rounding up to a whole unit.
-   Bulk materials, such as sand measured in cubic meters, may retain
    decimal quantities.
-   Distinguish calculated quantity from purchase quantity when the
    calculation requires it.
-   Document and test the rounding rule for each relevant calculator.
-   Apply wastage as a quantity allowance, not as an unexplained
    additional cost.

------------------------------------------------------------------------

## 7. Development Progress at Handoff

### Construction calculator modules

    No. Category                    Status at handoff
  ----- --------------------------- --------------------
      1 Concreting Works            Reported completed
      2 Masonry Works               Reported completed
      3 Steel Reinforcement Works   Not yet completed
      4 Carpentry Works             Not yet completed
      5 Roofing Works               Not yet completed
      6 Tiling Works                Not yet completed
      7 Painting Works              Not yet completed
      8 Scaffoldings and Forms      Not yet completed

**Reported calculator-module progress: 2 of 8 categories (25%).**

This progress describes the user's reported development status. It does
not mean that the completed modules have already passed formula
verification, unit testing, or full integration testing.

### Next development priorities

1.  Continue from the existing project and inspect the completed
    Concreting and Masonry modules.
2.  Use their established interface and implementation conventions as
    references where they are suitable.
3.  Complete the remaining six construction categories.
4.  Complete or integrate the material cost estimator.
5.  Complete the estimate results presentation.
6.  Add or verify input validation, unit conversion, wastage, and
    quantity override behavior.
7.  Test calculation formulas and end-to-end costing workflows.

The exact order of the remaining categories can be chosen based on
dependencies in the existing implementation and the source spreadsheet.

------------------------------------------------------------------------

## 8. Quality and Testing Requirements

Calculation correctness is a core requirement. A calculator is not
complete merely because its screen and input fields work.

For each calculator:

-   Verify the formula and its assumptions against the source
    spreadsheet and suitable construction references.
-   Define the expected input units and output units.
-   Validate required fields and reject invalid or physically impossible
    values where appropriate.
-   Test zero, negative, blank, unusually large, and decimal inputs as
    applicable.
-   Test unit conversions.
-   Test wastage calculations.
-   Test rounding and purchase-quantity behavior.
-   Test manual quantity overrides.
-   Verify material subtotals and the total estimated material cost.
-   Keep calculation tests independent of UI tests.

Construction quantity estimates are informational estimates. They must
not be represented as structural engineering approval, a substitute for
professional design, or a guarantee of actual site consumption.

------------------------------------------------------------------------

## 9. Settings and Measurement Conventions

The agreed baseline is:

-   Currency: Philippine Peso (PHP, ₱)
-   Measurement system: Metric
-   Preferences: basic application and calculation preferences only

Use consistent unit labels throughout the application. Where a
calculator supports more than one unit, make the accepted unit explicit
and convert values before applying formulas.

------------------------------------------------------------------------

## 10. Guidance for AI-Assisted Development in VS Code

When using an AI coding assistant with this handoff:

1.  Treat this document as the current Phase 1 scope and decision
    reference.
2.  Inspect the existing project files before proposing code changes.
3.  Do not recreate the application or replace the existing project
    structure without a demonstrated need.
4.  Do not remove or rewrite the working Concreting and Masonry modules
    without first identifying a concrete issue.
5.  Do not add accounts, saved estimates, cloud storage, labor costing,
    equipment costing, or budget monitoring to Phase 1.
6.  Do not invent construction formulas, material ratios, coverage
    rates, or market prices.
7.  Identify assumptions and request confirmation when a formula or
    requirement cannot be established from the available project
    materials.
8.  Prefer small, focused changes that fit the existing codebase.
9.  Explain which files will be affected before making broad changes.
10. Add or update tests whenever calculation logic changes.

------------------------------------------------------------------------

## 11. Items to Verify During the Next Handoff

The following details are not fully established by the discussions
documented here and should be inspected or confirmed from the existing
project:

-   Exact current folder structure and installed package versions
-   Exact calculators already implemented under Concreting and Masonry
-   Whether the material cost estimator and results screens have been
    started
-   Whether Zustand, React Hook Form, Zod, React Native Paper, Expo
    Router, decimal.js, and AsyncStorage are already installed
-   Exact calculator lists and formulas in the source spreadsheet
-   Formula references, material assumptions, and rounding rules for
    each calculator
-   Whether PDF or spreadsheet export is desired in a later phase (not a
    locked Phase 1 requirement)

Do not treat an item in this verification list as an approved feature
merely because it is mentioned here.

------------------------------------------------------------------------

## 12. Handoff Version History

  -----------------------------------------------------------------------
  Version                 Date                    Description
  ----------------------- ----------------------- -----------------------
  **v1.0 --- First        November 5, 2026        Initial consolidation
  Handoff**                                       of the agreed BuildCalc
                                                  Phase 1 scope, approved
                                                  recommended technology
                                                  stack, business rules,
                                                  architecture
                                                  guidelines, and
                                                  reported development
                                                  progress.

  -----------------------------------------------------------------------

### Handoff status

**This is the first handoff version (v1.0).** It records the decisions
and progress established up to November 5, 2026. Future changes to the
application scope, technology stack, or development decisions should be
documented in a subsequent handoff version rather than silently changing
this baseline.
