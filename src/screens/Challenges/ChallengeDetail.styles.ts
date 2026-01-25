import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  prompt: {
    fontSize: 15,
    opacity: 0.9,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.9,
  },
  metaText: {
    fontSize: 12,
    opacity: 0.8,
  },
  participateButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    opacity: 0.95,
  },
  participateButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  postCard: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    opacity: 0.95,
  },
  postUser: {
    fontWeight: "700",
    marginBottom: 4,
  },
  postCaption: {
    marginBottom: 6,
  },
  postMeta: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyText: {
    paddingHorizontal: 16,
    paddingTop: 24,
    opacity: 0.8,
  },
  errorText: {
    paddingHorizontal: 16,
    paddingTop: 24,
    opacity: 0.9,
  },
});
