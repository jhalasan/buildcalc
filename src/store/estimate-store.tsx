import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Appearance } from 'react-native';

import type { CalculatorId, EstimateModule, EstimateValues } from '@/utils/construction-estimate';

export type AppearancePreference = 'system' | 'light' | 'dark';

export type SavedTakeoff = {
  id: string;
  module: EstimateModule;
  calculatorId: CalculatorId;
  values: EstimateValues;
  overrides: EstimateValues;
  wastage: EstimateValues;
};

export type RecentCalculator = { module: EstimateModule; calculatorId: CalculatorId };

type EstimateStore = {
  prices: EstimateValues;
  takeoffs: readonly SavedTakeoff[];
  recent: readonly RecentCalculator[];
  appearance: AppearancePreference;
  setPrice: (itemId: string, value: string) => void;
  clearPrices: () => void;
  saveTakeoff: (takeoff: Omit<SavedTakeoff, 'id'> & { id?: string }) => string;
  duplicateTakeoff: (id: string) => void;
  removeTakeoff: (id: string) => void;
  clearEstimate: () => void;
  rememberCalculator: (module: EstimateModule, calculatorId: CalculatorId) => void;
  setAppearance: (preference: AppearancePreference) => void;
};

const APPEARANCE_KEY = 'buildcalc.appearance';
const PRICES_KEY = 'buildcalc.prices';
const RECENT_KEY = 'buildcalc.recent';
const MAX_RECENT = 3;
const StoreContext = createContext<EstimateStore | null>(null);

function applyAppearance(preference: AppearancePreference) {
  Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
}

function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function parsePrices(raw: string | null): EstimateValues {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string'
      )
    );
  } catch {
    return {};
  }
}

function parseRecent(raw: string | null): RecentCalculator[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is RecentCalculator =>
          !!item && typeof item.module === 'string' && typeof item.calculatorId === 'string'
      )
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

/**
 * The estimate itself is temporary for the session. Appearance, the unit prices the user
 * has typed, and recently opened calculators are saved on this device so they can be reused.
 * No prices are ever supplied by the app.
 */
export function EstimateProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<EstimateValues>({});
  const [takeoffs, setTakeoffs] = useState<readonly SavedTakeoff[]>([]);
  const [recent, setRecent] = useState<readonly RecentCalculator[]>([]);
  const [appearance, setAppearanceState] = useState<AppearancePreference>('system');
  const loaded = useRef(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(APPEARANCE_KEY),
      AsyncStorage.getItem(PRICES_KEY),
      AsyncStorage.getItem(RECENT_KEY),
    ])
      .then(([storedAppearance, storedPrices, storedRecent]) => {
        if (storedAppearance === 'light' || storedAppearance === 'dark') {
          setAppearanceState(storedAppearance);
          applyAppearance(storedAppearance);
        }
        // Anything typed before the load finished wins over the saved value.
        setPrices((current) => ({ ...parsePrices(storedPrices), ...current }));
        setRecent((current) => (current.length ? current : parseRecent(storedRecent)));
      })
      .catch(() => undefined)
      .finally(() => {
        loaded.current = true;
      });
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    const timer = setTimeout(() => {
      AsyncStorage.setItem(PRICES_KEY, JSON.stringify(prices)).catch(() => undefined);
    }, 400);
    return () => clearTimeout(timer);
  }, [prices]);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(RECENT_KEY, JSON.stringify(recent)).catch(() => undefined);
  }, [recent]);

  const setPrice = useCallback((itemId: string, value: string) => {
    setPrices((current) => ({ ...current, [itemId]: value }));
  }, []);

  const clearPrices = useCallback(() => setPrices({}), []);

  const saveTakeoff = useCallback<EstimateStore['saveTakeoff']>((takeoff) => {
    const id = takeoff.id ?? newId();
    setTakeoffs((current) => {
      const next = { ...takeoff, id };
      return current.some((item) => item.id === id)
        ? current.map((item) => (item.id === id ? next : item))
        : [...current, next];
    });
    return id;
  }, []);

  const duplicateTakeoff = useCallback((id: string) => {
    setTakeoffs((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index === -1) return current;
      const source = current[index];
      const copy: SavedTakeoff = {
        ...source,
        id: newId(),
        values: { ...source.values },
        overrides: { ...source.overrides },
        wastage: { ...source.wastage },
      };
      return [...current.slice(0, index + 1), copy, ...current.slice(index + 1)];
    });
  }, []);

  const removeTakeoff = useCallback((id: string) => {
    setTakeoffs((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearEstimate = useCallback(() => setTakeoffs([]), []);

  const rememberCalculator = useCallback<EstimateStore['rememberCalculator']>(
    (module, calculatorId) => {
      setRecent((current) => {
        if (current[0]?.module === module && current[0]?.calculatorId === calculatorId) return current;
        const rest = current.filter(
          (item) => !(item.module === module && item.calculatorId === calculatorId)
        );
        return [{ module, calculatorId }, ...rest].slice(0, MAX_RECENT);
      });
    },
    []
  );

  const setAppearance = useCallback((preference: AppearancePreference) => {
    setAppearanceState(preference);
    applyAppearance(preference);
    AsyncStorage.setItem(APPEARANCE_KEY, preference).catch(() => undefined);
  }, []);

  const value = useMemo<EstimateStore>(
    () => ({
      prices,
      takeoffs,
      recent,
      appearance,
      setPrice,
      clearPrices,
      saveTakeoff,
      duplicateTakeoff,
      removeTakeoff,
      clearEstimate,
      rememberCalculator,
      setAppearance,
    }),
    [
      prices,
      takeoffs,
      recent,
      appearance,
      setPrice,
      clearPrices,
      saveTakeoff,
      duplicateTakeoff,
      removeTakeoff,
      clearEstimate,
      rememberCalculator,
      setAppearance,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useEstimateStore(): EstimateStore {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useEstimateStore must be used inside EstimateProvider');
  return store;
}
