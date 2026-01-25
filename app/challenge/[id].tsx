import React, { useMemo } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

import { Screen } from "@/src/components/Screen/Screen";
import { useChallengePosts } from "@/src/hooks/useChallengePosts";
import { styles } from "@/src/screens/Challenges/ChallengeDetail.styles";
import { useChallenge } from "@/src/hooks/useChallenge";

export default function ChallengeDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const challengeId = useMemo(() => String(params.id ?? ""), [params.id]);

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

  const loading = loadingChallenge || loadingPosts;

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
          <View style={styles.header}>
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

            <Pressable
              style={styles.participateButton}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/create",
                  params: {
                    challengeId: challengeId,
                    challengeTitle: challenge.title,
                  },
                })
              }
            >
              <Text style={styles.participateButtonText}>Participate</Text>
            </Pressable>
          </View>

          {/* Posts */}
          {postsError ? (
            <Text style={styles.errorText}>
              Error loading posts: {String(postsError)}
            </Text>
          ) : posts.length === 0 ? (
            <Text style={styles.emptyText}>No posts yet. Be the first 😈</Text>
          ) : (
            <FlatList
              data={posts}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={styles.postCard}>
                  <Text style={styles.postUser}>
                    {item.username ?? item.userEmail ?? "Someone"}
                  </Text>
                  <Text style={styles.postCaption}>{item.caption}</Text>
                  {/* Si ya tienes componente PostItem o PostCard en tu app, cámbialo aquí */}
                  <Text style={styles.postMeta}>
                    {item.createdAt?.toDate
                      ? item.createdAt.toDate().toLocaleString()
                      : ""}
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      )}
    </Screen>
  );
}
