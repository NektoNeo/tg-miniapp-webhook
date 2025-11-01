import { create } from "zustand";

export type BudgetPreset =
  | "none"
  | "46-100"
  | "100-150"
  | "150-225"
  | "225-300"
  | "300-500";

export type QualityFilter = "FHD" | "2K" | "4K" | null;

interface FiltersState {
  budgetPreset: BudgetPreset;
  qualityFilter: QualityFilter;
  setBudgetPreset: (preset: BudgetPreset) => void;
  setQualityFilter: (quality: QualityFilter) => void;
  clearFilters: () => void;
  getBudgetRange: () => { min: number; max: number } | null;
}

const BUDGET_RANGES: Record<Exclude<BudgetPreset, "none">, { min: number; max: number }> = {
  "46-100": { min: 46000, max: 100000 },
  "100-150": { min: 100000, max: 150000 },
  "150-225": { min: 150000, max: 225000 },
  "225-300": { min: 225000, max: 300000 },
  "300-500": { min: 300000, max: 500000 },
};

export const useFiltersStore = create<FiltersState>((set, get) => ({
  budgetPreset: "none",
  qualityFilter: null,

  setBudgetPreset: (preset) => set({ budgetPreset: preset }),

  setQualityFilter: (quality) => set({ qualityFilter: quality }),

  clearFilters: () =>
    set({
      budgetPreset: "none",
      qualityFilter: null,
    }),

  getBudgetRange: () => {
    const { budgetPreset } = get();
    if (budgetPreset === "none") return null;
    return BUDGET_RANGES[budgetPreset];
  },
}));
