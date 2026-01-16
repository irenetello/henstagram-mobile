import PostCard from "@/components/PostCard";
import { Screen } from "@/components/Screen";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { usePostsStore } from "../store/postsStore";

export default function FeedScreen() {
  const router = useRouter();
  const posts = usePostsStore((s) => s.posts);

  return (
    <Screen title="Henstagram">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <PostCard post={item} onPressImage={() => router.push(`/post/${item.id}`)} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingVertical: 10 },
});
