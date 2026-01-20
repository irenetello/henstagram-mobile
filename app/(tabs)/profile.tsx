import React, { useState } from "react";
import {
  FlatList,
  View,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Pressable,
  Text,
  Alert,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "@/components/Screen";
import { useMyPosts } from "@/src/hooks/useMyPosts";
import { signOut } from "firebase/auth";
import { auth } from "@/src/lib/auth";
import { deletePost } from "@/src/lib/posts/postApi";
import { Post } from "@/src/types/post";

const GAP = 2;
const COLS = 3;
const W = Dimensions.get("window").width;
const TILE = Math.floor((W - GAP * (COLS - 1) - 24) / COLS);

export default function ProfileScreen() {
  const { posts, loading } = useMyPosts();

  const [selected, setSelected] = useState<Post | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo cerrar sesión.");
    }
  };

  const uid = auth.currentUser?.uid ?? null;
  const canManage = selected && uid && selected.userId === uid;

  const confirmDelete = () => {
    if (!selected) return;

    setMenuOpen(false);

    Alert.alert("Borrar post", "¿Seguro que quieres borrar esta foto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePost({ id: selected.id, storagePath: selected.storagePath });
            setSelected(null); // cerrar modal
          } catch (e: any) {
            Alert.alert("Error", e?.message ?? "No se pudo borrar.");
          }
        },
      },
    ]);
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
          <Pressable style={styles.tile} onPress={() => setSelected(item)}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.img}
              contentFit="cover"
              transition={120}
            />
          </Pressable>
        )}
      />

      {/* ✅ Modal detalle */}
      <Modal
        visible={!!selected}
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.detailWrap}>
          {/* Header del modal */}
          <View style={styles.detailHeader}>
            <Pressable onPress={() => setSelected(null)} hitSlop={10}>
              <Ionicons name="close" size={24} />
            </Pressable>

            <Text style={styles.detailTitle} numberOfLines={1}>
              {selected?.username ?? selected?.userEmail ?? "Post"}
            </Text>

            {canManage ? (
              <Pressable onPress={() => setMenuOpen(true)} hitSlop={10}>
                <Ionicons name="ellipsis-horizontal" size={22} />
              </Pressable>
            ) : (
              <View style={{ width: 22 }} />
            )}
          </View>

          {/* Imagen grande */}
          {selected ? (
            <Image
              source={{ uri: selected.imageUrl }}
              style={styles.detailImage}
              contentFit="cover"
              transition={150}
            />
          ) : null}
        </View>

        {/* Action sheet (3 puntitos) */}
        <Modal
          visible={menuOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuOpen(false)}
        >
          <Pressable style={styles.sheetBackdrop} onPress={() => setMenuOpen(false)}>
            <Pressable style={styles.sheet}>
              <Pressable onPress={confirmDelete} style={styles.sheetBtn}>
                <Text style={styles.sheetDelete}>Borrar</Text>
              </Pressable>
              <Pressable onPress={() => setMenuOpen(false)} style={styles.sheetBtn}>
                <Text style={styles.sheetCancel}>Cancelar</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </Modal>
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

  // ✅ modal detalle
  detailWrap: {
    flex: 1,
    backgroundColor: "white",
  },
  detailHeader: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  detailTitle: {
    flex: 1,
    textAlign: "center",
    fontWeight: "800",
  },
  detailImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#111",
  },

  // ✅ action sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "white",
    padding: 12,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  sheetBtn: {
    paddingVertical: 12,
  },
  sheetDelete: {
    color: "red",
    fontWeight: "800",
    fontSize: 16,
  },
  sheetCancel: {
    fontWeight: "700",
    fontSize: 16,
  },
});
