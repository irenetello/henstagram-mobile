import type { DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import type { Post } from "@/src/types/post";

export function mapPostDoc(doc: QueryDocumentSnapshot<DocumentData>): Post {
  const data = doc.data();

  return {
    id: doc.id,
    userId: data.userId,
    username: data.username ?? "Hey Friend",
    userEmail: data.userEmail ?? undefined,
    imageUrl: data.imageUrl,
    storagePath: data.storagePath ?? undefined,
    likesCount: data.likesCount ?? 0,
    caption: data.caption ?? "",
    createdAt: (data.createdAt as Timestamp) ?? null,
  };
}
