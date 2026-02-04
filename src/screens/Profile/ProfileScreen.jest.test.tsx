/* eslint-disable @typescript-eslint/no-require-imports */
/// <reference types="jest" />

import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";

import ProfileScreen from "./ProfileScreen";
import { useMyPosts } from "@/src/hooks/useMyPosts";
import { signOut } from "firebase/auth";

jest.mock("@/src/hooks/useMyPosts", () => ({
  useMyPosts: jest.fn(),
}));

jest.mock("../../hooks/useLikesCount", () => ({
  useLikesCount: jest.fn(() => 25),
}));

jest.mock("@/src/hooks/useIsLiked", () => ({
  useIsLiked: jest.fn(() => false),
}));

// ✅ Agregar mock de useComments
jest.mock("../../hooks/useComments", () => ({
  useComments: jest.fn(() => ({ comments: [], loading: false })),
}));

// ✅ Agregar mock de commentApi
jest.mock("@/src/lib/comments/commentApi", () => ({
  addComment: jest.fn(),
  deleteComment: jest.fn(),
}));

jest.mock("../../auth/AuthProvider", () => ({
  useAuth: jest.fn(() => ({ user: { uid: "test-user-id" } })),
}));

jest.mock("firebase/auth", () => ({
  signOut: jest.fn(),
}));

jest.mock("@/src/lib/auth", () => ({
  auth: {
    currentUser: { uid: "test-user-id" },
  },
}));

jest.mock("@/src/lib/posts/postApi", () => ({
  deletePost: jest.fn(),
}));

jest.mock("@/src/lib/posts/likeApi", () => ({
  toggleLike: jest.fn(),
}));

jest.mock("@/src/components/Screen/Screen", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    Screen: ({ children, title, headerRight }: any) => (
      <View testID="screen">
        <Text testID="screen-title">{title}</Text>
        {headerRight}
        {children}
      </View>
    ),
  };
});

jest.mock("expo-image", () => {
  const { View, Text } = require("react-native");
  return {
    Image: ({ source, testID }: any) => (
      <View testID={testID || "image"}>
        <Text>Image: {source.uri}</Text>
      </View>
    ),
  };
});

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Ionicons: ({ name, testID }: any) => <Text testID={testID || "icon"}>{name}</Text>,
  };
});

// ✅ FIX: Usar el path correcto
jest.mock("@/src/screens/Profile/ProfileScreen.styles", () => ({
  COLS: 3,
  styles: {
    logoutText: {},
    row: {},
    list: {},
    tile: {},
    img: {},
    detailWrap: {},
    detailHeader: {},
    detailTitle: {},
    detailImage: {},
    captionWrap: {},
    displayName: {},
    captionText: {},
    sheetBackdrop: {},
    sheet: {},
    sheetBtn: {},
    sheetDelete: {},
    sheetCancel: {},
  },
}));

jest.spyOn(Alert, "alert");

const mockUseMyPosts = useMyPosts as unknown as jest.Mock;

