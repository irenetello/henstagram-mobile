import React, { useMemo, useState } from "react";
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/src/components/Screen/Screen";
import {
  DEFAULT_BINGO_CARD,
  type BingoCell,
  getBingoRowColFromIndex,
} from "@/src/lib/bingo/defaultBingoCard";
import { requestTab } from "@/src/lib/tabs/tabBus";
import { useCreateDraftStore } from "@/src/store/createDraftStore";
import { useBingoCellPosts } from "@/src/hooks/bingo/useBingoCellPosts";
import { useMyBingoCells } from "@/src/hooks/bingo/useMyBingoCells";
import { useBingoWinner } from "@/src/hooks/bingo/useBingoWinner";
import { useAuth } from "@/src/auth/AuthProvider";
import { useBingoStore } from "@/src/store/bingoStore";

export function BingoScreen() {
  const card = DEFAULT_BINGO_CARD;
  const { user } = useAuth();

  // ✅ hooks arriba (NO dentro del handler)
  const startBingoDraft = useCreateDraftStore((s) => s.startBingoDraft);

  const focus = useBingoStore((s) => s.focus);
  const setFocus = useBingoStore((s) => s.setFocus);
  const clearFocus = useBingoStore((s) => s.clearFocus);

  const [openCellId, setOpenCellId] = useState<string | null>(null);

  const effectiveCellId = openCellId ?? (focus.cardId === card.id ? focus.cellId : null);
  const activeCell = useMemo(() => {
    if (!effectiveCellId) return null;
    return card.cells.find((c) => c.id === effectiveCellId) ?? null;
  }, [card.cells, effectiveCellId]);

  const { cellIds: myCompleted } = useMyBingoCells(card.id);
  const { winner } = useBingoWinner(card.id);

  const closeModal = () => {
    setOpenCellId(null);
    clearFocus();
  };

  const openCell = (cellId: string) => {
    setOpenCellId(cellId);
    setFocus(card.id, cellId);
  };

  const onCompleteWithPost = (cell: BingoCell) => {
    if (!user) {
      Alert.alert("Login required", "Please sign in to play bingo.");
      return;
    }

    if (cell.isFree) {
      Alert.alert("Free square", "That one is already free. No photo needed 😉");
      return;
    }

    // ✅ Start a fresh draft tagged to this bingo square
    startBingoDraft(card.id, cell.id, cell.text);

    requestTab("create");
    closeModal();
  };

  const renderCell = ({ item, index }: { item: BingoCell; index: number }) => {
    const completed = item.isFree || myCompleted.has(item.id);
    const { row, col } = getBingoRowColFromIndex(card.size, index);
    const isEdge =
      row === 0 || col === 0 || row === card.size - 1 || col === card.size - 1;

    return (
      <Pressable
        onPress={() => openCell(item.id)}
        style={[styles.cell, completed && styles.cellDone, isEdge && styles.cellEdge]}
      >
        <Text
          style={[styles.cellText, completed && styles.cellTextDone]}
          numberOfLines={4}
        >
          {item.text}
        </Text>
        {completed ? <Text style={styles.tick}>✓</Text> : null}
      </Pressable>
    );
  };

  return (
    <Screen title="MiniGames">
      <View style={styles.wrap}>
        <Text style={styles.h1}>{card.title}</Text>
        <Text style={styles.sub}>
          Tap a square → post a photo → it shows in the feed. First to complete a
          row/column wins.
        </Text>

        {winner ? (
          <View style={styles.winnerBanner}>
            <Text style={styles.winnerText}>
              🏆 Winner: {winner.username ?? "Someone"}
            </Text>
          </View>
        ) : null}

        <FlatList
          data={card.cells}
          keyExtractor={(c) => c.id}
          numColumns={card.size}
          renderItem={renderCell}
          contentContainerStyle={styles.grid}
        />
      </View>

      <Modal
        visible={!!activeCell}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {activeCell ? (
              <CellModalContent
                cardId={card.id}
                cell={activeCell}
                onClose={closeModal}
                onComplete={onCompleteWithPost}
              />
            ) : null}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function CellModalContent({
  cardId,
  cell,
  onClose,
  onComplete,
}: {
  cardId: string;
  cell: BingoCell;
  onClose: () => void;
  onComplete: (cell: BingoCell) => void;
}) {
  const { posts, loading } = useBingoCellPosts(cardId, cell.id);

  const participants = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of posts ?? []) {
      map.set(p.userId, p.username ?? p.userEmail ?? "Someone");
    }
    return Array.from(map.entries()).map(([userId, name]) => ({ userId, name }));
  }, [posts]);

  return (
    <View style={{ gap: 12 }}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle} numberOfLines={2}>
          {cell.text}
        </Text>
        <Pressable onPress={onClose} hitSlop={10}>
          <Text style={styles.modalClose}>Close</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Participants</Text>
        {loading ? (
          <Text style={styles.muted}>Loading…</Text>
        ) : participants.length ? (
          <Text style={styles.muted}>{participants.map((p) => p.name).join(", ")}</Text>
        ) : (
          <Text style={styles.muted}>No one yet. Be the legend.</Text>
        )}
      </View>

      <Pressable
        onPress={() => onComplete(cell)}
        style={[styles.primaryBtn, cell.isFree && styles.primaryBtnDisabled]}
        disabled={cell.isFree}
      >
        <Text style={styles.primaryBtnText}>
          {cell.isFree ? "Free square" : "Add photo post"}
        </Text>
      </Pressable>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Posts</Text>
        {loading ? (
          <Text style={styles.muted}>Loading…</Text>
        ) : posts?.length ? (
          posts.slice(0, 6).map((p) => (
            <View key={p.id} style={styles.postRow}>
              <Text style={styles.postRowName} numberOfLines={1}>
                {p.username ?? p.userEmail ?? "Someone"}
              </Text>
              <Text style={styles.postRowCaption} numberOfLines={1}>
                {p.caption || "(no caption)"}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.muted}>No posts yet.</Text>
        )}
        <Text style={styles.tiny}>
          Tip: the full post is in the Feed with a 🎯 Bingo tag.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16 },
  h1: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
  sub: { fontSize: 13, color: "#555", marginBottom: 12 },
  winnerBanner: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#f3f3f3",
    marginBottom: 12,
  },
  winnerText: { fontSize: 14, fontWeight: "600" },

  grid: { gap: 8, paddingBottom: 24 },
  cell: {
    flex: 1,
    minHeight: 74,
    margin: 4,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  cellEdge: { borderColor: "#ccc" },
  cellDone: { backgroundColor: "#eef7ee", borderColor: "#bfe3bf" },
  cellText: { fontSize: 11, color: "#111" },
  cellTextDone: { color: "#0b5" },
  tick: { alignSelf: "flex-end", fontSize: 16, fontWeight: "700", color: "#0b5" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 16,
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    maxHeight: "85%",
  },
  modalHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  modalTitle: { flex: 1, fontSize: 16, fontWeight: "700" },
  modalClose: { fontSize: 14, fontWeight: "600" },

  section: { marginTop: 8, gap: 6 },
  sectionTitle: { fontSize: 13, fontWeight: "700" },
  muted: { color: "#555", fontSize: 13 },

  primaryBtn: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#111",
    alignItems: "center",
  },
  primaryBtnDisabled: { opacity: 0.4 },
  primaryBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  postRow: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
    paddingVertical: 8,
  },
  postRowName: { fontWeight: "700", fontSize: 12 },
  postRowCaption: { color: "#444", fontSize: 12, marginTop: 2 },
  tiny: { fontSize: 11, color: "#666", marginTop: 8 },
});
