import { Post } from "@/src/types/post";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function PostCard({
  post,
  onPressImage,
}: {
  post: Post;
  onPressImage?: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.author}>{post.username}</Text>
      </View>

      <Pressable onPress={onPressImage}>
        <Image source={{ uri: post.imageUrl }} style={styles.image} />
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.caption}>{post.caption}</Text>
        <Text style={styles.likes}>❤️ {post.likesCount ?? 0}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 14 },
  header: { paddingHorizontal: 16, paddingBottom: 10 },
  author: { fontWeight: "700", fontSize: 15 },

  image: { width: "100%", aspectRatio: 1, backgroundColor: "#eee" },

  footer: { paddingHorizontal: 16, paddingTop: 10, gap: 6 },
  caption: { fontSize: 14, color: "#111" },
  likes: { fontSize: 13, color: "#444" },
});
