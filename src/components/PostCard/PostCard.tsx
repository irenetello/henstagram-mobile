import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";

import type { Post } from "@/src/types/post";
import { useAuth } from "@/src/auth/AuthProvider";
import { useIsLiked } from "@/src/hooks/useIsLiked";
import { useLikesCount } from "@/src/hooks/useLikesCount";
import { useComments } from "@/src/hooks/useComments";
import { toggleLike } from "@/src/lib/posts/likeApi";
import { PostHeader } from "@/src/components/PostHeader/PostHeader";
import { styles } from "./PostCard.style";

type Props = {
  post: Post;
  currentUid: string | null;
  feedMode?: boolean;
  onOpen: (post: Post) => void;
  onDelete?: (post: Post) => Promise<void>;
};

export default function PostCard({
  post,
  currentUid,
  feedMode,
  onOpen,
  onDelete,
}: Props) {
  const { user } = useAuth();

  const isOwner = !!currentUid && post.userId === currentUid;

  const liked = useIsLiked(post.id);
  const likesCount = useLikesCount(post.id);

  const { comments } = useComments(post.id);
  const commentsCount = comments?.length ?? 0;

  const displayName = post.username ?? post.userEmail ?? "Hey Friend";

  const onToggleLike = async () => {
    if (!user) return;
    try {
      await toggleLike({ postId: post.id, userId: user.uid });
    } catch (e) {
      console.error("TOGGLE LIKE ERROR:", e);
    }
  };

  return (
    <View style={styles.card}>
      <PostHeader
        displayName={displayName}
        isOwner={isOwner}
        onDelete={async () => {
          if (!onDelete) return;
          await onDelete(post);
        }}
      />

      <Pressable
        style={styles.imageWrap}
        onPress={() => (feedMode ? onOpen(post) : null)}
      >
        {post.challengeId ? (
          <Pressable
            style={styles.challengePill}
            onPress={() =>
              router.push({
                pathname: "/challenge/[id]",
                params: { id: String(post.challengeId) },
              })
            }
          >
            <Text style={styles.challengePillText} numberOfLines={1}>
              🏷️ {post.challengeTitle ?? "Challenge"}
            </Text>
          </Pressable>
        ) : null}

        <Image source={{ uri: post.imageUrl }} style={styles.image} contentFit="cover" />
      </Pressable>

      {/* ❤️ + 💬 */}
      <View style={styles.socialRow}>
        <Pressable onPress={onToggleLike} hitSlop={10} style={styles.iconBtn}>
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={20}
            color={liked ? "#ff0000" : "#000000"}
          />
        </Pressable>
        <Text style={styles.countText}>{likesCount}</Text>

        <Pressable
          onPress={() => onOpen(post)}
          hitSlop={10}
          style={[styles.iconBtn, { marginLeft: 12 }]}
        >
          <Ionicons name="chatbubble-outline" size={18} />
        </Pressable>
        <Text style={styles.countText}>{commentsCount}</Text>
      </View>

      {/* Caption */}
      {post.caption?.trim() ? (
        <View style={styles.captionWrap}>
          <Text style={styles.authorInline}>{displayName}</Text>
          <Text style={styles.captionText}>{post.caption}</Text>
        </View>
      ) : null}
    </View>
  );
}
