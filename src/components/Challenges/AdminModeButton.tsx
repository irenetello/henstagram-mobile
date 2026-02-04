import React from "react";
import { Pressable, Text } from "react-native";

interface AdminModeButtonProps {
  isAdminMode: boolean;
  onToggle: () => void;
}

export function AdminModeButton({ isAdminMode, onToggle }: AdminModeButtonProps) {
  return (
    <Pressable
      onPress={onToggle}
      style={{
        paddingHorizontal: 4,
        backgroundColor: "rgb(214, 229, 234)",
        borderRadius: 8,
        padding: 4,
      }}
    >
      <Text style={{ fontWeight: "700", fontSize: 16 }}>
        {isAdminMode ? "👤 User" : "⚙️ Admin"}
      </Text>
    </Pressable>
  );
}
