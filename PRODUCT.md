# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

The primary user is not yet specified. The initial workflow supports people estimating construction materials in the Philippines across concreting, masonry, steel reinforcement, carpentry, roofing, tiling, painting, and forms.

## Product Purpose

Buildcalc estimates construction material quantities and cost from measured work, reference factors, and user-entered Philippine peso unit prices.

## Positioning

No differentiated market position has been confirmed. The initial focus is a straightforward estimate with visible quantities, explicit assumptions, and user-supplied unit prices. The shared construction-estimate workbook is the reference for every module, not a verified engineering standard.

## Operating Context

The initial workflow is a quick, mobile-friendly estimate: choose a construction module and calculator, enter its measurements, review takeoff quantities, enter material prices, and review line costs and the total.

## Capabilities and Constraints

- Concreting: footings, wall footings, floor slabs by dimensions or area, rectangular and circular columns, beams, and stairs.
- Use workbook concrete class factors for slabs: AA (`1:1.5:3`, 12 cement bags/m³), A (`1:2:4`, 9 bags/m³), and B (`1:3:6`, 7.5 bags/m³). Non-slab concrete calculators use Class A factors.
- Estimate concrete sand at 0.5 m³ and gravel at 1 m³ per m³ of concrete, rounding these quantities up to 0.1 m³.
- Masonry: CHB wall count with openings and breakage allowance, 4-inch or 6-inch CHB mortar, one- or two-face plaster, and riprap.
- Use the workbook's wall, mortar, plaster, and riprap factors as planning references, and disclose their assumptions in the estimate.
- Let users enter unit prices for listed materials in Philippine pesos (PHP), edit final material quantities, and see each material subtotal.
- Offer optional per-material wastage input, defaulting to zero; apply it to calculated quantities and round bags and pieces up to whole purchase units. Do not apply a second allowance to CHB wall counts, which already include breakage.
- Label the total **Total Estimated Material Cost** and disclose that labor, equipment, overhead, and other construction expenses are excluded.
- Format quantities and costs consistently with the Philippine English locale (`en-PH`); currency is fixed to PHP.
- Steel reinforcement: CHB wall bars, footing matting, wall footing, rectangular and circular columns, one- and two-bay beams, one- and two-way slabs, wide-spacing ground slab, and stair bars, counted in 6 m bars with #16 tie wire per the workbook.
- Carpentry: lumber and round-log board feet, studs and nailing joists, and plywood covering with nails.
- Roofing: two- or three-sheet roof runs (8, 10, or 12 ft sheets) with umbrella nails, and roof accessories.
- Tiling: 16 tile sizes with the workbook's breakage-inclusive piece count, cement mortar or adhesive, and white cement. Painting: gallons from area, coverage, and coats. Scaffoldings and forms: column forms, beam forms, and staging lumber.
- Each workbook-based module shows its factors as assumptions. Where the workbook has an apparent error or an unused input, the assumptions say how the estimate differs (two-bay beam stirrups and bottom bars, painting coat multiplier, footing matting rounding, one calculator per log count). Concrete canal is not included.
- Estimates do not include labor, equipment, overhead, structural design, or supplier rates. Wall area in masonry calculations subtracts entered window and door openings.
- Filipino language support, independently validated engineering factors, and region-specific material rates have not been provided.

## Brand Commitments

The product name is Buildcalc.

## Evidence on Hand

The existing application is an Expo SDK 58 React Native project. No domain data, supplier rate schedules, or independently validated local construction standards have been provided. A user-supplied workbook provides reference estimating factors for the initial modules.

## Product Principles

- Show the assumptions and source character behind estimated quantities.
- Use dimensions and prices supplied by the user.
- Keep estimates understandable and useful across the eight work sections.
- Do not imply that a material estimate includes labor, equipment, or overhead.
