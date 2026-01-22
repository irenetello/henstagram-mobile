/* eslint-disable @typescript-eslint/no-require-imports */
/// <reference types="jest" />

import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";

import FeedScreen from "./FeedScreen";
import { usePosts } from "@/src/hooks/usePosts";
import { deletePost } from "@/src/lib/posts/postApi";

// ❌ NO HAGAS ESTO (rompe por hoisting):
// import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("@/src/hooks/usePosts", () => ({
  usePosts: jest.fn(),
}));

jest.mock("@/src/hooks/useLikesCount", () => ({
  useLikesCount: jest.fn(() => 42),
}));

jest.mock("@/src/hooks/useIsLiked", () => ({
  useIsLiked: jest.fn(() => false),
}));

// ✅ OJO: tu FeedScreen importa desde "@/src/auth/AuthProvider"
jest.mock("@/src/auth/AuthProvider", () => ({
  useAuth: jest.fn(() => ({ user: { uid: "test-user-id" } })),
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

// ✅ FIX: View/Text SOLO dentro del factory
jest.mock("@/src/components/Screen/Screen", () => {
  const React = require("react");
  const { View, Text } = require("react-native");

  return {
    Screen: ({ children, title }: any) => (
      <View testID="screen">
        <Text>{title}</Text>
        {children}
      </View>
    ),
  };
});

jest.mock("@/src/components/PostHeader/PostHeader", () => {
  const { View, Text, Pressable } = require("react-native");

  return {
    PostHeader: ({ displayName, isOwner, onDelete }: any) => (
      <View testID="post-header">
        <Text testID="display-name">{displayName}</Text>
        <Text testID="is-owner">{String(isOwner)}</Text>
        {isOwner && (
          <Pressable testID="delete-button" onPress={onDelete}>
            <Text>Delete</Text>
          </Pressable>
        )}
      </View>
    ),
  };
});

jest.mock("expo-image", () => {
  const { View, Text } = require("react-native");

  return {
    Image: ({ source, testID, ...props }: any) => (
      <View testID={testID || "image"} {...props}>
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

// ✅ OJO: FeedScreen usa "@/src/screens/Feed/FeedScreen.styles"
jest.mock("@/src/screens/Feed/FeedScreen.styles", () => ({
  styles: {
    card: {},
    image: {},
    likesRow: {},
    likeBtn: {},
    likesText: {},
    captionWrap: {},
    displayName: {},
    captionText: {},
    emptyWrap: {},
    emptyTitle: {},
    emptySubtitle: {},
    listContent: {},
  },
}));

const mockUsePosts = usePosts as unknown as jest.Mock;

describe("FeedScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading indicator when loading", () => {
    mockUsePosts.mockReturnValue({ posts: [], loading: true });

    render(<FeedScreen />);

    expect(screen.getByTestId("activity-indicator")).toBeTruthy();
  });

  it("shows empty state when no posts", () => {
    mockUsePosts.mockReturnValue({ posts: [], loading: false });

    render(<FeedScreen />);

    expect(screen.getByText("No hay posts todavía")).toBeTruthy();
    expect(screen.getByText("Sé la primera en subir una foto 👀")).toBeTruthy();
  });

  it("renders list of posts", () => {
    const mockPosts = [
      {
        id: "post-1",
        userId: "user-1",
        username: "testuser1",
        userEmail: "test1@example.com",
        imageUrl: "https://example.com/image1.jpg",
        caption: "Caption 1",
      },
      {
        id: "post-2",
        userId: "user-2",
        username: "testuser2",
        userEmail: "test2@example.com",
        imageUrl: "https://example.com/image2.jpg",
        caption: "Caption 2",
      },
    ];

    mockUsePosts.mockReturnValue({ posts: mockPosts, loading: false });

    render(<FeedScreen />);

    expect(screen.getAllByText("testuser1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("testuser2").length).toBeGreaterThan(0);
    expect(screen.getByText("Caption 1")).toBeTruthy();
    expect(screen.getByText("Caption 2")).toBeTruthy();
  });

  it("shows username as display name", () => {
    const mockPosts = [
      {
        id: "post-1",
        userId: "user-1",
        username: "cooluser",
        userEmail: "test@example.com",
        imageUrl: "https://example.com/image.jpg",
        caption: "Test",
      },
    ];

    mockUsePosts.mockReturnValue({ posts: mockPosts, loading: false });

    render(<FeedScreen />);

    const displayNames = screen.getAllByTestId("display-name");
    expect(displayNames[0]).toHaveTextContent("cooluser");
  });

  it("falls back to email when username not available", () => {
    const mockPosts = [
      {
        id: "post-1",
        userId: "user-1",
        userEmail: "test@example.com",
        imageUrl: "https://example.com/image.jpg",
        caption: "Test",
      },
    ];

    mockUsePosts.mockReturnValue({ posts: mockPosts, loading: false });

    render(<FeedScreen />);

    const displayNames = screen.getAllByTestId("display-name");
    expect(displayNames[0]).toHaveTextContent("test@example.com");
  });

  it("falls back to 'Hey Friend' when no user info", () => {
    const mockPosts = [
      {
        id: "post-1",
        userId: "user-1",
        imageUrl: "https://example.com/image.jpg",
        caption: "Test",
      },
    ];

    mockUsePosts.mockReturnValue({ posts: mockPosts, loading: false });

    render(<FeedScreen />);

    const displayNames = screen.getAllByTestId("display-name");
    expect(displayNames[0]).toHaveTextContent("Hey Friend");
  });

  it("shows owner controls for own posts", () => {
    const mockPosts = [
      {
        id: "post-1",
        userId: "test-user-id",
        username: "me",
        imageUrl: "https://example.com/image.jpg",
        caption: "My post",
      },
    ];

    mockUsePosts.mockReturnValue({ posts: mockPosts, loading: false });

    render(<FeedScreen />);

    expect(screen.getByTestId("is-owner")).toHaveTextContent("true");
    expect(screen.getByTestId("delete-button")).toBeTruthy();
  });

  it("hides owner controls for other users' posts", () => {
    const mockPosts = [
      {
        id: "post-1",
        userId: "other-user-id",
        username: "other",
        imageUrl: "https://example.com/image.jpg",
        caption: "Their post",
      },
    ];

    mockUsePosts.mockReturnValue({ posts: mockPosts, loading: false });

    render(<FeedScreen />);

    expect(screen.getByTestId("is-owner")).toHaveTextContent("false");
  });

  it("calls deletePost when delete button pressed", async () => {
    const mockPosts = [
      {
        id: "post-1",
        userId: "test-user-id",
        username: "me",
        imageUrl: "https://example.com/image.jpg",
        caption: "My post",
      },
    ];

    mockUsePosts.mockReturnValue({ posts: mockPosts, loading: false });

    render(<FeedScreen />);

    fireEvent.press(screen.getByTestId("delete-button"));

    await waitFor(() => {
      expect(deletePost).toHaveBeenCalledWith(mockPosts[0]);
    });
  });

  it("renders images with correct URIs", () => {
    const mockPosts = [
      {
        id: "post-1",
        userId: "user-1",
        username: "testuser",
        imageUrl: "https://example.com/image.jpg",
        caption: "Test",
      },
    ];

    mockUsePosts.mockReturnValue({ posts: mockPosts, loading: false });

    render(<FeedScreen />);

    expect(screen.getByText("Image: https://example.com/image.jpg")).toBeTruthy();
  });

  it("displays likes count", () => {
    const mockPosts = [
      {
        id: "post-1",
        userId: "user-1",
        username: "testuser",
        imageUrl: "https://example.com/image.jpg",
        caption: "Test",
      },
    ];

    mockUsePosts.mockReturnValue({ posts: mockPosts, loading: false });

    render(<FeedScreen />);

    expect(screen.getByText("42")).toBeTruthy();
  });
});
