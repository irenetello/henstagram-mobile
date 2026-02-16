/* eslint-disable @typescript-eslint/no-require-imports */
/// <reference types="jest" />

import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import CreateScreen from "./CreateScreen";
import * as ImagePicker from "expo-image-picker";
import { publishPost } from "@/src/lib/posts/firebasePosts";

const mockReplace = jest.fn();
let mockParams: { challengeId?: string; challengeTitle?: string } = {};

const mockStoreState = {
  imageUri: null as string | null,
  caption: "",
  isCaptionFocused: false,
  challengeId: null as string | null,
  challengeTitle: null as string | null,
  setImageUri: jest.fn(),
  setCaption: jest.fn(),
  setCaptionFocused: jest.fn(),
  setChallenge: jest.fn(),
  resetDraft: jest.fn(),
};

jest.mock("@/src/components/Screen/Screen", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    Screen: ({ children, title }: any) => (
      <View>
        <Text>{title}</Text>
        {children}
      </View>
    ),
  };
});

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => mockParams,
}));

jest.mock("@/src/auth/AuthProvider", () => ({
  useAuth: jest.fn(() => ({ user: { uid: "u1" }, initializing: false })),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@/src/store/createDraftStore", () => ({
  useCreateDraftStore: (selector: any) => selector(mockStoreState),
}));

jest.mock("@/src/lib/posts/firebasePosts", () => ({
  publishPost: jest.fn(),
}));

jest.mock("expo-image-picker", () => ({
  MediaTypeOptions: { Images: "Images" },
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));

describe("CreateScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
    mockParams = {};
    mockStoreState.imageUri = null;
    mockStoreState.caption = "";
    mockStoreState.challengeId = null;
    mockStoreState.challengeTitle = null;
  });

  it("sets challenge from route params", () => {
    mockParams = { challengeId: "ch-1", challengeTitle: "Weekly" };

    render(<CreateScreen />);

    expect(mockStoreState.setChallenge).toHaveBeenCalledWith("ch-1", "Weekly");
  });

  it("publishes and redirects to feed when there is no active challenge", async () => {
    mockStoreState.imageUri = "file://img.jpg";
    mockStoreState.caption = "  hello world  ";
    (publishPost as jest.Mock).mockResolvedValueOnce(undefined);

    render(<CreateScreen />);

    fireEvent.press(screen.getByText("Post"));

    await waitFor(() => {
      expect(publishPost).toHaveBeenCalledWith(
        "file://img.jpg",
        "hello world",
        undefined,
      );
      expect(mockStoreState.resetDraft).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)/feed");
    });
  });

  it("publishes and redirects to challenge detail when challenge is active", async () => {
    mockStoreState.imageUri = "file://img.jpg";
    mockStoreState.caption = "caption";
    mockStoreState.challengeId = "ch-7";
    mockStoreState.challengeTitle = "Title";
    (publishPost as jest.Mock).mockResolvedValueOnce(undefined);

    render(<CreateScreen />);

    fireEvent.press(screen.getByText("Post"));

    await waitFor(() => {
      expect(publishPost).toHaveBeenCalledWith("file://img.jpg", "caption", {
        challengeId: "ch-7",
        challengeTitle: "Title",
      });
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: "/challenge/[id]",
        params: { id: "ch-7" },
      });
    });
  });

  it("shows alert when gallery permission is denied", async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      granted: false,
    });

    render(<CreateScreen />);

    fireEvent.press(screen.getByText("Gallery"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Permission needed",
        "We need access to your photos to post a memory.",
      );
    });
  });
});
