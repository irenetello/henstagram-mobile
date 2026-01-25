import { create } from "zustand";

export type CreateDraftState = {
  imageUri: string | null;
  caption: string;
  isCaptionFocused: boolean;

  challengeId: string | null;
  challengeTitle: string | null;

  setImageUri: (uri: string | null) => void;
  setCaption: (text: string) => void;
  setCaptionFocused: (focused: boolean) => void;

  setChallenge: (id: string | null, title?: string | null) => void;

  resetDraft: () => void;
};

export const useCreateDraftStore = create<CreateDraftState>((set) => ({
  imageUri: null,
  caption: "",
  isCaptionFocused: false,

  challengeId: null,
  challengeTitle: null,

  setChallenge: (id, title = null) => set({ challengeId: id, challengeTitle: title }),

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
    }),
}));
