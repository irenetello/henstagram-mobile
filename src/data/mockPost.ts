import { Post } from "../types/post";

export const CURRENT_USER = "Irene"; // temporal hasta que haya auth

export const MOCK_POSTS: Post[] = [
  {
    id: "1",
    imageUrl: "https://picsum.photos/900/900?1",
    caption: "First memory ✨",
    username: "Irene",
    createdAt: Date.now(),
    likesCount: 3,
    userId: "1",
  },
  {
    id: "2",
    imageUrl: "https://picsum.photos/900/900?2",
    caption: "Chaos mode: ON 😈",
    username: "Helene",
    createdAt: Date.now(),
    likesCount: 7,
    userId: "2",
  },
  {
    id: "3",
    imageUrl: "https://picsum.photos/900/900?3",
    caption: "Brunch vibes 🥐",
    username: "Irene",
    createdAt: Date.now(),
    likesCount: 1,
    userId: "3",
  },
  {
    id: "4",
    imageUrl: "https://picsum.photos/900/900?4",
    caption: "We survived 🫡",
    username: "Irene",
    createdAt: Date.now(),
    likesCount: 9,
    userId: "1",
  },
  {
    id: "5",
    imageUrl: "https://picsum.photos/900/900?5",
    caption: "Iconic",
    username: "Helene",
    createdAt: Date.now(),
    likesCount: 2,
    userId: "2",
  },
  {
    id: "6",
    imageUrl: "https://picsum.photos/900/900?6",
    caption: "More chaos",
    username: "Irene",
    createdAt: Date.now(),
    likesCount: 5,
    userId: "1",
  },
];

export const getFeedPosts = () => MOCK_POSTS;

export const getMyPosts = (me: string = CURRENT_USER) =>
  MOCK_POSTS.filter((p) => p.username === me);
