---
name: Buildcalc
description: A ruled field sheet for concrete quantities and material costs.
colors:
  paper-ground: "#F4F0E7"
  paper-sheet: "#FCFBF8"
  ink: "#252923"
  muted-ink: "#65685F"
  field-blue: "#305E78"
  field-blue-on: "#FFFFFF"
  rule: "#D9D5CB"
  input-surface: "#FFFFFF"
  placeholder-ink: "#77796F"
  error-ink: "#A33327"
  night-ground: "#1C211F"
  night-sheet: "#252C29"
  night-ink: "#F4F0E7"
  night-muted-ink: "#C0C2B9"
  night-field-blue: "#83B9D2"
  night-field-blue-on: "#17252D"
  night-rule: "#48514C"
  night-input-surface: "#303936"
  night-placeholder-ink: "#AEB3A9"
  night-error-ink: "#FFB4A9"
typography:
  brand:
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 34
    letterSpacing: "-0.7px"
  section:
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 24
  field-label:
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 17
components:
  selected-component:
    backgroundColor: "{colors.field-blue}"
    textColor: "{colors.field-blue-on}"
    height: "44px"
  measurement-input:
    backgroundColor: "{colors.input-surface}"
    height: "48px"
    padding: "0 11px"
  total:
    textColor: "{colors.field-blue}"
    typography: "{typography.section}"
---

# Design System: Buildcalc

## Overview

**Creative North Star: "The Site Fieldbook"**

Buildcalc reads like a clear, ruled jobsite worksheet: measurements first, material prices next, and a takeoff that keeps quantities aligned with their costs. Warm paper, ink-dark text, thin rules, and a restrained field blue make the estimate feel practical without dressing up the arithmetic.

The same layout adapts to dark appearance with a charcoal ground and brighter blue. The screen stays focused on one task, and the estimate remains understandable before prices are entered.

**Key Characteristics:**
- Sequential, single-screen estimating workflow.
- Right-aligned measured quantities and costs.
- Flat surfaces and fine rules rather than floating cards.
- Light and dark palettes follow the device appearance.

## Colors

The palette pairs a paper-like light worksheet with a high-contrast dark counterpart; blue marks the selected component and the estimated total.

### Primary
- **Field Blue** (`{colors.field-blue}`): Selected construction component and estimated total in light appearance.
- **Night Field Blue** (`{colors.night-field-blue}`): Selected component and total in dark appearance.

### Neutral
- **Paper Ground** (`{colors.paper-ground}`): Light screen background.
- **Paper Sheet** (`{colors.paper-sheet}`): Result surface and unselected component controls.
- **Ink** (`{colors.ink}`): Primary light-theme text.
- **Muted Ink** (`{colors.muted-ink}`): Instructions, units, and supporting values.
- **Rule** (`{colors.rule}`): Section and estimate row dividers.
- **Night Ground** (`{colors.night-ground}`): Dark screen background.
- **Night Sheet** (`{colors.night-sheet}`): Dark result surface and unselected component controls.
- **Night Ink** (`{colors.night-ink}`): Primary dark-theme text.
- **Night Muted Ink** (`{colors.night-muted-ink}`): Dark-theme supporting text.
- **Night Rule** (`{colors.night-rule}`): Dark-theme dividers.

### Named Rules
**The Field Mark Rule.** Reserve blue for a current selection, the result total, and error emphasis; keep the rest of the worksheet neutral.

## Typography

**Display Font:** Platform system sans-serif  
**Body Font:** Platform system sans-serif  
**Label/Mono Font:** No separate family is used.

**Character:** Compact, sturdy headings identify each step; plain system text keeps measurements easy to scan.

### Hierarchy
- **Brand** (800, 28px, 34px line-height): Buildcalc wordmark.
- **Section** (700, 17px, 24px line-height): Component selection, dimensions, prices, and takeoff.
- **Body** (regular, 13–16px, 19–24px line-height): Instructions, values, and estimate details.
- **Label** (600, 12px, 17px line-height): Input names and compact material labels.
- **Tagline** (700, 11px, uppercase): Briefly names the calculator's scope.

## Layout

Use one vertically scrolling sheet, centered on wider screens and capped at 680px. Keep component choices in a wrapping row; let dimension fields form two columns when space permits and wrap when they do not. Stack material prices as clear, individually labeled inputs. Separate the four steps with whitespace and thin rules. Keep the result immediately after prices in the same flow.

## Elevation & Depth

The interface is flat: no shadows or floating layers. A lightly differentiated estimate surface groups the takeoff; hairline rules separate material rows and the total.

## Shapes

Controls and surfaces use square corners. Thin borders define inputs and unselected component choices. Preserve the ruled, worksheet-like geometry; avoid rounded card stacks.

## Components

### Component choices
- **Style:** At least 44px tall with a fine border. The selected choice uses the field blue and contrasting text; unselected choices sit on the sheet surface.
- **Behavior:** Choices identify the concrete component and update the height label to thickness for slabs.

### Inputs
- **Style:** At least 48px tall with a flat, bordered surface, readable label, and unit adjacent to the value.
- **Behavior:** Enter metric dimensions, whole-number quantity, adjustable mix parts, and material prices in Philippine pesos. Keep dimensions and ratio errors beside their inputs.

### Material takeoff
- **Style:** A paper-like, flat surface with ruled rows and right-aligned quantities and costs.
- **Behavior:** Show concrete volume and material quantities as soon as valid dimensions and mix parts exist. Show the cost total once all three material prices are entered.

## Do's and Don'ts

### Do:
- **Do** show the concrete volume, mix ratio, density assumption, dry-volume factor, and whole-bag rounding with the estimate.
- **Do** keep units visible beside the values they qualify.
- **Do** preserve the light and dark palette roles.
- **Do** make quantities available even when prices are still missing.
- **Do** prefix entered prices with `₱` and format cost summaries as Philippine pesos.

### Don't:
- **Don't** imply labor, reinforcement, or wall-opening deductions are included.
- **Don't** use a concrete bag price for a fractional bag; cement is rounded up to whole 50 kg bags.
- **Don't** turn the worksheet into a card dashboard or add decorative shadows.
