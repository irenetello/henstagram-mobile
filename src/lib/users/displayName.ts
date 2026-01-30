import { getUserProfile } from "@/src/lib/users/userApi";

const cache = new Map<string, string>();

export async function getDisplayName(uid: string, fallback?: string) {
  if (cache.has(uid)) return cache.get(uid)!;

  const profile = await getUserProfile(uid);
  const name = profile?.displayName ?? fallback ?? "User";
  cache.set(uid, name);
  return name;
}
