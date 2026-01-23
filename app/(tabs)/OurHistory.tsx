import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import { Screen } from "@/src/components/Screen/Screen";
import { db } from "@/src/lib/firebase";

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
        renderItem={({ item, index }) => <TimelineCard item={item} index={index} />}
      />
    </Screen>
  );
}

function TimelineCard({ item, index }: { item: OurHistoryEvent; index: number }) {
  const side = index % 2 === 0 ? "left" : "right";

  return (
    <View style={styles.cardWrap}>
      {/* center line */}
      <View style={styles.line} />
      {/* dot */}
      <View style={styles.dot} />

      <View style={[styles.card, side === "left" ? styles.left : styles.right]}>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.title}>{item.title}</Text>
        {item.caption ? <Text style={styles.caption}>{item.caption}</Text> : null}

        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={180}
          />
        ) : null}
      </View>
    </View>
  );
}

function FinalMessage() {
  return (
    <View style={styles.finalWrap}>
      <Text style={styles.finalTitle}>{FINAL_MESSAGE.title}</Text>
      <Text style={styles.finalBody}>{FINAL_MESSAGE.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, paddingBottom: 24 },

  cardWrap: { minHeight: 80, position: "relative" },
  line: {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
    width: 2,
    marginLeft: -1,
    backgroundColor: "#E5E7EB",
  },
  dot: {
    position: "absolute",
    left: "50%",
    top: 18,
    width: 12,
    height: 12,
    marginLeft: -6,
    borderRadius: 999,
    backgroundColor: "#111827",
  },

  card: {
    width: "47%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
  },
  left: { alignSelf: "flex-start" },
  right: { alignSelf: "flex-end" },

  date: { fontSize: 12, fontWeight: "700", color: "#6B7280" },
  title: { fontSize: 15, fontWeight: "800", marginTop: 6 },
  caption: { fontSize: 13, color: "#374151", marginTop: 6 },

  image: { height: 180, borderRadius: 12, marginTop: 10 },

  finalWrap: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
  },
  finalTitle: { fontSize: 16, fontWeight: "900" },
  finalBody: { marginTop: 10, fontSize: 13, color: "#374151", lineHeight: 18 },

  center: { padding: 16, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "800" },
  emptyText: { fontSize: 13, color: "#6B7280" },

  errorTitle: { fontSize: 16, fontWeight: "900" },
  errorText: { fontSize: 13, color: "#B91C1C" },
  errorHint: { fontSize: 12, color: "#6B7280" },
});
