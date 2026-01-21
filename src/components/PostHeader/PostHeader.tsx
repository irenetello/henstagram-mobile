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
