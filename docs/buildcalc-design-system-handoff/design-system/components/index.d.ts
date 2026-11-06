export type IconName = 'home'|'calculators'|'estimate'|'settings'|'chevron-right'|'chevron-down'|'chevron-up'|'back'|'pencil'|'plus'|'lock'|'alert'|'clear'|'info';
export interface IconProps { name: IconName; size?: number; label?: string }
export interface MastheadProps { name?: string; tagline?: string }
export interface AppBarProps { title: string; subtitle?: string; back?: string; onBack?: () => void }
export interface TabBarProps { active: 'home'|'calculators'|'estimate'|'settings'; onChange?: (id: string) => void }
export interface SectionHeadingProps { title: string; number?: string; trailing?: string }
export interface OptionButtonsProps { options: { value: string; label: string }[]; value: string; label?: string; onChange?: (value: string) => void }
export interface InputFieldProps { label: string; value?: string; unit?: string; prefix?: string; placeholder?: string; hideLabel?: boolean; invalid?: boolean; adjusted?: boolean; onChange?: (value: string) => void }
export interface ButtonProps { variant?: 'primary'|'secondary'|'quiet'|'danger'; icon?: IconName; block?: boolean; disabled?: boolean; onClick?: () => void; children: React.ReactNode }
export interface StatusTagProps { tone?: 'adjusted'; children?: React.ReactNode }
export interface ListRowProps { title: string; meta?: string; number?: string; trailing?: React.ReactNode; expanded?: boolean; sub?: boolean; off?: boolean; onClick?: () => void }
export interface SettingRowProps { title: string; meta?: string; value?: string; fixed?: boolean; control?: React.ReactNode }
export interface MeasureLineProps { label: string; value: string }
export interface MaterialLineProps { name: string; calculated: string; unit: string; priceLabel: string; status: string; price?: string; cost?: string; wastage?: string; override?: string; open?: boolean; wastageAllowed?: boolean }
export interface ResultRowProps { name: string; calc: string; basis?: string; cost: string; manual?: boolean }
export interface TotalRowProps { value: string; variant?: 'running'|'closed'|'head' }
export interface ValidationProps { children: React.ReactNode }
export interface AssumptionsProps { items: string[] }
export interface HomeScreenProps { theme?: 'light'|'dark' }
export interface CalculatorsScreenProps { theme?: 'light'|'dark' }
export interface CalculatorSheetScreenProps { theme?: 'light'|'dark' }
export interface EstimatorScreenProps { theme?: 'light'|'dark' }
export interface EstimatorEmptyScreenProps { theme?: 'light'|'dark' }
export interface ResultsScreenProps { theme?: 'light'|'dark' }
export interface SettingsScreenProps { theme?: 'light'|'dark' }
