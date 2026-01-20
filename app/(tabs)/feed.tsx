import React, { useState } from "react";
import {
  FlatList,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "@/components/Screen";
import { usePosts } from "@/src/hooks/usePosts";
import { auth } from "@/src/lib/auth";
import { deletePost } from "@/src/lib/posts/postApi";
// TODO: luego hacemos delete real (Firestore + Storage)
// import { deletePost } from "@/src/lib/posts";

export default function FeedScreen() {
  const { posts, loading } = usePosts();

  const uid = auth.currentUser?.uid ?? null;

  const handleDelete = async (post: any) => {
    // Aquí luego enchufamos delete real:
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

function PostHeader({
  displayName,
  isOwner,
  onDelete,
}: {
  displayName: string;
  isOwner: boolean;
  onDelete: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);

  const confirmDelete = () => {
    setOpen(false);
    Alert.alert("Borrar post", "¿Seguro que quieres borrar este post?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          try {
            await onDelete();
          } catch (e: any) {
            Alert.alert("Error", e?.message ?? "No se pudo borrar");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.header}>
      <Text style={styles.headerName}>{displayName}</Text>

      {isOwner ? (
        <>
          <Pressable onPress={() => setOpen(true)} hitSlop={10}>
            <Ionicons name="ellipsis-horizontal" size={20} color="white" />
          </Pressable>

          <Modal
            visible={open}
            transparent
            animationType="fade"
            onRequestClose={() => setOpen(false)}
          >
            <Pressable style={styles.sheetBackdrop} onPress={() => setOpen(false)}>
              <Pressable style={styles.sheet}>
                <Pressable onPress={confirmDelete} style={styles.sheetBtn}>
                  <Text style={styles.sheetDelete}>Borrar</Text>
                </Pressable>
                <Pressable onPress={() => setOpen(false)} style={styles.sheetBtn}>
                  <Text style={styles.sheetCancel}>Cancelar</Text>
                </Pressable>
              </Pressable>
            </Pressable>
          </Modal>
        </>
      ) : null}
    </View>
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

  // ✅ nuevo header
  header: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerName: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    opacity: 0.95,
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

  // ✅ modal tipo action sheet
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
    fontWeight: "700",
    fontSize: 16,
  },
  sheetCancel: {
    fontWeight: "600",
    fontSize: 16,
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
