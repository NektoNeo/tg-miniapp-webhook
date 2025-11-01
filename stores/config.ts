import { create } from "zustand";
import type { ConfigOption } from "@/types/pc";

interface ConfigState {
  selectedRam: ConfigOption | null;
  selectedSsd: ConfigOption | null;
  basePrice: number;
  setSelectedRam: (option: ConfigOption) => void;
  setSelectedSsd: (option: ConfigOption) => void;
  setBasePrice: (price: number) => void;
  getTotalPrice: () => number;
  reset: () => void;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  selectedRam: null,
  selectedSsd: null,
  basePrice: 0,

  setSelectedRam: (option) => set({ selectedRam: option }),

  setSelectedSsd: (option) => set({ selectedSsd: option }),

  setBasePrice: (price) => set({ basePrice: price }),

  getTotalPrice: () => {
    const { basePrice, selectedRam, selectedSsd } = get();
    const ramDelta = selectedRam?.priceDelta || 0;
    const ssdDelta = selectedSsd?.priceDelta || 0;
    return basePrice + ramDelta + ssdDelta;
  },

  reset: () =>
    set({
      selectedRam: null,
      selectedSsd: null,
      basePrice: 0,
    }),
}));
