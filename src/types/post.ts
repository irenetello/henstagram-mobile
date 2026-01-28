export type Post = {
  id: string;
  userId: string;
  username?: string;
  userEmail?: string;
  caption: string;
  likesCount?: number;
  storagePath?: string;
  commentsCount?: number;
  imageUrl: string;
  createdAt: any;
  challengeId?: string;
  challengeTitle?: string;
};
