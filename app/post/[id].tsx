import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { usePostsStore } from "../store/postsStore";

export default function PostDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const getPostById = usePostsStore((s) => s.getPostById);
  const post = useMemo(() => (id ? getPostById(id) : undefined), [id, getPostById]);

  if (!post) {
    return (
      <View style={styles.center}>
        <Text>Post not found 😅</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.topBack}>
        <Text style={styles.topBackText}>← Back</Text>
      </Pressable>

      <Image source={{ uri: post.imageUrl }} style={styles.image} />
      <View style={styles.meta}>
        <Text style={styles.author}>{post.authorName}</Text>
        <Text style={styles.caption}>{post.caption}</Text>
        <Text style={styles.likes}>❤️ {post.likesCount ?? 0}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topBack: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  topBackText: { fontSize: 16, color: "#007AFF", fontWeight: "600" },

  image: { width: "100%", aspectRatio: 1, backgroundColor: "#eee" },
  meta: { padding: 16 },
  author: { fontWeight: "700", fontSize: 16 },
  caption: { marginTop: 6, fontSize: 15, color: "#111" },
  likes: { marginTop: 10, color: "#444" },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  backBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: "#eee" },
  backText: { fontWeight: "700" },
});
