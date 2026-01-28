import { Post } from "@/src/types/post";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/src/auth/AuthProvider";
import { useIsLiked } from "@/src/hooks/useIsLiked";
import { useLikesCount } from "@/src/hooks/useLikesCount";
import { toggleLike } from "@/src/lib/posts/likeApi";

type Props = {
  post: Post;
  onPressImage?: () => void;
};

function LikeRow({ postId }: { postId: string }) {
  const { user } = useAuth();
  const liked = useIsLiked(postId);
  const likesCount = useLikesCount(postId);

  const onToggle = async () => {
    if (!user) return;
    try {
      await toggleLike({ postId, userId: user.uid });
    } catch (e) {
      console.error("TOGGLE LIKE ERROR:", e);
    }
  };

  return (
    <View style={styles.likesRow}>
      <Pressable onPress={onToggle} hitSlop={10} style={styles.likeBtn}>
        <Ionicons
          name={liked ? "heart" : "heart-outline"}
          size={22}
          color={liked ? "#ff0000" : "#000"}
        />
      </Pressable>
      <Text style={styles.likesText}>{likesCount}</Text>
    </View>
  );
}

export default function PostCard({ post, onPressImage }: Props) {
  const displayName = post.username ?? post.userEmail ?? "Hey Friend";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.author}>{displayName}</Text>
      </View>

      <Pressable onPress={onPressImage}>
        <Image source={{ uri: post.imageUrl }} style={styles.image} />
      </Pressable>

      <LikeRow postId={post.id} />

      {post.caption?.trim() ? (
        <View style={styles.captionWrap}>
          <Text style={styles.authorInline}>{displayName}</Text>
          <Text style={styles.caption}>{post.caption}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 14 },

  header: { paddingHorizontal: 16, paddingBottom: 10 },
  author: { fontWeight: "700", fontSize: 15 },

  image: { width: "100%", aspectRatio: 1, backgroundColor: "#eee" },

  likesRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  likeBtn: { paddingRight: 8 },
  likesText: { fontWeight: "600" },

  captionWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  authorInline: { fontWeight: "700", marginRight: 6 },
  caption: { fontSize: 14, color: "#111" },
});
