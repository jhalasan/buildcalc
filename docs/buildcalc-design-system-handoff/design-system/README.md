Buildcalc reads like a ruled site fieldbook: measure the work, review the material takeoff, enter your own unit prices, read the total. Build every screen as one flat sheet of ruled entries. Refuse the dashboard that hides measured inputs behind a result card.

## What the product may say

Buildcalc estimates **material quantities and material cost only**, from dimensions and prices the user supplies. Every screen holds to these rules.

- Label the money result **Total Estimated Material Cost**, in full, every time. Place the exclusions sentence next to it: "Material costs only. Labor, equipment, overhead, and other construction expenses are excluded."
- Never show a market price, a suggested price or a default price. A price field starts empty, and the total reads "Enter 1 unit price" until every line is priced.
- Show the calculated quantity beside any override. A manually changed quantity always carries the `adjusted` Manual tag.
- Never multiply mismatched units. Name the price unit on the field: "Cement · per 50 kg bag", "Sand · per m³".
- Round by material. Bags and pieces round up to whole units. Bulk materials keep decimals.
- Apply wastage to quantity, default it to zero, and never apply it to CHB counts, which already include breakage.
- Show the factors behind a takeoff as plain assumptions, and close with the planning-estimate notice. Never imply structural approval.
- Estimates are temporary. Say so where the estimate appears. Do not design for accounts, sign-in, saved estimates, history, projects, labor, equipment, budgets or live price lookups; all are out of Phase 1.

## Content fundamentals

**Voice.** Plain, direct, site-office English. State what happens and what is excluded. No encouragement, no exclamation marks, no emoji.

**Person.** Imperative for instructions, and no "I" or "we": "Choose a work section, then a calculator."

**Casing.** Sentence case for headings, buttons and labels. Work sections keep their proper names: Concreting Works, Masonry Works. The tagline alone is capitals: CONSTRUCTION TAKEOFF. The total is title case because it is a defined term.

**Units and money.** Metric. Write `m`, `m²`, `m³`, `pcs`, `bags`, always beside the value. Use a singular where it reads correctly: `1 bag`, `1 pc`. Format with the `en-PH` locale: `₱2,400.00`. Use the middle dot to join a name and its detail: "Floor slab · dimensions", "Calculated · 22 bags".

**Empty and error copy.** Say what to do next.

| Situation | Copy |
| --- | --- |
| No valid measurements | Complete the measurements above to see estimated quantities and costs. |
| Bad measurements | Check that measurements are finite and positive, counts are whole numbers, and wall openings do not exceed wall area. |
| Bad override | Enter a valid non-negative quantity; bags and pieces must be whole units. |
| Bad price | Unit prices must be zero or more. Correct the price to update the total. |
| Closing notice | Workbook-based planning estimates, not engineering approval. Verify material quantities, mixes, and specifications with a qualified construction professional before ordering or building. |

## Visual foundations

**Color.** Warm paper, dark ink, one field blue. Set the screen on `ground`, group a takeoff on `sheet`, and keep typed values on `field`. Set text in `ink`, and supporting text in `ink-muted`. Reserve `accent` for the current selection, section numbers, the active tab, the focus ring, the primary button and the total. Use `adjusted` only for manual quantities and `error` only for validation. If a screen has more blue than this, remove some.

**Type.** Barlow, a plain grotesk modeled on highway signs and vehicle plates, so it stays readable at a glance and fits long material names on a phone. Weight does the work: 800 for the wordmark and totals, 700 for titles and figures, 600 for names and labels, 400 for reading text. Set every number that lines up in tabular figures. Never go below `overline` at 12px or `caption` at 13px; this app gets read outdoors.

**Spacing.** Use the `space-` steps only. Pad screens `space-16` at the sides and top, and `space-40` at the bottom. Separate sections with `space-24` and a rule, not a box.

**Layout.** One vertically scrolling sheet, capped at `sheet-max-width` and centered on wider screens. Lay fields in two columns that wrap at `field-min-width`. Right-align quantities and costs along one edge so the eye can run down them.

**Borders and rules.** A 1px `rule` separates entries. A 1px `control-border` outlines anything you can type in or tap. A 1px `ink` rule opens a total. On Estimate Results, close the total with a double rule, the ledger's mark for a finished sum.

**Corners and depth.** `radius-none` everywhere. No shadows, blur, gradients or floating cards. `sheet` and rules give all the grouping this interface needs.

**States.** Pressed and hovered rows fill with `pressed`. Selected options fill with `accent` and `on-accent`. Focus is a solid 2px `accent` ring offset 2px, at least 3:1 on every surface. Disabled buttons drop to a `rule` border and `ink-muted` text, with the reason shown nearby. Touch targets are at least `control-height`.

**Motion.** Use the platform's default navigation transition. Values update in place. Do not animate numbers.

**Imagery.** None. No photos, hard hats or illustrations.

## Iconography

Icons are 24px line glyphs on a 24 grid, 1.75px stroke, square caps and mitered joins, in one ink. Use them through the `Icon` component or from the Icons assets, and pair them with a word except for the row chevron. No emoji anywhere.

No logo exists yet, so set the name as type in `brand`.

## Screens and navigation

Four tabs hold the top-level areas: Home, Calculators, Estimate, Settings. Estimate Results opens on top of the Estimate tab, which stays active in `TabBar`. A calculator opens on top of Calculators.

| Screen | Job | Component |
| --- | --- | --- |
| Home | Overview, current estimate, start a takeoff | `HomeScreen` |
| Construction Calculators | All eight work sections and their calculators | `CalculatorsScreen` |
| A calculator | Measurements and a live takeoff preview | `CalculatorSheetScreen` |
| Material Cost Estimator | Quantities, wastage, overrides, unit prices, subtotals | `EstimatorScreen`, `EstimatorEmptyScreen` |
| Estimate Results | The finished breakdown and total | `ResultsScreen` |
| Settings | Measurement, currency, appearance, about | `SettingsScreen` |

Sample quantities in the screens follow the app's formulas. Sample prices are round placeholders for layout, not market prices. Do not ship them.

## Building it in React Native

The components here are web renditions for review. In the app, build them with `View`, `Text`, `TextInput` and `Pressable`.

- Put the color tokens in one shared theme module with `light` and `dark` keys, and read it through the existing color-scheme hook. Replace the hard-coded `PALETTE` in the calculator and the unused template values in `src/constants/theme.ts`.
- Load Barlow weights 400, 600, 700 and 800 with Expo's font tooling, and let the system sans stand in until they load.
- Draw hairlines with `StyleSheet.hairlineWidth` if 1px looks heavy on a device, and set `fontVariant: ['tabular-nums']` on figures.
- If React Native Paper is added, set its theme to square corners and these colors, and turn off its elevation. Its defaults contradict this system.
