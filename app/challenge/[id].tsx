import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";

import { Screen } from "@/src/components/Screen/Screen";
import PostCard from "@/src/components/PostCard/PostCard";
import { PostDetailModal } from "@/src/components/PostDetailModal/PostDetailModal";
import { auth } from "@/src/lib/auth";

import { useChallenge } from "@/src/hooks/useChallenge";
import { useChallengePosts } from "@/src/hooks/useChallengePosts";
import { styles, COLS } from "@/src/screens/Challenges/ChallengeDetail.styles";
import { deletePost } from "@/src/lib/posts/postApi";

import { useCreateDraftStore } from "@/src/store/createDraftStore";
import { requestTab } from "@/src/lib/tabs/tabBus";
import type { Post } from "@/src/types/post";

type ViewMode = "grid" | "feed";

export default function ChallengeDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const challengeId = useMemo(() => String(params.id ?? ""), [params.id]);
  const setChallenge = useCreateDraftStore((s) => s.setChallenge);

  const {
    challenge,
    loading: loadingChallenge,
    error: challengeError,
  } = useChallenge(challengeId);

  const {
    posts,
    loading: loadingPosts,
    error: postsError,
  } = useChallengePosts(challengeId);

  const uid = auth.currentUser?.uid ?? null;

  const hasParticipated = useMemo(() => {
    if (!uid) return false;
    return posts.some((p) => p.userId === uid);
  }, [posts, uid]);

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [feedMode, setFeedMode] = useState(false);

  const loading = loadingChallenge || loadingPosts;

  const handleDelete = async (post: Post) => {
    await deletePost({ id: post.id, storagePath: post.storagePath });
  };

  return (
    <Screen title={challenge?.title ?? "Challenge"}>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : challengeError ? (
        <Text style={styles.errorText}>
          Error loading challenge: {String(challengeError)}
        </Text>
      ) : !challenge ? (
        <Text style={styles.errorText}>Challenge not found.</Text>
      ) : (
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerCard}>
            <Text style={styles.title}>{challenge.title}</Text>
            <Text style={styles.prompt}>{challenge.prompt}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.badge}>
                {challenge.status === "ended" ? "Ended" : "Active"}
              </Text>

              {challenge.endAt ? (
                <Text style={styles.metaText}>
                  Ends:{" "}
                  {challenge.endAt.toDate
                    ? challenge.endAt.toDate().toLocaleDateString()
                    : ""}
                </Text>
              ) : null}
            </View>
            <View style={styles.toggleRow}>
              <Pressable
                onPress={() => setViewMode("grid")}
                style={[styles.toggleBtn, viewMode === "grid" && styles.toggleBtnActive]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    viewMode === "grid" && styles.toggleTextActive,
                  ]}
                >
                  Grid
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setViewMode("feed")}
                style={[styles.toggleBtn, viewMode === "feed" && styles.toggleBtnActive]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    viewMode === "feed" && styles.toggleTextActive,
                  ]}
                >
                  Feed
                </Text>
              </Pressable>
            </View>
            <Pressable
              style={[styles.participateButton, hasParticipated && { opacity: 0.5 }]}
              onPress={() => {
                if (hasParticipated) {
                  Alert.alert(
                    "Already participated",
                    "You already participated in this challenge.",
                  );
                  return;
                }
                setChallenge(challenge.id, challenge.title);
                requestTab("create");
                requestAnimationFrame(() => {
                  router.back();
                });
              }}
              disabled={hasParticipated}
            >
              <Text style={styles.participateButtonText}>
                {hasParticipated ? "Already participated" : "Participate"}
              </Text>
            </Pressable>
          </View>

          {/* Posts */}
          {postsError ? (
            <Text style={styles.errorText}>
              Error loading posts: {String(postsError)}
            </Text>
          ) : posts.length === 0 ? (
            <Text style={styles.emptyText}>No posts yet. Be the first 😈</Text>
          ) : viewMode === "grid" ? (
            <FlatList
              key="grid"
              data={posts}
              keyExtractor={(item) => item.id}
              numColumns={COLS}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.gridList}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.tile}
                  onPress={() => {
                    setFeedMode(false);
                    setSelectedPost(item);
                  }}
                >
                  <Image source={{ uri: item.imageUrl }} style={styles.img} />
                </Pressable>
              )}
            />
          ) : (
            <FlatList
              key="feed"
              data={posts}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.feedList}
              renderItem={({ item }) => (
                <PostCard
                  post={item as Post}
                  currentUid={uid}
                  onOpen={(p) => {
                    setFeedMode(true);
                    setSelectedPost(p);
                  }}
                  onDelete={handleDelete}
                />
              )}
            />
          )}
          <PostDetailModal
            visible={!!selectedPost}
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            onDeletePost={async (p) => {
              await handleDelete(p);
              setSelectedPost(null);
            }}
            feedMode={feedMode}
          />
        </View>
      )}
    </Screen>
  );
}
