import { useEffect, useState } from "react";
import { useAuth } from "@/src/auth/AuthProvider";
import { listenUserLike } from "@/src/lib/posts/likeApi";

export function useIsLiked(postId: string) {
  const { user, initializing } = useAuth();
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (initializing) return;

    // ✅ Si no hay postId (modal abierto sin post), no subscribas a nada
    if (!postId) {
      setLiked(false);
      return;
    }

    if (!user) {
      setLiked(false);
      return;
    }

    const unsub = listenUserLike({
      postId,
      userId: user.uid,
      onChange: setLiked,
    });

    return () => unsub();
  }, [postId, user, initializing]);

  return liked;
}
