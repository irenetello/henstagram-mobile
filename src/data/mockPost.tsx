import { Post } from "@/components/PostCard";

export const CURRENT_USER = "Irene"; // temporal hasta que haya auth

export const MOCK_POSTS: Post[] = [
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
  {
    id: "4",
    imageUrl: "https://picsum.photos/900/900?4",
    caption: "We survived 🫡",
    authorName: "Irene",
    createdAt: Date.now(),
    likesCount: 9,
  },
  {
    id: "5",
    imageUrl: "https://picsum.photos/900/900?5",
    caption: "Iconic",
    authorName: "Helene",
    createdAt: Date.now(),
    likesCount: 2,
  },
  {
    id: "6",
    imageUrl: "https://picsum.photos/900/900?6",
    caption: "More chaos",
    authorName: "Irene",
    createdAt: Date.now(),
    likesCount: 5,
  },
];

export const getFeedPosts = () => MOCK_POSTS;

export const getMyPosts = (me: string = CURRENT_USER) =>
  MOCK_POSTS.filter((p) => p.authorName === me);
