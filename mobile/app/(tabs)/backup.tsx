import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useFocusEffect } from "@react-navigation/native";

import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth";
import {
  addBackupTask,
  fetchUploadedImages,
  loadBackupQueue,
  processBackupQueue,
  type BackupTask,
  type UploadedImage,
} from "@/lib/backup";

// ─── Status badge ────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  pending: "#F59E0B",
  uploading: "#2563EB",
  done: "#10B981",
  error: "#EF4444",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: STATUS_COLOR[status] ?? "#64748B" },
      ]}
    >
      <Text style={styles.badgeText}>{status.toUpperCase()}</Text>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function BackupScreen() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<BackupTask[]>([]);
  const [uploads, setUploads] = useState<UploadedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const processingRef = useRef(false);

  // ── Data loaders ────────────────────────────────────────────────────────────

  const loadQueue = useCallback(async () => {
    if (!user) return setTasks([]);
    setTasks(await loadBackupQueue(user.id));
  }, [user]);

  const loadUploads = useCallback(async () => {
    if (!user) return setUploads([]);
    try {
      setUploads(await fetchUploadedImages());
    } catch {
      // silently ignore — user may be temporarily offline
    }
  }, [user]);

  const loadAll = useCallback(async () => {
    await Promise.all([loadQueue(), loadUploads()]);
  }, [loadQueue, loadUploads]);

  // Refresh on focus (e.g. returning from another tab)
  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll]),
  );

  // ── Queue processor ─────────────────────────────────────────────────────────

  async function syncQueue() {
    if (!user || processingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);
    try {
      await processBackupQueue(user.id);
      await loadAll();
    } catch (e) {
      Alert.alert("Sync failed", (e as Error).message);
    } finally {
      setIsProcessing(false);
      processingRef.current = false;
    }
  }

  // ── Photo picker ────────────────────────────────────────────────────────────

  async function handlePickPhoto() {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to back up photos.");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Allow access to your photo library to continue.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      base64: true,
      allowsMultipleSelection: true,
    });

    if (result.canceled || !result.assets?.length) return;

    for (const asset of result.assets) {
      if (!asset.base64 || !asset.uri) continue;

      const fileName =
        asset.fileName ??
        asset.uri.split("/").pop() ??
        `backup-${Date.now()}.jpg`;

      await addBackupTask({
        userId: user.id,
        fileName,
        mimeType: asset.mimeType ?? "image/jpeg",
        base64: asset.base64,
      });
    }

    await loadQueue();
    await syncQueue();
  }

  // ── Pull-to-refresh ─────────────────────────────────────────────────────────

  async function handleRefresh() {
    setIsRefreshing(true);
    await loadAll();
    setIsRefreshing(false);
  }

  // ── Derived state ───────────────────────────────────────────────────────────

  const pendingCount = tasks.filter(
    (t) => t.status === "pending" || t.status === "error",
  ).length;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={["#0F172A", "#111827", "#1E293B"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#94A3B8"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Photo Backup</Text>
          <Text style={styles.subtitle}>
            {user
              ? `Signed in as ${user.email}`
              : "Sign in to start backing up"}
          </Text>
        </View>

        {/* Action card */}
        <View style={styles.card}>
          <Pressable
            style={[
              styles.primaryButton,
              (!user || isProcessing) && styles.buttonDisabled,
            ]}
            onPress={handlePickPhoto}
            disabled={!user || isProcessing}
          >
            <Text style={styles.primaryButtonText}>
              {isProcessing ? "Uploading…" : "Pick Photos to Back Up"}
            </Text>
          </Pressable>

          {pendingCount > 0 && (
            <Pressable
              style={[
                styles.secondaryButton,
                isProcessing && styles.buttonDisabled,
              ]}
              onPress={syncQueue}
              disabled={isProcessing}
            >
              <Text style={styles.secondaryButtonText}>
                Retry {pendingCount} Pending Upload
                {pendingCount !== 1 ? "s" : ""}
              </Text>
            </Pressable>
          )}

          {isProcessing && (
            <View style={styles.processingRow}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.processingText}>Syncing to cloud…</Text>
            </View>
          )}
        </View>

        {/* Queue */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upload Queue</Text>
          <Text style={styles.sectionCount}>
            {tasks.length === 0
              ? "Empty"
              : `${tasks.length} item${tasks.length !== 1 ? "s" : ""}`}
          </Text>
        </View>

        {tasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No pending uploads</Text>
          </View>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(i) => i.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.queueItem}>
                <View style={styles.queueItemLeft}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.fileName}
                  </Text>
                </View>
                <StatusBadge status={item.status} />
              </View>
            )}
          />
        )}

        {/* Uploaded images */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Backed Up</Text>
          <Text style={styles.sectionCount}>
            {uploads.length === 0
              ? "None yet"
              : `${uploads.length} photo${uploads.length !== 1 ? "s" : ""}`}
          </Text>
        </View>

        {uploads.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No uploads yet. Pick a photo to get started.
            </Text>
          </View>
        ) : (
          <FlatList
            data={uploads}
            keyExtractor={(i) => String(i.id)}
            scrollEnabled={false}
            numColumns={3}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <View style={styles.gridItem}>
                <Image
                  source={{ uri: item.thumbnail_url }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  transition={200}
                />
              </View>
            )}
          />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },

  content: {
    padding: 20,
    paddingTop: 72,
  },

  header: { marginBottom: 20 },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  subtitle: {
    color: "#94A3B8",
    marginTop: 4,
    fontSize: 13,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 24,
    gap: 10,
  },

  primaryButton: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  buttonDisabled: { opacity: 0.45 },

  processingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 4,
  },

  processingText: {
    color: "#94A3B8",
    fontSize: 13,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  sectionCount: {
    color: "#94A3B8",
    fontSize: 13,
  },

  emptyCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  emptyText: {
    color: "#64748B",
    fontSize: 14,
  },

  queueItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },

  queueItemLeft: { flex: 1, marginRight: 10 },

  itemTitle: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  gridRow: { gap: 8 },
  grid: { gap: 8, marginBottom: 16 },

  gridItem: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
});
