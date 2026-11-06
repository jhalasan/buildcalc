export const BuildcalcTheme = {
  light: {
    ground: '#ecebe5',
    surface: '#ffffff',
    surfaceAlt: '#f5f4ef',
    field: '#ffffff',
    pressed: '#e6e4dc',
    ink: '#14171a',
    inkMuted: '#51575d',
    inkFaint: '#5c6167',
    line: '#dcdad1',
    control: '#85898d',
    yellow: '#ffc21a',
    onYellow: '#14171a',
    charcoal: '#1d2125',
    onCharcoal: '#f6f4ec',
    onCharcoalMuted: '#b9bdc1',
    charcoalLine: '#3a4046',
    focus: '#14171a',
    error: '#b3261e',
    errorWash: '#fbe9e7',
    adjusted: '#7a4b00',
    adjustedWash: '#ffefc7',
    shadow: '#000000',
    scrim: 'rgba(10,12,14,0.55)',
    charcoalWash: 'rgba(255,255,255,0.07)',
  },
  dark: {
    ground: '#0e1012',
    surface: '#1a1d20',
    surfaceAlt: '#23272b',
    field: '#14171a',
    pressed: '#2a2f34',
    ink: '#f4f2eb',
    inkMuted: '#b5b9bd',
    inkFaint: '#9a9fa4',
    line: '#2e3338',
    control: '#7a8187',
    yellow: '#ffc21a',
    onYellow: '#14171a',
    charcoal: '#272c31',
    onCharcoal: '#f6f4ec',
    onCharcoalMuted: '#b9bdc1',
    charcoalLine: '#404750',
    focus: '#ffc21a',
    error: '#ffb4ab',
    errorWash: '#3b1f1c',
    adjusted: '#ffc76b',
    adjustedWash: '#3a2e12',
    shadow: '#000000',
    scrim: 'rgba(0,0,0,0.65)',
    charcoalWash: 'rgba(255,255,255,0.07)',
  },
} as const;

export type BuildcalcColors = { [Key in keyof (typeof BuildcalcTheme)['light']]: string };
export type BuildcalcColorScheme = keyof typeof BuildcalcTheme;

export const Fonts = {
  regular: 'BuildcalcRegular',
  semiBold: 'BuildcalcSemiBold',
  bold: 'BuildcalcBold',
  extraBold: 'BuildcalcExtraBold',
  condensedBold: 'BuildcalcCondensedBold',
  condensedExtraBold: 'BuildcalcCondensedExtraBold',
} as const;

export const Radius = { sm: 10, md: 14, lg: 20, pill: 999 } as const;
export const SHEET_MAX_WIDTH = 640;
