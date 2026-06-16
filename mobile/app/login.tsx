import { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";

import { login, register } from "@/lib/auth";
import { useAuth } from "@/context/auth";

export default function LoginScreen() {
  const { refresh } = useAuth();

  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password) return;
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        await register(email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      await refresh();
    } catch (error) {
      Alert.alert(
        isRegisterMode ? "Registration failed" : "Sign in failed",
        (error as Error).message,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit =
    email.trim().length > 0 && password.length > 0 && !isSubmitting;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={["#0F172A", "#111827", "#1E293B"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>☁️</Text>
          </View>
          <Text style={styles.title}>CloudVault</Text>
          <Text style={styles.subtitle}>
            Securely store, sync, and access your photos anywhere.
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.toggleContainer}>
            <Pressable
              onPress={() => setIsRegisterMode(false)}
              style={[
                styles.toggleButton,
                !isRegisterMode && styles.toggleButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  !isRegisterMode && styles.toggleTextActive,
                ]}
              >
                Sign In
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setIsRegisterMode(true)}
              style={[
                styles.toggleButton,
                isRegisterMode && styles.toggleButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  isRegisterMode && styles.toggleTextActive,
                ]}
              >
                Register
              </Text>
            </Pressable>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
              style={styles.input}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              ref={passwordRef}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              style={styles.input}
            />

            <Pressable
              style={[
                styles.submitButton,
                !canSubmit && styles.submitButtonDisabled,
              ]}
              disabled={!canSubmit}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting
                  ? "Please wait…"
                  : isRegisterMode
                    ? "Create Account"
                    : "Sign In"}
              </Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.footer}>
          Your memories, securely backed up in the cloud.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0F172A",
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  hero: {
    alignItems: "center",
    marginBottom: 40,
  },

  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  logoEmoji: { fontSize: 42 },

  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 10,
    letterSpacing: 0.5,
  },

  subtitle: {
    fontSize: 16,
    color: "#CBD5E1",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },

  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },

  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  toggleButtonActive: { backgroundColor: "#0F172A" },

  toggleText: { fontWeight: "600", color: "#64748B" },
  toggleTextActive: { color: "#FFFFFF" },

  form: { gap: 12 },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },

  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
  },

  submitButton: {
    marginTop: 8,
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },

  submitButtonDisabled: { opacity: 0.5 },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  footer: {
    marginTop: 28,
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 13,
  },
});
