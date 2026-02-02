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

  countdown: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    marginTop: 4,
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

  endText: {
    color: "#6575AC",
  },

  createButton: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#6575AC",
    alignItems: "center",
  },

  createButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },

  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },

  filterTabActive: {
    backgroundColor: "#6575AC",
  },

  filterTabText: {
    fontWeight: "600",
    fontSize: 14,
    color: "#666",
  },

  filterTabTextActive: {
    color: "#fff",
  },

  participateButton: {},
  participateText: {},
});
