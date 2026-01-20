import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "@/src/lib/firebase";
import { Post } from "../types/post";

export async function deletePost(post: Post) {
  // 1) borrar archivo
  if (post.storagePath) {
    await deleteObject(ref(storage, post.storagePath));
  } else {
    // Si no guardas storagePath, tendrás que derivarlo o NO borrar el archivo.
    // Mejor guardar storagePath al crear el post.
  }

  // 2) borrar doc
  await deleteDoc(doc(db, "posts", post.id));
}
