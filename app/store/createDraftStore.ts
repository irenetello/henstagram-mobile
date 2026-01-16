import { create } from "zustand";

export type CreateDraftState = {
  imageUri: string | null;
  caption: string;
  isCaptionFocused: boolean;

  setImageUri: (uri: string | null) => void;
  setCaption: (text: string) => void;
  setCaptionFocused: (focused: boolean) => void;

  resetDraft: () => void;
};

export const useCreateDraftStore = create<CreateDraftState>((set) => ({
  imageUri: null,
  caption: "",
  isCaptionFocused: false,

  setImageUri: (uri) => set({ imageUri: uri }),
  setCaption: (text) => set({ caption: text }),
  setCaptionFocused: (focused) => set({ isCaptionFocused: focused }),

  resetDraft: () => set({ imageUri: null, caption: "", isCaptionFocused: false }),
}));
