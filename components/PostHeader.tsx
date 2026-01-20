import React, { useState } from "react";
import { View, Text, Pressable, Modal, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  displayName: string;
  canManage: boolean;
  onDelete: () => Promise<void>;
};

export function PostHeader({ displayName, canManage, onDelete }: Props) {
  const [open, setOpen] = useState(false);

  const confirmDelete = () => {
    setOpen(false);
    Alert.alert("Delete post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await onDelete();
          } catch (e: any) {
            Alert.alert("Delete failed", e?.message ?? "Unknown error");
          }
        },
      },
    ]);
  };

  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Text style={{ fontWeight: "700", fontSize: 15 }}>{displayName}</Text>

      {canManage && (
        <>
          <Pressable onPress={() => setOpen(true)} hitSlop={10}>
            <Ionicons name="ellipsis-horizontal" size={20} />
          </Pressable>

          <Modal
            visible={open}
            transparent
            animationType="fade"
            onRequestClose={() => setOpen(false)}
          >
            <Pressable
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.35)",
                justifyContent: "flex-end",
              }}
              onPress={() => setOpen(false)}
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
                <Pressable onPress={() => setOpen(false)} style={{ paddingVertical: 12 }}>
                  <Text style={{ fontWeight: "600", fontSize: 16 }}>Cancel</Text>
                </Pressable>
              </Pressable>
            </Pressable>
          </Modal>
        </>
      )}
    </View>
  );
}
