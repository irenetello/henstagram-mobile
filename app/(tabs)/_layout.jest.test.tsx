/* eslint-disable @typescript-eslint/no-require-imports */
/// <reference types="jest" />

import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert, Keyboard } from "react-native";

const mockSetPage = jest.fn();
const mockOnTabRequest = jest.fn();

let tabRequestCallback: ((tab: any) => void) | null = null;

const mockStore = {
  imageUri: null as string | null,
  caption: "",
  isCaptionFocused: false,
  resetDraft: jest.fn(),
};

jest.mock("react-native-pager-view", () => {
  const ReactLocal = require("react");
  const { View } = require("react-native");
  return ReactLocal.forwardRef((_props: any, ref: any) => {
    ReactLocal.useImperativeHandle(ref, () => ({ setPage: mockSetPage }));
    return <View testID="pager">{_props.children}</View>;
  });
});

jest.mock("react-native-safe-area-context", () => {
  const ReactLocal = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaView: ({ children }: any) => <View>{children}</View>,
  };
});

jest.mock("@/src/store/createDraftStore", () => ({
  useCreateDraftStore: (selector: any) => selector(mockStore),
}));

jest.mock("@/src/lib/tabs/tabBus", () => ({
  onTabRequest: (...args: any[]) => mockOnTabRequest(...args),
}));

jest.mock("./feed", () => {
  const ReactLocal = require("react");
  const { Text } = require("react-native");
  return () => <Text>FeedScreen</Text>;
});

jest.mock("./create", () => {
  const ReactLocal = require("react");
  const { Text } = require("react-native");
  return () => <Text>CreateScreen</Text>;
});

jest.mock("./challenges", () => {
  const ReactLocal = require("react");
  const { Text } = require("react-native");
  return () => <Text>ChallengesScreen</Text>;
});

jest.mock("./ourHistory", () => {
  const ReactLocal = require("react");
  const { Text } = require("react-native");
  return () => <Text>OurHistoryScreen</Text>;
});

jest.mock("./profileScreen", () => {
  const ReactLocal = require("react");
  const { Text } = require("react-native");
  return () => <Text>ProfileScreen</Text>;
});

jest.mock("@/src/components/BottomTabBar", () => {
  const ReactLocal = require("react");
  const { Pressable, Text, View } = require("react-native");
  return {
    BottomTabBar: ({ activeTab, onTabPress }: any) => (
      <View>
        <Text testID="active-tab">{activeTab}</Text>
        <Pressable onPress={() => onTabPress("profile")}>
          <Text>go-profile</Text>
        </Pressable>
        <Pressable onPress={() => onTabPress("feed")}>
          <Text>go-feed</Text>
        </Pressable>
        <Pressable onPress={() => onTabPress("create")}>
          <Text>go-create</Text>
        </Pressable>
      </View>
    ),
  };
});

describe("app/(tabs)/_layout TabsLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
    jest.spyOn(Keyboard, "dismiss").mockImplementation(() => {});
    jest
      .spyOn(Keyboard, "addListener")
      .mockImplementation(() => ({ remove: jest.fn() }) as any);

    mockStore.imageUri = null;
    mockStore.caption = "";
    mockStore.isCaptionFocused = false;
    tabRequestCallback = null;

    mockOnTabRequest.mockImplementation((cb: any) => {
      tabRequestCallback = cb;
      return jest.fn();
    });
  });

  it("navigates via BottomTabBar press", async () => {
    const TabsLayout = require("./_layout").default;
    const { getByText } = render(<TabsLayout />);

    fireEvent.press(getByText("go-profile"));

    await waitFor(() => {
      expect(mockSetPage).toHaveBeenCalledWith(4);
    });
  });

  it("ignores press to current active tab", async () => {
    const TabsLayout = require("./_layout").default;
    const { getByText } = render(<TabsLayout />);

    fireEvent.press(getByText("go-feed"));

    await waitFor(() => {
      expect(mockSetPage).not.toHaveBeenCalled();
    });
  });

  it("responds to tab bus requests", async () => {
    const TabsLayout = require("./_layout").default;
    render(<TabsLayout />);

    expect(tabRequestCallback).toBeTruthy();
    act(() => {
      tabRequestCallback?.("challenges");
    });

    await waitFor(() => {
      expect(mockSetPage).toHaveBeenCalledWith(2);
    });
  });

  it("asks to discard when leaving create with dirty draft", async () => {
    const TabsLayout = require("./_layout").default;
    mockStore.caption = "dirty caption";

    const { getByText } = render(<TabsLayout />);
    fireEvent.press(getByText("go-create"));
    fireEvent.press(getByText("go-profile"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
      expect(Keyboard.dismiss).toHaveBeenCalled();
    });
  });
});
