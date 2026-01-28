import { View, Text, Button } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

import { Screen } from "@/src/components/Screen/Screen";
import { useChallenge } from "@/src/hooks/useChallenge";
import { styles } from "./ChallengeDetail.styles";

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { challenge, loading } = useChallenge(id!);

  if (loading || !challenge) {
    return (
      <Screen title="Challenge">
        <Text>Loading...</Text>
      </Screen>
    );
  }

  const handleParticipate = () => {
    router.push({
      pathname: "/create",
      params: {
        challengeId: challenge.id,
        challengeTitle: challenge.title,
      },
    });
  };

  return (
    <Screen title={challenge.title}>
      <View style={styles.container}>
        <Text style={styles.prompt}>{challenge.prompt}</Text>

        <Button title="Participate" onPress={handleParticipate} />
      </View>
    </Screen>
  );
}
