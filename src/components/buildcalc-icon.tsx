import Svg, { Path } from 'react-native-svg';
import type { ColorValue } from 'react-native';

export type BuildcalcIconName =
  | 'back'
  | 'calculators'
  | 'carpentry'
  | 'check'
  | 'chevron-down'
  | 'chevron-right'
  | 'chevron-up'
  | 'concrete'
  | 'estimate'
  | 'home'
  | 'info'
  | 'lock'
  | 'masonry'
  | 'moon'
  | 'painting'
  | 'plus'
  | 'rebar'
  | 'roofing'
  | 'ruler'
  | 'scaffold'
  | 'settings'
  | 'sun'
  | 'tiling'
  | 'trash'
  | 'edit'
  | 'phone'
  | 'share'
  | 'search'
  | 'close'
  | 'copy';

type BuildcalcIconProps = {
  name: BuildcalcIconName;
  color: ColorValue;
  size?: number;
  strokeWidth?: number;
};

const ICON_PATHS: Record<BuildcalcIconName, string> = {
  back: 'M15 5l-7 7 7 7',
  calculators:
    'M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM8 6.5h8v3.5H8zM8.5 14h.01M12 14h.01M15.5 14h.01M8.5 17.5h.01M12 17.5h.01M15.5 17.5h.01',
  carpentry: 'M3 17.5L14.5 6l3.5 3.5L6.5 21H3zM13 7.5l3.5 3.5M16 4l1.5-1.5 4 4L20 8',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  'chevron-down': 'M6 9l6 6 6-6',
  'chevron-right': 'M9 5l7 7-7 7',
  'chevron-up': 'M6 15l6-6 6 6',
  concrete: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
  estimate: 'M7 3h10a1 1 0 0 1 1 1v17l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1zM9 8h6M9 12h6',
  home: 'M3 11.5L12 4l9 7.5M5.5 10v9.5a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5V10M10 20v-5.5h4V20',
  info: 'M12 11v5.5M12 7.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  lock: 'M6.5 11h11a1 1 0 0 1 1 1v7.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V12a1 1 0 0 1 1-1zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  masonry: 'M3 5h18v14H3zM3 9.67h18M3 14.33h18M9 5v4.67M15 9.67v4.66M9 14.33V19',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z',
  painting: 'M5 4h12a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM18 7h2v5h-8v3M10.5 15h3v6h-3z',
  phone: 'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2',
  plus: 'M12 5v14M5 12h14',
  rebar: 'M4 8h16M4 16h16M8 4v16M16 4v16',
  roofing: 'M2.5 13L12 5l9.5 8M6 11.5V20M18 11.5V20M4 20h16',
  ruler: 'M3 15L15 3l6 6L9 21zM7.5 12l2.5 2.5M10.5 9l2 2M13.5 6l2.5 2.5',
  scaffold: 'M5 3v18M19 3v18M5 8h14M5 15h14M5 8l14 7M5 15l14-7',
  settings:
    'M4 7h9M17 7h3M13 4.5v5h4v-5zM4 17h3M11 17h9M7 14.5v5h4v-5z',
  sun: 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4',
  tiling: 'M4 4h16v16H4zM12 4v16M4 12h16',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6',
  share: 'M12 15V4M8 8l4-4 4 4M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7',
  search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-4-4',
  close: 'M6 6l12 12M18 6L6 18',
  copy: 'M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1zM16 9V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3',
};

export default function BuildcalcIcon({
  name,
  color,
  size = 24,
  strokeWidth = 1.9,
}: BuildcalcIconProps) {
  return (
    <Svg fill="none" height={size} pointerEvents="none" viewBox="0 0 24 24" width={size}>
      <Path
        d={ICON_PATHS[name]}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
