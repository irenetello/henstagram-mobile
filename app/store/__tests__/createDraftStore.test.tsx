import { beforeEach, describe, expect, it } from "vitest";
import { useCreateDraftStore } from "../createDraftStore";

describe("createDraftStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useCreateDraftStore.getState().resetDraft();
  });

  it("setImageUri changes the image", () => {
    const testUri = "file:///path/to/image.jpg";

    useCreateDraftStore.getState().setImageUri(testUri);

    expect(useCreateDraftStore.getState().imageUri).toBe(testUri);
  });

  it("setImageUri can set to null", () => {
    useCreateDraftStore.getState().setImageUri("some-uri");
    useCreateDraftStore.getState().setImageUri(null);

    expect(useCreateDraftStore.getState().imageUri).toBeNull();
  });

  it("setCaption changes the text", () => {
    const testCaption = "My test caption";

    useCreateDraftStore.getState().setCaption(testCaption);

    expect(useCreateDraftStore.getState().caption).toBe(testCaption);
  });

  it("setCaption updates caption correctly", () => {
    useCreateDraftStore.getState().setCaption("First");
    useCreateDraftStore.getState().setCaption("Second");

    expect(useCreateDraftStore.getState().caption).toBe("Second");
  });

  it("setCaptionFocused changes focus state", () => {
    expect(useCreateDraftStore.getState().isCaptionFocused).toBe(false);

    useCreateDraftStore.getState().setCaptionFocused(true);
    expect(useCreateDraftStore.getState().isCaptionFocused).toBe(true);

    useCreateDraftStore.getState().setCaptionFocused(false);
    expect(useCreateDraftStore.getState().isCaptionFocused).toBe(false);
  });

  it("resetDraft clears everything", () => {
    // Set some values
    useCreateDraftStore.getState().setImageUri("file:///test.jpg");
    useCreateDraftStore.getState().setCaption("Test caption");
    useCreateDraftStore.getState().setCaptionFocused(true);

    // Verify they're set
    expect(useCreateDraftStore.getState().imageUri).not.toBeNull();
    expect(useCreateDraftStore.getState().caption).not.toBe("");
    expect(useCreateDraftStore.getState().isCaptionFocused).toBe(true);

    // Reset
    useCreateDraftStore.getState().resetDraft();

    // Verify everything is cleared
    expect(useCreateDraftStore.getState().imageUri).toBeNull();
    expect(useCreateDraftStore.getState().caption).toBe("");
    expect(useCreateDraftStore.getState().isCaptionFocused).toBe(false);
  });
});
