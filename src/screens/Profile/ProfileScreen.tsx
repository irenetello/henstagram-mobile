import React, { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";

import { Screen } from "@/src/components/Screen/Screen";
import { useMyPosts } from "@/src/hooks/useMyPosts";
import { auth } from "@/src/lib/auth";
import { deletePost } from "@/src/lib/posts/postApi";
import type { Post } from "@/src/types/post";
import { COLS, styles } from "@/src/screens/Profile/ProfileScreen.styles";
import { PostDetailModal } from "@/src/components/PostDetailModal/PostDetailModal";

export default function ProfileScreen() {
  const { posts, loading } = useMyPosts();
  const [selected, setSelected] = useState<Post | null>(null);

  const onLogout = () => {
    Alert.alert("Sign out", "¿Seguro que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
          } catch (e: any) {
            Alert.alert("Error", e?.message ?? "No se pudo cerrar sesión");
          }
        },
      },
    ]);
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 24 }} />;
  }

  return (
    <Screen
      title="Profile"
      headerRight={
        <Pressable onPress={onLogout} hitSlop={10} style={{ paddingHorizontal: 8 }}>
          <Ionicons name="log-out-outline" size={22} />
        </Pressable>
      }
    >
      <FlatList
        data={posts}
        numColumns={COLS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        columnWrapperStyle={COLS > 1 ? styles.row : undefined}
        renderItem={({ item }) => (
          <Pressable style={styles.tile} onPress={() => setSelected(item)}>
            <Image source={{ uri: item.imageUrl }} style={styles.tileImage} />
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={{ padding: 24 }}>
            <Text style={{ opacity: 0.6 }}>Aún no has subido posts 🐣</Text>
          </View>
        }
      />

      <PostDetailModal
        visible={!!selected}
        post={selected}
        onClose={() => setSelected(null)}
        onDeletePost={async (p) => {
          await deletePost({ id: p.id, storagePath: p.storagePath });
        }}
        feedMode={false}
      />
    </Screen>
  );
}
