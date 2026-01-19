import type { Post } from "@/components/PostCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const CURRENT_USER = "Irene"; // temporal hasta que haya auth real

const SEED_POSTS: Post[] = [
  {
    id: "1",
    imageUrl: "https://picsum.photos/900/900?1",
    caption: "First memory ✨",
    authorName: "Irene",
    createdAt: Date.now(),
    likesCount: 3,
  },
  {
    id: "2",
    imageUrl: "https://picsum.photos/900/900?2",
    caption: "Chaos mode: ON 😈",
    authorName: "Helene",
    createdAt: Date.now(),
    likesCount: 7,
  },
  {
    id: "3",
    imageUrl: "https://picsum.photos/900/900?3",
    caption: "Brunch vibes 🥐",
    authorName: "Irene",
    createdAt: Date.now(),
    likesCount: 1,
  },
];

type PostsState = {
  posts: Post[];
  addPost: (input: { imageUrl: string; caption: string; authorName?: string }) => Post;
  getPostById: (id: string) => Post | undefined;

  // opcional: para resetear en dev
  resetPosts: () => void;
};

export const usePostsStore = create<PostsState>()(
  persist(
    (set, get) => ({
      posts: SEED_POSTS,

      addPost: ({ imageUrl, caption, authorName }) => {
        const newPost: Post = {
          id: String(Date.now()),
          imageUrl,
          caption: caption.trim(),
          authorName: authorName ?? CURRENT_USER,
          createdAt: Date.now(),
          likesCount: 0,
        };

        set((state) => ({ posts: [newPost, ...state.posts] }));
        return newPost;
      },

      getPostById: (id) => get().posts.find((p) => p.id === id),

      resetPosts: () => set({ posts: SEED_POSTS }),
    }),
    {
      name: "henstagram-posts",
      storage: createJSONStorage(() => AsyncStorage),

      // guardamos solo lo necesario
      partialize: (state) => ({ posts: state.posts }),
    },
  ),
);
