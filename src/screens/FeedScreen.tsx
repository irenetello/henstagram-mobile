import { FlatList, View, ActivityIndicator, Text, Pressable } from "react-native";
import { Image } from "expo-image";

import { Screen } from "@/src/components/Screen/Screen";
import { usePosts } from "@/src/hooks/usePosts";
import { auth } from "@/src/lib/auth";
import { deletePost } from "@/src/lib/posts/postApi";
import { PostHeader } from "@/src/components/PostHeader/PostHeader";
import { styles } from "@/src/styles/Feed.styles";
import { useIsLiked } from "@/src/hooks/useIsLiked";
import { toggleLike } from "@/src/lib/posts/likeApi";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../auth/AuthProvider";
import { useLikesCount } from "../hooks/useLikesCount";

type LikeRowProps = { postId: string; likesCount: number };

function LikeRow({ postId, likesCount }: LikeRowProps) {
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
    <View style={styles.likesRow}>
      <Pressable onPress={onToggle} hitSlop={10} style={styles.likeBtn}>
        <Ionicons
          name={liked ? "heart" : "heart-outline"}
          size={20}
          color={liked ? "#ff0000" : "#000000"}
        />
      </Pressable>
      <Text style={styles.likesText}>{likesCount}</Text>
    </View>
  );
}

type PostItemProps = {
  item: any;
  uid: string | null;
  onDelete: (post: any) => void;
};

function PostItem({ item, uid, onDelete }: PostItemProps) {
  const isOwner = uid != null && item.userId === uid;
  const displayName = item.username ?? item.userEmail ?? "Unknown";

  // ✅ Hooks aquí dentro: OK
  const likesCount = useLikesCount(item.id);

  return (
    <View style={styles.card}>
      <PostHeader
        displayName={displayName}
        isOwner={isOwner}
        onDelete={async () => onDelete(item)}
      />

      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        contentFit="cover"
        transition={150}
      />

      <LikeRow postId={item.id} likesCount={likesCount} />

      {item.caption?.trim() ? (
        <View style={styles.captionWrap}>
          <Text style={styles.captionText}>{item.caption}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function FeedScreen() {
  const { posts, loading } = usePosts();

  const uid = auth.currentUser?.uid ?? null;

  const handleDelete = async (post: any) => {
    await deletePost(post);
    console.log("DELETE POST:", post.id);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 24 }} />;

  if (!loading && posts.length === 0) {
    return (
      <Screen title="Henstagram">
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No hay posts todavía</Text>
          <Text style={styles.emptySubtitle}>Sé la primera en subir una foto 👀</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="Henstagram">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <PostItem item={item} uid={uid} onDelete={handleDelete} />
        )}
      />
    </Screen>
  );
}
