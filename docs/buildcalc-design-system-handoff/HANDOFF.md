# Buildcalc design system handoff

Date: November 5, 2026
Online version: https://claude.ai/artifact/Upv1CuHoDRmrSf3EtXAwmk (private until shared)

## What is in this package

| Path | What it is |
| --- | --- |
| `design-system/README.md` | The brand book: product rules, voice, visual foundations, navigation, React Native notes. Start here. |
| `design-system/tokens.json` | Every color, type style, spacing step, radius and size. |
| `design-system/tokens.css` | The same colors, spacing, radius and sizes as CSS variables. Type styles are in `tokens.json` and `bundle.css`. |
| `design-system/components/` | One folder per component with usage guidance and a preview, plus `bundle.js`, `bundle.css` and `index.d.ts`. |
| `icons/` | The 14 icons as SVG files. |
| `previews/` | Pages to open in a browser. Start with the `*Screen.html` files. |

## Viewing the screens

Unzip the package and open any file in `previews/` in a browser. React and the Barlow font load from the internet, so previews need a connection.

- `HomeScreen.html`
- `CalculatorsScreen.html` and `CalculatorSheetScreen.html`
- `EstimatorScreen.html` and `EstimatorEmptyScreen.html`
- `ResultsScreen.html`
- `SettingsScreen.html`

## Building it

The components are web renditions for design review, not React Native code. Rebuild them with `View`, `Text`, `TextInput` and `Pressable`, following "Building it in React Native" in the brand book. No app code has been changed yet.

## Not final

- **Takeoffs per estimate.** The screens hold several takeoffs in one estimate. The Phase 1 handoff does not specify this, and the current code prices one calculator at a time. Needs a decision.
- **Default wastage and Appearance settings.** Proposed in this design, not required by the Phase 1 handoff.
- **Product name.** The design uses "Buildcalc", as the code and `PRODUCT.md` do. The Phase 1 handoff writes "BuildCalc".
- **Sample data.** Quantities follow `src/utils/construction-estimate.ts`. Prices are round placeholders for layout, not market prices. Do not ship them.
- **Logo.** None exists yet, so the name is set as type.
- **Font.** Barlow loads from Google Fonts in these previews. The app needs its own font setup.
- **Existing docs.** `DESIGN.md` and the hard-coded `PALETTE` in `src/components/estimate-calculator.tsx` still describe the earlier look.
