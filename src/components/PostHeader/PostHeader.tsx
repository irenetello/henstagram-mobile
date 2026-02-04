import React, { useState } from "react";
import { View, Text, Pressable, Modal, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./PostHeader.styles";

type Props = {
  displayName: string;
  isOwner: boolean;
  onDelete: () => Promise<void>;
};

export function PostHeader({ displayName, isOwner, onDelete }: Props) {
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
            Alert.alert("Error", e?.message ?? "Could not delete post.");
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
            <Ionicons name="ellipsis-horizontal" size={20} color="black" />
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
                  <Text style={styles.sheetDelete}>Delete</Text>
                </Pressable>
                <Pressable onPress={() => setOpen(false)} style={styles.sheetBtn}>
                  <Text style={styles.sheetCancel}>Cancel</Text>
                </Pressable>
              </Pressable>
            </Pressable>
          </Modal>
        </>
      ) : null}
    </View>
  );
}
