import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/context/auth";

const FEATURES = [
  {
    emoji: "📸",
    title: "Automatic Uploads",
    text: "Securely upload and sync your favorite photos in seconds.",
  },
  {
    emoji: "🔒",
    title: "Private Storage",
    text: "Your uploads stay visible only to your account.",
  },
  {
    emoji: "⚡",
    title: "Offline Queue",
    text: "Photos queue locally and upload when you're back online.",
  },
  {
    emoji: "☁️",
    title: "Cloud Backup",
    text: "Powered by ImageKit — fast, reliable, and scalable.",
  },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <LinearGradient
      colors={["#0F172A", "#111827", "#1E293B"]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>☁️</Text>
          </View>

          <Text style={styles.title}>CloudVault</Text>

          <Text style={styles.subtitle}>
            Securely back up your memories and access them from anywhere.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push("/(tabs)/backup")}
          >
            <Text style={styles.primaryButtonText}>Start Backing Up</Text>
          </Pressable>
        </View>

        {/* Features */}
        <View style={styles.grid}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureCard}>
              <Text style={styles.cardEmoji}>{f.emoji}</Text>
              <Text style={styles.cardTitle}>{f.title}</Text>
              <Text style={styles.cardText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomCard}>
          <Text style={styles.bottomTitle}>
            Your memories deserve a safer place.
          </Text>
          <Text style={styles.bottomText}>
            Back up your photos, keep them organized, and access them whenever
            you need.
          </Text>

          <View style={styles.bottomActions}>
            {user ? (
              <Pressable
                style={styles.secondaryButton}
                onPress={() => router.push("/(tabs)/profile")}
              >
                <Text style={styles.secondaryButtonText}>View Profile</Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.secondaryButton}
                onPress={() => router.push("/login")}
              >
                <Text style={styles.secondaryButtonText}>Sign In</Text>
              </Pressable>
            )}

            <Pressable
              style={styles.outlineButton}
              onPress={() => router.push("/(tabs)/backup")}
            >
              <Text style={styles.outlineButtonText}>Open Backup</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  content: {
    padding: 24,
    paddingTop: 80,
    paddingBottom: 120,
  },

  hero: {
    alignItems: "center",
    marginBottom: 40,
  },

  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },

  logoEmoji: { fontSize: 44 },

  title: {
    fontSize: 38,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 12,
    letterSpacing: 0.5,
  },

  subtitle: {
    fontSize: 16,
    color: "#CBD5E1",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 320,
    marginBottom: 28,
  },

  primaryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 18,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  grid: { gap: 16, marginBottom: 32 },

  featureCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  cardEmoji: { fontSize: 30, marginBottom: 14 },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  cardText: {
    color: "#CBD5E1",
    lineHeight: 22,
    fontSize: 14,
  },

  bottomCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
  },

  bottomTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },

  bottomText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#475569",
    marginBottom: 24,
  },

  bottomActions: { gap: 12 },

  secondaryButton: {
    backgroundColor: "#0F172A",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  outlineButton: {
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },

  outlineButtonText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 16,
  },
});
