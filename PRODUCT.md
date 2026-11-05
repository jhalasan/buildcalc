# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

The primary user is not yet specified. The first workflow supports people estimating concrete material requirements for construction components.

## Product Purpose

Buildcalc estimates concrete volume, material quantities, and material cost from component dimensions, quantity, and locally entered material prices.

## Positioning

No differentiated market position has been confirmed. The initial focus is a straightforward estimate with visible quantities and user-supplied prices.

## Operating Context

The initial workflow is a quick, mobile-friendly estimate: choose a construction component, enter its dimensions and quantity, enter material prices, and review quantities and total material cost.

## Capabilities and Constraints

- Support footings, beams, columns, slabs, walls, and custom rectangular concrete pours.
- Calculate gross rectangular volume from length, width, height, and quantity. Slab thickness is entered as height.
- Use a nominal cement:sand:aggregate ratio of 1:2:4 by default, with an editable ratio.
- Estimate dry material volume using a 1.54 multiplier; convert cement volume at an assumed bulk density of 1,440 kg/m³.
- Report and price cement as whole 50 kg bags rounded up; report and price sand and aggregate in cubic metres.
- Let users enter cement price per bag and sand and aggregate prices per cubic metre, all in Philippine pesos (PHP).
- Format quantities and costs consistently with the Philippine English locale (`en-PH`); currency is fixed to PHP.
- Estimates cover concrete materials only. Do not include labor or reinforcement, or subtract openings from gross wall volume.
- Currency is standardized to Philippine pesos (PHP); quantities and costs use `en-PH` formatting.
- Filipino language support and region-specific material rates have not been provided.

## Brand Commitments

The product name is Buildcalc.

## Evidence on Hand

The existing application is an Expo SDK 58 React Native project. No domain data, rate schedules, or regional standards have been provided.

## Product Principles

- Show the assumptions behind estimated quantities.
- Use dimensions and prices supplied by the user.
- Keep estimates understandable and useful across common rectangular concrete components.
- Do not imply that a material estimate includes labor, reinforcement, or wall-opening deductions.