describe("ProfileScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as unknown as jest.Mock).mockRestore?.();
  });

  it("shows loading indicator when loading", () => {
    mockUseMyPosts.mockReturnValue({ posts: [], loading: true });

    render(<ProfileScreen />);

    // ✅ FIX: ActivityIndicator no tiene testID por defecto
    expect(
      screen.UNSAFE_getByType(require("react-native").ActivityIndicator),
    ).toBeTruthy();
  });

  it("renders profile title", () => {
    mockUseMyPosts.mockReturnValue({ posts: [], loading: false });

    render(<ProfileScreen />);

    expect(screen.getByTestId("screen-title")).toHaveTextContent("Profile");
  });

  it("renders logout button", () => {
    mockUseMyPosts.mockReturnValue({ posts: [], loading: false });

    render(<ProfileScreen />);

    expect(screen.getByText("Log out")).toBeTruthy();
  });

  it("calls signOut when logout pressed", async () => {
    mockUseMyPosts.mockReturnValue({ posts: [], loading: false });

    render(<ProfileScreen />);

    fireEvent.press(screen.getByText("Log out"));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
    });
  });

  it("shows alert on logout error", async () => {
    mockUseMyPosts.mockReturnValue({ posts: [], loading: false });
    (signOut as unknown as jest.Mock).mockRejectedValue(new Error("Logout failed"));

    render(<ProfileScreen />);

    fireEvent.press(screen.getByText("Log out"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", "No se pudo cerrar sesión.");
    });
  });

  it("renders grid of posts", () => {
    const mockPosts = [
      {
        id: "post-1",
        userId: "test-user-id",
        username: "testuser",
        imageUrl: "https://example.com/image1.jpg",
        caption: "Post 1",
        storagePath: "path1",
        createdAt: new Date(),
      },
      {
        id: "post-2",
        userId: "test-user-id",
        username: "testuser",
        imageUrl: "https://example.com/image2.jpg",
        caption: "Post 2",
        storagePath: "path2",
        createdAt: new Date(),
      },
    ];

    mockUseMyPosts.mockReturnValue({ posts: mockPosts, loading: false });

    render(<ProfileScreen />);

    expect(screen.getByText("Image: https://example.com/image1.jpg")).toBeTruthy();
    expect(screen.getByText("Image: https://example.com/image2.jpg")).toBeTruthy();
  });

  it("opens modal when post is pressed", () => {
    const mockPosts = [
      {
        id: "post-1",
        userId: "test-user-id",
        username: "testuser",
        imageUrl: "https://example.com/image.jpg",
        caption: "My post",
        storagePath: "path1",
        createdAt: new Date(),
      },
    ];

    mockUseMyPosts.mockReturnValue({ posts: mockPosts, loading: false });

    render(<ProfileScreen />);

    fireEvent.press(screen.getAllByText(/Image:/)[0]);

    // ✅ Verificar que el modal se abrió
    expect(screen.getByText("testuser")).toBeTruthy();
    expect(screen.getByText("25")).toBeTruthy();
  });

  it("shows username in modal", () => {
    const mockPosts = [
      {
        id: "post-1",
        userId: "test-user-id",
        username: "cooluser",
        imageUrl: "https://example.com/image.jpg",
        caption: "Test caption",
        storagePath: "path1",
        createdAt: new Date(),
      },
    ];

    mockUseMyPosts.mockReturnValue({ posts: mockPosts, loading: false });

    render(<ProfileScreen />);

    fireEvent.press(screen.getAllByText(/Image:/)[0]);

    expect(screen.getByText("cooluser")).toBeTruthy();
  });

  it("shows Post as title when username not available", () => {
    const mockPosts = [
      {
        id: "post-1",
        userId: "test-user-id",
        userEmail: "test@example.com",
        imageUrl: "https://example.com/image.jpg",
        caption: "Test caption",
        storagePath: "path1",
        createdAt: new Date(),
      },
    ];

    mockUseMyPosts.mockReturnValue({ posts: mockPosts, loading: false });

    render(<ProfileScreen />);

    fireEvent.press(screen.getAllByText(/Image:/)[0]);

    expect(screen.getByText("Post")).toBeTruthy();
  });

  it("shows Post as title when no user info", () => {
    const mockPosts = [
      {
        id: "post-1",
        userId: "test-user-id",
        imageUrl: "https://example.com/image.jpg",
        caption: "Test caption",
        storagePath: "path1",
        createdAt: new Date(),
      },
    ];

    mockUseMyPosts.mockReturnValue({ posts: mockPosts, loading: false });

    render(<ProfileScreen />);

    fireEvent.press(screen.getAllByText(/Image:/)[0]);

    expect(screen.getByText("Post")).toBeTruthy();
  });

  it("displays likes count in modal", () => {
    const mockPosts = [
      {
        id: "post-1",
        userId: "test-user-id",
        username: "testuser",
        imageUrl: "https://example.com/image.jpg",
        caption: "Test",
        storagePath: "path1",
        createdAt: new Date(),
      },
    ];

    mockUseMyPosts.mockReturnValue({ posts: mockPosts, loading: false });

    render(<ProfileScreen />);

    fireEvent.press(screen.getAllByText(/Image:/)[0]);

    expect(screen.getByText("25")).toBeTruthy();
  });

  it("shows delete option for own posts", () => {
    const mockPosts = [
      {
        id: "post-1",
        userId: "test-user-id",
        username: "me",
        imageUrl: "https://example.com/image.jpg",
        caption: "My post",
        storagePath: "path1",
        createdAt: new Date(),
      },
    ];

    mockUseMyPosts.mockReturnValue({ posts: mockPosts, loading: false });

    render(<ProfileScreen />);

    fireEvent.press(screen.getAllByText(/Image:/)[0]);

    const menuButton = screen.getByText("ellipsis-horizontal");
    fireEvent.press(menuButton);

    expect(screen.getByText("Delete")).toBeTruthy();
  });

  it("shows confirmation alert when delete pressed", () => {
    const mockPosts = [
      {
        id: "post-1",
        userId: "test-user-id",
        username: "me",
        imageUrl: "https://example.com/image.jpg",
        caption: "My post",
        storagePath: "path1",
        createdAt: new Date(),
      },
    ];

    mockUseMyPosts.mockReturnValue({ posts: mockPosts, loading: false });

    render(<ProfileScreen />);

    fireEvent.press(screen.getAllByText(/Image:/)[0]);

    const menuButton = screen.getByText("ellipsis-horizontal");
    fireEvent.press(menuButton);

    const deleteButton = screen.getByText("Delete");
    fireEvent.press(deleteButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      "Delete post",
      "Are you sure you want to delete this photo?",
      expect.any(Array),
    );
  });

  it("doesn't render caption when empty", () => {
    const mockPosts = [
      {
        id: "post-1",
        userId: "test-user-id",
        username: "testuser",
        imageUrl: "https://example.com/image.jpg",
        caption: "",
        storagePath: "path1",
        createdAt: new Date(),
      },
    ];

    mockUseMyPosts.mockReturnValue({ posts: mockPosts, loading: false });

    render(<ProfileScreen />);

    fireEvent.press(screen.getAllByText(/Image:/)[0]);

    // ✅ FIX: Cuando caption está vacío, NO se muestra la sección de caption
    // Solo debe aparecer "testuser" en el header, no en caption
    const usernames = screen.getAllByText("testuser");
    expect(usernames.length).toBe(1); // Solo en header
  });

  it("closes modal when close button pressed", () => {
    const mockPosts = [
      {
        id: "post-1",
        userId: "test-user-id",
        username: "testuser",
        imageUrl: "https://example.com/image.jpg",
        caption: "My post",
        storagePath: "path1",
        createdAt: new Date(),
      },
    ];

    mockUseMyPosts.mockReturnValue({ posts: mockPosts, loading: false });

    render(<ProfileScreen />);

    fireEvent.press(screen.getAllByText(/Image:/)[0]);

    expect(screen.getByText("testuser")).toBeTruthy();

    const closeButton = screen.getByText("close");
    fireEvent.press(closeButton);

    expect(screen.queryByText("My post")).toBeNull();
  });
});
