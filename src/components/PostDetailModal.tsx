import React, { useState } from "react";
import { Modal, View, Text, Pressable, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Post } from "@/src/types/post";

type Props = {
  visible: boolean;
  onClose: () => void;
  post: Post | null;
  canManage: boolean;
  onDelete: (post: Post) => Promise<void>;
};

export function PostDetailModal({ visible, onClose, post, canManage, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (!post) return null;

  const confirmDelete = () => {
    setMenuOpen(false);
    Alert.alert("Delete post", "Delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await onDelete(post);
            onClose(); // cierra modal tras borrar
          } catch (e: any) {
            Alert.alert("Delete failed", e?.message ?? "Unknown error");
          }
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable onPress={onClose} hitSlop={10}>
          <Ionicons name="close" size={24} />
        </Pressable>

        <Text style={{ fontWeight: "700" }}>
          {post.username ?? post.userEmail ?? "Post"}
        </Text>

        {canManage ? (
          <Pressable onPress={() => setMenuOpen(true)} hitSlop={10}>
            <Ionicons name="ellipsis-horizontal" size={22} />
          </Pressable>
        ) : (
          <View style={{ width: 22 }} />
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Image
          source={{ uri: post.imageUrl }}
          style={{ width: "100%", aspectRatio: 1 }}
        />
      </View>

      {/* Action sheet */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "flex-end",
          }}
          onPress={() => setMenuOpen(false)}
        >
          <Pressable
            style={{
              backgroundColor: "white",
              padding: 12,
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14,
            }}
          >
            <Pressable onPress={confirmDelete} style={{ paddingVertical: 12 }}>
              <Text style={{ color: "red", fontWeight: "700", fontSize: 16 }}>
                Delete
              </Text>
            </Pressable>
            <Pressable onPress={() => setMenuOpen(false)} style={{ paddingVertical: 12 }}>
              <Text style={{ fontWeight: "600", fontSize: 16 }}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </Modal>
  );
}
