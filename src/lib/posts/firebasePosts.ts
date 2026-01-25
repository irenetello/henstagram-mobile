import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth } from "../auth";
import { createPost } from "./postApi";
import { storage } from "../firebase";
import { getUserProfile } from "../users/userApi";

// helper: convertir uri local (file://) a Blob
async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return await response.blob();
}

export async function publishPost(
  imageUri: string,
  caption: string,
  opts?: { challengeId?: string; challengeTitle?: string },
) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const profile = await getUserProfile(user.uid);

  const blob = await uriToBlob(imageUri);

  const filename = `${Date.now()}.jpg`;
  const storagePath = `posts/${user.uid}/${filename}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, blob);
  const imageUrl = await getDownloadURL(storageRef);

  await createPost({
    userId: user.uid,
    imageUrl,
    caption,
    storagePath,
    username: profile?.displayName ?? undefined,
    userEmail: user.email ?? undefined,
    challengeId: opts?.challengeId,
    challengeTitle: opts?.challengeTitle,
  });
}
