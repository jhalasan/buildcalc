import Svg, { Path, Rect } from 'react-native-svg';
import { Platform, type ColorValue } from 'react-native';

type BrandMarkProps = { size?: number; color: ColorValue };

/** The Buildcalc framing-square mark, master cut. Source: assets/brand/mark.svg. */
export default function BrandMark({ size = 36, color }: BrandMarkProps) {
  return (
    <Svg
      {...(Platform.OS === 'web'
        ? { 'aria-hidden': true }
        : { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' as const })}
      height={size}
      pointerEvents="none"
      viewBox="12 12 72 72"
      width={size}>
      <Path
        d="M20 20 H32 V27 H27 V30 H32 V37 H27 V40 H32 V47 H27 V50 H32 V64 H43 V69 H46 V64 H53 V69 H56 V64 H63 V69 H66 V64 H76 V76 H20 Z"
        fill={color}
      />
      <Rect fill={color} height={36} width={36} x={40} y={20} />
    </Svg>
  );
}
