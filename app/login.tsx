import { useState } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { auth } from "@/src/lib/auth";
import loadingImage from "../assets/images/loading.jpg";
import iconImage from "../assets/images/icon.png";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setErr(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);

      // invite-only check
      const invited = await getDoc(doc(db, "allowedEmails", cleanEmail));
      if (!invited.exists()) {
        setErr("No estás en la lista del grupo 🙂");
        await signOut(auth);
        return;
      }
    } catch (e: any) {
      const code = e?.code;

      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        setErr("Email o contraseña incorrectos.");
      } else if (code === "auth/user-not-found") {
        setErr("Ese usuario no existe.");
      } else if (code === "auth/too-many-requests") {
        setErr("Demasiados intentos. Espera un momento y prueba otra vez.");
      } else {
        setErr("No se pudo iniciar sesión.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={loadingImage} style={styles.bg} resizeMode="cover">
        <View style={styles.bgOverlay} />

        <View style={styles.card}>
          <Image source={iconImage} style={styles.icon} />
          <Text style={styles.title}>Henstagram</Text>

          <TextInput
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          {err ? <Text style={styles.errorText}>{err}</Text> : null}

          <Pressable
            onPress={signIn}
            disabled={loading}
            style={[styles.button, loading && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>{loading ? "Loading..." : "Sign in"}</Text>
          </Pressable>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  card: {
    width: "78%",
    aspectRatio: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    justifyContent: "center",
    gap: 12,
  },
  icon: {
    width: 60,
    height: 60,
    alignSelf: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    color: "#6575AC",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: "white",
  },
  errorText: {
    color: "#d60000",
    textAlign: "center",
  },
  button: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#6575AC",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontWeight: "700",
    color: "white",
  },
});
