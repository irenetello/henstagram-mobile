import React, { useState } from "react";
import {
  FlatList,
  View,
  ActivityIndicator,
  Pressable,
  Text,
  Alert,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "@/src/components/Screen/Screen";
import { useMyPosts } from "@/src/hooks/useMyPosts";
import { signOut } from "firebase/auth";
import { auth } from "@/src/lib/auth";
import { deletePost } from "@/src/lib/posts/postApi";
import { Post } from "@/src/types/post";
import { COLS, styles } from "@/src/styles/ProfileScreen.styles";
import { useIsLiked } from "@/src/hooks/useIsLiked";
import { toggleLike } from "@/src/lib/posts/likeApi";
import { useAuth } from "../auth/AuthProvider";
import { useLikesCount } from "../hooks/useLikesCount";

type LikeRowProps = { postId: string; likesCount: number };

function LikeRow({ postId, likesCount }: LikeRowProps) {
  const { user } = useAuth();
  const liked = useIsLiked(postId);

  const onToggle = async () => {
    if (!user) return;
    try {
      await toggleLike({ postId, userId: user.uid });
    } catch (e) {
      console.error("TOGGLE LIKE ERROR:", e);
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <Pressable onPress={onToggle} hitSlop={10} style={{ marginRight: 8 }}>
        <Ionicons
          name={liked ? "heart" : "heart-outline"}
          size={24}
          color={liked ? "#ff0000" : "#000000"}
        />
      </Pressable>
      <Text style={{ fontSize: 14, fontWeight: "600" }}>{likesCount}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { posts, loading } = useMyPosts();

  const [selected, setSelected] = useState<Post | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ Solo llamar al hook si hay un post seleccionado
  const selectedLikesCount = useLikesCount(selected?.id ?? null);

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

          {/* Likes */}
          {selected ? (
            <LikeRow postId={selected.id} likesCount={selectedLikesCount} />
          ) : null}

          {selected?.caption?.trim() ? (
            <View style={styles.captionWrap}>
              <Text style={styles.captionText}>{selected.caption}</Text>
            </View>
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
