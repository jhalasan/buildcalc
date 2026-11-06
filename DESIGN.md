---
name: Buildcalc
description: A pro site tool for Philippine builders; job-site yellow on charcoal and warm concrete grey, condensed numerals, soft tactile cards.
colors:
  ground: "#ecebe5"
  surface: "#ffffff"
  surface-alt: "#f5f4ef"
  pressed: "#e6e4dc"
  ink: "#14171a"
  ink-muted: "#51575d"
  ink-faint: "#5c6167"
  line: "#dcdad1"
  control: "#85898d"
  yellow: "#ffc21a"
  on-yellow: "#14171a"
  charcoal: "#1d2125"
  on-charcoal: "#f6f4ec"
  on-charcoal-muted: "#b9bdc1"
  charcoal-line: "#3a4046"
  error: "#b3261e"
  error-wash: "#fbe9e7"
  adjusted: "#7a4b00"
  adjusted-wash: "#ffefc7"
  dark-ground: "#0e1012"
  dark-surface: "#1a1d20"
  dark-surface-alt: "#23272b"
  dark-ink: "#f4f2eb"
  dark-line: "#2e3338"
typography:
  display:
    fontFamily: "Barlow Condensed ExtraBold"
    fontSize: "40px"
    fontWeight: 800
    lineHeight: "42px"
    letterSpacing: "-0.2px"
  title:
    fontFamily: "Barlow Condensed Bold"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: "32px"
  big-figure:
    fontFamily: "Barlow Condensed ExtraBold"
    fontSize: "36px"
    fontWeight: 800
    lineHeight: "38px"
    fontFeature: "tabular-nums"
  heading:
    fontFamily: "Barlow Bold"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: "24px"
  body:
    fontFamily: "Barlow Regular"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "23px"
  body-strong:
    fontFamily: "Barlow SemiBold"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "22px"
  figure:
    fontFamily: "Barlow Bold"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: "22px"
    fontFeature: "tabular-nums"
  label:
    fontFamily: "Barlow SemiBold"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: "18px"
  caption:
    fontFamily: "Barlow Regular"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
rounded:
  sm: "10px"
  md: "14px"
  lg: "20px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
  4xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.on-yellow}"
    rounded: "{rounded.md}"
    height: "56px"
    padding: "0 20px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "56px"
    padding: "0 20px"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.error}"
    rounded: "{rounded.md}"
    height: "56px"
  button-disabled:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.ink-faint}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
  card-charcoal:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.on-charcoal}"
    rounded: "{rounded.lg}"
    padding: "16px"
  option-chip:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 16px"
  option-chip-selected:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.on-yellow}"
  field:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "56px"
    padding: "0 14px"
  tag-adjusted:
    backgroundColor: "{colors.adjusted-wash}"
    textColor: "{colors.adjusted}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
  tab-active-pill:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.on-yellow}"
    rounded: "16px"
    width: "64px"
    height: "32px"
---

# Design System: Buildcalc

## Overview

**Creative North Star: "The Site Tool"**

Buildcalc looks and handles like equipment, not a worksheet. Job-site yellow is the single loud voice, set against a charcoal masthead and warm concrete-grey ground. Inputs and targets are oversized for one-handed, gloved use outdoors; the live total travels with the thumb instead of sitting at the foot of a document. This build replaces the earlier flat, square, no-shadow ruled-paper "Site Fieldbook" world; none of its rules (square corners, no shadow, paper rules) apply.

Density is moderate and thumb-first: 56px primary controls, 48px chips, 96px work-section cards, one column capped at 640px. Numerals are condensed and tabular so quantities and pesos read like stamped figures; prose is a plain humanist sans. Depth is soft in light mode and tonal in dark mode. Pressed states are tactile (slight scale and tint).

