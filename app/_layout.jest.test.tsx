/* eslint-disable @typescript-eslint/no-require-imports */
/// <reference types="jest" />

import React from "react";
import { render, waitFor } from "@testing-library/react-native";

const mockReplace = jest.fn();
const mockUseFonts = jest.fn();
const mockHideAsync = jest.fn(() => Promise.resolve());
const mockPreventAutoHideAsync = jest.fn(() => Promise.resolve());

let mockSegments: string[] = [];
let mockAuthState: { user: any; initializing: boolean } = {
  user: null,
  initializing: false,
};

jest.mock("expo-font", () => ({
  useFonts: (...args: any[]) => mockUseFonts(...args),
}));

jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: () => mockPreventAutoHideAsync(),
  hideAsync: () => mockHideAsync(),
}));

jest.mock("expo-router", () => {
  const { View } = require("react-native");
  const Stack: any = ({ children }: any) => <View testID="stack">{children}</View>;
  Stack.Screen = ({ children }: any) => <View>{children}</View>;

  return {
    Stack,
    useRouter: () => ({ replace: mockReplace }),
    useSegments: () => mockSegments,
    ErrorBoundary: () => null,
  };
});

jest.mock("@react-navigation/native", () => {
  const { View } = require("react-native");
  return {
    ThemeProvider: ({ children }: any) => <View>{children}</View>,
    DarkTheme: { dark: true },
    DefaultTheme: { dark: false },
  };
});

jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");
  return {
    SafeAreaProvider: ({ children }: any) => <View>{children}</View>,
  };
});

jest.mock("@expo/vector-icons/FontAwesome", () => ({
  __esModule: true,
  default: { font: {} },
}));

jest.mock("@/src/components/useColorScheme", () => ({
  useColorScheme: () => "light",
}));

jest.mock("@/src/notifications/NotificationTapHandler", () => ({
  NotificationTapHandler: () => null,
}));

jest.mock("@/src/notifications/ChallengeNotificationScheduler", () => ({
  ChallengeNotificationScheduler: () => null,
}));

jest.mock("@/src/auth/AuthProvider", () => {
  return {
    AuthProvider: ({ children }: any) => <>{children}</>,
    useAuth: () => mockAuthState,
  };
});

describe("app/_layout RootLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSegments = [];
    mockAuthState = { user: null, initializing: false };
    mockUseFonts.mockReturnValue([true, null]);
  });

  it("returns null while fonts are not loaded", () => {
    mockUseFonts.mockReturnValue([false, null]);
    const RootLayout = require("./_layout").default;

    const { toJSON } = render(<RootLayout />);
    expect(toJSON()).toBeNull();
  });

  it("redirects to login when unauthenticated outside login", async () => {
    const RootLayout = require("./_layout").default;
    render(<RootLayout />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login");
      expect(mockHideAsync).toHaveBeenCalled();
    });
  });

  it("redirects to feed when authenticated and currently in login", async () => {
    mockAuthState = { user: { uid: "u1" }, initializing: false };
    mockSegments = ["login"];
    const RootLayout = require("./_layout").default;

    render(<RootLayout />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)/feed");
    });
  });

  it("does not redirect while auth is initializing", async () => {
    mockAuthState = { user: null, initializing: true };
    const RootLayout = require("./_layout").default;

    render(<RootLayout />);

    await waitFor(() => {
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});
