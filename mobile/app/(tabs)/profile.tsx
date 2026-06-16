import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useFocusEffect } from "@react-navigation/native";

import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth";
import { fetchUploadedImages, type UploadedImage } from "@/lib/backup";
import { logout } from "@/lib/auth";

// ─── Image Viewer Modal ───────────────────────────────────────────────────────

function ImageViewerModal({
  image,
  onClose,
}: {
  image: UploadedImage | null;
  onClose: () => void;
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    if (!image) return;

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Allow access to your photo library to save images.",
      );
      return;
    }

    setIsDownloading(true);
    try {
      const fileUri =
        FileSystem.documentDirectory +
        (image.file_name || `photo-${image.id}.jpg`);
      const { uri } = await FileSystem.downloadAsync(
        image.original_url,
        fileUri,
      );
      await MediaLibrary.saveToLibraryAsync(uri);
      await FileSystem.deleteAsync(uri, { idempotent: true });
      Alert.alert("Saved!", "Photo saved to your library.");
    } catch {
      Alert.alert("Download failed", "Could not save the photo. Try again.");
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleShare() {
    if (!image) return;
    try {
      await Share.share({ url: image.original_url, message: image.file_name });
    } catch {
      // user cancelled
    }
  }

  if (!image) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={modalStyles.backdrop}>
        {/* Full-size image */}
        <Image
          source={{ uri: image.original_url }}
          style={modalStyles.fullImage}
          contentFit="contain"
          transition={150}
        />

        {/* Top bar */}
        <View style={modalStyles.topBar}>
          <Pressable style={modalStyles.iconBtn} onPress={onClose} hitSlop={12}>
            <Text style={modalStyles.iconText}>✕</Text>
          </Pressable>
          <Text style={modalStyles.fileName} numberOfLines={1}>
            {image.file_name}
          </Text>
          <Pressable
            style={modalStyles.iconBtn}
            onPress={handleShare}
            hitSlop={12}
          >
            <Text style={modalStyles.iconText}>⬆</Text>
          </Pressable>
        </View>

        {/* Bottom actions */}
        <View style={modalStyles.bottomBar}>
          <Pressable
            style={[
              modalStyles.actionBtn,
              isDownloading && modalStyles.btnDisabled,
            ]}
            onPress={handleDownload}
            disabled={isDownloading}
          >
            <Text style={modalStyles.actionBtnText}>
              {isDownloading ? "Saving…" : "⬇  Save to Library"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user, refresh } = useAuth();

  const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;
  const [uploads, setUploads] = useState<UploadedImage[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(
    null,
  );

  const loadUploads = useCallback(async () => {
    if (!user) return setUploads([]);
    try {
      setUploads(await fetchUploadedImages());
    } catch {
      // silently ignore network errors
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadUploads();
    }, [loadUploads]),
  );

  async function handleRefresh() {
    setIsRefreshing(true);
    await loadUploads();
    setIsRefreshing(false);
  }

  async function handleLogout() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await logout();
            await refresh();
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  }

  const thumbnailCount = uploads.filter((u) => !!u.thumbnail_url).length;

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
        {/* Header card */}
        <View style={styles.headerCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {user?.email?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Profile - {BASE_URL}</Text>
            <Text style={styles.email}>{user?.email ?? "Not signed in"}</Text>
            <Text style={styles.sub}>CloudVault storage overview</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{uploads.length}</Text>
            <Text style={styles.statLabel}>Total Photos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{thumbnailCount}</Text>
            <Text style={styles.statLabel}>With Thumbnails</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {uploads.length > 0
                ? `${Math.round((thumbnailCount / uploads.length) * 100)}%`
                : "—"}
            </Text>
            <Text style={styles.statLabel}>Coverage</Text>
          </View>
        </View>

        {/* Photo grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Backups</Text>
          {uploads.length > 0 && (
            <Text style={styles.sectionHint}>Tap a photo to view</Text>
          )}
        </View>

        {uploads.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>Nothing backed up yet</Text>
            <Text style={styles.emptyText}>
              Head over to the Backup tab to upload your first photo.
            </Text>
          </View>
        ) : (
          <FlatList
            data={uploads}
            keyExtractor={(item) => String(item.id)}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.gridItem,
                  pressed && styles.gridItemPressed,
                ]}
                onPress={() => setSelectedImage(item)}
              >
                <Image
                  source={{ uri: item.thumbnail_url }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  transition={200}
                />
                {/* Download hint overlay on long-press area */}
                <View style={styles.gridItemOverlay} />
              </Pressable>
            )}
          />
        )}

        {/* Sign out */}
        <Pressable
          style={[styles.logoutButton, isLoggingOut && styles.buttonDisabled]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          <Text style={styles.logoutText}>
            {isLoggingOut ? "Signing out…" : "Sign Out"}
          </Text>
        </Pressable>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Full-screen image viewer */}
      <ImageViewerModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </ThemedView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.96)",
    justifyContent: "center",
  },

  fullImage: {
    flex: 1,
    width: "100%",
  },

  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    gap: 12,
  },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  iconText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  fileName: {
    flex: 1,
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 44,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  actionBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },

  actionBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  btnDisabled: { opacity: 0.5 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },

  content: {
    padding: 20,
    paddingTop: 72,
  },

  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 16,
  },

  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarLetter: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },

  headerInfo: { flex: 1 },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  email: {
    color: "#CBD5E1",
    marginTop: 2,
    fontWeight: "600",
    fontSize: 13,
  },

  sub: {
    color: "#64748B",
    marginTop: 2,
    fontSize: 12,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },

  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  statNumber: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },

  statLabel: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
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

  sectionHint: {
    color: "#475569",
    fontSize: 12,
  },

  emptyCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 8,
  },

  emptyEmoji: { fontSize: 36 },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  emptyText: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  gridRow: { gap: 8 },
  grid: { gap: 8, marginBottom: 24 },

  gridItem: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  gridItemPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },

  gridItemOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },

  logoutButton: {
    backgroundColor: "#7F1D1D",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },

  logoutText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  buttonDisabled: { opacity: 0.5 },
});
