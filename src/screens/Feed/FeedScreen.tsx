import React, { useMemo, useState } from "react";
import { FlatList, View, ActivityIndicator, Text, Pressable } from "react-native";

import { Screen } from "@/src/components/Screen/Screen";
import PostCard from "@/src/components/PostCard/PostCard";
import { PostDetailModal } from "@/src/components/PostDetailModal/PostDetailModal";
import { usePosts } from "@/src/hooks/posts/usePosts";
import { auth } from "@/src/lib/auth";
import { deletePost } from "@/src/lib/posts/postApi";
import { styles } from "@/src/screens/Feed/FeedScreen.styles";
import type { Post } from "@/src/types/post";
import { FilterTabs } from "@/src/components/Challenges/FilterTabs";

export default function FeedScreen() {
  const { posts, loading } = usePosts();
  const uid = auth.currentUser?.uid ?? null;

  const [filter, setFilter] = useState<"all" | "challenges" | "bingo">("all");

  const filteredPosts = useMemo(() => {
    if (filter === "challenges") {
      return posts.filter((p) => !!p.challengeId);
    }
    if (filter === "bingo") {
      return posts.filter((p) => !!p.bingoCardId && !!p.bingoCellId);
    }
    return posts;
  }, [posts, filter]);

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
      <FilterTabs
        filters={[
          { label: "All", value: "all" },
          { label: "Challenges", value: "challenges" },
          { label: "Bingo", value: "bingo" },
        ]}
        activeFilter={filter}
        onFilterChange={(v) => setFilter(v as "all" | "challenges" | "bingo")}
      />

      <FlatList
        data={filteredPosts}
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
