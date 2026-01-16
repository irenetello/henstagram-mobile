import { Screen } from "@/components/Screen";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { CURRENT_USER, usePostsStore } from "../store/postsStore";

export default function ProfileScreen() {
  const router = useRouter();
  const posts = usePostsStore((s) => s.posts);

  const myPosts = useMemo(
    () => posts.filter((p) => p.authorName === CURRENT_USER),
    [posts],
  );

  return (
    <Screen title="Profile">
      <View style={styles.header}>
        <Text style={styles.name}>{CURRENT_USER}</Text>
        <Text style={styles.sub}>{myPosts.length} posts</Text>
      </View>

      <FlatList
        data={myPosts}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={({ item }) => (
          <Pressable
            style={styles.tile}
            onPress={() => router.push(`/post/${item.id}` as any)}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.img} />
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  name: { fontSize: 22, fontWeight: "700" },
  sub: { marginTop: 4, color: "#666" },

  tile: { width: "33.3333%", aspectRatio: 1, padding: 1 },
  img: { width: "100%", height: "100%" },
});
