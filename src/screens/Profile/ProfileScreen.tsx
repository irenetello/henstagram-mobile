import React, { useState, useRef } from "react";
import {
  FlatList,
  View,
  ActivityIndicator,
  Pressable,
  Text,
  Alert,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { Screen } from "@/src/components/Screen/Screen";
import { useMyPosts } from "@/src/hooks/useMyPosts";
import { auth } from "@/src/lib/auth";
import { deletePost } from "@/src/lib/posts/postApi";
import { Post } from "@/src/types/post";
import { COLS, styles } from "@/src/screens/Profile/ProfileScreen.styles";
import { useIsLiked } from "@/src/hooks/useIsLiked";
import { toggleLike } from "@/src/lib/posts/likeApi";
import { useAuth } from "../../auth/AuthProvider";
import { useLikesCount } from "../../hooks/useLikesCount";

import { useComments } from "@/src/hooks/useComments";
import { addComment, deleteComment } from "@/src/lib/comments/commentApi";
import { router } from "expo-router";

type LikeRowProps = {
  postId: string;
  likesCount: number;
  commentsCount: number;
};

function LikeRow({ postId, likesCount, commentsCount }: LikeRowProps) {
  const { user } = useAuth();
  const liked = useIsLiked(postId);

  const onToggle = async () => {
    if (!user) return;
    try {
      await toggleLike({ postId, userId: user.uid });
    } catch (e) {
      console.error("TOGGLE LIKE ERROR:", e);
    }
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
      <Pressable onPress={onToggle} hitSlop={10}>
        <Ionicons
          name={liked ? "heart" : "heart-outline"}
          size={24}
          color={liked ? "#ff0000" : "#000"}
        />
      </Pressable>

      <Text style={{ marginHorizontal: 8, fontWeight: "600" }}>{likesCount}</Text>

      <Ionicons name="chatbubble-outline" size={22} />
      <Text style={{ marginLeft: 8, fontWeight: "600" }}>{commentsCount}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { posts, loading } = useMyPosts();

  const [selected, setSelected] = useState<Post | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  const selectedLikesCount = useLikesCount(selected?.id ?? null);
  const { comments, loading: commentsLoading } = useComments(selected?.id ?? null);

  const commentsListRef = useRef<FlatList>(null);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      Alert.alert("Error", "No se pudo cerrar sesión.");
    }
  };

  const uid = auth.currentUser?.uid ?? null;
  const canManage = selected && uid && selected.userId === uid;

  const sendComment = async () => {
    if (!selected || !commentText.trim() || !auth.currentUser) return;

    await addComment({
      postId: selected.id,
      userId: auth.currentUser.uid,
      username: selected.username,
      userEmail: auth.currentUser.email ?? undefined,
      text: commentText,
    });

    setCommentText("");
  };

  const confirmDeleteComment = (commentId: string) => {
    if (!selected) return;

    Alert.alert("Borrar comentario", "¿Seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: () => deleteComment({ postId: selected.id, commentId }),
      },
    ]);
  };

  const confirmDeletePost = () => {
    if (!selected) return;

    setMenuOpen(false);

    Alert.alert("Borrar post", "¿Seguro que quieres borrar esta foto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          await deletePost({
            id: selected.id,
            storagePath: selected.storagePath,
          });
          setSelected(null);
        },
      },
    ]);
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 24 }} />;
  }

  return (
    <Screen
      title="Profile"
      headerRight={
        <Pressable onPress={logout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      }
    >
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        numColumns={COLS}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.tile} onPress={() => setSelected(item)}>
            <View style={styles.imageWrapGrid}>
              {item.challengeId ? (
                <View style={styles.challengePillSmall}>
                  <Text style={styles.challengePillSmallText} numberOfLines={1}>
                    🏷️ {item.challengeTitle ?? "Challenge"}
                  </Text>
                </View>
              ) : null}

              <Image source={{ uri: item.imageUrl }} style={styles.img} />
            </View>
          </Pressable>
        )}
      />

      {/* MODAL */}
      <Modal visible={!!selected} animationType="slide">
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
                <Pressable onPress={() => setSelected(null)}>
                  <Ionicons name="close" size={24} />
                </Pressable>

                <Text style={styles.detailTitle}>{selected?.username ?? "Post"}</Text>

                {canManage ? (
                  <Pressable onPress={() => setMenuOpen(true)}>
                    <Ionicons name="ellipsis-horizontal" size={22} />
                  </Pressable>
                ) : (
                  <View style={{ width: 22 }} />
                )}
              </View>

              {/* IMAGE */}
              {selected && (
                <View style={styles.imageWrapDetail}>
                  {selected.challengeId ? (
                    <Pressable
                      style={styles.challengePill}
                      onPress={() =>
                        router.push({
                          pathname: "/challenge/[id]",
                          params: { id: String(selected.challengeId) },
                        })
                      }
                    >
                      <Text style={styles.challengePillText} numberOfLines={1}>
                        🏷️ {selected.challengeTitle ?? "Challenge"}
                      </Text>
                    </Pressable>
                  ) : null}

                  <Image source={{ uri: selected.imageUrl }} style={styles.detailImage} />
                </View>
              )}

              {/* LIKES */}
              {selected && (
                <LikeRow
                  postId={selected.id}
                  likesCount={selectedLikesCount}
                  commentsCount={comments?.length ?? 0}
                />
              )}

              {/* COMMENTS */}
              <FlatList
                ref={commentsListRef}
                data={comments}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const canDelete = auth.currentUser?.uid === item.userId;

                  return (
                    <Pressable
                      onLongPress={() => canDelete && confirmDeleteComment(item.id)}
                      style={{ padding: 16 }}
                    >
                      <Text style={{ fontWeight: "600" }}>{item.username ?? "User"}</Text>
                      <Text>{item.text}</Text>
                    </Pressable>
                  );
                }}
                ListEmptyComponent={
                  commentsLoading ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={{ padding: 16, opacity: 0.6 }}>
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
            <Pressable onPress={sendComment}>
              <Ionicons name="send" size={20} />
            </Pressable>
          </View>

          {/* ACTION SHEET */}
          <Modal visible={menuOpen} transparent animationType="fade">
            <Pressable style={styles.sheetBackdrop} onPress={() => setMenuOpen(false)}>
              <Pressable style={styles.sheet}>
                <Pressable onPress={confirmDeletePost}>
                  <Text style={styles.sheetDelete}>Borrar</Text>
                </Pressable>
                <Pressable onPress={() => setMenuOpen(false)}>
                  <Text style={styles.sheetCancel}>Cancelar</Text>
                </Pressable>
              </Pressable>
            </Pressable>
          </Modal>
        </View>
      </Modal>
    </Screen>
  );
}