**Key Characteristics:**
- Yellow (#ffc21a) is the action and selection color; charcoal is the anchor surface.
- Barlow Condensed for display and numeric figures, Barlow for everything else.
- 10/14/20px radii with pill chips; softly lifted white cards on warm grey.
- One stenciled-line icon family (BuildcalcIcon), placed in rounded icon tiles.
- Light and dark schemes, both first-class.

## Colors

A restrained palette: warm concrete neutrals plus one saturated safety yellow, with charcoal as the dark anchor.

### Primary
- **Job-Site Yellow** (#ffc21a): primary buttons, selected chips, active tab pill, icon tiles, the brand wordmark on charcoal, text selection. Identical in light and dark. Always carries `on-yellow` ink (#14171a), never white or yellow-on-white text.

### Neutral
- **Warm Concrete** (#ecebe5 light / #0e1012 dark): screen ground.
- **Poured White** (#ffffff light / #1a1d20 dark): cards, tab bar, fields (dark field #14171a).
- **Sand Alt** (#f5f4ef / #23272b): unselected chips, disabled buttons, muted tags.
- **Pressed Grey** (#e6e4dc / #2a2f34): pressed state fill.
- **Site Charcoal** (#1d2125 light / #272c31 dark): masthead, step numbers, badges, charcoal cards; text on it is #f6f4ec with #b9bdc1 for secondary; dividers #3a4046.
- **Ink** (#14171a / #f4f2eb): primary text. Muted #51575d / #b5b9bd; faint #5c6167 / #9a9fa4 (placeholders, disabled).
- **Hairline** (#dcdad1 / #2e3338): dividers and card borders (borders only visible in dark mode cards).
- **Control Grey** (#85898d / #7a8187): resting field and secondary-button strokes.

### Semantic
- **Error** (#b3261e / #ffb4ab) with wash (#fbe9e7 / #3b1f1c): invalid fields, danger button.
- **Adjusted Amber** (#7a4b00 / #ffc76b) on wash (#ffefc7 / #3a2e12): the tag marking an adjusted (wastage-affected) quantity.
- Focus ring: ink in light, yellow in dark.

### Named Rules
**The One Voice Rule.** Yellow marks what you can act on or what is selected. It never decorates; on white it is a fill with dark ink, never a text color. Yellow text appears only on charcoal.

**The Ink-On-Yellow Rule.** Every yellow fill takes #14171a text or icon.

## Typography

**Display Font:** Barlow Condensed (ExtraBold 800, Bold 700)
**Body Font:** Barlow (Regular 400, SemiBold 600, Bold 700)

**Character:** Condensed stamped numerals against a plain, sturdy sans. Figures feel like gauge readouts; prose stays calm.

### Hierarchy
- **Display** (800, 40/42, -0.2 tracking): masthead headline only.
- **Title** (700 condensed, 28/32): wordmark and screen titles.
- **Big Figure** (800 condensed, 36/38, tabular): totals and key quantities.
- **Heading** (700, 18/24): section and card titles.
- **Body** (400, 16/23) and **Body Strong** (600, 16/22): content and emphasized rows.
- **Figure** (700, 16/22, tabular): inline numbers, step numbers.
- **Label** (600, 13/18): field labels, counts, tags. Sentence case.
- **Caption** (400, 13/18): hints, notices, details.
- Button labels Barlow Bold 17/22; field input Bold 20 tabular; chip label 15/20 (Bold when selected); tab label 13/16.

### Named Rules
**The Tabular Rule.** Any number a user compares or sums (quantities, pesos, totals) uses tabular-nums.

## Layout

Single scrolling column inside `Screen`: ground color, content centered and capped at 640px (SHEET_MAX_WIDTH), 16px side padding, 20px gap between blocks (28px between major home sections). Space scale: 4, 8, 12, 16, 20, 24, 32, 40. Fields flex with a 140px minimum so pairs wrap on narrow phones. Home goes full-bleed at the top for the masthead, then returns to 16px padding. Bottom navigation is a fixed four-tab bar under the same 640px cap, respecting safe-area insets.

## Elevation & Depth

Hybrid. In light mode, surface cards carry a soft ambient lift (web `0 1px 2px rgba(20,23,26,0.06), 0 4px 12px rgba(20,23,26,0.05)`; native shadow opacity 0.07, radius 8, offset y2, elevation 1). In dark mode there is no shadow; cards get a 1px hairline border instead. Charcoal and alt-toned cards are unlifted and rely on tonal contrast. Tab bar is separated by a hairline top border.

### Named Rules
**The Soft-Lift Rule.** Only white surface cards lift, and only softly and in light mode. No hard offset shadows; no glow.

## Shapes

Rounded and friendly but sturdy. Radius scale: sm 10, md 14 (buttons, fields, strips), lg 20 (cards, work cards), pill 999 (chips, tags). Icon tiles use 30% of their size as radius. The home masthead has 28px bottom corners. Tab active indicator is a 64x32 pill (16px). Strokes are 1.5px on controls (2px on focus or error), 1px on cards.

## Components

### Buttons
- **Shape:** 14px radius, 56px minimum height, 20px horizontal padding, optional 20px leading icon.
- **Primary:** yellow fill, ink label (Bold 17).
- **Secondary:** transparent, 1.5px control-grey stroke, ink label. **Danger:** transparent, error stroke and label.
- **Pressed:** opacity 0.85 and scale 0.98. **Disabled:** sand-alt fill, line stroke, faint label.

### Chips (Options)
- Radio group of pills, 48px high, 1.5px stroke. Unselected: sand-alt with hairline. Selected: yellow fill, ink stroke, Bold label. Pressed: pressed grey.

### Cards / Containers
- 20px radius, 16px padding, 1px border (hairline in dark, transparent otherwise). Tones: surface (lifted), alt, charcoal. Work-section cards are 96px minimum with a 60px yellow icon tile, heading, caption, count, and chevron; pressed turns pressed-grey.

### Inputs / Fields
- White (dark #14171a) fill, 14px radius, 56px high, 1.5px control-grey stroke. Label above in Label style. Unit or prefix affix in SemiBold 16 muted. Value in Bold 20 tabular.
- **Focus:** 2px stroke in focus color. **Invalid:** 2px error stroke and error label.

### Navigation
- Bottom tab bar, white surface, hairline top border. Icon over label (13px). Active tab: yellow 64x32 pill behind an ink icon, Bold ink label; inactive muted. The Estimate tab shows a charcoal count badge with yellow numeral. Minimum tab height 56px.

### Masthead and estimate strip (signature)
Charcoal block with yellow brand mark and wordmark, Display headline, and a tappable strip (14px radius, translucent white fill, charcoal-line border) showing the running takeoff count and total, with the material-costs-only line beneath.

### Tags and icon tiles
Pill tags: Adjusted (amber on amber wash) and Planned (muted on sand-alt). Icon tiles: yellow with ink glyph, muted, or charcoal with yellow glyph.

## Do's and Don'ts

### Do:
- **Do** keep primary targets at 56px (chips 48px) and make yellow the only action color.
- **Do** put ink on every yellow fill and use tabular figures for all numbers.
- **Do** build new surfaces from Screen, Card, Txt variants, Button, Field, Options, Tag, IconTile in `src/components/ui/kit.tsx`; read colors through `useColors`, never hard-code hex.
- **Do** design every surface for both light and dark schemes.
- **Do** use BuildcalcIcon stencil icons at 20-24px, inside tiles for section identity.

### Don't:
- **Don't** return to the flat, square, no-shadow ruled-paper look; corners below 10px and document-with-tabs layouts are off-system.
- **Don't** use yellow as text on light surfaces or as a decorative accent.
- **Don't** add hard offset shadows, glows, or shadows in dark mode.
- **Don't** introduce a third typeface or system display faces.
- **Don't** add unicode or emoji glyph icons.
