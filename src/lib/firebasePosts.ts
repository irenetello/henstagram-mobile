/* eslint-disable prettier/prettier */
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { storage, db } from "./firebase";
import { auth } from "./auth";

// helper: convertir uri local (file://) a Blob
async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return await response.blob();
}

export async function publishPost(imageUri: string, caption: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const blob = await uriToBlob(imageUri);

  const filename = `${Date.now()}.jpg`;
  const storagePath = `posts/${user.uid}/${filename}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, blob);
  const imageUrl = await getDownloadURL(storageRef);

  await addDoc(collection(db, "posts"), {
    // Guarda ambos por compatibilidad (tú antes ya estabas usando userId)
    uid: user.uid,
    userId: user.uid,

    authorEmail: user.email ?? null,
    caption,
    imageUrl,

    createdAt: serverTimestamp(),
  });
}
