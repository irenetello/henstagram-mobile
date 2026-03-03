import { create } from "zustand";

type BingoFocus = {
  cardId: string | null;
  cellId: string | null;
};

type BingoStore = {
  focus: BingoFocus;
  setFocus: (cardId: string, cellId: string) => void;
  clearFocus: () => void;
};

export const useBingoStore = create<BingoStore>((set) => ({
  focus: { cardId: null, cellId: null },
  setFocus: (cardId, cellId) => set({ focus: { cardId, cellId } }),
  clearFocus: () => set({ focus: { cardId: null, cellId: null } }),
}));
