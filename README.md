# Buildcalc

Buildcalc estimates concrete quantities and material costs for rectangular construction components. It supports footings, beams, columns, slabs, walls, and custom pours.

## Run the app

```bash
npm install
npx expo start
```

Open the QR code in Expo Go, or press `w` in the terminal to open the web version.

## Use the calculator

1. Select a component and enter its length, width, height (or slab thickness), and quantity in metres.
2. Adjust the cement:sand:aggregate mix ratio if needed. The default is `1:2:4`.
3. Enter material prices in Philippine pesos (PHP): cement per 50 kg bag, sand per cubic metre, and aggregate per cubic metre.
4. Review the live volume, material takeoff, line costs, and estimated materials total in Philippine pesos.

All prices and cost summaries use Philippine pesos (PHP) with `en-PH` number formatting. Currency cannot be changed.

## Estimate assumptions

- Concrete volume is `length x width x height x quantity`.
- Dry material volume is estimated as concrete volume x `1.54`.
- Cement volume uses the cement share of the entered mix ratio and an assumed bulk density of `1,440 kg/m^3`.
- Cement is rounded up to whole 50 kg bags; the cement cost uses that whole-bag quantity.
- Sand and aggregate are shown and priced by their estimated cubic-metre quantities.
- The estimate is for materials only. It does not include labor or reinforcement and does not subtract wall openings. Confirm quantities and mix design with a construction professional before ordering.
