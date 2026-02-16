import React, { useState } from "react";
import { FlatList, View, ActivityIndicator, Text } from "react-native";

import { Screen } from "@/src/components/Screen/Screen";
import PostCard from "@/src/components/PostCard/PostCard";
import { PostDetailModal } from "@/src/components/PostDetailModal/PostDetailModal";
import { usePosts } from "@/src/hooks/posts/usePosts";
import { auth } from "@/src/lib/auth";
import { deletePost } from "@/src/lib/posts/postApi";
import { styles } from "@/src/screens/Feed/FeedScreen.styles";
import type { Post } from "@/src/types/post";

export default function FeedScreen() {
  const { posts, loading } = usePosts();
  const uid = auth.currentUser?.uid ?? null;

  const [selected, setSelected] = useState<Post | null>(null);

  const handleDelete = async (post: Post) => {
    await deletePost(post);
  };

  if (loading) {
    return <ActivityIndicator testID="activity-indicator" style={{ marginTop: 24 }} />;
  }

  if (!loading && posts.length === 0) {
    return (
      <Screen title="Henstagram">
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No hay posts todavía</Text>
          <Text style={styles.emptySubtitle}>Sé la primera en subir una foto 👀</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="Henstagram">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <PostCard
            post={item as Post}
            currentUid={uid}
            onOpen={(p) => setSelected(p)}
            onDelete={handleDelete}
          />
        )}
      />

      <PostDetailModal
        visible={!!selected}
        post={selected}
        onClose={() => setSelected(null)}
        feedMode={true}
      />
    </Screen>
  );
}
