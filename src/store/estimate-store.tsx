import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

type EstimateStore = {
  prices: EstimateValues;
  takeoffs: readonly SavedTakeoff[];
  appearance: AppearancePreference;
  setPrice: (itemId: string, value: string) => void;
  saveTakeoff: (takeoff: Omit<SavedTakeoff, 'id'> & { id?: string }) => string;
  removeTakeoff: (id: string) => void;
  clearEstimate: () => void;
  setAppearance: (preference: AppearancePreference) => void;
};

const APPEARANCE_KEY = 'buildcalc.appearance';
const StoreContext = createContext<EstimateStore | null>(null);

function applyAppearance(preference: AppearancePreference) {
  Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
}

/**
 * Estimates are temporary for the session (Phase 1). Only the appearance
 * preference is persisted locally.
 */
export function EstimateProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<EstimateValues>({});
  const [takeoffs, setTakeoffs] = useState<readonly SavedTakeoff[]>([]);
  const [appearance, setAppearanceState] = useState<AppearancePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(APPEARANCE_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark') {
          setAppearanceState(stored);
          applyAppearance(stored);
        }
      })
      .catch(() => undefined);
  }, []);

  const setPrice = useCallback((itemId: string, value: string) => {
    setPrices((current) => ({ ...current, [itemId]: value }));
  }, []);

  const saveTakeoff = useCallback<EstimateStore['saveTakeoff']>((takeoff) => {
    const id = takeoff.id ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    setTakeoffs((current) => {
      const next = { ...takeoff, id };
      return current.some((item) => item.id === id)
        ? current.map((item) => (item.id === id ? next : item))
        : [...current, next];
    });
    return id;
  }, []);

  const removeTakeoff = useCallback((id: string) => {
    setTakeoffs((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearEstimate = useCallback(() => {
    setTakeoffs([]);
    setPrices({});
  }, []);

  const setAppearance = useCallback((preference: AppearancePreference) => {
    setAppearanceState(preference);
    applyAppearance(preference);
    AsyncStorage.setItem(APPEARANCE_KEY, preference).catch(() => undefined);
  }, []);

  const value = useMemo<EstimateStore>(
    () => ({
      prices,
      takeoffs,
      appearance,
      setPrice,
      saveTakeoff,
      removeTakeoff,
      clearEstimate,
      setAppearance,
    }),
    [prices, takeoffs, appearance, setPrice, saveTakeoff, removeTakeoff, clearEstimate, setAppearance]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useEstimateStore(): EstimateStore {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useEstimateStore must be used inside EstimateProvider');
  return store;
}
