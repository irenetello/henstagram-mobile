import { FlatList, View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Screen } from "@/components/Screen";
import { usePosts } from "@/src/hooks/usePosts";

export default function FeedScreen() {
  const { posts, loading } = usePosts();

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
        renderItem={({ item }) => (
          <View style={styles.card}>
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
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 24,
    gap: 14,
  },
  card: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  image: {
    width: "100%",
    height: 420,
  },
  captionWrap: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  captionText: {
    color: "white",
    fontSize: 14,
    opacity: 0.92,
  },
  emptyWrap: {
    padding: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
});
