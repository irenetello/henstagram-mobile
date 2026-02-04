import React from "react";
import { Modal, Pressable, Text } from "react-native";
import type { Challenge } from "@/src/types/challenge";
import { ACTIVATE_OPTIONS } from "../../screens/Challenges/utils/challengeActions";

interface ActivateModalProps {
  visible: boolean;
  target: Challenge | null;
  onClose: () => void;
  onConfirm: (durationMs: number | null) => Promise<void>;
}

export function ActivateModal({
  visible,
  target: _target,
  onClose,
  onConfirm,
}: ActivateModalProps) {
  const handleSelect = async (durationMs: number | null) => {
    await onConfirm(durationMs);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.35)",
          justifyContent: "flex-end",
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: "white",
            padding: 12,
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
          }}
          onPress={() => null}
        >
          <Text style={{ fontWeight: "700", fontSize: 16, marginBottom: 6 }}>
            Activate challenge?
          </Text>
          <Text style={{ opacity: 0.7, marginBottom: 8 }}>
            Pick a duration (or no limit).
          </Text>

          {ACTIVATE_OPTIONS.map((option) => (
            <Pressable
              key={option.label}
              style={{ paddingVertical: 12 }}
              onPress={() => handleSelect(option.durationMs)}
            >
              <Text style={{ fontWeight: "600" }}>{option.label}</Text>
            </Pressable>
          ))}

          <Pressable style={{ paddingVertical: 12 }} onPress={onClose}>
            <Text style={{ fontWeight: "600" }}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
