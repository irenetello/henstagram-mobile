import { create } from "zustand";

export type CreateDraftState = {
  imageUri: string | null;
  caption: string;
  isCaptionFocused: boolean;

  challengeId: string | null;
  challengeTitle: string | null;

  bingoCardId: string | null;
  bingoCellId: string | null;
  bingoCellText: string | null;

  setImageUri: (uri: string | null) => void;
  setCaption: (text: string) => void;
  setCaptionFocused: (focused: boolean) => void;

  setChallenge: (id: string | null, title?: string | null) => void;
  setBingo: (
    cardId: string | null,
    cellId?: string | null,
    cellText?: string | null,
  ) => void;

  resetDraft: () => void;
  startBingoDraft: (cardId: string, cellId: string, cellText?: string | null) => void;
};

export const useCreateDraftStore = create<CreateDraftState>((set) => ({
  imageUri: null,
  caption: "",
  isCaptionFocused: false,

  challengeId: null,
  challengeTitle: null,

  bingoCardId: null,
  bingoCellId: null,
  bingoCellText: null,

  setChallenge: (id, title = null) => set({ challengeId: id, challengeTitle: title }),

  setBingo: (cardId, cellId = null, cellText = null) =>
    set({ bingoCardId: cardId, bingoCellId: cellId, bingoCellText: cellText }),

  setImageUri: (uri) => set({ imageUri: uri }),
  setCaption: (text) => set({ caption: text }),
  setCaptionFocused: (focused) => set({ isCaptionFocused: focused }),

  resetDraft: () =>
    set({
      imageUri: null,
      caption: "",
      isCaptionFocused: false,
      challengeId: null,
      challengeTitle: null,
      bingoCardId: null,
      bingoCellId: null,
      bingoCellText: null,
    }),
  startBingoDraft: (cardId, cellId, cellText = null) =>
    set({
      imageUri: null,
      caption: "",
      isCaptionFocused: false,
      challengeId: null,
      challengeTitle: null,
      bingoCardId: cardId,
      bingoCellId: cellId,
      bingoCellText: cellText,
    }),
}));
