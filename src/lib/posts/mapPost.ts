import type { DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import type { Post } from "@/src/types/post";

export function mapPostDoc(doc: QueryDocumentSnapshot<DocumentData>): Post {
  const data = doc.data();

  return {
    id: doc.id,
    userId: data.userId,
    imageUrl: data.imageUrl,
    caption: data.caption,
    createdAt: data.createdAt,
    likesCount: data.likesCount ?? 0,
    storagePath: data.storagePath,
    userEmail: data.userEmail,
    username: data.username,
    commentsCount: data.commentsCount ?? 0,
  };
}
