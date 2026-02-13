import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import { Screen } from "@/src/components/Screen/Screen";
import { db } from "@/src/lib/firebase";
import ConfettiCannon from "react-native-confetti-cannon";
import { styles } from "./OurHistoryScreen.styles";

type OurHistoryEvent = {
  id: string;
  order: number;
  date: string;
  title: string;
  caption?: string;
  imageUrl?: string;
};

const FINAL_MESSAGE = {
  title: "For the Hen 💌",
  body: "Kim, I love you. And to the bridesmaids: good luck keeping this legend alive tonight 😄\n\n— Jasper",
};

export default function OurHistoryScreen() {
  const [events, setEvents] = useState<OurHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "ourHistoryEvents"), orderBy("order", "asc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: OurHistoryEvent[] = snap.docs.map((d) => {
          const data = d.data() as Omit<OurHistoryEvent, "id">;
          return { id: d.id, ...data };
        });

        setEvents(list);
        setLoading(false);
        setError(null);
      },
      (e) => {
        setError(e?.message ?? "Could not load Our History.");
        setLoading(false);
      },
    );

    return unsub;
  }, []);

  const data = useMemo(() => events, [events]);

  if (loading) {
    return (
      <Screen title="Our History">
        <ActivityIndicator style={{ marginTop: 24 }} />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen title="Our History">
        <View style={styles.center}>
          <Text style={styles.errorTitle}>No timeline today 😅</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>
            Tip: if you’re on sketchy Wi-Fi, try hotspot. Firestore gets moody.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="Our History">
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        onEndReached={() => setShowConfetti(true)}
        onEndReachedThreshold={0.2}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>No events yet</Text>
            <Text style={styles.emptyText}>
              Add docs to the Firestore collection “ourHistoryEvents”.
            </Text>
          </View>
        }
        ListFooterComponent={<FinalMessage />}
        renderItem={({ item, index }) => (
          <TimelineCard item={item} index={index} onPressImage={setPreviewUrl} />
        )}
      />
      {showConfetti ? (
        <ConfettiCannon
          count={120}
          origin={{ x: 0, y: 0 }}
          fadeOut
          onAnimationEnd={() => setShowConfetti(false)}
        />
      ) : null}

      <Modal visible={!!previewUrl} transparent animationType="fade">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.85)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setPreviewUrl(null)}
        >
          {previewUrl ? (
            <Image
              source={{ uri: previewUrl }}
              style={{ width: "92%", height: "70%" }}
              contentFit="contain"
              transition={180}
            />
          ) : null}
        </Pressable>
      </Modal>
    </Screen>
  );
}

function TimelineCard({
  item,
  index,
  onPressImage,
}: {
  item: OurHistoryEvent;
  index: number;
  onPressImage: (url: string) => void;
}) {
  const side = index % 2 === 0 ? "left" : "right";

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <View style={styles.cardWrap}>
      <View style={styles.line} />
      <View style={styles.dot} />

      <Animated.View
        style={[
          styles.card,
          side === "left" ? styles.left : styles.right,
          { opacity, transform: [{ translateY }] },
        ]}
      >
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.title}>{item.title}</Text>
        {item.caption ? <Text style={styles.caption}>{item.caption}</Text> : null}

        {item.imageUrl ? (
          <Pressable onPress={() => onPressImage(item.imageUrl!)}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={180}
            />
          </Pressable>
        ) : null}
      </Animated.View>
    </View>
  );
}

function FinalMessage() {
  const [fired, setFired] = useState(false);

  return (
    <View
      style={styles.finalWrap}
      onLayout={() => {
        if (!fired) setFired(true);
      }}
    >
      <Text style={styles.finalTitle}>{FINAL_MESSAGE.title}</Text>
      <Text style={styles.finalBody}>{FINAL_MESSAGE.body}</Text>
    </View>
  );
}
