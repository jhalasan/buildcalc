# Logo handoff: Framing square

Replace the BuildCalc brick mark with the Framing square mark across the launcher icons, splash, favicon and Home masthead.

Design reference: https://claude.ai/artifact/SE1fmfZrpXLn83d5shPvPL (boards "C · Framing square (selected)" and "C · In use"). The link is private to its owner. Everything needed to build is in this file.

## Before you start

- This is Expo SDK 58. Follow `AGENTS.md`, and check the versioned docs before changing any icon or splash config.
- `src/app/(tabs)/index.tsx` and `DESIGN.md` have uncommitted work, including the `PlanningNotice` change. Make small edits on top of it. Do not revert, stash or overwrite it.
- Do not commit unless asked.
- Do not rename the app or change `name` in `app.json`. It reads "Buildcalc" while the UI reads "BuildCalc". That is a separate decision for the owner.

## The mark

A carpenter's square holding one block. Square corners, flat fill, no gradient or shadow. It uses one colour at a time.

The drawing grid is 96 × 96. The mark occupies x and y 20 to 76, so it is 56 units square and centred.

**Master** (tick marks on):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
  <path fill="#ffc21a" d="M20 20 H32 V27 H27 V30 H32 V37 H27 V40 H32 V47 H27 V50 H32 V64 H43 V69 H46 V64 H53 V69 H56 V64 H63 V69 H66 V64 H76 V76 H20 Z"/>
  <rect fill="#ffc21a" x="40" y="20" width="36" height="36"/>
</svg>
```

**Small cut** (tick marks off, for anything rendered under 32 px):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="12 12 72 72">
  <path fill="#ffc21a" d="M20 20 H32 V64 H76 V76 H20 Z"/>
  <rect fill="#ffc21a" x="40" y="20" width="36" height="36"/>
</svg>
```

## Colours

Use the existing tokens. Do not add new ones.

| Use | Mark | Ground |
| --- | --- | --- |
| Primary | yellow `#ffc21a` | charcoal `#1d2125` |
| On a yellow fill | on-yellow `#14171a` | yellow `#ffc21a` |
| On white | ink `#14171a` | white. Never a yellow mark on white. |

## Assets to regenerate

Keep every existing path and pixel size, so `app.json` needs no path changes.

| File | Size | Background | Mark | `viewBox` |
| --- | --- | --- | --- | --- |
| `assets/images/icon.png` | 1024 × 1024 | solid `#1d2125`, no alpha | yellow master | `0 0 96 96` |
| `assets/expo.icon/Assets/mark.png` | 1024 × 1024 | transparent | yellow master | `0 0 96 96` |
| `assets/images/android-icon-foreground.png` | 1024 × 1024 | transparent | yellow master | `-18.67 -18.67 133.33 133.33` |
| `assets/images/android-icon-monochrome.png` | 1024 × 1024 | transparent | white `#ffffff` master | `-18.67 -18.67 133.33 133.33` |
| `assets/images/splash-icon.png` | 512 × 512 | transparent | yellow master | `20 20 56 56` |
| `assets/images/favicon.png` | 48 × 48 | solid `#1d2125`, no alpha | yellow small cut | `12 12 72 72` |

Leave `assets/images/android-icon-background.png`, `assets/expo.icon/icon.json` and the `app.json` colours and `imageWidth: 140` unchanged.

**Why the Android files use a different `viewBox`:** the mark fills all four corners of its square. The adaptive icon safe zone is a circle 66 of 108 units across, or 61% of the layer. At the 58% used on iOS, those corners would fall outside it. The Android `viewBox` draws the mark at 42% of the layer so all four corners stay inside. Do not "fix" it to match iOS.

**How to render:** this project has no image tooling and should not gain any. Install `sharp` in a scratch folder outside the repo, render the SVGs there, and copy only the PNGs in. Do not change `package.json` or `package-lock.json`.

Also save the two SVGs above as `assets/brand/mark.svg` and `assets/brand/mark-small.svg`, so the source lives with the project.

## Home masthead

In `src/app/(tabs)/index.tsx`, lines 40 to 42 currently put a `ruler` icon in the 36 px yellow tile:

```tsx
<View style={[styles.mark, { backgroundColor: c.yellow }]}>
  <BuildcalcIcon color={c.onYellow} name="ruler" size={22} strokeWidth={2.2} />
</View>
```

1. Add `src/components/brand-mark.tsx`, using `react-native-svg` (already installed). Props are `size` and `color`. It draws the master path and rect with `viewBox="12 12 72 72"`, so the mark nearly fills the tile. Mark it as decorative for accessibility, because the wordmark sits beside it.
2. Replace the `BuildcalcIcon` line with `<BrandMark color={c.onYellow} size={36} />`.
3. Keep the `styles.mark` tile, its 11 px radius, the wordmark and `PlanningNotice` as they are.

The `ruler` glyph stays in `BuildcalcIcon` if anything else uses it. Check before removing anything, and leave it if unsure.

## Docs

In `DESIGN.md`, under "Tags and icon tiles", replace the first sentence with:

> The app mark is a yellow framing square holding one block, on charcoal, used for the launcher icon, adaptive icon layers, splash, favicon, and the Home masthead tile (ink on yellow there). Below 32 px the tick marks are dropped.

## Out of scope

- The app name and `app.json` `name`.
- The Buildcalc design system artifact and `docs/buildcalc-design-system-handoff`. They still describe a blue, square-cornered look.
- Any other icon or screen.

## Done when

- [ ] `npx expo lint` and `npx tsc --noEmit` pass.
- [ ] `npx expo-doctor` reports nothing new.
- [ ] `git diff --stat` shows no dependency changes, and the earlier uncommitted work is intact.
- [ ] Every regenerated PNG has been opened and checked: correct size, colour and alpha, and the mark is centred.
- [ ] On web, Home shows the new mark in the yellow tile in light and dark, and the favicon has changed.
- [ ] Report what could not be checked. Launcher icons and the native splash only update in a new native build (`eas build --profile development`, or `npx expo run:ios` / `run:android`), not in Expo Go or over the air.
- [ ] In that build, check that the Android icon is not clipped under circle and squircle masks, and that the Android 12+ splash does not crop the mark's corners. If the splash does crop, change `splash-icon.png` to `viewBox="0 0 96 96"` and tell the owner the mark will look smaller.
