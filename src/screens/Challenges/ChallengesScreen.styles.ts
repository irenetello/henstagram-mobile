import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  list: {
    padding: 16,
    gap: 12,
  },

  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
    color: "#111",
  },

  prompt: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#f7f7f7",
  },

  chipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#222",
  },

  adminMeta: {
    marginTop: 10,
    gap: 6,
  },

  metaText: {
    fontSize: 12,
    color: "#555",
  },

  adminActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },

  actionButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },

  actionText: {
    fontWeight: "800",
    color: "#111",
  },

  deleteButton: {
    borderColor: "#f0b3b3",
  },

  deleteText: {
    color: "#b00020",
  },

  participateButton: {},
  participateText: {},
});
