export type Comment = {
  id: string;
  postId: string;
  userId: string;
  text: string;
  username?: string;
  userEmail?: string;
  createdAt: any;
};
