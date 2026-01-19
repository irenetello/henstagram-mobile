import {
  FlatList,
  View,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Pressable,
  Text,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { Screen } from "@/components/Screen";
import { useMyPosts } from "@/src/hooks/useMyPosts";
import { signOut } from "firebase/auth";
import { auth } from "@/src/lib/auth";

const GAP = 2;
const COLS = 3;
const W = Dimensions.get("window").width;
const TILE = Math.floor((W - GAP * (COLS - 1) - 24) / COLS);

export default function ProfileScreen() {
  const { posts, loading } = useMyPosts();

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo cerrar sesión.");
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 24 }} />;

  return (
    <Screen
      title="Profile"
      headerRight={
        <Pressable onPress={logout} hitSlop={10}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      }
    >
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
  logoutText: {
    fontWeight: "800",
  },
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
