import { FlatList, View, ActivityIndicator, Text } from "react-native";
import { Image } from "expo-image";

import { Screen } from "@/src/components/Screen/Screen";
import { usePosts } from "@/src/hooks/usePosts";
import { auth } from "@/src/lib/auth";
import { deletePost } from "@/src/lib/posts/postApi";
import { PostHeader } from "@/src/components/PostHeader/PostHeader";
import { styles } from "@/src/styles/Feed.styles";

export default function FeedScreen() {
  const { posts, loading } = usePosts();

  const uid = auth.currentUser?.uid ?? null;

  const handleDelete = async (post: any) => {
    await deletePost(post);
    console.log("DELETE POST:", post.id);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 24 }} />;

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
        renderItem={({ item }) => {
          const isOwner = uid != null && item.userId === uid;
          const displayName = item.username ?? item.userEmail ?? "Unknown";

          return (
            <View style={styles.card}>
              <PostHeader
                displayName={displayName}
                isOwner={isOwner}
                onDelete={() => handleDelete(item)}
              />

              <Image
                source={{ uri: item.imageUrl }}
                style={styles.image}
                contentFit="cover"
                transition={150}
              />

              {item.caption?.trim() ? (
                <View style={styles.captionWrap}>
                  <Text style={styles.captionText}>{item.caption}</Text>
                </View>
              ) : null}
            </View>
          );
        }}
      />
    </Screen>
  );
}
