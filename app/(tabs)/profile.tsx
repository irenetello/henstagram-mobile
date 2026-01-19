import { FlatList, View, ActivityIndicator, Dimensions, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Screen } from "@/components/Screen";
import { useMyPosts } from "@/src/hooks/useMyPosts";

const GAP = 2;
const COLS = 3;
const W = Dimensions.get("window").width;
const TILE = Math.floor((W - GAP * (COLS - 1) - 24) / COLS);
// 24 = paddingHorizontal 12 + 12

export default function ProfileScreen() {
  const { posts, loading } = useMyPosts();

  if (loading) return <ActivityIndicator style={{ marginTop: 24 }} />;

  return (
    <Screen title="Profile">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        numColumns={COLS}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.tile}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.img}
              contentFit="cover"
              transition={120}
            />
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 24,
  },
  row: {
    gap: GAP,
    marginBottom: GAP,
  },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  img: {
    width: "100%",
    height: "100%",
  },
});
