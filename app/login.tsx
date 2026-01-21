import { useState } from "react";
import { Text, TextInput, Pressable } from "react-native";
import { router } from "expo-router";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { auth } from "@/src/lib/auth";
import { Screen } from "@/components/Screen/Screen";

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
        await signOut(auth); // <- IMPORTANT: si no está invitado, fuera sesión
        return;
      }

      router.replace("/(tabs)/feed");
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
    <Screen title="Login">
      <Text style={{ fontSize: 28, fontWeight: "700" }}>Henstagram</Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
      />

      {err ? <Text style={{ color: "red" }}>{err}</Text> : null}

      <Pressable
        onPress={signIn}
        disabled={loading}
        style={{
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
          opacity: loading ? 0.6 : 1,
          borderWidth: 1,
        }}
      >
        <Text style={{ fontWeight: "600" }}>{loading ? "Entrando..." : "Sign in"}</Text>
      </Pressable>
    </Screen>
  );
}
