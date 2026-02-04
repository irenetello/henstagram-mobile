import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { router } from "expo-router";

import type { Post } from "@/src/types/post";
import { useAuth } from "@/src/auth/AuthProvider";
import { useIsLiked } from "@/src/hooks/useIsLiked";
import { useLikesCount } from "@/src/hooks/useLikesCount";
import { useComments } from "@/src/hooks/useComments";
import { toggleLike } from "@/src/lib/posts/likeApi";
import { addComment, deleteComment } from "@/src/lib/comments/commentApi";
import { styles } from "./PostDetailModal.style";
import { getDisplayName } from "@/src/lib/users/displayName";

type Props = {
  visible: boolean;
  post: Post | null;
  feedMode?: boolean;
  onClose: () => void;
  onDeletePost?: (post: Post) => Promise<void>;
};

export function PostDetailModal({
  visible,
  post,
  feedMode,
  onClose,
  onDeletePost,
}: Props) {
  const { user } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  const commentsListRef = useRef<FlatList>(null);

  const postId = post?.id ?? null;
  const liked = useIsLiked(postId ?? "");
  const likesCount = useLikesCount(postId);
  const { comments, loading: commentsLoading } = useComments(postId);
  const commentsCount = comments?.length ?? 0;
  const displayName = post?.username || post?.userEmail;

  const canManagePost = useMemo(() => {
    if (!post || !user) return false;
    return post.userId === user.uid;
  }, [post, user]);

  if (!post) return null;

  const onToggleLike = async () => {
    if (!user) return;
    try {
      await toggleLike({ postId: post.id, userId: user.uid });
    } catch (e) {
      console.error("TOGGLE LIKE ERROR:", e);
    }
  };

  const onSendComment = async () => {
    if (!user) return;
    const text = commentText.trim();
    if (!text) return;

    try {
      const uid = user.uid;
      const fallback = user.email ? user.email.split("@")[0] : "User";
      const username = await getDisplayName(uid, fallback);

      await addComment({
        postId: post.id,
        text,
        userId: uid,
        username,
        userEmail: user.email ?? undefined,
      });
      setCommentText("");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not send comment.");
    }
  };

  const confirmDeleteComment = (commentId: string) => {
    Alert.alert("Delete comment", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteComment({ postId: post.id, commentId }),
      },
    ]);
  };

  const confirmDeletePost = () => {
    if (!onDeletePost) return;

    setMenuOpen(false);

    Alert.alert("Delete post", "Are you sure you want to delete this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await onDeletePost(post);
            onClose();
          } catch (e: any) {
            Alert.alert("Delete failed", e?.message ?? "Unknown error");
          }
        },
      },
    ]);
  };

  const openChallenge = () => {
    if (!post.challengeId) return;
    router.push({
      pathname: "/challenge/[id]",
      params: { id: String(post.challengeId) },
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={60}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.detailWrap}>
            {/* HEADER */}
            <View style={styles.detailHeader}>
              <Pressable onPress={onClose} hitSlop={10}>
                <Ionicons name="close" size={24} />
              </Pressable>

              <Text style={styles.detailTitle} numberOfLines={1}>
                {displayName}
              </Text>

              {canManagePost && onDeletePost ? (
                <Pressable onPress={() => setMenuOpen(true)} hitSlop={10}>
                  <Ionicons name="ellipsis-horizontal" size={22} />
                </Pressable>
              ) : (
                <View style={{ width: 22 }} />
              )}
            </View>

            {/* IMAGE */}
            {!feedMode && (
              <View style={styles.imageWrapDetail}>
                {post.challengeId ? (
                  <Pressable style={styles.challengePill} onPress={openChallenge}>
                    <Text style={styles.challengePillText} numberOfLines={1}>
                      🏷️ {post.challengeTitle ?? "Challenge"}
                    </Text>
                  </Pressable>
                ) : null}

                <Image source={{ uri: post.imageUrl }} style={styles.detailImage} />
              </View>
            )}
            {/* LIKES + COMMENTS COUNTS */}
            <View style={styles.socialRow}>
              <Pressable onPress={onToggleLike} hitSlop={10} style={styles.likeBtn}>
                <Ionicons
                  name={liked ? "heart" : "heart-outline"}
                  size={24}
                  color={liked ? "#ff0000" : "#000"}
                />
              </Pressable>

              <Text style={styles.countText}>{likesCount}</Text>

              <Ionicons name="chatbubble-outline" size={22} />
              <Text style={[styles.countText, { marginLeft: 8 }]}>{commentsCount}</Text>
            </View>
            {post.caption?.trim() ? (
              <View style={styles.captionView}>
                <Text style={styles.captionUser}>
                  {post.username ?? post.userEmail ?? "User"}
                </Text>
                <Text style={styles.captionText}>{post.caption}</Text>
              </View>
            ) : null}

            {/* COMMENTS */}
            <FlatList
              ref={commentsListRef}
              data={comments}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const canDelete = user?.uid === item.userId;

                return (
                  <Pressable
                    onLongPress={() => canDelete && confirmDeleteComment(item.id)}
                    style={styles.commentItem}
                  >
                    <Text style={styles.commentUser}>
                      {item.username ?? item.userEmail ?? "User"}
                    </Text>
                    <Text>{item.text}</Text>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                commentsLoading ? (
                  <ActivityIndicator style={{ padding: 16 }} />
                ) : (
                  <Text style={styles.emptyText}>
                    Sé la primera gallina en comentar 🐔
                  </Text>
                )
              }
            />

            <View style={{ height: 90 }} />
          </View>
        </KeyboardAwareScrollView>

        {/* INPUT */}
        <View style={styles.commentInputRow}>
          <TextInput
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Añade un comentario…"
            style={styles.commentInput}
          />
          <Pressable onPress={onSendComment} hitSlop={10}>
            <Ionicons name="send" size={20} />
          </Pressable>
        </View>

        {/* ACTION SHEET (delete post) */}
        <Modal
          visible={menuOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuOpen(false)}
        >
          <Pressable style={styles.sheetBackdrop} onPress={() => setMenuOpen(false)}>
            <Pressable style={styles.sheet}>
              <Pressable onPress={confirmDeletePost} style={{ paddingVertical: 12 }}>
                <Text style={styles.sheetDelete}>Delete</Text>
              </Pressable>
              <Pressable
                onPress={() => setMenuOpen(false)}
                style={{ paddingVertical: 12 }}
              >
                <Text style={styles.sheetCancel}>Cancel</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </Modal>
  );
}
