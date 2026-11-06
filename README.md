# Buildcalc

Buildcalc estimates construction material quantities and costs for work in the Philippines. The first modules cover concreting and masonry, with prices and cost totals in Philippine pesos.

## Run the app

```bash
npm install
npx expo start
```

Open the QR code in Expo Go, or press `w` in the terminal to open the web version.

## Tests

`npm test` runs the calculation tests in `src/utils/__tests__/`. Expected values for the workbook-based modules are the cached results in `docs/CONST-ESTIMATE-MADE-EASY.xls`; the tests also cover wastage, rounding, quantity overrides, price validation, and numeric input cleanup.

## Home screen

Home shows the current in-session estimate and a grid of all eight work sections.
The Calculators tab lists each section's calculators, Estimate combines the takeoffs
you add with one price per material, and Settings holds appearance and about
information. Takeoffs are temporary and clear when the app closes. Unit prices you type are saved
on this device, along with your appearance setting and recent calculators. No sample
estimate or price is shown as user data.

## Modules in this release

All eight work sections are implemented from `docs/CONST-ESTIMATE-MADE-EASY.xls`:
Concreting, Masonry, Steel Reinforcement (11 calculators), Carpentry (4), Roofing (3),
Tiling, Painting, and Scaffoldings and Forms (3). Each calculator lists its workbook
factors and rounding as assumptions. The workbook's concrete canal sheet is not included.

### Concreting

Estimate footings, wall footings, floor slabs by dimensions or area, rectangular and circular columns, beams, and stairs. Enter the required dimensions in metres; footing and column calculators also take a whole-number quantity.

Slab calculators include workbook reference mix classes: AA (`1:1.5:3`), A (`1:2:4`), and B (`1:3:6`). The workbook factors are 12, 9, and 7.5 cement bags per cubic metre respectively, with sand at 0.5 m³ and gravel at 1 m³ per m³ of concrete. Non-slab concrete calculators use Class A factors.

### Masonry

- **CHB wall:** Estimate blocks using net wall area, subtracting entered window and door openings, with an adjustable breakage allowance.
- **CHB mortar:** Estimate cement and screened sand for 4-inch or 6-inch blocks.
- **Wall plaster:** Estimate cement and fine sand for one or two faces.
- **Riprap:** Estimate boulders, cement, and sand from a trapezoidal side section and its length.

For each material, enter its unit price in Philippine pesos. The calculated quantity remains visible; an optional quantity override changes the final quantity used for costing. Optional wastage percentages default to zero and apply to the calculated quantity. CHB wall estimates already include their breakage allowance, so a second wastage allowance is not applied. Bag and piece quantities round up to whole units after wastage; bulk quantities retain decimals.

Buildcalc calculates material line costs and shows **Total Estimated Material Cost** once all unit prices are entered. Labor, equipment, overhead, and other construction expenses are excluded.

All prices and cost summaries use Philippine pesos (PHP) with `en-PH` number formatting. Currency is fixed.

## Reference factors and limitations

- Concrete volume uses the selected geometry. Circular columns use a cylindrical volume; stairs use the workbook's step-wedge plus sloping-stringer estimate.
- Concrete cement quantities use the workbook's class factors and whole-bag rounding. Sand and gravel are rounded up to 0.1 m³.
- CHB coverage is estimated at 12.5 blocks per net wall m², plus the entered breakage allowance.
- CHB mortar factors are 0.525 cement bags and 0.0438 m³ screened sand per m² for 4-inch blocks, or 1.013 bags and 0.0844 m³ per m² for 6-inch blocks.
- Plaster quantities use the workbook factors for a nominal 16 mm layer and a 1:2 mix. Riprap uses the workbook's boulder, cement, and sand factors; its note specifies 15–25 kg stones with at least half over 20 kg.
- These are workbook-based planning estimates, not verified engineering specifications or local supplier rates. The estimates do not include labor, reinforcement, or waste unless entered by the user or included in the CHB breakage allowance. Confirm quantities, mixes, dimensions, and applicable requirements with a qualified construction professional before ordering or building.
